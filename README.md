# Akash Bhalshankar: portfolio

A React portfolio that renders from **one resume JSON**. A FastAPI service keeps that JSON in sync with the resume PDF in your Google Drive. Update the PDF, press Sync, review the changes, press Approve, and the site updates with no redeploy.

```
akash-portfolio/
├─ preview/portfolio-preview.html   the approved single-file preview (just double-click it)
├─ frontend/                        React 18 + Vite + Tailwind + Framer Motion
└─ backend/                         FastAPI + Drive sync + admin review page
```

---

## Setup in 15 minutes

You need: **Node 20+**, **Python 3.12** (not 3.14, some packages have no wheels yet), and about **1 GB free disk space** on the drive where pip caches (usually C:).

### Step 1. See it first (no setup)
Open `preview/portfolio-preview.html` in a browser. This is the approved design.

### Step 2. Start the backend

**Windows (PowerShell)**
```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1          # if blocked: Set-ExecutionPolicy -Scope Process Bypass
pip install -r requirements.txt
copy .env.example .env
notepad .env                          # set ADMIN_TOKEN to any long random text, save
python -m uvicorn app.main:app --reload
```

**macOS / Linux**
```bash
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env && nano .env     # set ADMIN_TOKEN
python -m uvicorn app.main:app --reload
```
Check: open http://localhost:8000/health. You should see `{"ok":true,"published":true,...}`. Interactive API docs are at http://localhost:8000/docs.

> Use `python -m uvicorn`, not bare `uvicorn`. It works even if the venv's Scripts folder is not on PATH.

### Step 3. Start the frontend (new terminal)
```bash
cd frontend
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run dev
```
Open http://localhost:5173. The page loads from the API; if the API is down it falls back to the bundled `src/data/resume.fallback.json`, so it never shows a blank page.

### Step 4. Connect Google Drive (once)
1. Go to https://console.cloud.google.com, create a project, then **APIs & Services > Library > Google Drive API > Enable**.
2. **IAM & Admin > Service Accounts > Create**. Open it, **Keys > Add key > JSON**. Save the file as `backend/service-account.json`.
3. Copy the service account's email (looks like `name@project.iam.gserviceaccount.com`).
4. In Google Drive, open your resume PDF, **Share**, paste that email, give **Viewer** access.
5. Copy the file id from the PDF's URL: `drive.google.com/file/d/`**`THIS_PART`**`/view`.
6. In `backend/.env` set `DRIVE_FILE_ID=THIS_PART` and keep `GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json`.
7. Add at least one free model key to `.env`, for example `GROQ_API_KEY` from https://console.groq.com. Providers are tried in this order and the first success wins: Groq, Gemini, NVIDIA, OpenRouter.
8. Restart the backend. `/health` should now show `"driveConfigured": true`.

### Step 5. Your first sync
1. Open http://localhost:8000/admin and paste your `ADMIN_TOKEN`.
2. Press **Sync from Drive**. It downloads the PDF, extracts the text, builds the JSON and saves a **draft** with a diff of what would change.
3. Press **View draft and diff**, fix anything in the editor (for example `"hidden": true` on a project you don't want shown), and **Save draft**.
4. Press **Approve and publish**. Refresh http://localhost:5173 and the change is live. **Roll back** undoes it.

Hand-written content (Chikki's challenges and features, hero lines, links, which project is the flagship) is carried over from the published version on every sync, so re-parsing never wipes it. Set `PRESERVE_CURATED=false` to turn that off.

### Step 6. Check everything works
```bash
cd backend && pip install -r requirements-dev.txt && pytest      # 8 tests
cd frontend && npm run build                                      # produces dist/
```

---

## Extra features
- **View as** buttons (AI Engineer, Backend, Full-stack, QA) re-order the skills and highlight matching tags and experience lines. Share a tailored link such as `https://akashbhalshankar.com/?role=backend`, or any word: `?role=langgraph`, or `?skills=fastapi,rag`.
- **Print resume view**: footer link or Ctrl+P gives a clean one-page layout (no animation, everything expanded).
- **Contact form** posts to `POST /contact`. Spam protection: hidden honeypot field, `CONTACT_PER_HOUR` per-IP limit, strict length checks. Every message is first saved to `backend/data/messages.jsonl`, then emailed if `SMTP_*` and `CONTACT_TO` are set (Gmail needs an App Password). Without `VITE_API_URL` the form tells visitors to use email.
- **Recommendations** appear only when `recommendations` in the resume JSON has entries, so nothing is ever invented: `{"name","role","relation","quote"}`. Add them in `/admin` (edit draft) and they survive resyncs.
- **Accessibility and SEO**: skip link, `aria-current` on the active nav link, reduced-motion support everywhere, JSON-LD Person data, theme-color, high-priority hero image.

## Updating the site later
1. Replace the PDF in Drive (same file, so the id stays the same).
2. Wait for the scheduled sync (`SYNC_INTERVAL_HOURS`, default 6) or press **Sync from Drive** in `/admin`.
3. Review the diff, then **Approve**. New organisations, projects, certificates and achievements appear automatically.

If Drive, the parser or every model fails, nothing changes: the live site keeps its last published version. `AUTO_APPROVE=true` publishes without the review step (not recommended).

## Folder structure
```
akash-portfolio/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── admin.html
│   │   ├── config.py
│   │   ├── contact.py
│   │   ├── context.py
│   │   ├── curate.py
│   │   ├── drive.py
│   │   ├── llm.py
│   │   ├── main.py
│   │   ├── parser.py
│   │   ├── schema.py
│   │   ├── store.py
│   │   └── sync.py
│   ├── data/
│   │   ├── history/
│   │   └── published.json
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_smoke.py
│   ├── .env.example
│   ├── .python-version
│   ├── requirements-dev.txt
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── hero-art.webp
│   │   ├── og.png
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── components/
│   │   │   ├── About.jsx
│   │   │   ├── BackToTop.jsx
│   │   │   ├── ChikkiBot.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── CountUp.jsx
│   │   │   ├── CursorGlow.jsx
│   │   │   ├── Experience.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── GlanceBar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Intro.jsx
│   │   │   ├── Magnet.jsx
│   │   │   ├── Marked.jsx
│   │   │   ├── More.jsx
│   │   │   ├── Nav.jsx
│   │   │   ├── Orbs.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Reveal.jsx
│   │   │   ├── RootNetwork.jsx
│   │   │   ├── Skills.jsx
│   │   │   ├── SplitTitle.jsx
│   │   │   └── StackStrip.jsx
│   │   ├── data/
│   │   │   └── resume.fallback.json
│   │   ├── hooks/
│   │   │   ├── useResume.js
│   │   │   ├── useScroll.js
│   │   │   ├── useSpotlight.js
│   │   │   └── useTheme.js
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── role.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── preview/
│   └── portfolio-preview.html
├── .gitignore
└── README.md
```

## What each part does
```
frontend/src
├─ App.jsx                 wires hooks and sections together
├─ components/             Nav, Hero (headline + cutout art), RootNetwork (canvas roots), GlanceBar, StackStrip, About, Experience,
│                          Projects (flagship + ChikkiBot), Skills, More, Contact, Footer,
│                          BackToTop, Orbs, Reveal, Magnet, Intro, CursorGlow, SplitTitle, CountUp, Marked, Recommendations
├─ hooks/                  useResume (API, then cache, then bundled JSON), useTheme, useScroll
├─ data/resume.fallback.json   last-known-good content bundled into the build
├─ lib/api.js              API base URL, resume download URL, date formatting
└─ styles.css              design tokens (Moss default, Clay, Bark) and all component styles
frontend/public            favicon, robots.txt, sitemap.xml, og.png (1200x630 share image), hero-art.webp (transparent cutout, recolored to Moss)

backend/app
├─ main.py                 routes, CORS, scheduler
├─ drive.py                Drive PDF into memory (io.BytesIO), no temp files
├─ parser.py               pypdf text, LLM, Pydantic-validated JSON (one self-correcting retry)
├─ llm.py                  Groq > Gemini > NVIDIA > OpenRouter failover
├─ schema.py               the resume schema every consumer shares
├─ curate.py               keeps hand-written content across syncs
├─ store.py                atomic files, in-memory hot swap, draft, approve, rollback, diff
├─ sync.py                 one sync run
├─ contact.py              contact form delivery and spam protection
├─ context.py              plain text for Chikki, built from the same JSON
└─ admin.html              review page at /admin
backend/data/published.json    seed content served until your first approved sync
```

**Tech stack.** Frontend: React 18, Vite, Tailwind, Framer Motion, CSS keyframes. Backend: Python 3.12, FastAPI, Pydantic v2, pypdf, httpx, APScheduler, Google Drive API. Fonts: Bricolage Grotesque and Instrument Sans.

## API
| Route | Who | What |
|---|---|---|
| `GET /resume` | public | published JSON with ETag and short cache |
| `GET /resume/download` | public | newest resume PDF from Drive (cached copy if Drive is down) |
| `GET /resume/context` | public | plain text for Chikki from the same JSON |
| `POST /contact` | public | contact form (honeypot, rate limit, SMTP or saved to a file) |
| `POST /resume/sync?force=` | admin | Drive to draft plus diff |
| `GET` / `PUT /resume/draft` | admin | read or edit the draft (validated) |
| `POST /resume/approve` | admin | publish the draft |
| `POST /resume/rollback` | admin | restore the previous or a named version |
| `GET /resume/history` | admin | rollback points |

Admin routes need the header `X-Admin-Token`. To make Chikki read the same data, have her call `GET /resume/context` (or import `app.context.to_context`).

## Content rules we agreed (also enforced in `parser.py`)
- No fixed years-of-experience number; the hero says "AI Engineer at UBS, since October 2025", so it never goes stale.
- No relocation or preferred-city text. Location is "Hyderabad, India" with "Ready to learn, explore and build."
- No internal UBS project names or flows. Chikki is the single flagship; AgriMentor is listed as a UBS bootcamp project. Projects that are not built or deployed are not listed.
- Only facts from the resume are used. The phone number is never published.
- Pizza Xpert and investing are not on the site. NCC stays under Leadership.

## Deploy
- **Frontend** (Vercel or Netlify): root `frontend`, build `npm run build`, output `dist`, env `VITE_API_URL=https://your-api-url`.
- **Backend** (Render, Railway or Fly): root `backend`, build `pip install -r requirements.txt`, start `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Copy every `.env` value into the host's environment. Put the service account JSON in `GOOGLE_SERVICE_ACCOUNT_JSON` instead of a file. Set `ALLOWED_ORIGINS=https://akashbhalshankar.com`. Mount a **persistent disk** at `DATA_DIR`, otherwise approved data resets on restart (the site still falls back to the bundled JSON).

## Before you publish
- Replace the LinkedIn and GitHub placeholder links (in `resume.fallback.json` and `backend/data/published.json`, or later in `/admin`).
- `frontend/public/og.png` is the link-preview image (already added). If you move the site off akashbhalshankar.com, update the URLs in `frontend/index.html` and `sitemap.xml`.
- Add your real LinkedIn and GitHub URLs to the JSON-LD `sameAs` in `frontend/index.html` for better search results.
- Set `VITE_API_URL` so the **Download resume** button points at `/resume/download`.

## Troubleshooting
| Symptom | Fix |
|---|---|
| `No space left on device` while installing | Free disk space, run `pip cache purge`, retry. Set `TMP`/`TEMP` to a drive with space if C: is full. |
| `uvicorn is not recognized` | The install failed or the venv is not active. Run `.\.venv\Scripts\Activate.ps1`, reinstall, and start with `python -m uvicorn ...`. |
| Package build errors on Python 3.14 | Use Python 3.12 (`py -3.12 -m venv .venv`). |
| Page shows old content | The browser caches the last good copy; hard refresh, or approve a new draft. |
| CORS error in the browser | Add your frontend origin to `ALLOWED_ORIGINS`. |
| `Invalid admin token` | `ADMIN_TOKEN` in `.env` must match what you paste in `/admin`. |
| Drive `404` or `403` | Share the PDF with the service account email, and double-check `DRIVE_FILE_ID`. |
| `Every model provider failed` | Add or check a key in `.env`; a 429 means that provider is rate-limited and the next one is tried. |
| `Resume text looks empty` | The PDF is a scan. Export a text PDF from Word or Docs. |
