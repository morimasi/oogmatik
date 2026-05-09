import * as fs from 'fs';
import * as path from 'path';
import { ActivityBlueprint } from './types';

/**
 * ActivityScaffoldEngine: Ootonom etkinlik modülü oluşturma ve entegrasyon motoru.
 */
export class ActivityScaffoldEngine {
  private workspaceRoot: string;
  private templateDir: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.templateDir = path.join(workspaceRoot, 'src/tools/scaffold/templates');
  }

  /**
   * Bir blueprint'ten tüm otonom süreci başlatır.
   */
  async process(blueprint: ActivityBlueprint) {
    console.log(`[Scaffold] Starting process for: ${blueprint.identity.title}`);

    // 1. Modül Klasörünü Oluştur
    const moduleDir = this.ensureModuleDirectory(blueprint);

    // 2. Dosyaları Şablonlardan Üret
    this.generateModuleFiles(blueprint, moduleDir);

    // 3. Global Entegrasyonlar (Types, Constants, Registry)
    this.injectIntegrations(blueprint);

    console.log(`[Scaffold] Otonom modül başarıyla kuruldu: ${blueprint.identity.key}`);
    return { success: true, moduleDir };
  }

  private ensureModuleDirectory(bp: ActivityBlueprint): string {
    const slug = bp.identity.key.toLowerCase().replace(/_/g, '-');
    const dir = path.join(this.workspaceRoot, 'src/modules/activities', slug);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      fs.mkdirSync(path.join(dir, 'ui'), { recursive: true });
    }
    return dir;
  }

  private generateModuleFiles(bp: ActivityBlueprint, dir: string) {
    const data = {
      ...bp,
      interfaceName: bp.dataModel.interfaceName,
      itemsName: bp.dataModel.itemsName || `${bp.dataModel.interfaceName}Item`,
      enumKey: bp.identity.key,
      title: bp.identity.title
    };

    // 1. types.ts
    this.renderTemplate('dataType.template.txt', path.join(dir, 'types.ts'), data);
    
    // 2. generators.ts
    this.renderTemplate('aiGenerator.template.txt', path.join(dir, 'generators.ts'), data);

    // 3. index.ts (Barrel)
    fs.writeFileSync(path.join(dir, 'index.ts'), `export * from './types';\nexport * from './generators';\n`);
    
    console.log(`[Scaffold] Module files generated in ${dir}`);
  }

  private renderTemplate(templateName: string, outputPath: string, data: any) {
    const templatePath = path.join(this.templateDir, templateName);
    if (!fs.existsSync(templatePath)) {
      console.error(`[Scaffold] Template missing: ${templateName}`);
      return;
    }

    let content = fs.readFileSync(templatePath, 'utf8');

    // Basit Handlebars benzeri replacement
    content = content.replace(/\{\{title\}\}/g, data.title);
    content = content.replace(/\{\{interfaceName\}\}/g, data.interfaceName);
    content = content.replace(/\{\{itemsName\}\}/g, data.itemsName);
    content = content.replace(/\{\{enumKey\}\}/g, data.enumKey);

    // UI/Logic AI Prompt Injection
    if (data.logic?.aiPrompt) {
        content = content.replace(/\{\{logic\.aiPrompt\.role\}\}/g, data.logic.aiPrompt.role);
        content = content.replace(/\{\{logic\.aiPrompt\.task\}\}/g, data.logic.aiPrompt.task);
    }

    // JSON Stringify desteği
    content = content.replace(/\{\{json ([^}]+)\}\}/g, (_, key) => {
      const parts = key.split('.');
      let val = data;
      for (const part of parts) {
        val = val?.[part];
      }
      return JSON.stringify(val, null, 2);
    });

    fs.writeFileSync(outputPath, content);
  }

  private injectIntegrations(bp: ActivityBlueprint) {
    console.log(`[Scaffold] Injecting global integrations...`);

    // 1. ActivityType Enum
    this.injectIntoEnum(
      path.join(this.workspaceRoot, 'src/types/activity.ts'),
      'ActivityType',
      bp.identity.key,
      bp.identity.enumValue
    );

    // 2. ACTIVITIES array
    this.injectIntoArray(
      path.join(this.workspaceRoot, 'src/constants.ts'),
      'ACTIVITIES',
      this.buildActivityObject(bp)
    );
  }

  private injectIntoEnum(filePath: string, enumName: string, key: string, value: string) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(`${key} =`)) return;

    const regex = new RegExp(`export enum ${enumName} \\{([^]*?)\\}`, 'm');
    const match = content.match(regex);

    if (match) {
      const enumBody = match[1];
      const lines = enumBody.split('\n').map(l => l.trim()).filter(l => l);
      
      // Son satırı bul ve virgül eksikse ekle
      const lastIdx = lines.length - 1;
      if (lastIdx >= 0 && !lines[lastIdx].endsWith(',')) {
          lines[lastIdx] = lines[lastIdx] + ',';
      }
      
      lines.push(`${key} = '${value}',`);
      
      const newBody = '\n  ' + lines.join('\n  ') + '\n';
      const newContent = content.replace(enumBody, newBody);
      fs.writeFileSync(filePath, newContent);
      console.log(`[Scaffold] Injected ${key} into ${enumName}`);
    }
  }

  private injectIntoArray(filePath: string, arrayName: string, objectStr: string) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(`ActivityType.${objectStr.match(/ActivityType\.(\w+)/)?.[1] || '____'}`)) return;

    const regex = new RegExp(`export const ${arrayName}: [^=]+ = \\[([^]*?)\\];`, 'm');
    const match = content.match(regex);

    if (match) {
      const arrayBody = match[1];
      const newItem = `\n  ${objectStr},`;
      const newBody = arrayBody.trimEnd() + newItem + '\n';
      const newContent = content.replace(arrayBody, newBody);
      fs.writeFileSync(filePath, newContent);
      console.log(`[Scaffold] Injected item into ${arrayName}`);
    }
  }

  private buildActivityObject(bp: ActivityBlueprint): string {
    return `{
    id: ActivityType.${bp.identity.key},
    title: '${bp.identity.title}',
    description: '${bp.identity.description}',
    icon: '${bp.identity.icon}',
    defaultStyle: { columns: 1 }
  }`;
  }
}
