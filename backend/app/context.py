"""Plain-text grounding for Chikki, built from the same published JSON the website uses,
so the site and the assistant can never disagree."""
from typing import Optional


def to_context(resume: Optional[dict]) -> str:
    if not resume:
        return ""
    p = resume["profile"]
    lines = [f"{p['name']} - {p.get('title', '')}. {p.get('lead', '')}"]
    for e in resume.get("experience", []):
        lines.append(f"EXPERIENCE: {e['role']} at {e['org']} ({e['start']} to {e.get('end') or 'present'})")
        lines += [f"  - {b}" for b in e.get("bullets", [])]
    for pr in resume.get("projects", []):
        if pr.get("hidden"):
            continue
        lines.append(f"PROJECT: {pr['title']} - {pr.get('summary', '')} Stack: {', '.join(pr.get('stack', []))}")
    for g in resume.get("skills", []):
        lines.append(f"SKILLS ({g['group']}): {', '.join(g['items'])}")
    for c in resume.get("certifications", []):
        lines.append(f"CERTIFICATION: {c['name']} ({c.get('issuer', '')})")
    for a in resume.get("achievements", []):
        lines.append(f"ACHIEVEMENT: {a['title']} {a.get('detail', '')}")
    return "\n".join(lines)
