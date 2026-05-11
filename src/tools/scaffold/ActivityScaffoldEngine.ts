import * as fs from 'fs';
import * as path from 'path';
import { ActivityBlueprint } from './types';
import { IScaffoldPlugin } from './plugins/IScaffoldPlugin';
import { EnumInjectorPlugin } from './plugins/EnumInjectorPlugin';
import { ConstantsInjectorPlugin } from './plugins/ConstantsInjectorPlugin';
import { RegistryInjectorPlugin } from './plugins/RegistryInjectorPlugin';
import { ExportInjectorPlugin } from './plugins/ExportInjectorPlugin';
import { SheetRendererPlugin } from './plugins/SheetRendererPlugin';
import { ConfigPanelPlugin } from './plugins/ConfigPanelPlugin';
import { AIGeneratorPlugin } from './plugins/AIGeneratorPlugin';
import { ScaffoldVFS } from './ScaffoldVFS';
import { SyntaxValidator } from './SyntaxValidator';

/**
 * ActivityScaffoldEngine v3: Otonom (Generative) Üretim Hattı.
 * 
 * Yenilikler:
 * - ScaffoldVFS: Atomik dosya işlemleri ve Rollback.
 * - SyntaxValidator: AI kodlarını build kırmadan önce denetleme.
 * - AIGeneratorPlugin: Statik şablonları AI kod üretimi ile değiştirme.
 */
export class ActivityScaffoldEngine {
  private workspaceRoot: string;
  private templateDir: string;
  private logs: string[] = [];
  private vfs = new ScaffoldVFS();
  private plugins: IScaffoldPlugin[] = [];

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.templateDir = path.join(workspaceRoot, 'src/tools/scaffold/templates');

    this.plugins = [
      new EnumInjectorPlugin(),
      new ConstantsInjectorPlugin(),
      new RegistryInjectorPlugin(),
      new ExportInjectorPlugin(),
      new SheetRendererPlugin(),
      new ConfigPanelPlugin()
    ];
  }

  private log(level: 'info' | 'warn' | 'error', msg: string): void {
    const entry = `[Scaffold:${level.toUpperCase()}] ${msg}`;
    this.logs.push(entry);
    if (level === 'error') {
      console.error(entry);
    }
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  /**
   * Bir blueprint'ten tüm otonom süreci başlatır.
   */
  async process(blueprint: ActivityBlueprint, options?: { dryRun?: boolean }): Promise<ScaffoldResult> {
    this.logs = [];
    this.vfs.rollback(); // Reset memo
    const dryRun = options?.dryRun ?? false;
    this.log('info', `Phase 4 Generative Process Starting: ${blueprint.identity.title} (dryRun=${dryRun})`);

    const slug = blueprint.identity.key.toLowerCase().replace(/_/g, '-');
    const moduleDir = path.join(this.workspaceRoot, 'src/modules/activities', slug);

    try {
      // 1. Dosya Üretimi (VFS RAM)
      // Önce AI Plugin'i çalıştırıyoruz (Şablonlar yerine AI kod yazar)
      const aiPlugin = new AIGeneratorPlugin();
      const aiResults = await aiPlugin.executeAsync(blueprint, this.getUtils(slug, dryRun));

      const generatedFiles = this.vfs.getPendingChanges();

      // 2. Global Entegrasyonlar
      const injections = await this.injectIntegrationsAsync(blueprint, slug, dryRun);
      injections.push(...aiResults);

      // 3. Syntax Doğrulama (Bora Demir Check)
      const pendingFilesContent: Record<string, string> = {};
      for (const f of generatedFiles) {
        pendingFilesContent[path.basename(f)] = this.vfs.read(f);
      }

      const syntaxValidation = SyntaxValidator.validatePayload(pendingFilesContent);
      if (!syntaxValidation.valid) {
        this.log('error', `Build Güvenlik Duvarı: AI kodunda syntax hatası yakalandı!\n${syntaxValidation.errors.join('\n')}`);
        this.vfs.rollback();
        return { success: false, moduleDir, generatedFiles, injections, logs: this.getLogs() };
      }

      // 4. Atomic Commit
      if (!dryRun) {
        this.vfs.commit();
      }

      const result: ScaffoldResult = {
        success: true,
        moduleDir,
        generatedFiles,
        injections,
        logs: this.getLogs(),
      };

      this.log('info', `Phase 4 Otonom modül ${dryRun ? '(dry-run) simüle edildi' : 'başarıyla kuruldu'}: ${blueprint.identity.key}`);
      return result;

    } catch (error: any) {
      this.log('error', `Otonom İşlem Başarısız: ${error.message}`);
      this.vfs.rollback();
      throw error;
    }
  }

  private getUtils(slug: string, dryRun: boolean) {
    return {
      workspaceRoot: this.workspaceRoot,
      slug,
      dryRun,
      readVFS: (f: string) => this.vfs.read(f),
      writeVFS: (f: string, c: string) => this.vfs.write(f, c),
      log: (l: 'info' | 'warn' | 'error', m: string) => this.log(l, m)
    };
  }

  private async injectIntegrationsAsync(bp: ActivityBlueprint, slug: string, dryRun: boolean): Promise<InjectionResult[]> {
    const results: InjectionResult[] = [];
    const utils = this.getUtils(slug, dryRun);

    for (const plugin of this.plugins) {
      try {
        // Sync plugin execution
        const pluginResults = plugin.execute(bp, utils);
        results.push(...pluginResults);
      } catch (error: any) {
        this.log('error', `Plugin Hatası [${plugin.name}]: ${error.message}`);
        results.push({ target: 'plugin-execution', type: 'registry', key: plugin.name, success: false, error: error.message });
      }
    }

    return results;
  }
}

// ────────────────────── TİP TANIMLARI ──────────────────────

export interface ScaffoldResult {
  success: boolean;
  moduleDir: string;
  generatedFiles: string[];
  injections: InjectionResult[];
  logs: string[];
}

export interface InjectionResult {
  target: string;
  type: 'enum' | 'array' | 'registry' | 'export' | 'sheetRenderer' | 'configPanel';
  key: string;
  success: boolean;
  skipped?: boolean;
  error?: string;
}

