# ArchMind 🦊

An AI assistant for **architecture and the built environment** — a terminal chatbot
and a full Next.js website, both powered by [OpenRouter](https://openrouter.ai).

ArchMind reasons about spatial planning, passive design, materials, codes and
practice — with technical rigour and clear safety limits. It informs professional
judgment; it never replaces a licensed architect's or engineer's stamped work.

## What's inside

| Part | Path | Description |
|------|------|-------------|
| Terminal chatbot | `main.py` | Streaming CLI chat over OpenRouter |
| Backend API | `main.py --serve` | FastAPI server the website talks to |
| Website | `frontend/` | Next.js site — landing, about, use cases, and `/chat` |
| Fox mascot | `frontend/components/mascot.tsx` | Interactive corner mascot that launches a popup chat |

The website never sees your API key: the browser calls the Next.js `/api/chat`
route, which proxies to the Python backend, which holds the OpenRouter credentials.

```
Browser ──▶ Next.js /api/chat ──▶ Python (main.py --serve) ──▶ OpenRouter
```

## Prerequisites

- Python 3.12+ (this repo uses [uv](https://github.com/astral-sh/uv))
- Node.js 18+ and npm
- An OpenRouter API key — https://openrouter.ai/keys

## Setup

```bash
# 1. Configure the backend
cp .env.example .env
#   then edit .env and paste your OPENROUTER_API_KEY

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
uv run main.py --serve       # http://127.0.0.1:8000

# Terminal 2 — website
cd frontend && npm run dev   # http://localhost:3000
```

Open http://localhost:3000 and either use the full `/chat` page or click the
fox in the bottom-right corner to chat from anywhere on the site.

## Configuration

| Variable | Where | Default | Notes |
|----------|-------|---------|-------|
| `OPENROUTER_API_KEY` | `.env` | — | Required. Your OpenRouter key. |
| `OPENROUTER_MODEL` | `.env` | `anthropic/claude-sonnet-4-5` | Any OpenRouter model id. |
| `ARCHMIND_BACKEND_URL` | `frontend/.env.local` | `http://127.0.0.1:8000` | Where the frontend proxies chat. |

`.env` and `.env.local` are git-ignored — your key never leaves your machine.

## Disclaimer

ArchMind is a thinking partner and reference, not a licensed professional. It will
not give final structural sizing, code-compliance sign-off, or life-safety
determinations — those must come from a qualified, licensed professional. When
usefulness and safety conflict, safety wins.
