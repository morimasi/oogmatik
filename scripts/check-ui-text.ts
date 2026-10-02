#!/usr/bin/env node
/**
 * Arayüz metni denetleyicisi (UI Text Guard)
 * ------------------------------------------------------------------
 * bdmind'de kullanıcı YALNIZCA Türkçe metin görmelidir. Bu denetleyici,
 * Kaynak kodda yeni eklenen İNGİLİZCE arayüz metnini yakalar ve süreci
 * kırar; böylece çeviri regresyonu sessizce geri dönemez.
 *
 * Nasıl çalışır?
 *   1. AST üzerinden yalnızca KULLANICIYA GÖRÜNEN metinler toplanır:
 *      - JSX metin düğümleri
 *      - Görünen JSX attribute'ları (title, placeholder, alt, aria-label, label…)
 *      - Görünen property değerleri (title, description, label, message…)
 *   2. Teknik değerler bilinçli olarak dışlanır: CSS sınıfları, tanımlayıcılar,
 *      snake_case enum/AI şema anahtarları, MIME türleri, yazı tipi adları,
 *      Firebase hata kodları, URL'ler, e-postalar, tip konumları.
 *   3. Bulunan metin `scripts/ui-text-baseline.json` içindeki bilinen
 *      İstisnalarla (marka/ürün adları) karşılaştırılır. Baseline'da OLMAYAN
 *      İngilizce metin → HATA.
 *
 * Kullanım:
 *   npx vitest run scripts/check-ui-text.test.ts   (önerilen — CI)
 *   node --experimental-strip-types scripts/check-ui-text.ts
 *   npx tsx scripts/check-ui-text.ts --update      (baseline'i yenile)
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

export interface UiTextHit {
  /** Proje köküne göre dosya yolu (POSIX ayırıcı). */
  file: string;
  /** 1 tabanlı satır numarası. */
  line: number;
  /** Metnin bulunduğu bağlam (jsx / attr:title / prop:label …). */
  kind: string;
  /** Bulunan kullanıcıya görünen metin. */
  text: string;
}

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'kaynak', 'build', '__tests__', 'src_old']);
const SKIP_FILE = /\.(test|spec)\.(ts|tsx)$/;

/** JSX attribute'larından yalnızca kullanıcıya görünen olanlar taranır. */
const DISPLAY_ATTRS = new Set([
  'title', 'placeholder', 'alt', 'aria-label', 'label', 'tooltip', 'description',
  'aria-description', 'aria-placeholder', 'aria-valuetext',
]);

/** Değeri kullanıcıya gösterilen property'ler. */
const DISPLAY_PROPS = new Set([
  'title', 'description', 'shortDescription', 'label', 'heading', 'subtitle', 'tagline',
  'headline', 'placeholder', 'tooltip', 'message', 'text', 'caption', 'summary',
  'emptyText', 'emptyMessage', 'helperText', 'confirmText', 'cancelText', 'buttonText',
  'topicTemplate', 'note', 'hint', 'instruction', 'legend', 'eyebrow', 'alt',
]);

/** Bu property'lerin değerleri görünse bile taranmaz (kod/CSS/enum alanları). */
const SKIP_PROPS = new Set([
  'className', 'class', 'style', 'css', 'key', 'id', 'value', 'type', 'code', 'slug',
  'icon', 'color', 'url', 'href', 'src', 'fontFamily', 'aspectRatio', 'difficulty',
  'status', 'targetSkills', 'activityType', 'category', 'role', 'variant', 'size',
]);

/** CSS / kod sızıntısı olan string'ler arayüz metni değildir. */
const CSS_LIKE =
  /(^|\s)(flex|grid|block|inline|hidden|w-|h-|p[xytrbl]?-|m[xytrbl]?-|text-|bg-|border|rounded|shadow|gap-|items-|justify-|space-|absolute|relative|fixed|sticky|overflow|cursor-|pointer-|select-|whitespace-|truncate|break-|backdrop-|from-|via-|to-|ring|outline|divide|col-|row-|inset|top-|right-|bottom-|left-|z-|opacity|transition|duration|ease|transform|translate|scale|rotate|skew|filter|animate|object-|aspect|order|content-|basis|grow|shrink|self-|place-|leading|tracking|list-|appearance|touch|will-|contain|mix-|isolation|\[|\]|\(|\)|:|;|!|\d)/;

/**
 * Arayüz metninde asla geçmemesi gereken İngilizce kelimeler.
 * Türkçeye yerleşmiş ödünç kelimeler (panel, video, model, sistem, program,
 * rapor, plan, tip, form, blok, test, grup, aktif, pasif, normal, modül…) ve
 * marka/teknoloji adları burada BİLİNÇLİ olarak yoktur.
 */
const ENGLISH_WORDS = new Set(`save cancel delete editing edit close loading submit search settings profile
dashboard overview welcome logout login register password username user email download upload
export preview print refresh retry next previous back continue confirm error warning success
name title description status difficulty category answer question score grade student teacher
parent school class course lesson homework assignment activity task result progress report
analytics chart graph table list card sidebar menu section modal dialog tooltip notification
alert message banner header footer button link icon image photo audio file document folder
share copy paste filter sort view mode theme language today tomorrow week month year hour minute
start finish done complete pending active inactive enabled disabled selected available required
optional default custom general special basic advanced easy medium hard simple complex quick new
old recent popular favorite private public draft published archived trash generated generate output input
template subject practice quiz flashcard worksheet click clicking below above more less show hide
add remove update create first second third fourth fifth sixth seventh eighth ninth tenth
monday tuesday wednesday thursday friday saturday sunday january february march april may june
july august september october november december please thanks sorry hello okay
learn choose select apply reset clear configure preferences insert delete rename duplicate
enable disable toggle visible expand collapse approve reject archive restore
`.split(/\s+/).filter(Boolean));

function wordsOf(s: string): string[] {
  return s.toLowerCase().match(/[a-z]+/g) || [];
}

/**
 * Metin kullanıcıya görünen İNGİLİZCE mi?
 * Türkçe karakter içeriyorsa Türkçedir; aksi hâlde en az iki İngilizce kelime
 * ya da tek kelimelik belirgin bir arayüz terimi aranır.
 */
export function isEnglishUiText(text: string): boolean {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length < 2) return false;
  if (/[çğıöşüÇĞİÖŞÜ]/.test(t)) return false;
  if (/^[\w./#@:[\]()<>-]+$/.test(t)) return false;
  if (/[{}$<>`]/.test(t)) return false;
  if (/^(https?|mailto|data|blob):/.test(t)) return false;
  if (/^[a-z]+([A-Z][a-z]+)+$/.test(t)) return false;
  if (/^&[a-z]+;$/.test(t)) return false;              // HTML varlığı (&copy; &nbsp;)
  if (/^[A-Za-z]\.?$/.test(t)) return false;
  const words = wordsOf(t);
  const hits = words.filter((w) => ENGLISH_WORDS.has(w)).length;
  if (hits >= 2) return true;
  return hits === 1 && words.length <= 2;
}

function isCssLike(text: string): boolean {
  return CSS_LIKE.test(text);
}

function isSkipSafe(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (/_/.test(t)) return true;              // snake_case enum / AI şema anahtarı
  if (t.includes('@')) return true;          // e-posta
  if (t.includes('://')) return true;        // URL
  if (/^(fa-|fa )/.test(t)) return true;     // Font Awesome sınıfı
  if (/^\d+([.,]\d+)?(px|mm|cm|pt|em|rem|%|s|ms|vh|vw|fr)?$/.test(t)) return true;
  if (/^[a-z-]+$/.test(t) && /-/.test(t)) return true;   // kebab-case (slug/sınıf)
  return false;
}

/** Bir dosyayı AST üzerinden tarar ve İngilizce arayüz metinlerini döner. */
export function scanSourceForEnglishUiText(file: string, filePath: string): UiTextHit[] {
  const hits: UiTextHit[] = [];
  const sf = ts.createSourceFile(
    filePath,
    file,
    ts.ScriptTarget.Latest,
    true,
    /\.tsx$/.test(filePath) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const inTypePosition = (node: ts.Node): boolean => {
    let p: ts.Node | undefined = node.parent;
    while (p) {
      if (
        ts.isLiteralTypeNode(p) ||
        ts.isTypeAliasDeclaration(p) ||
        ts.isInterfaceDeclaration(p) ||
        ts.isEnumDeclaration(p) ||
        ts.isTypeLiteralNode(p) ||
        ts.isUnionTypeNode(p) ||
        ts.isIntersectionTypeNode(p)
      ) {
        return true;
      }
      p = p.parent;
    }
    return false;
  };

  const check = (node: ts.Node, text: string, kind: string): void => {
    if (isSkipSafe(text) || isCssLike(text) || inTypePosition(node)) return;
    if (!isEnglishUiText(text)) return;
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    hits.push({ file: filePath, line: line + 1, kind, text: text.replace(/\s+/g, ' ').trim() });
  };

  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) {
      check(node, node.text, 'jsx');
    } else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const name = ts.isIdentifier(node.name) ? node.name.text : '';
      const val = node.initializer.text;
      if (DISPLAY_ATTRS.has(name) && !/[-_/.:]/.test(val)) check(node.initializer, val, `attr:${name}`);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const p = node.parent;
      const isImport = ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isModuleDeclaration(p);
      const isJsxAttrInit = ts.isJsxAttribute(p) && p.initializer === node;
      if (!isImport && !isJsxAttrInit) {
        const isKey =
          (ts.isPropertyAssignment(p) && p.name === node) ||
          (ts.isPropertySignature(p) && p.name === node);
        const propName =
          (ts.isPropertyAssignment(p) || ts.isPropertySignature(p)) && p.name && ts.isIdentifier(p.name)
            ? p.name.text
            : null;
        const blocked = propName !== null && SKIP_PROPS.has(propName);
        const isDisplayProp = propName !== null && DISPLAY_PROPS.has(propName);
        if (!isKey && !blocked && isDisplayProp) check(node, node.text, `prop:${propName}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return hits;
}

function collectFiles(rootDir: string, out: string[] = []): string[] {
  if (!fs.existsSync(rootDir)) return out;
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(rootDir, entry.name);
    if (entry.isDirectory()) collectFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !SKIP_FILE.test(entry.name)) out.push(full);
  }
  return out;
}

/** Projedeki tüm İngilizce arayüz metinlerini döner. */
export function findEnglishUiText(rootDir = 'src'): UiTextHit[] {
  const hits: UiTextHit[] = [];
  for (const filePath of collectFiles(rootDir)) {
    const rel = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    hits.push(...scanSourceForEnglishUiText(fs.readFileSync(filePath, 'utf8'), rel));
  }
  return hits.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));
}

/* ── Baseline ─────────────────────────────────────────────────────── */

export const BASELINE_PATH = path.join('scripts', 'ui-text-baseline.json');

export function loadBaseline(baselinePath = BASELINE_PATH): Set<string> {
  if (!fs.existsSync(baselinePath)) return new Set();
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    if (Array.isArray(parsed)) return new Set(parsed.filter((x): x is string => typeof x === 'string'));
    return new Set();
  } catch {
    return new Set();
  }
}

export function saveBaseline(texts: string[], baselinePath = BASELINE_PATH): void {
  const unique = [...new Set(texts)].sort();
  fs.writeFileSync(baselinePath, `${JSON.stringify(unique, null, 2)}\n`, 'utf8');
}

/** Baseline'da bulunmayan (yani yeni eklenen) İngilizce metinler. */
export function findNewEnglishUiText(hits: UiTextHit[], baseline: Set<string>): UiTextHit[] {
  return hits.filter((h) => !baseline.has(h.text));
}

/* ── CLI ──────────────────────────────────────────────────────────── */

const isMain =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  /check-ui-text(\.ts|\.mts|\.js)$/.test(process.argv[1]);

if (isMain) {
  const hits = findEnglishUiText('src');
  if (process.argv.includes('--update')) {
    saveBaseline(hits.map((h) => h.text));
    console.log(`Baseline güncellendi: ${new Set(hits.map((h) => h.text)).size} istisna.`);
    process.exit(0);
  }
  const baseline = loadBaseline();
  const fresh = findNewEnglishUiText(hits, baseline);
  if (fresh.length === 0) {
    console.log(`✓ Arayüz metni temiz (${hits.length} bilinen istisna, yeni İngilizce yok).`);
    process.exit(0);
  }
  console.error(`✗ ${fresh.length} yeni İngilizce arayüz metni bulundu:\n`);
  for (const h of fresh) console.error(`  ${h.file}:${h.line} [${h.kind}] ${h.text}`);
  console.error('\nYa Türkçeye çevirin ya da meşru bir istisnaysa baseline\'i yenileyin:');
  console.error('  npx tsx scripts/check-ui-text.ts --update');
  process.exit(1);
}
