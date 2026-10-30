"""One sync = Drive PDF -> text -> validated JSON -> draft (+ diff). Published data is never touched unless approved,
so a Drive outage, a bad parse or a rate-limited model all leave the live site on its last known good version."""
import json
import logging

from . import store
from .curate import merge_curated
from .config import settings
from .drive import fetch_resume_pdf
from .parser import parse_resume
from .schema import Meta

log = logging.getLogger("sync")


def _state_path():
    return store._dir() / "state.json"


def _read_state() -> dict:
    try:
        return json.loads(_state_path().read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def cached_pdf_path():
    return store._dir() / "resume.pdf"


async def run_sync(force: bool = False) -> dict:
    pdf, meta = await fetch_resume_pdf()
    store._write_atomic(cached_pdf_path(), pdf)  # also the fallback for /resume/download

    fingerprint = meta.get("md5Checksum") or meta.get("modifiedTime")
    if not force and fingerprint and _read_state().get("fingerprint") == fingerprint:
        return {"status": "unchanged", "source": meta}

    resume = await parse_resume(pdf)
    resume.meta = Meta(sourceFileId=meta.get("id"), sourceModifiedTime=meta.get("modifiedTime"))
    published, _ = store.get_published()
    data = resume.model_dump()
    if settings.preserve_curated:
        data = merge_curated(published, data)  # keep Chikki's write-up, hero lines, links, flagship flags
    draft = await store.save_draft(data)
    changes = store.diff(published, draft)

    store._write_atomic(_state_path(), json.dumps({"fingerprint": fingerprint}).encode())
    status = "draft"
    if settings.auto_approve and changes:
        await store.approve()
        status = "published"
    log.info("sync %s: %s", status, list(changes))
    return {"status": status, "changes": changes, "source": meta}
