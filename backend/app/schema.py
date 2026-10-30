"""The single resume schema. The portfolio, Chikki and the download link all read this same shape."""
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class _M(BaseModel):
    model_config = ConfigDict(extra="ignore")


class Links(_M):
    linkedin: Optional[str] = None
    github: Optional[str] = None
    site: Optional[str] = None


class Profile(_M):
    name: str
    title: str = "AI Engineer"
    heroLines: list[str] = Field(default_factory=lambda: ["I build AI", "agents that", "do real work."])
    lead: str = ""
    focus: str = ""
    topStack: list[str] = Field(default_factory=list)
    location: str = ""
    openTo: str = ""
    tagline: str = "Ready to learn, explore and build."
    email: str = ""
    links: Links = Field(default_factory=Links)
    nowBuilding: list[str] = Field(default_factory=list)
    about: list[str] = Field(default_factory=list)
    contactLine: str = ""


class Highlight(_M):
    value: str
    label: str


class Experience(_M):
    role: str
    org: str
    location: str = ""
    start: str  # "YYYY-MM"
    end: Optional[str] = None  # null means present
    bullets: list[str] = Field(default_factory=list)


class Titled(_M):
    title: str
    body: str


class Project(_M):
    id: str
    title: str
    kind: Literal["personal", "bootcamp", "work"] = "personal"
    section: str = "More projects"  # heading the project is grouped under on the page
    featured: bool = False  # the one flagship project
    mascot: Optional[str] = None  # "chikki" shows the interactive robot beside the flagship
    hidden: bool = False  # flip to true in the draft to keep something off the site
    summary: str = ""
    description: list[str] = Field(default_factory=list)
    bullets: list[str] = Field(default_factory=list)
    stack: list[str] = Field(default_factory=list)
    liveUrl: Optional[str] = None
    repoUrl: Optional[str] = None
    challenges: list[Titled] = Field(default_factory=list)
    features: list[Titled] = Field(default_factory=list)


class SkillGroup(_M):
    group: str
    items: list[str]


class Certification(_M):
    name: str
    issuer: str = ""
    code: str = ""


class Education(_M):
    degree: str
    school: str = ""
    year: str = ""
    score: str = ""
    code: str = ""


class Detail(_M):
    title: str
    detail: str = ""


class Recommendation(_M):
    name: str
    role: str = ""
    relation: str = ""
    quote: str


class Meta(_M):
    updatedAt: Optional[str] = None
    sourceFileId: Optional[str] = None
    sourceModifiedTime: Optional[str] = None


class Resume(_M):
    profile: Profile
    highlights: list[Highlight] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    skills: list[SkillGroup] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    leadership: list[Detail] = Field(default_factory=list)
    achievements: list[Detail] = Field(default_factory=list)
    recommendations: list[Recommendation] = Field(default_factory=list)  # optional slot, shown only when filled
    meta: Meta = Field(default_factory=Meta)
