import os

def resolve_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        return False

    if not any('<<<<<<< HEAD' in line for line in lines):
        return False

    new_lines = []
    state = 'NORMAL' # NORMAL, IN_HEAD, IN_REMOTE
    
    for line in lines:
        if '<<<<<<< HEAD' in line:
            state = 'IN_HEAD'
            continue
        elif '=======' in line and state == 'IN_HEAD':
            state = 'IN_REMOTE'
            continue
        elif '>>>>>>>' in line and state == 'IN_REMOTE':
            state = 'NORMAL'
            continue
        
        if state == 'NORMAL' or state == 'IN_HEAD':
            new_lines.append(line)
            
    if state != 'NORMAL':
        print(f"Warning: Unterminated conflict in {filepath}")
        return False

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    return True

def main():
    for root, dirs, files in os.walk('.'):
        if '.git' in dirs:
            dirs.remove('.git')
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.css', '.bat', '.md', '.json')):
                filepath = os.path.join(root, file)
                if resolve_file(filepath):
                    print(f"Resolved: {filepath}")

if __name__ == "__main__":
    main()
