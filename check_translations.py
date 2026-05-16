import os
import json

base_dir = r"assets\Translations"
if not os.path.exists(base_dir):
    print("Base dir not found")
    exit(1)

for root, dirs, files in os.walk(base_dir):
    json_files = [f for f in files if f.endswith('.json')]
    if not json_files:
        continue
    
    # Collect all keys across all files in this dir
    all_keys = set()
    file_data = {}
    for jf in json_files:
        fp = os.path.join(root, jf)
        with open(fp, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                file_data[jf] = data
                all_keys.update(data.keys())
            except Exception as e:
                print(f"Error parsing {fp}: {e}")
                
    # Check for missing keys
    for jf, data in file_data.items():
        missing = all_keys - set(data.keys())
        if missing:
            print(f"{os.path.basename(root)}/{jf} is missing keys: {missing}")

    # Check for empty values or English values
    for jf, data in file_data.items():
        for k, v in data.items():
            if not v:
                print(f"{os.path.basename(root)}/{jf} has empty value for key: {k}")
            elif isinstance(v, str):
                # Simple check for English characters. If a string has many English characters, it might be untranslated.
                import re
                if re.match(r'^[a-zA-Z\s\.,!\?]+$', v):
                    print(f"{os.path.basename(root)}/{jf} has English value for key {k}: {v}")

print("Check complete.")
