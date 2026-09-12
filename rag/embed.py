import json
import os
from pathlib import Path

import numpy as np
from openai import OpenAI


def get_client() -> OpenAI:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key or api_key == "your_openrouter_api_key_here":
        raise RuntimeError(
            "OPENROUTER_API_KEY not set. Add it to your .env file."
        )
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
        default_headers={
            "HTTP-Referer": "https://archmind.local",
            "X-Title": "ArchMind Chatbot",
        },
    )


def generate_embeddings(
    chunks: list[dict],
    model: str = "text-embedding-3-small",
    output_dir: str = "data/embeddings",
    batch_size: int = 20,
) -> np.ndarray:
    """Generate embeddings for a list of chunk dicts and save to disk.

    Each chunk dict must have ``"id"`` and ``"text"`` keys.

    Returns the embedding matrix (n_chunks x dim).
    """
    client = get_client()
    texts = [c["text"] for c in chunks]

    all_embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        resp = client.embeddings.create(model=model, input=batch)
        all_embeddings.extend(e.embedding for e in resp.data)

    matrix = np.array(all_embeddings, dtype=np.float32)

    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    np.save(out / "vectors.npy", matrix)

    # Human-readable JSON copy
    with open(out / "vectors.json", "w", encoding="utf-8") as f:
        json.dump(
            {"model": model, "dim": matrix.shape[1], "vectors": matrix.tolist()},
            f,
            indent=2,
        )

    with open(out / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(
            {
                "model": model,
                "dim": matrix.shape[1],
                "chunks": chunks,
            },
            f,
            indent=2,
            ensure_ascii=False,
        )

    print(f"Saved {len(chunks)} embeddings ({matrix.shape[1]}d) to {out}")
    return matrix


def load_index(
    index_dir: str = "data/embeddings",
) -> tuple[np.ndarray, list[dict], str]:
    """Load embedding matrix, chunk metadata, and model name."""
    index_dir = Path(index_dir)
    matrix = np.load(index_dir / "vectors.npy")
    with open(index_dir / "metadata.json", encoding="utf-8") as f:
        meta = json.load(f)
    return matrix, meta["chunks"], meta["model"]


def search(
    query: str,
    matrix: np.ndarray,
    chunks: list[dict],
    model: str | None = None,
    k: int = 5,
) -> list[dict]:
    """Return top-*k* chunks most similar to *query*.

    Each result: ``{"id": int, "text": str, "score": float}``.
    """
    client = get_client()
    resp = client.embeddings.create(
        model=model or "text-embedding-3-small",
        input=[query],
    )
    q_vec = np.array(resp.data[0].embedding, dtype=np.float32)

    scores = (matrix @ q_vec) / (
        np.linalg.norm(matrix, axis=1) * np.linalg.norm(q_vec)
    )
    top_idx = np.argsort(scores)[-k:][::-1]

    return [
        {**chunks[i], "score": round(float(scores[i]), 4)}
        for i in top_idx
    ]
