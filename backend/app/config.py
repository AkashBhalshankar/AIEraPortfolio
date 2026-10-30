"""Settings read from environment variables (or a local .env file)."""
import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

_APP_DIR = Path(__file__).parent
_BACKEND_DIR = _APP_DIR.parent


def _bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


@dataclass
class Settings:
    admin_token: str = os.getenv("ADMIN_TOKEN", "")
    allowed_origins: list[str] = field(
        default_factory=lambda: [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
    )
    drive_file_id: str = os.getenv("DRIVE_FILE_ID", "")
    sa_file: str = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "")
    sa_json: str = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "")
    sync_interval_hours: float = float(os.getenv("SYNC_INTERVAL_HOURS", "6"))
    auto_approve: bool = _bool("AUTO_APPROVE", False)
    preserve_curated: bool = _bool("PRESERVE_CURATED", True)
    contact_to: str = os.getenv("CONTACT_TO", "")
    resend_api_key: str = os.getenv("RESEND_API_KEY", "")
    contact_per_hour: int = int(os.getenv("CONTACT_PER_HOUR", "5"))
    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_pass: str = os.getenv("SMTP_PASS", "")
    data_dir: Path = Path(os.getenv("DATA_DIR", str(_BACKEND_DIR / "data")))


settings = Settings()

# Ordered fallback chain. Groq, NVIDIA and OpenRouter speak the OpenAI chat-completions dialect, and so does Gemini
# through its compatibility endpoint, so one client covers all four.
PROVIDERS = [
    ("groq", "https://api.groq.com/openai/v1", os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"), os.getenv("GROQ_API_KEY", "")),
    ("gemini", "https://generativelanguage.googleapis.com/v1beta/openai", os.getenv("GEMINI_MODEL", "gemini-2.0-flash"), os.getenv("GEMINI_API_KEY", "")),
    ("nvidia", "https://integrate.api.nvidia.com/v1", os.getenv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct"), os.getenv("NVIDIA_API_KEY", "")),
    ("openrouter", "https://openrouter.ai/api/v1", os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct"), os.getenv("OPENROUTER_API_KEY", "")),
]
