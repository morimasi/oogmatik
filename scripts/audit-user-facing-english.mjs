import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const VISIBLE_FIELDS = new Set([
  'title',
  'description',
  'desc',
  'label',
  'placeholder',
  'tooltip',
  'helperText',
  'buttonLabel',
  'emptyMessage',
  'emptyState',
  'error',
  'buttonText',
  'instruction',
  'question',
  'answer',
  'note',
  'subtitle',
  'header',
  'message',
  'errorMessage',
  'successMessage',
  'alt',
]);

const ENGLISH_UI_WORDS =
  /\b(?:english|dashboard|success|rate|save|cancel|delete|search|loading|continue|back|next|close|submit|edit|export|import|print|share|settings|profile|home|library|archive|active|inactive|pending|completed|failed|total|average|score|result|download|upload|sync|preview|design|content|style|question|answer|student|teacher|correct|incorrect|retry|remove|clear|select|choose|start|finish|read|write|story|storyboard|instruction|easy|medium|hard|watermark|source|qr\s+code|custom\s+map|avatar|density\s+level|font\s+size|line\s+height|margins|radius|opacity|zoom(?:\s+level)?|please\s+wait|no\s+results|no\s+data|not\s+found)\b/i;

const isEnglishCandidate = (value) =>
  ENGLISH_UI_WORDS.test(value.replace(/<[^>]*>/g, ' ').trim());

export const collectEnglishVisibleTextCandidates = (source, filename = '<source>') => {
  const scriptKind = filename.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, scriptKind);
  const candidates = [];

  const add = (node, value) => {
    const text = value.trim();
    if (!text || !isEnglishCandidate(text)) return;
    candidates.push({
      file: filename,
      line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
      text,
    });
  };

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      add(node, node.getText(sourceFile));
    } else if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isStringLiteral(node.expression)
    ) {
      add(node, node.expression.text);
    } else if (
      ts.isJsxAttribute(node) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      node.name.text !== 'imagePrompt'
    ) {
      add(node, node.initializer.text);
    } else if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      VISIBLE_FIELDS.has(node.name.text) &&
      ts.isStringLiteral(node.initializer)
    ) {
      add(node, node.initializer.text);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return candidates;
};

const RUNTIME_ROOTS = ['src', 'components', 'api', 'services', 'offlineGenerators', 'data', 'utils'];
const RUNTIME_ROOT_FILES = ['App.tsx', 'constants.ts'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);

const collectSourceFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(fullPath);
    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) return [];
    return [fullPath];
  });
};

export const auditApplicationSources = (rootDirectory) => {
  const sourceFiles = [
    ...RUNTIME_ROOTS.flatMap((root) => collectSourceFiles(path.join(rootDirectory, root))),
    ...RUNTIME_ROOT_FILES.map((filename) => path.join(rootDirectory, filename)),
  ];
  return sourceFiles
    .filter((filename) => fs.existsSync(filename) && !fs.statSync(filename).isDirectory())
    .filter((filename) => filename.endsWith('.ts') || filename.endsWith('.tsx'))
    .flatMap((filename) =>
      collectEnglishVisibleTextCandidates(
        fs.readFileSync(filename, 'utf8'),
        path.relative(rootDirectory, filename)
      )
    );
};

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const rootDirectory = process.cwd();
  const candidates = auditApplicationSources(rootDirectory);
  for (const candidate of candidates) {
    process.stdout.write(`${candidate.file}:${candidate.line}: ${candidate.text}\n`);
  }
  if (candidates.length > 0) process.exitCode = 1;
}
