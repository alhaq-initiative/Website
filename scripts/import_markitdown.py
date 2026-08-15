#!/usr/bin/env python3
"""
Import books/documents into library chapters using MarkItDown.

Examples:
  python scripts/import_markitdown.py --input "D:/Docs/book.pdf" --series faith-sellers
  python scripts/import_markitdown.py --input "D:/Docs/batch" --book-dir 03_Filastin_Verified --story-start 1
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
from pathlib import Path

try:
    from markitdown import MarkItDown
except ImportError:
    MarkItDown = None

SUPPORTED_EXTS = {
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".csv",
    ".txt",
    ".rtf",
    ".html",
    ".htm",
    ".md",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".mp3",
    ".wav",
    ".m4a",
}

SERIES_TO_BOOK_DIR = {
    "al-nawadir-al-sultaniyya": "01_Al_Nawadir_al_Sultaniyya",
    "faith-sellers": "02_Chronicles_of_the_Faith_Sellers",
    "filastin-verified": "03_Filastin_Verified",
}


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return slug or "untitled"


def parse_book_number(book_dir: str) -> str:
    m = re.match(r"^(\d{2})_", book_dir)
    return m.group(1) if m else "00"


def to_yaml_scalar(value: str) -> str:
    if re.match(r"^[A-Za-z0-9 .,_\-/]+$", value or ""):
        return value
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def build_frontmatter(
    *,
    title: str,
    slug: str,
    series: str,
    status: str,
    source_type: str,
    story_number: int | None,
) -> str:
    lines = [
        "---",
        f"title: {to_yaml_scalar(title)}",
        f"slug: {to_yaml_scalar(slug)}",
        f"series: {to_yaml_scalar(series)}",
    ]
    if story_number is not None:
        lines.append(f"story_number: {story_number}")
    lines.extend(
        [
            f"status: {to_yaml_scalar(status)}",
            "historical_confidence: pending",
            f"source_type: {to_yaml_scalar(source_type)}",
            "tags:",
            "  - imported",
            "  - markitdown",
            "source: markitdown",
            f"last_imported: {dt.date.today().isoformat()}",
            "---",
            "",
        ]
    )
    return "\n".join(lines)


def collect_input_files(input_path: Path) -> list[Path]:
    if input_path.is_file():
        return [input_path]
    if not input_path.is_dir():
        raise FileNotFoundError(f"Input path not found: {input_path}")

    files = [
        p
        for p in input_path.rglob("*")
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTS
    ]
    files.sort()
    return files


def convert_file(md: MarkItDown, src: Path) -> str:
    if src.suffix.lower() == ".md":
        return src.read_text(encoding="utf-8", errors="ignore")

    result = md.convert(str(src))
    text = getattr(result, "text_content", "") or ""
    return text.strip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Import source docs into library markdown chapters")
    parser.add_argument("--input", required=True, help="File or directory containing source documents")
    parser.add_argument("--series", default="faith-sellers", help="Series key for frontmatter")
    parser.add_argument("--book-dir", help="Book dir under assets/library/books (e.g. 02_Chronicles_of_the_Faith_Sellers)")
    parser.add_argument("--status", default="draft", help="Frontmatter status")
    parser.add_argument("--source-type", default="document-import", help="Frontmatter source_type")
    parser.add_argument("--story-start", type=int, help="Starting story number for sequential numbering")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing output files")
    args = parser.parse_args()

    if MarkItDown is None:
        print("ERROR: markitdown is not installed. Run: python -m pip install markitdown", file=sys.stderr)
        return 2

    repo_root = Path(__file__).resolve().parents[1]
    input_path = Path(args.input).resolve()

    book_dir = args.book_dir or SERIES_TO_BOOK_DIR.get(args.series, args.series)
    out_dir = repo_root / "assets" / "library" / "books" / book_dir / "01_Chapters"
    out_dir.mkdir(parents=True, exist_ok=True)

    files = collect_input_files(input_path)
    if not files:
        print("No supported files found.")
        return 0

    md = MarkItDown()
    book_number = parse_book_number(book_dir)
    story = args.story_start

    print(f"Importing {len(files)} file(s) to {out_dir}")

    for src in files:
        title = src.stem.replace("_", " ").replace("-", " ").strip()
        slug = slugify(src.stem)

        story_number = story
        story_part = f"_{story_number:02d}" if story_number is not None else ""
        strict_name = f"{book_number}{story_part}_{slug.replace('-', '_')}.md"
        out_path = out_dir / strict_name

        if out_path.exists() and not args.overwrite:
            print(f"SKIP (exists): {out_path.name}")
            if story is not None:
                story += 1
            continue

        try:
            body_md = convert_file(md, src)
        except Exception as exc:
            print(f"FAIL: {src.name} -> {exc}", file=sys.stderr)
            if story is not None:
                story += 1
            continue

        fm = build_frontmatter(
            title=title,
            slug=slug,
            series=args.series,
            status=args.status,
            source_type=args.source_type,
            story_number=story_number,
        )
        out_path.write_text(fm + body_md, encoding="utf-8")
        print(f"OK: {src.name} -> {out_path.name}")

        if story is not None:
            story += 1

    print("Done. Next run: npm run content:index")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
