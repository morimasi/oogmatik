const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach((file) => {
    const dirFile = path.join(dir, file);
    try {
      if (fs.statSync(dirFile).isDirectory()) {
        filelist = walkSync(dirFile, filelist);
      } else {
        if (dirFile.endsWith('.ts') || dirFile.endsWith('.tsx')) {
          filelist.push(dirFile);
        }
      }
    } catch (e) {}
  });
  return filelist;
}

const files = walkSync(path.join(__dirname, 'src'));

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const getRelativePrefix = () => {
    const parts = file.split(path.sep);
    const srcIndex = parts.indexOf('src');
    const depth = parts.length - srcIndex - 2; // -1 for filename, -1 for src itself
    if (depth === 0) return './';
    return '../'.repeat(depth);
  };

  if (!file.endsWith('logger.ts')) {
    if (content.includes('console.log')) {
      content = content.replace(/console\.log\(/g, 'logger.info(');
      if (!content.includes('import { logger }')) {
        const prefix = getRelativePrefix();
        content = `import { logger } from '${prefix}utils/logger';\n` + content;
      }
      changed = true;
    }
  }

  if (!file.endsWith('AppError.ts') && !file.endsWith('logger.ts')) {
    if (content.includes('throw new Error')) {
      content = content.replace(
        /throw new Error\((.*?)\)/g,
        "throw new AppError($1, 'INTERNAL_ERROR', 500)"
      );
      if (!content.includes('import { AppError }')) {
        const prefix = getRelativePrefix();
        content = `import { AppError } from '${prefix}utils/AppError';\n` + content;
      }
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
