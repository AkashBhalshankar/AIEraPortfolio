import json
from pathlib import Path

from fastapi.testclient import TestClient

from app import store
from app.config import settings
from app.main import app
from app.schema import Resume

SEED = json.loads((Path(__file__).parents[1] / "data" / "published.json").read_text())


def test_seed_matches_schema():
    Resume.model_validate(SEED)


def test_public_endpoints(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "data_dir", tmp_path)
    (tmp_path / "published.json").write_text(json.dumps(SEED))
    store.load()
    c = TestClient(app)
    r = c.get("/resume")
    assert r.status_code == 200 and r.headers["etag"]
    assert c.get("/resume", headers={"If-None-Match": r.headers["etag"]}).status_code == 304
    assert "Chikki" in c.get("/resume/context").text


def test_admin_flow_approve_and_rollback(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "data_dir", tmp_path)
    monkeypatch.setattr(settings, "admin_token", "secret")
    (tmp_path / "published.json").write_text(json.dumps(SEED))
    store.load()
    c = TestClient(app)
    h = {"X-Admin-Token": "secret"}
    assert c.get("/resume/draft").status_code == 401

    new = json.loads(json.dumps(SEED))
    new["certifications"].append({"name": "New Cert", "issuer": "Someone", "code": "NC"})
    r = c.put("/resume/draft", json=new, headers=h)
    assert r.status_code == 200 and r.json()["diff"]["certifications"]["added"] == ["New Cert"]

    assert c.post("/resume/approve", headers=h).status_code == 200
    assert any(x["name"] == "New Cert" for x in c.get("/resume").json()["certifications"])

    assert c.post("/resume/rollback", headers=h).status_code == 200
    assert not any(x["name"] == "New Cert" for x in c.get("/resume").json()["certifications"])


def test_merge_keeps_hand_written_content():
    from app.curate import merge_curated

    parsed = json.loads(json.dumps(SEED))
    chikki = next(p for p in parsed["projects"] if p["title"] == "Chikki")
    for key in ("challenges", "features", "description"):
        chikki[key] = []
    chikki["featured"], chikki["mascot"] = False, None
    parsed["profile"]["heroLines"] = ["x", "y", "z"]

    merged = merge_curated(SEED, parsed)
    kept = next(p for p in merged["projects"] if p["title"] == "Chikki")
    assert kept["featured"] is True and kept["mascot"] == "chikki" and len(kept["description"]) == 2
    assert merged["profile"]["heroLines"] == SEED["profile"]["heroLines"]
    Resume.model_validate(merged)


def _client(tmp_path, monkeypatch):
    from app import contact as contact_mod

    monkeypatch.setattr(settings, "data_dir", tmp_path)
    monkeypatch.setattr(settings, "smtp_host", "")
    monkeypatch.setattr(settings, "contact_per_hour", 5)
    contact_mod.reset_rate_limit()
    (tmp_path / "published.json").write_text(json.dumps(SEED))
    store.load()
    return TestClient(app)


GOOD = {"name": "Ravi", "email": "ravi@example.com", "message": "Hello Akash, we have an AI role for you.", "company": ""}


def test_contact_saves_message(tmp_path, monkeypatch):
    c = _client(tmp_path, monkeypatch)
    r = c.post("/contact", json=GOOD)
    assert r.status_code == 202 and r.json()["status"] == "saved"
    assert "Ravi" in (tmp_path / "messages.jsonl").read_text()


def test_contact_honeypot_and_validation(tmp_path, monkeypatch):
    c = _client(tmp_path, monkeypatch)
    assert c.post("/contact", json={**GOOD, "company": "spam inc"}).json() == {"status": "ok"}
    assert not (tmp_path / "messages.jsonl").exists()
    assert c.post("/contact", json={**GOOD, "email": "nope"}).status_code == 422
    assert c.post("/contact", json={**GOOD, "message": "short"}).status_code == 422


def test_contact_rate_limit(tmp_path, monkeypatch):
    c = _client(tmp_path, monkeypatch)
    codes = [c.post("/contact", json=GOOD).status_code for _ in range(6)]
    assert codes[:5] == [202] * 5 and codes[5] == 429


def test_recommendations_slot_is_preserved():
    from app.curate import merge_curated

    old = json.loads(json.dumps(SEED))
    old["recommendations"] = [{"name": "A. Lead", "role": "Engineering Lead", "relation": "managed Akash", "quote": "Great engineer."}]
    new = json.loads(json.dumps(SEED))
    new["recommendations"] = []
    assert merge_curated(old, new)["recommendations"][0]["name"] == "A. Lead"
    Resume.model_validate(old)
