import * as fs from 'fs';
import * as path from 'path';

/**
 * ScaffoldVFS: Bellek içi dosya sistemi simülasyonu ve atomik commit/rollback mekanizması.
 * 
 * Amaç: AI tarafından üretilen kodun hatalı olması durumunda diske yazılmasını 
 * engellemek ve projenin bütünlüğünü korumak.
 */
export class ScaffoldVFS {
    private memFS: Map<string, string> = new Map();
    private backups: Map<string, string> = new Map();

    /**
     * Belleğe dosya yazar.
     */
    write(filePath: string, content: string): void {
        this.memFS.set(filePath, content);
    }

    /**
     * Bellekten veya diskten dosya okur.
     */
    read(filePath: string): string {
        if (this.memFS.has(filePath)) {
            return this.memFS.get(filePath)!;
        }
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf8');
        }
        return '';
    }

    /**
     * Değişiklik yapılacak dosyaların yedeğini alır.
     */
    snapshot(filePaths: string[]): void {
        for (const f of filePaths) {
            if (fs.existsSync(f)) {
                this.backups.set(f, fs.readFileSync(f, 'utf8'));
            }
        }
    }

    /**
     * Bellekteki tüm dosyaları fiziksel diske yazar.
     */
    commit(): void {
        for (const [filePath, content] of this.memFS.entries()) {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(filePath, content, 'utf8');
        }
        this.memFS.clear();
        this.backups.clear();
    }

    /**
     * İşlemi iptal eder ve belleği temizler.
     */
    rollback(): void {
        this.memFS.clear();
        this.backups.clear();
    }

    getPendingChanges(): string[] {
        return Array.from(this.memFS.keys());
    }
}
