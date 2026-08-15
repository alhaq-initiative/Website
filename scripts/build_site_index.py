import json
from pathlib import Path
from bs4 import BeautifulSoup

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = WORKSPACE_ROOT / "hf-space-chatbot" / "site_index.json"

def clean_html(file_path: Path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")
            
        for tag in soup(["script", "style", "nav", "svg", "noscript", "iframe", "footer"]):
            tag.decompose()
            
        title = soup.title.string.strip() if soup.title else file_path.stem
        main_node = soup.find("main") or soup.find("article") or soup.body
        clean_text = " ".join(main_node.get_text().split()) if main_node else ""
        
        rel_path = "/" + str(file_path.relative_to(WORKSPACE_ROOT)).replace("\\", "/")
        
        return {
            "file": file_path.name,
            "path": rel_path,
            "title": title,
            "content": clean_text[:5000]
        }
    except Exception as e:
        print(f"[Skip] Could not parse {file_path.name}: {e}")
        return None

def build_index():
    index_map = {}
    target_files = sorted(list(set(list(WORKSPACE_ROOT.glob("*.html")) + list(WORKSPACE_ROOT.glob("legal/*.html")) + list(WORKSPACE_ROOT.glob("legal/**/*.html")))))
    
    for file in target_files:
        data = clean_html(file)
        if data:
            index_map[data["path"]] = data
            
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(index_map, f, indent=2, ensure_ascii=False)
        
    print(f"[Done] Indexed {len(index_map)} pages into {OUTPUT_FILE}")

if __name__ == "__main__":
    build_index()
