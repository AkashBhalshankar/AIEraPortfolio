"""Portfolio API.

Public
  GET  /resume            published JSON (ETag, short cache) - the website renders from this
  GET  /resume/download   always the newest PDF from Drive (falls back to the last cached copy)
  POST /contact           contact form (honeypot, rate limit, SMTP or saved to data/messages.jsonl)
  GET  /resume/context    plain-text grounding for Chikki, from the same published JSON
Admin (header X-Admin-Token)
  POST /resume/sync       pull Drive -> parse -> save a DRAFT and return the diff
  GET  /resume/draft      the draft plus its diff against what is live
  PUT  /resume/draft      edit the draft (hide a project, fix a line) - validated before saving
  POST /resume/approve    publish the draft (previous version is archived)
  POST /resume/rollback   restore the previous (or a named) version
  GET  /resume/history    available rollback points
"""
import logging
import re
import secrets
from contextlib import asynccontextmanager
from pathlib import Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import Body, Depends, FastAPI, Header, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel, ValidationError
from . import store
from .config import settings
from .contact import ContactIn, deliver, rate_limited
from .context import to_context
app = FastAPI(title="Portfolio API", version="1.0.0")
from .drive import fetch_resume_pdf
from .llm import AllProvidersFailed
from .sync import cached_pdf_path, run_sync


class NavigatorIn(BaseModel):
    message: str = ""
    mode: str = "ask"


@app.post("/navigator/chat")
async def navigator_chat(body: NavigatorIn):
    published, _ = store.get_published()
    ctx = to_context(published)
    system = (
        "You are Akash's portfolio navigator AI. Speak in first person as Akash's guide. "
        "Only use facts from the provided resume context. Keep answers short (2-4 sentences max). "
        "If the user asks to go to a section, also include a navigation hint like NAVIGATE:about|experience|projects|skills-matrix|events|contact. "
        "When giving an intro about Akash after settling, focus on who he is, what he builds, and what he's open to."
    )
    user = f"CONTEXT:\n{ctx}\n\nUSER_MESSAGE: {body.message}\nMODE: {body.mode}"
    try:
        from .llm import chat_json
        reply = await chat_json(system, user)
        return {"reply": reply}
    except Exception as exc:
        log.warning("navigator llm failed: %s", exc)
        p = (published or {}).get("profile", {})
        lead = p.get("lead", "AI Engineer building LLM agents and backends.")
        about = (p.get("about") or [""])[0]
        fallback = f"I'm Akash's navigator. {lead} {about[:200]} Ask me to take you to Projects, Experience, Skills, or just say 'tell me about Akash'."
        return {"reply": fallback}


app.add_middleware(
    CORSMiddleware, allow_origins=settings.allowed_origins, allow_methods=["GET", "POST", "PUT"], allow_headers=["*"], expose_headers=["ETag"],
)


def admin(x_admin_token: str = Header(default="")) -> None:
    if not settings.admin_token or not secrets.compare_digest(x_admin_token, settings.admin_token):
        raise HTTPException(401, "Invalid admin token")


@app.get("/health")
def health():
    published, etag = store.get_published()
    return {"ok": True, "published": bool(published), "version": etag, "driveConfigured": bool(settings.drive_file_id)}


@app.get("/resume")
def get_resume(request: Request, response: Response):
    published, etag = store.get_published()
    if not published:
        raise HTTPException(404, "Nothing published yet")
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers={"ETag": etag})
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    return published


@app.post("/contact", status_code=202)
async def contact(body: ContactIn, request: Request):
    if body.company:  # honeypot tripped: pretend success so bots learn nothing
        return {"status": "ok"}
    fwd = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    ip = fwd or (request.client.host if request.client else "unknown")
    if rate_limited(ip):
        raise HTTPException(429, "Too many messages, please try again later")
    try:
        return {"status": await deliver(body)}
    except Exception as exc:  # noqa: BLE001 - the copy is already saved to disk
        log.error("contact mail failed, message saved locally: %s", exc)
        return {"status": "saved"}


@app.get("/resume/context")
def get_context():
    published, _ = store.get_published()
    return Response(to_context(published), media_type="text/plain; charset=utf-8")


@app.get("/resume/download")
async def download_resume():
    published, _ = store.get_published()
    name = re.sub(r"[^A-Za-z0-9]+", "_", (published or {}).get("profile", {}).get("name", "Resume")).strip("_")
    headers = {"Content-Disposition": f'attachment; filename="{name}_Resume.pdf"'}
    try:
        pdf, _meta = await fetch_resume_pdf()
        return Response(pdf, media_type="application/pdf", headers=headers)
    except Exception as exc:  # noqa: BLE001
        log.warning("live download failed (%s), serving cached copy", exc)
        path: Path = cached_pdf_path()
        if path.exists():
            return FileResponse(path, media_type="application/pdf", headers=headers)
        raise HTTPException(503, "Resume is temporarily unavailable")


@app.post("/resume/sync", dependencies=[Depends(admin)])
async def sync_now(force: bool = False):
    try:
        return await run_sync(force=force)
    except AllProvidersFailed as exc:
        raise HTTPException(503, f"Every model provider failed: {exc}")
    except ValueError as exc:
        raise HTTPException(422, str(exc))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(502, f"Sync failed, live site unchanged: {exc}")


@app.get("/resume/draft", dependencies=[Depends(admin)])
def get_draft():
    draft = store.get_draft()
    if not draft:
        raise HTTPException(404, "No draft")
    published, _ = store.get_published()
    return {"draft": draft, "diff": store.diff(published, draft)}


@app.put("/resume/draft", dependencies=[Depends(admin)])
async def put_draft(body: dict = Body(...)):
    try:
        draft = await store.save_draft(body)
    except ValidationError as exc:
        raise HTTPException(422, exc.errors(include_url=False))
    published, _ = store.get_published()
    return {"draft": draft, "diff": store.diff(published, draft)}


@app.post("/resume/approve", dependencies=[Depends(admin)])
async def approve():
    try:
        await store.approve()
    except LookupError as exc:
        raise HTTPException(404, str(exc))
    return {"status": "published"}


@app.get("/resume/history", dependencies=[Depends(admin)])
def get_history():
    return {"versions": store.history()}


@app.post("/resume/rollback", dependencies=[Depends(admin)])
async def rollback(version: str | None = None):
    try:
        await store.rollback(version)
    except LookupError as exc:
        raise HTTPException(404, str(exc))
    return {"status": "rolled back"}


@app.get("/admin", response_class=HTMLResponse, include_in_schema=False)
def admin_page():
    return (Path(__file__).parent / "admin.html").read_text(encoding="utf-8")
