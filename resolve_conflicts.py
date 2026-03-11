import os
import re

def resolve_conflicts(directory):
    # Regex to find git conflict blocks
    conflict_pattern = re.compile(r'<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [a-f0-9]+', re.MULTILINE)

    for root, dirs, files in os.walk(directory):
        if '.git' in dirs:
            dirs.remove('.git') # Don't go into .git folder
        
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.css', '.bat', '.md')):
                filepath = os.path.join(root, file)
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                except UnicodeDecodeError:
                    continue # Skip binary or non-utf8 files

                if '<<<<<<< HEAD' in content:
                    print(f"Resolving conflicts in: {filepath}")
                    
                    # Replacement: Keep HEAD version
                    new_content = conflict_pattern.sub(r'\1', content)
                    
                    # Sometimes the hash might be different or missing if it's a different merge tool output
                    # Fallback pattern for any conflict
                    if '<<<<<<< HEAD' in new_content:
                        fallback_pattern = re.compile(r'<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> .*?\n', re.MULTILINE)
                        new_content = fallback_pattern.sub(r'\1', new_content)
                    
                    if new_content != content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Fixed {filepath}")

if __name__ == "__main__":
    resolve_conflicts('.')
