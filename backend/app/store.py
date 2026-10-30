"""File-backed store with an in-memory cache.
published.json = what the site serves. draft.json = awaiting approval. history/ = rollback points.
Writes are atomic (temp file + replace), so readers never see half a file."""
import asyncio
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from .config import settings
from .schema import Resume

_lock = asyncio.Lock()
_cache: dict[str, Any] = {"published": None, "etag": None}


def _dir() -> Path:
    d = settings.data_dir
    (d / "history").mkdir(parents=True, exist_ok=True)
    return d


def _write_atomic(path: Path, data: bytes) -> None:
    fd, tmp = tempfile.mkstemp(dir=path.parent)
    with os.fdopen(fd, "wb") as f:
        f.write(data)
    os.replace(tmp, path)


def _read_json(path: Path) -> Optional[dict]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def _etag(obj: dict) -> str:
    import hashlib
    return hashlib.sha1(json.dumps(obj, sort_keys=True).encode()).hexdigest()[:16]


def load() -> None:
    """Warm the cache at startup."""
    pub = _read_json(_dir() / "published.json")
    _cache["published"], _cache["etag"] = pub, (_etag(pub) if pub else None)


def get_published() -> tuple[Optional[dict], Optional[str]]:
    return _cache["published"], _cache["etag"]


def get_draft() -> Optional[dict]:
    return _read_json(_dir() / "draft.json")


def _stamp(resume: dict) -> dict:
    resume.setdefault("meta", {})["updatedAt"] = datetime.now(timezone.utc).isoformat()
    return resume


async def save_draft(resume: Resume | dict) -> dict:
    data = resume.model_dump() if isinstance(resume, Resume) else Resume.model_validate(resume).model_dump()
    async with _lock:
        _write_atomic(_dir() / "draft.json", json.dumps(data, indent=2, ensure_ascii=False).encode())
    return data


async def approve() -> dict:
    """Publish the draft. The previous version is archived first, so a rollback is always possible."""
    async with _lock:
        draft = _read_json(_dir() / "draft.json")
        if not draft:
            raise LookupError("No draft to approve")
        Resume.model_validate(draft)  # never publish something the site cannot render
        current = _read_json(_dir() / "published.json")
        if current:
            ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
            _write_atomic(_dir() / "history" / f"{ts}.json", json.dumps(current, indent=2, ensure_ascii=False).encode())
        draft = _stamp(draft)
        _write_atomic(_dir() / "published.json", json.dumps(draft, indent=2, ensure_ascii=False).encode())
        (_dir() / "draft.json").unlink(missing_ok=True)
        _cache["published"], _cache["etag"] = draft, _etag(draft)  # hot swap, zero downtime
    return draft


def history() -> list[str]:
    return sorted((p.stem for p in (_dir() / "history").glob("*.json")), reverse=True)


async def rollback(version: Optional[str] = None) -> dict:
    async with _lock:
        names = history()
        if not names:
            raise LookupError("No earlier version")
        target = version or names[0]
        data = _read_json(_dir() / "history" / f"{target}.json")
        if not data:
            raise LookupError(f"Unknown version {target}")
        _write_atomic(_dir() / "published.json", json.dumps(data, indent=2, ensure_ascii=False).encode())
        _cache["published"], _cache["etag"] = data, _etag(data)
    return data


# ---------- diff, so you can see exactly what a sync would change ----------
_KEYS = {
    "experience": lambda x: f"{x.get('role')} @ {x.get('org')} ({x.get('start')})",
    "projects": lambda x: x.get("title", ""),
    "certifications": lambda x: x.get("name", ""),
    "education": lambda x: x.get("degree", ""),
    "leadership": lambda x: x.get("title", ""),
    "achievements": lambda x: x.get("title", ""),
    "skills": lambda x: x.get("group", ""),
    "highlights": lambda x: x.get("value", ""),
}


def diff(old: Optional[dict], new: dict) -> dict:
    old = old or {}
    out: dict[str, Any] = {}
    changed_profile = [k for k, v in new.get("profile", {}).items() if old.get("profile", {}).get(k) != v]
    if changed_profile:
        out["profile"] = {"changed": changed_profile}
    for section, key in _KEYS.items():
        a = {key(x): x for x in old.get(section, [])}
        b = {key(x): x for x in new.get(section, [])}
        added = sorted(set(b) - set(a))
        removed = sorted(set(a) - set(b))
        changed = sorted(k for k in set(a) & set(b) if a[k] != b[k])
        if added or removed or changed:
            out[section] = {"added": added, "removed": removed, "changed": changed}
    return out
