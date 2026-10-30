"""Pull the resume PDF straight from Google Drive into memory (no temp files)."""
import asyncio
import io
import json

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

from .config import settings

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]


def _credentials():
    if settings.sa_json:
        return service_account.Credentials.from_service_account_info(json.loads(settings.sa_json), scopes=SCOPES)
    if settings.sa_file:
        return service_account.Credentials.from_service_account_file(settings.sa_file, scopes=SCOPES)
    raise RuntimeError("Set GOOGLE_SERVICE_ACCOUNT_FILE or GOOGLE_SERVICE_ACCOUNT_JSON")


def _fetch() -> tuple[bytes, dict]:
    if not settings.drive_file_id:
        raise RuntimeError("Set DRIVE_FILE_ID")
    svc = build("drive", "v3", credentials=_credentials(), cache_discovery=False)
    meta = svc.files().get(fileId=settings.drive_file_id, fields="id,name,modifiedTime,md5Checksum").execute()
    buf = io.BytesIO()
    req = svc.files().get_media(fileId=settings.drive_file_id)
    downloader = MediaIoBaseDownload(buf, req)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    return buf.getvalue(), meta


async def fetch_resume_pdf() -> tuple[bytes, dict]:
    """Google's client is blocking, so run it in a worker thread and keep the event loop free."""
    return await asyncio.to_thread(_fetch)
