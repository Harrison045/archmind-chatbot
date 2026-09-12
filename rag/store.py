import json
import os
from pathlib import Path

import chromadb
from chromadb.api.types import EmbeddingFunction, Documents
import numpy as np
from openai import OpenAI


COLLECTION_NAME = "archmind_kb"
CHROMA_DIR = "data/chromadb"
EMBEDDINGS_DIR = "data/embeddings"
EMBED_MODEL = "text-embedding-3-small"


class OpenRouterEmbeddingFunction(EmbeddingFunction):
    def __init__(self, model: str = EMBED_MODEL):
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key or api_key == "your_openrouter_api_key_here":
            raise RuntimeError("OPENROUTER_API_KEY not set")
        self._client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "https://archmind.local",
                "X-Title": "ArchMind Chatbot",
            },
        )
        self._model = model

    def __call__(self, texts: Documents) -> list[list[float]]:
        resp = self._client.embeddings.create(model=self._model, input=list(texts))
        return [e.embedding for e in resp.data]


def get_client() -> chromadb.PersistentClient:
    return chromadb.PersistentClient(path=str(Path(CHROMA_DIR)))


def populate() -> int:
    """Load saved embeddings + chunks into ChromaDB."""
    embeddings_dir = Path(EMBEDDINGS_DIR)

    matrix = np.load(embeddings_dir / "vectors.npy")
    with open(embeddings_dir / "metadata.json", encoding="utf-8") as f:
        meta = json.load(f)

    chunks = meta["chunks"]

    ef = OpenRouterEmbeddingFunction()
    client = get_client()
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"},
    )

    ids = [str(c["id"]) for c in chunks]
    texts = [c["text"] for c in chunks]

    collection.add(
        embeddings=matrix.tolist(),
        documents=texts,
        ids=ids,
    )

    print(f"Stored {len(chunks)} chunks in ChromaDB ({CHROMA_DIR})")
    return len(chunks)


def search(query: str, k: int = 5) -> list[dict]:
    """Query ChromaDB and return top-k results with scores."""
    ef = OpenRouterEmbeddingFunction()
    client = get_client()
    collection = client.get_collection(COLLECTION_NAME, embedding_function=ef)

    results = collection.query(
        query_texts=[query],
        n_results=k,
    )

    output = []
    for i in range(len(results["ids"][0])):
        output.append({
            "id": int(results["ids"][0][i]),
            "text": results["documents"][0][i],
            "score": round(1.0 - results["distances"][0][i], 4),
        })
    return output


def count() -> int:
    client = get_client()
    try:
        return client.get_collection(COLLECTION_NAME).count()
    except Exception:
        return 0
