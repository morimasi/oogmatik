import { describe, it, expect, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runVercelIgnoreCheck } from './check-vercelignore.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempDirs = [];

function makeTempRepo(vercelIgnorePatterns) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vercelignore-check-'));
    tempDirs.push(dir);

    // İç içe "tests" klasörü: tam da deploy'u kıran senaryo
    const nested = path.join(dir, 'src', 'components', 'assessment', 'tests');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, 'MatrixMemoryTest.tsx'), 'export const x = 1;');
    fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'App.tsx'), 'export const App = () => null;');
    fs.writeFileSync(path.join(dir, '.vercelignore'), vercelIgnorePatterns.join('\n') + '\n');

    execFileSync('git', ['init', '-q'], { cwd: dir });
    execFileSync('git', ['add', '-A'], { cwd: dir });
    return dir;
}

afterAll(() => {
    for (const dir of tempDirs) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

describe('.vercelignore build context koruması', () => {
    it('bu depoda gerekli kaynak dosyaların hiçbirini dışlamaz', () => {
        const result = runVercelIgnoreCheck(repoRoot);

        expect(result.skipped).toBeUndefined();
        expect(result.offenders).toEqual([]);
        expect(result.ok).toBe(true);
        expect(result.checked).toBeGreaterThan(100);
    });

    it('köke sabitlenmemiş "tests/" desenini hata olarak yakalar', () => {
        const dir = makeTempRepo(['tests/']);
        const result = runVercelIgnoreCheck(dir);

        expect(result.ok).toBe(false);
        expect(result.offenders.some((o) => o.path.includes('components/assessment/tests/'))).toBe(true);
    });

    it('köke sabitlenmiş "/tests/" desenine izin verir', () => {
        const dir = makeTempRepo(['/tests/']);
        const result = runVercelIgnoreCheck(dir);

        expect(result.ok).toBe(true);
        expect(result.offenders).toEqual([]);
        expect(result.checked).toBeGreaterThan(0);
    });
});
