import re
import math
from pathlib import Path
from collections import Counter

import pdfplumber


# ---------------------------------------------------------------------------
# 1. HTML entities
# ---------------------------------------------------------------------------

HTML_ENTITY_MAP = {
    "&mdash;": "\u2014",
    "&ndash;": "\u2013",
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&#39;": "'",
    "&#8211;": "\u2013",
    "&#8212;": "\u2014",
    "&#160;": " ",
}


def decode_html_entities(text: str) -> str:
    for entity, char in HTML_ENTITY_MAP.items():
        text = text.replace(entity, char)
    text = re.sub(r"&#x([0-9A-Fa-f]+);", lambda m: chr(int(m.group(1), 16)), text)
    text = re.sub(r"&#(\d+);", lambda m: chr(int(m.group(1))), text)
    return text


# ---------------------------------------------------------------------------
# 2. PDF-extraction junk
# ---------------------------------------------------------------------------

CID_RE = re.compile(r"\(cid:(\d+)\)")


def decode_cid_glyphs(text: str) -> str:
    """Replace (cid:NNN) placeholders with known Unicode mappings."""
    known_cid = {
        127: "\u2022",  # bullet
        183: "\u00b7",  # middle dot
        149: "\u2022",  # bullet
    }
    def _replace(m: re.Match) -> str:
        num = int(m.group(1))
        return known_cid.get(num, m.group(0))
    return CID_RE.sub(_replace, text)


# ---------------------------------------------------------------------------
# 3. Page header / footer detection
# ---------------------------------------------------------------------------

def _find_repeating_lines(pages_text: list[str]) -> set[str]:
    """Identify lines that appear on 80 %+ of pages — likely headers/footers."""
    line_counts: Counter[str] = Counter()
    num_pages = len(pages_text)
    for text in pages_text:
        seen = set()
        for line in text.splitlines():
            line = line.strip()
            if line and len(line) < 60:
                seen.add(line)
        for line in seen:
            line_counts[line] += 1

    threshold = math.ceil(num_pages * 0.8)
    return {line for line, count in line_counts.items() if count >= threshold}


def strip_repeating_lines(text: str, repeating: set[str]) -> str:
    lines = text.splitlines()
    out = [l for l in lines if l.strip() not in repeating]
    return "\n".join(out)


# ---------------------------------------------------------------------------
# 4. Tables  ->  readable prose (NOT pipe/dash table format)
# ---------------------------------------------------------------------------

def _clean_cell(c) -> str:
    return (c or "").strip().replace("\n", " ")


def _table_to_sentences(rows: list[list]) -> str:
    """Turn an extracted table into flowing, readable sentences.

    The first row is treated as the header. Each following row becomes one
    sentence that pairs the header labels with the row's values, e.g.:

        Header:  ["Building use", "Typical coverage", "Notes"]
        Row:     ["Detached house", "40 - 50%", "Generous setbacks, gardens"]
        Output:  "Detached house — typical coverage 40 - 50%; notes:
                  generous setbacks, gardens."

    No pipes, no dashes-as-borders, no grid. Just sentences.
    """
    if not rows:
        return ""

    # Drop fully-empty rows
    rows = [r for r in rows if any(_clean_cell(c) for c in r)]
    if not rows:
        return ""

    header = [_clean_cell(c) for c in rows[0]]
    body_rows = rows[1:]

    # If there's no usable header or only one column, just join the values.
    if len(header) <= 1 or not body_rows:
        flat = []
        for r in rows:
            cells = [_clean_cell(c) for c in r if _clean_cell(c)]
            if cells:
                flat.append(", ".join(cells))
        return ". ".join(flat) + ("." if flat else "")

    # Labels we treat as "definition" headers -> render as "Subject: definition"
    DEFINITION_LABELS = {"meaning", "definition", "description"}
    # Labels that are just free-text notes -> append value with no label
    NOTE_LABELS = {"notes", "note"}

    def _end(s: str) -> str:
        """Ensure exactly one terminating period, no doubles."""
        s = s.rstrip()
        s = re.sub(r"\.+$", "", s)
        return s + "."

    sentences = []

    # Special case: two-column term/definition table (glossary)
    if len(header) == 2 and header[1].strip().lower() in DEFINITION_LABELS:
        for r in body_rows:
            cells = [_clean_cell(c) for c in r]
            while len(cells) < 2:
                cells.append("")
            term, definition = cells[0], cells[1]
            if not term:
                continue
            if definition:
                sentences.append(_end(f"{term}: {definition}"))
            else:
                sentences.append(_end(term))
        return " ".join(sentences)

    for r in body_rows:
        cells = [_clean_cell(c) for c in r]
        while len(cells) < len(header):
            cells.append("")
        subject = cells[0]
        if not subject:
            continue

        parts = []
        for label, value in zip(header[1:], cells[1:]):
            if not value:
                continue
            label_l = label.strip().lower()
            if label_l in NOTE_LABELS or not label_l:
                parts.append(value)
            else:
                parts.append(f"{label_l} {value}")

        if parts:
            sentences.append(_end(f"{subject} \u2014 " + "; ".join(parts)))
        else:
            sentences.append(_end(subject))

    return " ".join(sentences)


def _row_signature(cell_values: list[str]) -> set[str]:
    """Token set for matching raw table-text lines against table cell data."""
    sig = set()
    for v in cell_values:
        for tok in re.findall(r"[A-Za-z0-9%/]+", v.lower()):
            if len(tok) >= 2:
                sig.add(tok)
    return sig


def _strip_raw_table_lines(text: str, tables: list[list[list]]) -> str:
    """Remove the raw table rows that extract_text() leaves in the body text.

    extract_text() flattens each table row into a plain line. Since we render
    tables separately as prose, those raw lines are duplicates and must go.
    We match a body line to a table row by token overlap.
    """
    # Build a list of token-signatures, one per table data row.
    row_sigs = []
    for tbl in tables:
        for r in tbl:
            vals = [_clean_cell(c) for c in r if _clean_cell(c)]
            if vals:
                row_sigs.append(_row_signature(vals))

    if not row_sigs:
        return text

    kept = []
    for line in text.splitlines():
        line_tokens = set(
            t for t in re.findall(r"[A-Za-z0-9%/]+", line.lower()) if len(t) >= 2
        )
        if not line_tokens:
            kept.append(line)
            continue

        # If this line's tokens are largely contained in any table row, drop it.
        drop = False
        for sig in row_sigs:
            if not sig:
                continue
            overlap = len(line_tokens & sig)
            # require a strong match: most of the line's tokens come from the row
            if overlap >= 2 and overlap >= 0.6 * len(line_tokens):
                drop = True
                break
        if not drop:
            kept.append(line)

    return "\n".join(kept)


def extract_text_and_tables(page) -> dict:
    text = page.extract_text() or ""
    tables = page.extract_tables() or []
    return {"text": text, "tables": tables}


# ---------------------------------------------------------------------------
# 5. Table caption removal
# ---------------------------------------------------------------------------

TABLE_CAPTION_RE = re.compile(r"^Table\s+\d+(?:\.\d+)?.*$", re.MULTILINE)


def strip_table_captions(text: str) -> str:
    return TABLE_CAPTION_RE.sub("", text)


# ---------------------------------------------------------------------------
# 6. Front-matter stripping
# ---------------------------------------------------------------------------

FRONT_MATTER_KEYWORDS = [
    "Document version",
    "support@",
    "Table of Contents",
    "Internal distribution",
    "Supersedes v",
    "Last revised",
    "Prepared by",
    "Studio line",
    "Source Reference Document",
    "ArchAssist",
    "Architectural Design",
    "Meridian Design",
]


def strip_front_matter(text: str) -> str:
    """Remove everything before the first section heading (e.g. '1. ')."""
    lines = text.splitlines()
    filtered = []
    in_front = True
    for line in lines:
        if in_front:
            if re.match(r"^\d+\.\s", line.strip()):
                in_front = False
                filtered.append(line)
                continue
            if any(kw.lower() in line.lower() for kw in FRONT_MATTER_KEYWORDS):
                continue
            if re.match(r"^[l|]\s*\d+\.\s", line.strip()):  # TOC line like "l 1. Site Analysis"
                continue
            if not line.strip():
                continue
            filtered.append(line)
        else:
            filtered.append(line)
    return "\n".join(filtered)


# ---------------------------------------------------------------------------
# 7. Section detection
# ---------------------------------------------------------------------------

SECTION_NUM_RE = re.compile(r"(\d+(?:\.\d+)*)\.")


def find_sections(text: str) -> list[dict]:
    starts: list[tuple[int, str]] = []
    for m in re.finditer(r"^(\d+)\.\s+([A-Z])", text, re.MULTILINE):
        starts.append((m.start(), m.group(1)))

    if not starts:
        return [{"number": "", "title": "", "text": text.strip()}]

    sections = []
    for i, (start, num) in enumerate(starts):
        end = starts[i + 1][0] if i + 1 < len(starts) else len(text)
        raw = text[start:end].strip()
        body = raw[len(num) + 2:]

        period_m = re.search(r"\.\s+[a-z]", body)
        sub_m = re.search(r"\s+\d+\.\d+", body)

        boundary = None
        if period_m:
            boundary = period_m
        if sub_m and (boundary is None or sub_m.start() < boundary.start()):
            boundary = sub_m

        if boundary:
            title = body[:boundary.start()].strip().rstrip(".,:;")
        else:
            title = body.strip().rstrip(".,:;")

        text_body = raw[len(num) + 2 + len(title):].strip()
        sections.append({"number": num, "title": title, "text": text_body})

    return sections


def split_sections(text: str) -> list[dict]:
    return find_sections(text)


# ---------------------------------------------------------------------------
# 8. Unit conversion
# ---------------------------------------------------------------------------

FEET_INCHES_RE = re.compile(
    r"(?<=\d)\s*(?:ft|feet|foot|')\s*(?:(?:and\s+)?(\d+)\s*(?:in|inches|inch|\"))?",
    re.IGNORECASE,
)
PURE_FEET_RE = re.compile(
    r"(\d+(?:\.\d+)?)\s*(?:ft|feet|foot)(?!\s*(?:and\s+)?\d+\s*(?:in|inches|inch|\"))",
    re.IGNORECASE,
)
INCHES_RE = re.compile(
    r"(\d+(?:\.\d+)?)\s*(?:in|inches|inch)(?![/\w])",
    re.IGNORECASE,
)
SQFT_RE = re.compile(
    r"(\d+(?:\.\d+)?)\s*(?:sq\s*ft|square\s*feet|square\s*foot)",
    re.IGNORECASE,
)
SQFT_ABBR_RE = re.compile(
    r"(\d+(?:\.\d+)?)\s*(?:sf|s\.f\.)(?![/\w])",
    re.IGNORECASE,
)


def _to_metres_feet(match: re.Match) -> str:
    val = float(match.group(1))
    metres = round(val * 0.3048, 2)
    return f"{metres} m"


def _to_metres_inches(match: re.Match) -> str:
    val = float(match.group(1))
    metres = round(val * 0.0254, 2)
    return f"{metres} m"


def _to_sqm(match: re.Match) -> str:
    val = float(match.group(1))
    sqm = round(val * 0.092903, 2)
    return f"{sqm} m\u00b2"


def convert_imperial_to_metric(text: str) -> str:
    text = SQFT_RE.sub(_to_sqm, text)
    text = SQFT_ABBR_RE.sub(_to_sqm, text)
    text = PURE_FEET_RE.sub(_to_metres_feet, text)
    text = INCHES_RE.sub(_to_metres_inches, text)
    return text


# ---------------------------------------------------------------------------
# 9. Main cleaning pipeline
# ---------------------------------------------------------------------------


def clean_text(text: str) -> str:
    text = decode_html_entities(text)
    text = decode_cid_glyphs(text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"-\s*\n\s*", "", text)
    text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)
    text = re.sub(r"[^\S\n]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def rebuild_paragraphs(raw: str) -> str:
    blocks = re.split(r"\n\s*\n", raw)
    cleaned = []
    for block in blocks:
        block = clean_text(block)
        if not block:
            continue
        cleaned.append(block)
    return "\n\n".join(cleaned)


def clean_pdf(
    pdf_path: str,
    output_path: str | None = None,
    strip_front: bool = True,
    convert_units: bool = False,
    split_sections_flag: bool = False,
    include_tables: bool = True,
) -> str | list[dict]:
    """Extract, clean, and optionally structure a PDF.

    Tables are converted into readable sentences and merged inline with the
    text they belong to. The raw flattened table rows that extract_text()
    produces are removed so the data is not duplicated. ``include_tables``
    now defaults to True because the table content is the data — it just
    appears as prose, not as a grid.
    """
    pdf_path = str(pdf_path)
    pages_raw: list[str] = []
    pages_tables: list[list] = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            data = extract_text_and_tables(page)
            pages_raw.append(data["text"])
            pages_tables.append(data["tables"])

    repeating = _find_repeating_lines(pages_raw)

    text_parts: list[str] = []
    for raw, tables in zip(pages_raw, pages_tables):
        raw = strip_repeating_lines(raw, repeating)
        raw = strip_table_captions(raw)

        # Remove the raw duplicate table rows left by extract_text()
        if tables:
            raw = _strip_raw_table_lines(raw, tables)

        page_text = rebuild_paragraphs(raw)

        # Re-add the table content as readable prose (if requested)
        if include_tables and tables:
            prose_tables = []
            for tbl in tables:
                sent = _table_to_sentences(tbl)
                if sent.strip():
                    prose_tables.append(sent.strip())
            if prose_tables:
                page_text = (page_text + "\n\n" + "\n\n".join(prose_tables)).strip()

        text_parts.append(page_text)

    text = "\n\n".join(text_parts)

    if strip_front:
        text = strip_front_matter(text)

    if convert_units:
        text = convert_imperial_to_metric(text)

    text = text.strip()

    if split_sections_flag:
        chunks = split_sections(text)
        if output_path:
            out = Path(output_path)
            out.parent.mkdir(parents=True, exist_ok=True)
            if out.suffix == ".jsonl":
                import json
                with out.open("w", encoding="utf-8") as f:
                    for chunk in chunks:
                        f.write(json.dumps(chunk, ensure_ascii=False) + "\n")
            else:
                combined = "\n\n---\n\n".join(
                    f"## {c['number']} {c['title']}\n\n{c['text']}"
                    for c in chunks if c["number"]
                )
                out.write_text(combined, encoding="utf-8")
        return chunks

    if output_path:
        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")

    return text


def clean_pdf_pages(
    pdf_path: str,
    output_dir: str | None = None,
    strip_front: bool = True,
    include_tables: bool = True,
) -> list[dict]:
    """Extract and clean each page separately.

    Tables are rendered as prose and the raw duplicate rows are removed.
    """
    with pdfplumber.open(pdf_path) as pdf:
        pages_raw = [extract_text_and_tables(p) for p in pdf.pages]

    page_texts = [p["text"] for p in pages_raw]
    repeating = _find_repeating_lines(page_texts)

    result: list[dict] = []
    for i, data in enumerate(pages_raw):
        raw = data["text"]
        tables = data["tables"]
        raw = strip_repeating_lines(raw, repeating)
        raw = strip_table_captions(raw)

        if tables:
            raw = _strip_raw_table_lines(raw, tables)

        text = rebuild_paragraphs(raw)

        if not text.strip() and not tables:
            continue

        if include_tables and tables:
            prose_tables = []
            for tbl in tables:
                sent = _table_to_sentences(tbl)
                if sent.strip():
                    prose_tables.append(sent.strip())
            if prose_tables:
                text = (text + "\n\n" + "\n\n".join(prose_tables)).strip()

        result.append({"page": i + 1, "text": text.strip()})

    if strip_front and result:
        first = result[0]["text"]
        stripped = strip_front_matter(first)
        result[0]["text"] = stripped

    if output_dir:
        out_dir = Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        for entry in result:
            out_dir.joinpath(f"page_{entry['page']:04d}.txt").write_text(
                entry["text"], encoding="utf-8"
            )

    return result


# ---------------------------------------------------------------------------
# 10. Inspection helper
# ---------------------------------------------------------------------------


def inspect_structure(pdf_path: str, pages: int = 3) -> None:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"PDF: {pdf_path}")
        print(f"Total pages: {len(pdf.pages)}\n")
        for i, page in enumerate(pdf.pages[:pages]):
            print(f"--- Page {i + 1} ({page.width:.0f} x {page.height:.0f}) ---")
            text = page.extract_text() or ""
            print(text[:600])
            print()
            tables = page.extract_tables()
            if tables:
                print(f"  [{len(tables)} table(s) found]")
                for ti, t in enumerate(tables):
                    print(f"  Table {ti + 1}: {len(t)} rows")
            print()


if __name__ == "__main__":
    import sys
    src = sys.argv[1] if len(sys.argv) > 1 else "/mnt/user-data/outputs/ArchAssist_Knowledge_Base.pdf"
    out = clean_pdf(src, convert_units=True, include_tables=True)
    print(out)