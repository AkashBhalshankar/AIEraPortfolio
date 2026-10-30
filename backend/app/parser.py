"""PDF bytes -> text (pypdf) -> validated Resume JSON (LLM + Pydantic)."""
import io
import json
import re

from pydantic import ValidationError
from pypdf import PdfReader

from .llm import chat_json
from .schema import Resume

SYSTEM = """You turn a resume into JSON for a personal portfolio. Reply with ONE JSON object and nothing else.

Hard rules
- Use only facts that are in the resume text. Never invent employers, dates, metrics, links or skills. Omit what is missing.
- Never output a phone number.
- Never output a total years-of-experience number anywhere. Describe the current role with its start month instead.
- Never mention relocation or preferred cities. location is the current city only.
- Dates are "YYYY-MM". The current job has "end": null.
- Write in plain, first-person-friendly sentences. No buzzword filler.

Shape
{
 "profile": {"name","title","heroLines":[3 short lines],"lead":"one sentence: role, employer, since when, core stack","focus","topStack":[max 3],
   "location","openTo","tagline":"Ready to learn, explore and build.","email","links":{"linkedin","github","site"},
   "nowBuilding":[3-5 short phrases],"about":[2 short paragraphs],"contactLine"},
 "highlights":[{"value","label"}]   // 2-3 measurable outcomes that really appear in the resume
 "experience":[{"role","org","location","start","end","bullets":[]}]   // newest first
 "projects":[{"id","title","kind":"personal|bootcamp|work","section":"heading to group under","featured":false,"mascot":null,
   "hidden":false,"summary","description":[],"bullets":[],"stack":[],"liveUrl":null,"repoUrl":null,"challenges":[{"title","body"}],"features":[{"title","body"}]}],
 "skills":[{"group","items":[]}],
 "certifications":[{"name","issuer","code":"2 letters"}],
 "education":[{"degree","school","year","score","code":"2 letters"}],
 "leadership":[{"title","detail"}],
 "achievements":[{"title","detail"}]
}
Set featured=true only for a project that has a live URL in the resume; otherwise false for all."""


def pdf_to_text(data: bytes) -> str:
    reader = PdfReader(io.BytesIO(data))
    text = "\n".join((page.extract_text() or "") for page in reader.pages)
    return re.sub(r"[ \t]+", " ", text).strip()


def _extract_json(raw: str) -> dict:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?|```$", "", raw, flags=re.M).strip()
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object in reply")
    return json.loads(raw[start : end + 1])


async def parse_resume(pdf_bytes: bytes) -> Resume:
    text = pdf_to_text(pdf_bytes)
    if len(text) < 200:
        raise ValueError("Resume text looks empty. Is the PDF scanned? Export it as a text PDF.")
    prompt = f"Resume text:\n\n{text}"
    last_error = ""
    for attempt in range(2):  # one retry, feeding the validation error back to the model
        user = prompt if not last_error else f"{prompt}\n\nYour previous JSON was invalid: {last_error}\nReturn corrected JSON only."
        raw = await chat_json(SYSTEM, user)
        try:
            return Resume.model_validate(_extract_json(raw))
        except (ValueError, ValidationError) as exc:
            last_error = str(exc)[:600]
    raise ValueError(f"Could not produce valid JSON: {last_error}")
