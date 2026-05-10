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

/**
 * ActivityScaffoldEngine v2: Otonom etkinlik modülü oluşturma ve entegrasyon motoru.
 * 
 * Desteklenen şablon sözdizimi:
 * - {{variable}} → basit değişken
 * - {{json path.to.var}} → JSON.stringify
 * - {{#each array}}...{{this.field}}...{{/each}} → döngü
 * - {{#unless condition}}...{{/unless}} → koşullu
 */
export class ActivityScaffoldEngine {
  private workspaceRoot: string;
  private templateDir: string;
  private logs: string[] = [];
  private vfs: Map<string, string> = new Map();
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

  private readVFS(filePath: string): string {
    return this.vfs.has(filePath) ? this.vfs.get(filePath)! : fs.readFileSync(filePath, 'utf8');
  }

  private writeVFS(filePath: string, content: string) {
    this.vfs.set(filePath, content);
  }

  private commitVFS(): void {
    for (const [filePath, content] of this.vfs.entries()) {
      const outputDir = path.dirname(filePath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }

  /**
   * Bir blueprint'ten tüm otonom süreci başlatır.
   */
  async process(blueprint: ActivityBlueprint, options?: { dryRun?: boolean }): Promise<ScaffoldResult> {
    this.logs = [];
    this.vfs.clear();
    const dryRun = options?.dryRun ?? false;
    this.log('info', `Starting process for: ${blueprint.identity.title} (dryRun=${dryRun})`);

    const slug = blueprint.identity.key.toLowerCase().replace(/_/g, '-');
    const moduleDir = path.join(this.workspaceRoot, 'src/modules/activities', slug);

    // 1. Modül Klasörünü Oluştur (Artık VFS Commit yapacak)
    // 2. Template'lerden Dosya Üret (Memory)
    const generatedFiles = this.generateModuleFiles(blueprint, moduleDir, dryRun);

    // 3. Global Entegrasyonlar
    const injections = this.injectIntegrations(blueprint, slug, dryRun);

    // Atomic Check
    const hasError = injections.some(i => !i.success && !i.skipped);
    if (hasError && !dryRun) {
      this.log('error', 'Enjeksiyon hatası tespit edildi. VFS RAM üzerinden iptal edildi, projenin bütünlüğü korundu.');
      return { success: false, moduleDir, generatedFiles, injections, logs: this.getLogs() };
    }

    if (!dryRun) {
      this.commitVFS();
    }

    const result: ScaffoldResult = {
      success: true,
      moduleDir,
      generatedFiles,
      injections,
      logs: this.getLogs(),
    };

    this.log('info', `Otonom modül ${dryRun ? '(dry-run) simüle edildi' : 'başarıyla kuruldu'}: ${blueprint.identity.key}`);
    return result;
  }

  // ────────────────────── DOSYA ÜRETİMİ ──────────────────────

  private generateModuleFiles(bp: ActivityBlueprint, dir: string, dryRun: boolean): string[] {
    const data = this.buildTemplateData(bp);
    const files: string[] = [];

    const templateMap: Record<string, string> = {
      'dataType.template.txt': 'types.ts',
      'aiGenerator.template.txt': 'generators.ts',
      'offlineGenerator.template.txt': 'offlineGenerators.ts',
      'worksheetUI.template.txt': 'ui/WorksheetUI.tsx',
      'configPanel.template.txt': 'ui/ConfigPanel.tsx',
      'index.template.txt': 'index.ts',
    };

    for (const [template, output] of Object.entries(templateMap)) {
      const templatePath = path.join(this.templateDir, template);
      const outputPath = path.join(dir, output);

      if (!fs.existsSync(templatePath)) {
        this.log('warn', `Template bulunamadı (atlanıyor): ${template}`);
        continue;
      }

      const content = this.renderTemplate(templatePath, data);

      if (!dryRun) {
        this.writeVFS(outputPath, content);
      }

      files.push(outputPath);
      this.log('info', `${dryRun ? '[DRY] ' : ''}Generated: ${output}`);
    }

    return files;
  }

  private buildTemplateData(bp: ActivityBlueprint): Record<string, unknown> {
    return {
      ...bp,
      interfaceName: bp.dataModel.interfaceName,
      itemsName: bp.dataModel.itemsName || `${bp.dataModel.interfaceName}Item`,
      enumKey: bp.identity.key,
      title: bp.identity.title,
      slug: bp.identity.key.toLowerCase().replace(/_/g, '-'),
      camelCase: bp.identity.key
        .toLowerCase()
        .split('_')
        .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
        .join(''),
      PascalCase: bp.identity.key
        .toLowerCase()
        .split('_')
        .map(w => w[0].toUpperCase() + w.slice(1))
        .join(''),
    };
  }

  // ────────────────────── RECURSIVE TEMPLATE MOTORU (Ultra-Premium V3) ──────────────────────

  private renderTemplate(templatePath: string, data: Record<string, unknown>): string {
    const rawContent = fs.readFileSync(templatePath, 'utf8');
    return this.parseNodes(rawContent, data);
  }

  /**
   * Rekürsif AST-Benzeri Şablon Çözümleyici
   * Destekler: {{#each ...}}, {{#if ...}}, {{#unless ...}}, {{var}}, {{json var}} ve her türlü **Nested** yapı
   */
  private parseNodes(content: string, context: unknown): string {
    let result = '';
    let i = 0;

    while (i < content.length) {
      const blockStart = content.indexOf('{{#', i);
      const varStart = content.indexOf('{{', i);

      if (blockStart === -1 && varStart === -1) {
        result += content.substring(i);
        break;
      }

      // Değişken mi, blok mu belirle
      const isBlock = blockStart !== -1 && (varStart === -1 || blockStart <= varStart);

      if (isBlock) {
        result += content.substring(i, blockStart);
        const tagEnd = content.indexOf('}}', blockStart);
        if (tagEnd === -1) break; // Hatalı tag

        const tagContent = content.substring(blockStart + 3, tagEnd).trim(); // "each arrayPath", "if condition" vs.
        const parts = tagContent.split(/\s+/);
        const directive = parts[0];
        const expression = parts.slice(1).join(' ');

        const endTag = `{{/${directive}}}`;
        const blockInnerStart = tagEnd + 2;
        const blockInnerEnd = this.findMatchingEndTag(content, directive, blockInnerStart);

        if (blockInnerEnd === -1) {
          throw new Error(`Ultra-Premium Parser Error: Kapanış tagı ${endTag} bulunamadı!`);
        }

        const innerTemplate = content.substring(blockInnerStart, blockInnerEnd);

        // Rekürsif Çözümleme
        if (directive === 'each') {
          const arr = this.resolveValue(context, expression);
          if (Array.isArray(arr)) {
            for (const item of arr) {
              // Alt dalları işleyerek stack tabanlı nesting gerçekleştirilir
              result += this.parseNodes(innerTemplate, item);
            }
          }
        } else if (directive === 'if') {
          const isTrue = this.evaluateCondition(context, expression);
          if (isTrue) {
            result += this.parseNodes(innerTemplate, context);
          }
        } else if (directive === 'unless') {
          const isTrue = this.evaluateCondition(context, expression);
          if (!isTrue) {
            result += this.parseNodes(innerTemplate, context);
          }
        }

        i = blockInnerEnd + endTag.length;

      } else {
        // Variable interpolation (e.g. {{json val}}, {{val}}, {{this.val}})
        result += content.substring(i, varStart);
        const tagEnd = content.indexOf('}}', varStart);
        if (tagEnd === -1) break;

        let varName = content.substring(varStart + 2, tagEnd).trim();

        if (varName.startsWith('json ')) {
          const val = this.resolveValue(context, varName.replace('json ', '').trim());
          result += JSON.stringify(val, null, 2);
        } else {
          const val = this.resolveValue(context, varName);
          if (val != null && typeof val !== 'object') {
            result += String(val);
          } else if (val != null && varName === 'this') {
            result += JSON.stringify(val); // Eğer 'this' bir objeyse düz string formatlama
          }
        }

        i = tagEnd + 2;
      }
    }

    return result;
  }

  private findMatchingEndTag(content: string, directive: string, startIndex: number): number {
    const startTagList = ['{{#' + directive, `{{#${directive} `];
    const endTag = `{{/${directive}}}`;
    let depth = 1;
    let i = startIndex;

    while (i < content.length) {
      const nextStart = Math.min(
        ...startTagList.map(s => { const idx = content.indexOf(s, i); return idx === -1 ? Infinity : idx; })
      );
      const nextEnd = content.indexOf(endTag, i);

      if (nextEnd === -1) return -1; // End tag yok

      if (nextStart < nextEnd) {
        depth++;
        i = nextStart + startTagList[0].length;
      } else {
        depth--;
        if (depth === 0) return nextEnd;
        i = nextEnd + endTag.length;
      }
    }
    return -1;
  }

  private evaluateCondition(context: unknown, expression: string): boolean {
    const eqMatch = expression.match(/^\(eq\s+([^\s]+)\s+(['"])(.*?)\2\)$/);
    if (eqMatch) {
      const leftVal = this.resolveValue(context, eqMatch[1].trim());
      return String(leftVal) === eqMatch[3];
    } else {
      const val = this.resolveValue(context, expression);
      return !!val;
    }
  }

  private resolveValue(data: unknown, keyPath: string): unknown {
    if (keyPath === 'this') return data;
    if (keyPath.startsWith('this.')) keyPath = keyPath.replace('this.', '');

    const parts = keyPath.split('.');
    let current: unknown = data;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }

  // ────────────────────── GLOBAL ENTEGRASYONLAR (PLUGIN SYSTEM) ──────────────────────

  private injectIntegrations(bp: ActivityBlueprint, slug: string, dryRun: boolean): InjectionResult[] {
    const results: InjectionResult[] = [];

    const utils = {
      workspaceRoot: this.workspaceRoot,
      slug,
      dryRun,
      readVFS: (f: string) => this.readVFS(f),
      writeVFS: (f: string, c: string) => this.writeVFS(f, c),
      log: (l: 'info' | 'warn' | 'error', m: string) => this.log(l, m)
    };

    for (const plugin of this.plugins) {
      try {
        const pluginResults = plugin.execute(bp, utils);
        results.push(...pluginResults);
      } catch (error: any) {
        this.log('error', `Plugin Hatası [${plugin.name}]: ${error.message}`);
        results.push({ target: 'plugin-execution', type: 'registry', key: plugin.name, success: false, error: error.message });
      }
    }

    // TODO: Geri kalan eski hardcoded metotları (ConstantsInjector, vs.) 
    // zamanla pluginlere taşı. Modülerliğe açık kapı bıraktık.

    return results;
  }

  // ────────────────────── YARDIMCI ──────────────────────

  private buildActivityObject(bp: ActivityBlueprint): string {
    const skills = bp.pedagogical?.targetSkills?.map(s => `'${s}'`).join(', ') || '';
    return `{
    id: ActivityType.${bp.identity.key},
    title: '${bp.identity.title}',
    description: '${bp.identity.description}',
    icon: '${bp.identity.icon}',
    category: '${bp.identity.categoryId}',
    targetSkills: [${skills}],
    defaultStyle: { columns: 1 }
  }`;
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
