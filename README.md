# ArchMind 🦊

An AI assistant for **architecture and the built environment** — a terminal chatbot
and a full Next.js website, both powered by [Groq](https://console.groq.com).

ArchMind reasons about spatial planning, passive design, materials, codes and
practice — with technical rigour and clear safety limits. It informs professional
judgment; it never replaces a licensed architect's or engineer's stamped work.

## What's inside

| Part | Path | Description |
|------|------|-------------|
| Terminal chatbot | `main.py` | Streaming CLI chat over Groq |
| Backend API | `main.py --serve` | FastAPI server the website talks to |
| Website | `frontend/` | Next.js site — landing, about, use cases, and `/chat` |
| Fox mascot | `frontend/components/mascot.tsx` | Interactive corner mascot that launches a popup chat |
| Shared Q&A cache | `cache.py` | Postgres (Neon) cache so a repeated question skips the model call |

The website never sees your API key: the browser calls the Next.js `/api/chat`
route, which proxies to the Python backend, which holds the Groq credentials.

```
Browser ──▶ Next.js /api/chat ──▶ Python (main.py --serve) ──▶ Groq
                                          │
                                          ▼
                                   Postgres (Neon) — Q&A cache
```

## Prerequisites

- Python 3.12+ (this repo uses [uv](https://github.com/astral-sh/uv))
- Node.js 18+ and npm
- A Groq API key (free) — https://console.groq.com/keys
- A Postgres connection string for the shared cache — e.g. [Neon](https://neon.tech) (free tier)

## Setup

```bash
# 1. Configure the backend
cp .env.example .env
#   then edit .env and paste your GROQ_API_KEY and DATABASE_URL

# 2. Configure the frontend (defaults are fine for local dev)
cp frontend/.env.example frontend/.env.local

# 3. Install dependencies
uv sync                      # backend
cd frontend && npm install   # frontend
```

## Running

### Terminal chatbot only

```bash
uv run main.py
```

### Full website (two terminals)

```bash
# Terminal 1 — backend API
uv run main.py --serve            # normal
uv run main.py --serve --reload   # dev: auto-restart on .py / .env changes

# Terminal 2 — website
cd frontend && npm run dev   # http://localhost:3000
```

Open http://localhost:3000 and either use the full `/chat` page or click the
fox in the bottom-right corner to chat from anywhere on the site.

## Configuration

| Variable | Where | Default | Notes |
|----------|-------|---------|-------|
| `GROQ_API_KEY` | `.env` | — | Required. Your Groq key. |
| `GROQ_MODEL` | `.env` | `openai/gpt-oss-120b` | Any model id available on Groq. |
| `DATABASE_URL` | `.env` | — | Required. Postgres connection string for the shared Q&A cache. |
| `HOST` | `.env` / host env vars | `127.0.0.1` | Bind address for `main.py --serve`. Cloud hosts (Render, etc.) should set this to `0.0.0.0`. |
| `PORT` | `.env` / host env vars | `8000` | Port for `main.py --serve`. Most PaaS hosts set this automatically. |
| `FRONTEND_URLS` | `.env` (backend) | — | Comma-separated extra origins to allow in CORS (e.g. your deployed Vercel URL), on top of `http://localhost:3000`. |
| `ARCHMIND_BACKEND_URL` | `frontend/.env.local` | `http://127.0.0.1:8000` | Where the frontend proxies chat. Set to your deployed backend URL in production. |

`.env` and `.env.local` are git-ignored — your keys never leave your machine.

## Hosting

ArchMind deploys as two separate services: the Python backend and the Next.js frontend.

### Backend → Render (free tier)

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. On [Render](https://render.com), **New → Blueprint**, point it at this repo. It picks up
   [`render.yaml`](render.yaml) automatically (build: `pip install -r requirements.txt`,
   start: `python main.py --serve`).
3. In the Render dashboard, set the environment variables it left blank:
   `GROQ_API_KEY`, `DATABASE_URL` (your Neon connection string), and `FRONTEND_URLS`
   (your Vercel URL, once you have it — you can add this after step 2 below and redeploy).
4. Deploy. Render gives you a URL like `https://archmind-backend.onrender.com`.

Note: on Render's free tier, the service sleeps after inactivity and the first
request after a sleep takes ~30-50s to wake up. That's a platform limit, not a bug.

### Frontend → Vercel

1. On [Vercel](https://vercel.com), **New Project**, import this repo.
2. Set **Root Directory** to `frontend` (Vercel dashboard setting — this can't be
   done via a committed config file).
3. Add environment variable `ARCHMIND_BACKEND_URL` = your Render URL from above
   (e.g. `https://archmind-backend.onrender.com`).
4. Deploy. Vercel gives you a URL like `https://archmind.vercel.app`.
5. Back in Render, set `FRONTEND_URLS` to that Vercel URL and redeploy the backend
   so CORS allows it.

## Disclaimer

ArchMind is a thinking partner and reference, not a licensed professional. It will
not give final structural sizing, code-compliance sign-off, or life-safety
determinations — those must come from a qualified, licensed professional. When
usefulness and safety conflict, safety wins.
