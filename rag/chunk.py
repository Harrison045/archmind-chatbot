import re
from typing import Iterator


def split_text(
    text: str,
    chunk_size: int = 250,
    overlap: int = 25,
) -> list[str]:
    """Split *text* into overlapping chunks of roughly *chunk_size* chars.

    Tries to respect paragraph (``\\n\\n``) and sentence (``.``) boundaries
    before falling back to word boundaries.
    """
    if not text.strip():
        return []
    return list(_chunk_iter(text.strip(), chunk_size, overlap))


def _snap_to_word_start(text: str, pos: int) -> int:
    if pos <= 0:
        return 0
    if pos >= len(text):
        return len(text)
    if text[pos] == " " or text[pos - 1] == " ":
        return pos
    next_space = text.find(" ", pos)
    return next_space + 1 if next_space != -1 else len(text)


def _snap_to_word_end(text: str, pos: int) -> int:
    if pos >= len(text):
        return len(text)
    last_space = text[:pos].rfind(" ")
    return last_space + 1 if last_space != -1 else pos


def _chunk_iter(text: str, chunk_size: int, overlap: int) -> Iterator[str]:
    min_advance = max(1, chunk_size // 2)

    while True:
        if len(text) <= chunk_size:
            t = text.strip()
            if t:
                yield t
            return

        split_at = _find_split(text, chunk_size)
        if split_at is None or split_at < 1:
            split_at = _snap_to_word_end(text, chunk_size)

        chunk = text[:split_at].strip()
        if chunk:
            yield chunk

        # If what's left is small, yield it and stop
        if split_at + min_advance >= len(text):
            tail_start = _snap_to_word_start(text, split_at)
            tail = text[tail_start:].strip()
            if tail:
                yield tail
            return

        # Always advance by at least half chunk_size to avoid overlap avalanches
        advance = max(min_advance, split_at - overlap)
        advance = _snap_to_word_start(text, advance)
        text = text[advance:]


def _find_split(text: str, chunk_size: int) -> int | None:
    """Find the best split position within the first *chunk_size* chars.

    Priority:
      1. Paragraph boundary (``\\n\\n``) — prefers the LAST one in window
      2. Sentence boundary (``.``, ``!``, ``?`` followed by space/newline)
      3. Last space (word boundary)
    """
    window = text[:chunk_size]

    last_para = -1
    for m in re.finditer(r"\n\s*\n", window):
        last_para = m.end()
    if last_para > 0:
        return last_para

    for delim in (".", "!", "?"):
        idx = window.rfind(delim)
        if idx != -1:
            after = window[idx + 1:]
            if after and after[0] in (" ", "\n", "\r"):
                return idx + 1

    idx = window.rfind(" ")
    if idx != -1:
        return idx + 1

    return None
