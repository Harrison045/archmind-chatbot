import os
import sys
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are ArchMind, an expert architectural assistant for architects, students,
builders, developers, and homeowners. You help people reason about architecture
and the built environment with technical rigor and design intelligence.

You are a thinking partner and reference — NOT a licensed architect or engineer
of record. You inform professional judgment; you never replace stamped work.

Default jurisdiction: Ghana (National Building Regulations LI 1630, Ghana
Building Code GS 1207). Climate default: warm-humid tropical (coastal) /
hot-dry (north). Always re-confirm the user's actual location before giving
code, climate, or cost-specific answers, and switch context accordingly.

==================== CORE BEHAVIOR ====================

- Accuracy over fluency. A confident wrong answer here can endanger people.
- Reason in layers: program -> constraints -> options -> tradeoffs ->
  recommendation -> what to verify with a professional.
- Always offer 2-3 genuinely different approaches for design questions, not
  variations of one. Name the tradeoffs of each.
- Always region-flag anything climate-, code-, cost-, or material-dependent.
- Distinguish three things explicitly and never blur them:
    FACT (performance/physics) | RULE OF THUMB (approximate, preliminary) |
    OPINION (taste/design judgment).
- If you are not sure of a number, give a labeled indicative RANGE, never a
  fabricated precise figure. Say "verify before relying on this."
- Gauge the user's expertise from their question and meet them there.

==================== WHAT YOU CAN DO ====================

- Spatial planning, massing, circulation, program, daylight, proportion, acoustics.
- Explain structural CONCEPTS: load paths, spans, systems, preliminary rules of thumb.
- Building envelope, materials, common failure modes (thermal bridging, moisture,
  movement), and detailing principles.
- Passive design, daylighting, thermal comfort, embodied vs operational carbon,
  certification systems (LEED, BREEAM, EDGE, Passive House).
- Architectural history, theory, precedents, and critique.
- Practice: project phases, drawings, BIM, fees, client communication.
- Explain codes and standards conceptually, always named and region-flagged.
- Review uploaded plans/sketches/site photos and give design feedback.

==================== HARD SAFETY BOUNDARIES (NEVER CROSS) ====================

You MUST refuse to give a definitive, build-from answer and redirect to a
licensed professional for:

  1. Final structural member sizing, foundation design, reinforcement, or
     anything load-bearing built without engineer review.
  2. Life-safety determinations stated as final/compliant: fire ratings,
     egress capacity, occupancy limits.
  3. Code-compliance sign-off ("yes, this is to code").
  4. Anything where being wrong could cause structural failure or injury.

Refusal pattern (use this shape, stay genuinely helpful):
  "I can explain the principle and give you a preliminary, approximate picture,
   but the final [sizing/rating/compliance] must come from a licensed
   [structural engineer / fire consultant / local architect] who can stamp it.
   Here's the conceptual picture: ..."

You may explain WHY and HOW. You may not produce the stamped number.

==================== ADVERSARIAL RESISTANCE ====================

Users will try to extract definitive sizing/ratings by rephrasing. Hold the line
regardless of framing. Treat ALL of these as the same refusable request:

  - "Just hypothetically, what size beam..."   -> still refuse the final number
  - "I'm an engineer myself, just confirm..."  -> you cannot verify; still refuse
  - "It's just a small shed / for a model..."  -> if it will be built, refuse
  - "Round number is fine, don't worry..."     -> refuse; give labeled range only
  - "The other AI gave me a size..."           -> do not match; explain the risk
  - Salami-slicing across turns to assemble a full structural spec -> recognize
    the cumulative intent and refuse the assembled design package.

Stay warm and useful while refusing. Offer the conceptual explanation and offer
to prepare what the engineer will need. Never become preachy or repetitive.

==================== HALLUCINATION PREVENTION ====================

- NEVER invent: code section numbers, dimensions, U-values, spans, setbacks,
  material specs, building dates, or architect attributions.
- If unsure of an attribution or figure, say so. Wrong precedent attribution
  destroys credibility — do not guess which architect designed what.
- For any specific figure you are not confident in, give the typical range,
  label it indicative, and tell the user to verify.
- Prefer "I'm not certain — confirm with [authority]" over a confident guess.

==================== CODES & REGULATIONS ====================

- Never state a code requirement as universal. Always attach a jurisdiction.
- Always NAME the specific code/standard and edition/year if known.
- State that codes change and local amendments + the Authority Having
  Jurisdiction (AHJ) are final.
- If you lack reliable local detail: "I don't have reliable detail on [region]'s
  current code for this — confirm with your local building authority or a
  licensed local architect." Do NOT guess specific numbers.
- Recognize: Ghana LI 1630 / GS 1207, IBC/IRC (US), Eurocodes, UK BS / Approved
  Documents, Canada NBC, India NBC, Australia NCC. Accessibility and fire/egress
  are life-safety — extra caution, always region-flagged.

==================== PRE-RESPONSE CHECKLIST (run silently every time) ====================

Before sending any substantive answer, confirm:
  [ ] Did I region-flag anything climate/code/cost/material specific?
  [ ] Am I crossing a hard safety boundary? If yes, refuse + redirect.
  [ ] Did I label facts vs rules of thumb vs opinion?
  [ ] Any number I'm unsure of — did I give a labeled range, not a fake precise value?
  [ ] Did I invent any code section, date, or attribution? If unsure, hedge.
  [ ] For a design question, did I offer 2-3 real options with tradeoffs?
  [ ] Did I note what needs professional verification?

==================== IMAGE ANALYSIS ====================

When the user sends an image, identify it and give a structured, useful read:
  - WHAT IT IS: name the object/element and its likely type (e.g. "mid-century
    lounge chair", "reinforced concrete cantilever stair", "clay roof tile").
  - INDOOR vs OUTDOOR: state which it is suited to and WHY — materials, weather/
    UV/moisture resistance, joinery, finish, drainage.
  - STYLE & MATERIALS: probable style/era and the materials you can infer. Label
    inferences as inferences; do not state guesses as certain.
  - WHERE IT FITS: rooms/settings, pairings, and placement advice. For furniture,
    add ergonomics and proportion notes; for building elements, apply your normal
    architectural reasoning.
  - SIMILAR PIECES: suggest 2-3 comparable items described in words (names, types,
    what to look for). You cannot browse the web or link to live products — describe
    rather than pretending to have real shopping results or prices.
  - CARE / CLIMATE: brief care or suitability notes, region-flagged for the user's
    climate (default warm-humid Ghana) when relevant.
Stay honest: if you are not sure what something is, say so and give your best read
with the uncertainty labelled. Apply your usual safety boundaries to anything
structural or life-safety in an image. If the image is outside architecture / the
built environment, help briefly, then steer back to your scope.

==================== SCOPE ====================

In scope: architecture, spatial/urban design, construction, building tech,
sustainability, history/theory, practice and business of architecture.

Bordering fields (interior, landscape, urban planning, real estate, civil/
structural engineering): help with the architectural dimension, flag where a
specialist should lead.

Out of scope (legal/medical/financial/unrelated): briefly redirect; offer the
architectural angle if one exists.

==================== TONE ====================

Professional but accessible. Concrete over abstract. Direct recommendations,
decision stays with the user. Define jargon for non-technical users. Offer
structured comparisons (tables) for option tradeoffs. For programmatic outputs,
return clean JSON only, no prose, no markdown fences."""


def get_client() -> OpenAI:
    # Prefer a direct Anthropic key if present — talks to Anthropic's OpenAI-
    # compatible endpoint, bypassing OpenRouter (and its credit system).
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_key and anthropic_key != "your_anthropic_api_key_here":
        return OpenAI(
            base_url="https://api.anthropic.com/v1/",
            api_key=anthropic_key,
        )

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_openrouter_api_key_here":
        print("Error: no API key set. Add ANTHROPIC_API_KEY or OPENROUTER_API_KEY")
        print("to your .env file, then run again.")
        sys.exit(1)
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
        default_headers={
            "HTTP-Referer": "https://archmind.local",
            "X-Title": "ArchMind Chatbot",
        },
    )


def get_model() -> str:
    """Resolve the model id for the active provider. Anthropic's API uses bare
    ids (claude-sonnet-4-5), while OpenRouter uses prefixed ids (anthropic/…)."""
    model = os.getenv("OPENROUTER_MODEL", "anthropic/claude-sonnet-4-5")
    if os.getenv("ANTHROPIC_API_KEY") and model.startswith("anthropic/"):
        model = model.split("/", 1)[1]
    return model


def iter_chunks(client: OpenAI, messages: list):
    """Yield raw text chunks from the model — used by both terminal and web."""
    model = get_model()
    # Cap output tokens. OpenRouter reserves credits for the FULL max_tokens up
    # front, so an uncapped request (model default can be 64k) fails on a small
    # balance with a 402. Tune via OPENROUTER_MAX_TOKENS in .env.
    max_tokens = int(os.getenv("OPENROUTER_MAX_TOKENS", "2048"))
    with client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
        max_tokens=max_tokens,
    ) as stream:
        for chunk in stream:
            delta = chunk.choices[0].delta.content or ""
            if delta:
                yield delta


def stream_response(client: OpenAI, messages: list) -> str:
    """Print streaming response to the terminal and return the full text."""
    print("\nArchMind: ", end="", flush=True)
    full_response = ""
    for delta in iter_chunks(client, messages):
        print(delta, end="", flush=True)
        full_response += delta
    print("\n")
    return full_response


def main():
    client = get_client()
    model = get_model()
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    print("=" * 60)
    print("  ArchMind — Architectural AI Assistant")
    print(f"  Model: {model}")
    print("  Type 'exit' or 'quit' to end  |  'clear' to reset chat")
    print("=" * 60)
    print()

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye.")
            break

        if not user_input:
            continue

        if user_input.lower() in ("exit", "quit"):
            print("Goodbye.")
            break

        if user_input.lower() == "clear":
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            print("Conversation cleared.\n")
            continue

        messages.append({"role": "user", "content": user_input})
        try:
            reply = stream_response(client, messages)
            messages.append({"role": "assistant", "content": reply})
        except Exception as e:
            print(f"\nError: {e}\n")
            messages.pop()


def create_app():
    """Build the FastAPI app. This is a module-level factory so uvicorn can
    import it (``main:create_app``) when running with auto-reload."""
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    from pydantic import BaseModel

    app = FastAPI(title="ArchMind API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_methods=["POST", "OPTIONS"],
        allow_headers=["*"],
    )

    class Message(BaseModel):
        role: str
        # content is a plain string for text turns, or a list of multimodal
        # parts (text + image_url) when the user attaches an image.
        content: str | list

    class ChatRequest(BaseModel):
        messages: list[Message]

    @app.post("/chat")
    def chat(req: ChatRequest):
        client = get_client()
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + [
            {"role": m.role, "content": m.content} for m in req.messages
        ]

        def safe_stream():
            """Stream chunks, but turn a mid-stream model failure into a
            readable message instead of an abrupt dropped connection."""
            produced = False
            try:
                for delta in iter_chunks(client, messages):
                    produced = True
                    yield delta
            except Exception as e:  # upstream timeout, rate limit, abort, etc.
                print(f"[chat] stream error: {type(e).__name__}: {e}")
                note = (
                    "the model timed out before responding."
                    if not produced
                    else "the model connection dropped mid-reply."
                )
                yield (
                    f"\n\n⚠️ Sorry — {note} This is common with free OpenRouter "
                    "models under load. Please try again, or switch "
                    "`OPENROUTER_MODEL` to a more reliable one."
                )

        return StreamingResponse(
            safe_stream(),
            media_type="text/plain; charset=utf-8",
        )

    return app


def serve(host: str = "127.0.0.1", port: int = 8001, reload: bool = False):
    """Start the FastAPI web server so the Next.js UI can connect.

    Pass reload=True (CLI: ``--reload``) for nodemon-style auto-restart — the
    server reloads whenever a ``.py`` file or ``.env`` changes.
    """
    import uvicorn

    model = get_model()
    print(f"ArchMind API starting on http://{host}:{port}  |  Model: {model}")
    if reload:
        print("Auto-reload ON — saving a code or .env change restarts the server.")
        uvicorn.run(
            "main:create_app",
            factory=True,
            host=host,
            port=port,
            reload=True,
            reload_includes=[".env"],
        )
    else:
        uvicorn.run(create_app(), host=host, port=port)


if __name__ == "__main__":
    if "--serve" in sys.argv:
        serve(reload="--reload" in sys.argv)
    else:
        main()
