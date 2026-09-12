"""Postgres-backed cache for single-question ArchMind conversations, shared
across every deployment/instance (e.g. a Neon Postgres database).

Only the first user message of a fresh conversation is cached — once a
conversation has history, the answer depends on that context, so caching by
question text alone would return stale/wrong answers.
"""

import hashlib
import os
import re

import psycopg2
from psycopg2.pool import SimpleConnectionPool

_pool: SimpleConnectionPool | None = None


def _get_pool() -> SimpleConnectionPool:
    global _pool
    if _pool is None:
        DATABASE_URL = os.getenv("DATABASE_URL")
        if not DATABASE_URL or DATABASE_URL == "your_database_connection_string_here":
            raise RuntimeError(
                "DATABASE_URL is not set in your .env file. "
                "Add your Neon/Postgres connection string, then run again."
            )
        _pool = SimpleConnectionPool(1, 5, DATABASE_URL)
        with _pool.getconn() as conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        CREATE TABLE IF NOT EXISTS qa_cache (
                            question_hash TEXT PRIMARY KEY,
                            question TEXT NOT NULL,
                            answer TEXT NOT NULL,
                            created_at TIMESTAMPTZ DEFAULT NOW()
                        )
                        """
                    )
                conn.commit()
            finally:
                _pool.putconn(conn)
    return _pool


def normalize(question: str) -> str:
    """Collapse whitespace/case so trivially-different phrasing still hits cache."""
    return re.sub(r"\s+", " ", question.strip().lower())


def _hash(question: str) -> str:
    return hashlib.sha256(normalize(question).encode("utf-8")).hexdigest()


def get(question: str) -> str | None:
    pool = _get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT answer FROM qa_cache WHERE question_hash = %s",
                (_hash(question),),
            )
            row = cur.fetchone()
            return row[0] if row else None
    finally:
        pool.putconn(conn)


def save(question: str, answer: str) -> None:
    if not answer.strip():
        return
    pool = _get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO qa_cache (question_hash, question, answer)
                VALUES (%s, %s, %s)
                ON CONFLICT (question_hash) DO UPDATE SET
                    answer = EXCLUDED.answer,
                    created_at = NOW()
                """,
                (_hash(question), question.strip(), answer),
            )
        conn.commit()
    finally:
        pool.putconn(conn)
