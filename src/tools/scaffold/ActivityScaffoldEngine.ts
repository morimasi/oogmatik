import * as fs from 'fs';
import * as path from 'path';
import { ActivityBlueprint, DataField } from './types';

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

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.templateDir = path.join(workspaceRoot, 'src/tools/scaffold/templates');
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

  // ────────────────────── TEMPLATE MOTORU ──────────────────────

  private renderTemplate(templatePath: string, data: Record<string, unknown>): string {
    let content = fs.readFileSync(templatePath, 'utf8');

    // 1. {{#each path.to.array}} ... {{/each}} blokları
    content = this.processEachBlocks(content, data);

    // 2. {{#unless condition}} ... {{/unless}} blokları
    content = this.processUnlessBlocks(content, data);

    // 2.5. {{#if condition}} ... {{/if}} blokları
    content = this.processIfBlocks(content, data);

    // 3. {{json path.to.var}} → JSON.stringify
    content = content.replace(/\{\{json ([^}]+)\}\}/g, (_, keyPath: string) => {
      const val = this.resolveValue(data, keyPath.trim());
      return JSON.stringify(val, null, 2);
    });

    // 4. {{path.to.var}} → basit değişken
    content = content.replace(/\{\{([^#/}][^}]*)\}\}/g, (_, keyPath: string) => {
      const val = this.resolveValue(data, keyPath.trim());
      return val != null ? String(val) : '';
    });

    return content;
  }

  private processEachBlocks(content: string, data: Record<string, unknown>): string {
    const eachRegex = /\{\{#each ([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

    return content.replace(eachRegex, (_, arrayPath: string, body: string) => {
      if (body.includes('{{#each') || body.includes('{{#if') || body.includes('{{#unless')) {
        this.log('warn', `Nested blok tespit edildi (${arrayPath}). Bu sürüm nested özellikleri desteklememektedir, muhtemel bozulma!`);
      }

      const arr = this.resolveValue(data, arrayPath.trim());
      if (!Array.isArray(arr)) {
        this.log('warn', `#each: '${arrayPath}' dizi değil`);
        return '';
      }

      return arr
        .map((item: unknown) => {
          let rendered = body;
          if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>;
            // {{this.fieldName}} kalıpları
            rendered = rendered.replace(/\{\{this\.([^}]+)\}\}/g, (__, field: string) => {
              return obj[field.trim()] != null ? String(obj[field.trim()]) : '';
            });
            // {{this}} → tüm objeyi string olarak
            rendered = rendered.replace(/\{\{this\}\}/g, JSON.stringify(obj));
          } else {
            // Basit değerler için {{this}}
            rendered = rendered.replace(/\{\{this\}\}/g, String(item));
          }
          return rendered;
        })
        .join('');
    });
  }

  private processUnlessBlocks(content: string, data: Record<string, unknown>): string {
    const unlessRegex = /\{\{#unless ([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;

    return content.replace(unlessRegex, (_, condPath: string, body: string) => {
      if (body.includes('{{#each') || body.includes('{{#if') || body.includes('{{#unless')) {
        this.log('warn', `Nested blok tespit edildi (unless). Sistem stabil çalışmayabilir!`);
      }
      const val = this.resolveValue(data, condPath.trim());
      return val ? '' : body;
    });
  }

  private processIfBlocks(content: string, data: Record<string, unknown>): string {
    const ifRegex = /\{\{#if ([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    return content.replace(ifRegex, (_, expr: string, body: string) => {
      if (body.includes('{{#each') || body.includes('{{#if') || body.includes('{{#unless')) {
        this.log('warn', `Nested blok tespit edildi (if). Bu blok çökmeye yol açabilir!`);
      }
      expr = expr.trim();
      let isTrue = false;

      // Support {{#if (eq this.type "enum")}} format essentially, very basic
      const eqMatch = expr.match(/^\(eq\s+([^\s]+)\s+(['"])(.*?)\2\)$/);
      if (eqMatch) {
        const leftVal = this.resolveValue(data, eqMatch[1].trim());
        isTrue = String(leftVal) === eqMatch[3];
      } else {
        const val = this.resolveValue(data, expr);
        isTrue = !!val;
      }
      return isTrue ? body : '';
    });
  }

  private resolveValue(data: Record<string, unknown>, keyPath: string): unknown {
    const parts = keyPath.split('.');
    let current: unknown = data;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }

  // ────────────────────── GLOBAL ENTEGRASYONLAR ──────────────────────

  private injectIntegrations(bp: ActivityBlueprint, slug: string, dryRun: boolean): InjectionResult[] {
    const results: InjectionResult[] = [];

    // 1. ActivityType Enum
    results.push(this.injectIntoEnum(
      path.join(this.workspaceRoot, 'src/types/activity.ts'),
      'ActivityType',
      bp.identity.key,
      bp.identity.enumValue,
      dryRun
    ));

    // 2. ACTIVITIES array (constants.ts)
    results.push(this.injectIntoArray(
      path.join(this.workspaceRoot, 'src/constants.ts'),
      'ACTIVITIES',
      this.buildActivityObject(bp),
      bp.identity.key,
      dryRun
    ));

    // 3. Generator Registry
    results.push(this.injectRegistryEntry(bp, slug, dryRun));

    // 4. Generators index.ts (export)
    results.push(this.injectExport(
      path.join(this.workspaceRoot, 'src/services/generators/index.ts'),
      `export { generate${bp.identity.key}FromAI } from '../../modules/activities/${slug}/generators';`,
      bp.identity.key,
      dryRun
    ));

    // 5. OfflineGenerators index.ts (export)
    results.push(this.injectExport(
      path.join(this.workspaceRoot, 'src/services/offlineGenerators/index.ts'),
      `export { generateOffline${bp.identity.key} } from '../../modules/activities/${slug}/offlineGenerators';`,
      bp.identity.key,
      dryRun
    ));

    // 6. SheetRenderer (routing case)
    results.push(this.injectSheetRendererCase(bp, slug, dryRun));

    // 7. Activity configs index (panel kaydı)
    results.push(this.injectConfigPanelEntry(bp, slug, dryRun));

    return results;
  }

  private injectIntoEnum(filePath: string, enumName: string, key: string, value: string, dryRun: boolean): InjectionResult {
    const result: InjectionResult = { target: filePath, type: 'enum', key, success: false };

    if (!fs.existsSync(filePath)) {
      result.error = 'Dosya bulunamadı';
      this.log('error', `Enum inject: ${filePath} bulunamadı`);
      return result;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(`${key} =`)) {
      result.success = true;
      result.skipped = true;
      this.log('info', `Enum inject: ${key} zaten mevcut (atlanıyor)`);
      return result;
    }

    const regex = new RegExp(`export enum ${enumName} \\{([^]*?)\\}`, 'm');
    const match = content.match(regex);

    if (!match) {
      result.error = `${enumName} enum bulunamadı`;
      this.log('error', result.error);
      return result;
    }

    const enumBody = match[1];
    const lines = enumBody.split('\n').map(l => l.trim()).filter(l => l);
    const lastIdx = lines.length - 1;
    if (lastIdx >= 0 && !lines[lastIdx].endsWith(',')) {
      lines[lastIdx] = lines[lastIdx] + ',';
    }
    lines.push(`${key} = '${value}',`);
    const newBody = '\n  ' + lines.join('\n  ') + '\n';

    if (!dryRun) {
      const newContent = content.replace(enumBody, newBody);
      this.writeVFS(filePath, newContent);
    }

    result.success = true;
    this.log('info', `${dryRun ? '[DRY] ' : ''}Enum inject: ${key} → ${enumName}`);
    return result;
  }

  private injectIntoArray(filePath: string, arrayName: string, objectStr: string, key: string, dryRun: boolean): InjectionResult {
    const result: InjectionResult = { target: filePath, type: 'array', key, success: false };

    if (!fs.existsSync(filePath)) {
      result.error = 'Dosya bulunamadı';
      return result;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(`ActivityType.${key}`)) {
      result.success = true;
      result.skipped = true;
      this.log('info', `Array inject: ${key} zaten mevcut`);
      return result;
    }

    const regex = new RegExp(`export const ${arrayName}: [^=]+ = \\[([^]*?)\\];`, 'm');
    const match = content.match(regex);

    if (!match) {
      result.error = `${arrayName} dizisi bulunamadı`;
      this.log('error', result.error);
      return result;
    }

    if (!dryRun) {
      const arrayBody = match[1];
      const newItem = `\n  ${objectStr},`;
      const newBody = arrayBody.trimEnd() + newItem + '\n';
      const newContent = content.replace(arrayBody, newBody);
      this.writeVFS(filePath, newContent);
    }

    result.success = true;
    this.log('info', `${dryRun ? '[DRY] ' : ''}Array inject: ${key} → ${arrayName}`);
    return result;
  }

  private injectRegistryEntry(bp: ActivityBlueprint, slug: string, dryRun: boolean): InjectionResult {
    const filePath = path.join(this.workspaceRoot, 'src/services/generators/registry.ts');
    const result: InjectionResult = { target: filePath, type: 'registry', key: bp.identity.key, success: false };

    if (!fs.existsSync(filePath)) {
      result.error = 'registry.ts bulunamadı';
      return result;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(`[ActivityType.${bp.identity.key}]`)) {
      result.success = true;
      result.skipped = true;
      this.log('info', `Registry inject: ${bp.identity.key} zaten mevcut`);
      return result;
    }

    // Import satırı ekle (dosyanın başına)
    const importLine = `import { generate${bp.identity.key}FromAI, generateOffline${bp.identity.key} } from '../../modules/activities/${slug}/generators';\n`;

    // Registry entry
    const registryEntry = `  [ActivityType.${bp.identity.key}]: {\n    ai: generate${bp.identity.key}FromAI,\n    offline: generateOffline${bp.identity.key},\n  },`;

    if (!dryRun) {
      // Import'u son import satırından sonra ekle
      const lastImportIdx = content.lastIndexOf('import ');
      const lineEnd = content.indexOf('\n', lastImportIdx);
      content = content.slice(0, lineEnd + 1) + importLine + content.slice(lineEnd + 1);

      // Registry'nin sonuna (kapanış };'den önce) ekle
      const closingIdx = content.lastIndexOf('};');
      if (closingIdx > -1) {
        content = content.slice(0, closingIdx) + registryEntry + '\n' + content.slice(closingIdx);
      }

      this.writeVFS(filePath, content);
    }

    result.success = true;
    this.log('info', `${dryRun ? '[DRY] ' : ''}Registry inject: ${bp.identity.key}`);
    return result;
  }

  private injectExport(filePath: string, exportLine: string, key: string, dryRun: boolean): InjectionResult {
    const result: InjectionResult = { target: filePath, type: 'export', key, success: false };

    if (!fs.existsSync(filePath)) {
      result.error = 'Dosya bulunamadı';
      this.log('warn', `Export inject: ${filePath} bulunamadı (atlanıyor)`);
      result.success = true;
      result.skipped = true;
      return result;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(key)) {
      result.success = true;
      result.skipped = true;
      return result;
    }

    if (!dryRun) {
      content = content.trimEnd() + '\n' + exportLine + '\n';
      this.writeVFS(filePath, content);
    }

    result.success = true;
    this.log('info', `${dryRun ? '[DRY] ' : ''}Export inject: ${key}`);
    return result;
  }

  private injectSheetRendererCase(bp: ActivityBlueprint, slug: string, dryRun: boolean): InjectionResult {
    const filePath = path.join(this.workspaceRoot, 'src/components/SheetRenderer.tsx');
    const result: InjectionResult = { target: filePath, type: 'sheetRenderer', key: bp.identity.key, success: false };

    if (!fs.existsSync(filePath)) {
      result.error = 'SheetRenderer.tsx bulunamadı';
      this.log('warn', 'SheetRenderer.tsx bulunamadı (atlanıyor)');
      result.success = true;
      result.skipped = true;
      return result;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(`ActivityType.${bp.identity.key}`)) {
      result.success = true;
      result.skipped = true;
      return result;
    }

    // Lazy import + case bloğu
    const PascalCase = bp.identity.key
      .toLowerCase()
      .split('_')
      .map((w: string) => w[0].toUpperCase() + w.slice(1))
      .join('');

    const lazyImport = `const ${PascalCase}Sheet = React.lazy(() => import('../modules/activities/${slug}/ui/WorksheetUI').then(m => ({ default: m.${PascalCase}Sheet })));\n`;
    const caseBlock = `    case ActivityType.${bp.identity.key}:\n      return <${PascalCase}Sheet data={data} />;\n`;

    if (!dryRun) {
      // İlk import'tan önce lazy import ekle
      const firstImportIdx = content.indexOf('import ');
      if (firstImportIdx > -1) {
        content = lazyImport + content;
      }

      // switch default'tan önce case ekle
      const defaultIdx = content.lastIndexOf('default:');
      if (defaultIdx > -1) {
        content = content.slice(0, defaultIdx) + caseBlock + content.slice(defaultIdx);
      }

      this.writeVFS(filePath, content);
    }

    result.success = true;
    this.log('info', `${dryRun ? '[DRY] ' : ''}SheetRenderer inject: ${bp.identity.key}`);
    return result;
  }

  private injectConfigPanelEntry(bp: ActivityBlueprint, slug: string, dryRun: boolean): InjectionResult {
    const filePath = path.join(this.workspaceRoot, 'src/components/activity-configs/index.ts');
    const result: InjectionResult = { target: filePath, type: 'configPanel', key: bp.identity.key, success: false };

    if (!fs.existsSync(filePath)) {
      this.log('warn', 'activity-configs/index.ts bulunamadı (atlanıyor)');
      result.success = true;
      result.skipped = true;
      return result;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(bp.identity.key)) {
      result.success = true;
      result.skipped = true;
      return result;
    }

    const PascalCase = bp.identity.key
      .toLowerCase()
      .split('_')
      .map((w: string) => w[0].toUpperCase() + w.slice(1))
      .join('');

    const exportLine = `export { ${PascalCase}Config } from '../../modules/activities/${slug}/ui/ConfigPanel';\n`;

    if (!dryRun) {
      content = content.trimEnd() + '\n' + exportLine;
      this.writeVFS(filePath, content);
    }

    result.success = true;
    this.log('info', `${dryRun ? '[DRY] ' : ''}ConfigPanel inject: ${bp.identity.key}`);
    return result;
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
