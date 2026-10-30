"""Keep hand-written content when the resume is re-parsed.

The resume gives facts (roles, dates, skills, certificates). It does not contain things you wrote by hand:
Chikki's challenges and features, the hero lines, which project is the flagship, links. A sync would
otherwise wipe those, so they are carried over from the currently published version."""
import copy
from typing import Optional

PROFILE_KEEP = ["heroLines", "tagline", "links", "contactLine", "about", "nowBuilding"]
PROJECT_KEEP = ["kind", "section", "featured", "mascot", "hidden", "description", "challenges", "features", "liveUrl", "repoUrl"]


def merge_curated(old: Optional[dict], new: dict) -> dict:
    if not old:
        return new
    out = copy.deepcopy(new)
    old_profile = old.get("profile", {})
    for key in PROFILE_KEEP:
        if old_profile.get(key):
            out["profile"][key] = old_profile[key]

    if old.get("recommendations"):          # endorsements are written by others, never parsed from the resume
        out["recommendations"] = old["recommendations"]

    previous = {p["title"].strip().lower(): p for p in old.get("projects", [])}
    for project in out.get("projects", []):
        before = previous.get(project["title"].strip().lower())
        if not before:
            continue
        for key in PROJECT_KEEP:
            if key in before and (before[key] not in (None, "", [])):
                project[key] = before[key]
        if before.get("featured") is not None:
            project["featured"] = before["featured"]
        if before.get("hidden") is not None:
            project["hidden"] = before["hidden"]
        if not project.get("stack"):
            project["stack"] = before.get("stack", [])
    return out
