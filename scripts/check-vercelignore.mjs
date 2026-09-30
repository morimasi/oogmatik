#!/usr/bin/env node
/**
 * .vercelignore denetleyicisi
 * ------------------------------------------------------------------
 * Vercel, .vercelignore dosyasını gitignore semantiğiyle uygular. Başında "/"
 * olmayan bir klasör deseni (örn. `tests/`) HER seviyedeki `tests/` klasörünü
 * eşler. Bu yüzden `src/components/assessment/tests/` gibi uygulama kodu
 * build context'inden çıkar ve deploy sırasında Rollup
 * "Could not resolve ..." hatasıyla build kırılır.
 *
 * Bu script, git'in kendi gitignore motorunu (Vercel'in kullandığı davranışla
 * aynı) kullanarak build için zorunlu dosyaların .vercelignore tarafından
 * dışlanmadığını doğrular. Build'den önce çalıştırılmalıdır:
 *
 *   npm run check:vercelignore
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/** Build için vazgeçilmez klasörler (Vite fonksiyonları + statik varlıklar). */
const REQUIRED_DIRS = ['src', 'api', 'public'];

/** Build için vazgeçilmez kök dosyaları (varsa kontrol edilir). */
const REQUIRED_ROOT_FILES = [
    'index.html',
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'tsconfig.json',
    'tailwind.config.js',
    'postcss.config.js',
    'vercel.json',
    'firebase.json',
    'firestore.rules',
    'firestore.indexes.json',
    'cors.json',
    'swagger.yaml',
    'google42e59f2eb5b772e5.html',
];

function git(args, options = {}) {
    return execFileSync('git', args, {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        ...options,
    });
}

function collectRequiredFiles(repoRoot) {
    const files = [];

    for (const dir of REQUIRED_DIRS) {
        if (!existsSync(path.join(repoRoot, dir))) continue;
        const out = git(['ls-files', '-z', '--', dir], { cwd: repoRoot });
        for (const file of out.split('\0')) {
            if (file) files.push(file);
        }
    }

    for (const file of REQUIRED_ROOT_FILES) {
        if (existsSync(path.join(repoRoot, file))) files.push(file);
    }

    return files;
}

/**
 * Denetimi çalıştırır.
 * @returns {{ ok: boolean, skipped?: string, checked?: number, offenders: { path: string, pattern?: string, line?: string }[] }}
 */
export function runVercelIgnoreCheck(repoRootOverride) {
    let repoRoot = repoRootOverride;
    if (!repoRoot) {
        try {
            repoRoot = git(['rev-parse', '--show-toplevel']).trim();
        } catch {
            return { ok: true, skipped: 'Git deposu değil', offenders: [] };
        }
    }

    const vercelIgnorePath = path.join(repoRoot, '.vercelignore');
    if (!existsSync(vercelIgnorePath)) {
        return { ok: true, skipped: '.vercelignore bulunamadı', offenders: [] };
    }

    const files = collectRequiredFiles(repoRoot);
    if (files.length === 0) {
        return { ok: true, skipped: 'kontrol edilecek dosya yok', offenders: [] };
    }

    // Git, core.excludesFile'ı gitignore kaynağı olarak okur. Vercel'in uyguladığı
    // davranışla birebir aynı sonucu verir (absolüt yol, ileri eğimli).
    const absIgnore = vercelIgnorePath.split(path.sep).join('/');

    let stdout = '';
    try {
        stdout = git(
            ['-c', `core.excludesFile=${absIgnore}`, 'check-ignore', '--no-index', '-v', '--stdin'],
            { cwd: repoRoot, input: `${files.join('\n')}\n` }
        );
    } catch (error) {
        // check-ignore: exit 0 => en az bir yol yok sayılıyor, exit 1 => hiçbiri.
        if (error?.status === 1) {
            stdout = '';
        } else {
            throw error;
        }
    }

    // Gitignore kararı "son eşleşen desen" ile verilir: sonuç `!` ile başlıyorsa
    // dosya korunuyordur. Bu yüzden `-v` çıktısında negatif desenleri eleriz.
    const offenders = stdout
        .split('\n')
        .map((line) => line.trimEnd())
        .filter(Boolean)
        .map((line) => {
            const match = line.match(/^(.*?):(\d+):(.*)\t(.*)$/);
            if (!match) return { path: line, pattern: undefined, line: undefined };
            return { path: match[4], pattern: match[3], line: match[2] };
        })
        .filter((offender) => !(offender.pattern && offender.pattern.startsWith('!')));

    return { ok: offenders.length === 0, checked: files.length, offenders };
}

function main() {
    const result = runVercelIgnoreCheck();

    if (result.skipped) {
        console.log(`ℹ️  .vercelignore kontrolü atlandı: ${result.skipped}.`);
        return 0;
    }

    if (result.ok) {
        console.log(`✅ .vercelignore, build için gerekli ${result.checked} dosyanın tamamını build context'inde bırakıyor.`);
        return 0;
    }

    console.error('❌ .vercelignore, build için gerekli dosyaları dışlıyor!\n');
    console.error('   Vercel bu dosyaları yüklemez; Rollup "Could not resolve ..." ile build kırar.\n');
    for (const offender of result.offenders) {
        if (offender.pattern) {
            console.error(`   - ${offender.path}\n       ↳ desen: "${offender.pattern}" (.vercelignore:${offender.line})`);
        } else {
            console.error(`   - ${offender.path}`);
        }
    }
    console.error('\nDüzeltme: klasör desenlerini köke sabitleyin (örn. "tests/" yerine "/tests/")');
    console.error('veya gerekli dosyaları geri alın (örn. "!/public/**").');
    return 1;
}

const invokedDirectly =
    process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
    process.exit(main());
}
