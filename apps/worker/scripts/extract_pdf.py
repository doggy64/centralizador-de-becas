"""Extrae texto de páginas digitales. Las páginas escaneadas quedan sin texto."""
import json
import sys

import pymupdf


def main():
    data = sys.stdin.buffer.read(5 * 1024 * 1024 + 1)
    if len(data) > 5 * 1024 * 1024 or not data.startswith(b"%PDF-"):
        raise ValueError("PDF inválido")
    with pymupdf.open(stream=data, filetype="pdf") as doc:
        if doc.needs_pass or len(doc) > 100:
            raise ValueError("PDF fuera de límites")
        pages = []
        for number, page in enumerate(doc, 1):
            text = " ".join(page.get_text().split())[:2000]
            if text:
                pages.append({"pageNumber": number, "text": text})
    sys.stdout.buffer.write(json.dumps(pages, ensure_ascii=False).encode("utf-8"))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit("Documento PDF ilegible")
