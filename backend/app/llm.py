"""Ordered model failover: Groq -> Gemini -> NVIDIA -> OpenRouter.
A 429, 5xx, timeout or unusable reply moves on to the next provider."""
import logging

import httpx

from .config import PROVIDERS

log = logging.getLogger("llm")


class AllProvidersFailed(RuntimeError):
    pass


async def chat_json(system: str, user: str, timeout: float = 90.0) -> str:
    errors: list[str] = []
    async with httpx.AsyncClient(timeout=timeout) as client:
        for name, base, model, key in PROVIDERS:
            if not key:
                continue
            try:
                r = await client.post(
                    f"{base}/chat/completions",
                    headers={"Authorization": f"Bearer {key}"},
                    json={
                        "model": model,
                        "temperature": 0,
                        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                    },
                )
                if r.status_code == 429 or r.status_code >= 500:
                    raise RuntimeError(f"HTTP {r.status_code}")
                r.raise_for_status()
                text = r.json()["choices"][0]["message"]["content"]
                if not text or not text.strip():
                    raise RuntimeError("empty reply")
                log.info("parsed with %s", name)
                return text
            except Exception as exc:  # noqa: BLE001 - any failure means "try the next provider"
                log.warning("provider %s failed: %s", name, exc)
                errors.append(f"{name}: {exc}")
    raise AllProvidersFailed("; ".join(errors) or "no provider has an API key")
