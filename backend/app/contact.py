"""Contact form delivery.
Anti-spam: honeypot field, per-IP rate limit, strict length limits, and header-injection-safe subject.
Delivery: SMTP when configured, otherwise the message is saved to data/messages.jsonl so nothing is lost."""
import asyncio
import json
import re
import smtplib
import time
from collections import defaultdict, deque
from datetime import datetime, timezone
from email.message import EmailMessage

from pydantic import BaseModel, Field, field_validator

from . import store
from .config import settings

_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_hits: dict[str, deque] = defaultdict(deque)


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(max_length=120)
    message: str = Field(min_length=10, max_length=2000)
    company: str = ""  # honeypot: humans never see or fill this

    @field_validator("email")
    @classmethod
    def _valid_email(cls, v: str) -> str:
        v = v.strip()
        if not _EMAIL.match(v):
            raise ValueError("invalid email")
        return v


def reset_rate_limit() -> None:
    _hits.clear()


def rate_limited(ip: str, limit: int | None = None, window: int = 3600) -> bool:
    limit = limit or settings.contact_per_hour
    now = time.monotonic()
    q = _hits[ip]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        return True
    q.append(now)
    return False


def _one_line(text: str, n: int) -> str:
    return re.sub(r"[\r\n]+", " ", text).strip()[:n]


def _send_resend(c: ContactIn) -> None:
    import httpx
    payload = {
        "from": settings.contact_to,
        "to": [settings.contact_to],
        "reply_to": c.email,
        "subject": f"Portfolio message from {_one_line(c.name, 60)}",
        "text": f"From: {c.name} <{c.email}>\n\n{c.message}",
    }
    r = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {settings.resend_api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=15,
    )
    r.raise_for_status()


async def deliver(c: ContactIn) -> str:
    record = {"at": datetime.now(timezone.utc).isoformat(), "name": c.name, "email": c.email, "message": c.message}
    # Always keep a copy first, so a mail outage never loses a message.
    path = store._dir() / "messages.jsonl"
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
    if settings.resend_api_key and settings.contact_to:
        await asyncio.to_thread(_send_resend, c)
        return "sent"
    return "saved"
