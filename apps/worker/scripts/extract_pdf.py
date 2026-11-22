"""Extrae bloques de texto y aplica OCR a páginas con imágenes sin texto."""
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
            text = page.get_text(sort=True).strip()
            if not text and page.get_images(full=True):
                ocr = page.get_textpage_ocr(language="spa+eng", dpi=150, full=True)
                text = page.get_text(textpage=ocr, sort=True).strip()
            if len(text) > 40000:
                raise ValueError("Página fuera de límites")
            if text:
                entry = {"pageNumber": number, "text": text}
                links = []
                for link in page.get_links():
                    if link.get("uri", "").startswith("https://"):
                        links.append({"url": link["uri"], "label": page.get_textbox(link["from"]).strip()})
                if links:
                    entry["links"] = links
                pages.append(entry)
    sys.stdout.buffer.write(json.dumps(pages, ensure_ascii=False).encode("utf-8"))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit("Documento PDF ilegible")
