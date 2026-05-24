import os
import re

def replace_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Case sensitive replacements
        content = content.replace('Oogmatik', 'bdmind')
        content = content.replace('oogmatik', 'bdmind')
        content = content.replace('OOGMATIK', 'BDMIND')
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    root_dir = r"c:\Users\Administrator\Desktop\oogmatik"
    exclude_dirs = {'.git', 'node_modules', 'dist', '.gemini', '.idx', 'tmp'}
    exclude_files = {'oogmatik-rename.py'} # ignore itself
    
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file in exclude_files:
                continue
            
            # Process text-like files
            extensions = {'.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.txt'}
            if os.path.splitext(file)[1] in extensions:
                replace_in_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
