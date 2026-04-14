import fitz  # PyMuPDF
import os

dir_path = "src/kaynak/sari"
for filename in os.listdir(dir_path):
    if filename.endswith(".pdf"):
        filepath = os.path.join(dir_path, filename)
        print(f"\n{'='*40}")
        print(f"File: {filename}")
        print(f"{'='*40}")
        try:
            doc = fitz.open(filepath)
            for i in range(min(5, doc.page_count)):
                page = doc[i]
                text = page.get_text()
                print(f"--- Page {i+1} ---")
                print(text[:300] + ("...\n" if len(text) > 300 else "\n"))
        except Exception as e:
            print(f"Error reading {filename}: {e}")
