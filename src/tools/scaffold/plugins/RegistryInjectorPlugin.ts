import { ActivityBlueprint } from '../types';
import { IScaffoldPlugin } from './IScaffoldPlugin';
import { InjectionResult } from '../ActivityScaffoldEngine';
import * as path from 'path';
import * as fs from 'fs';

export class RegistryInjectorPlugin implements IScaffoldPlugin {
    name = 'RegistryInjectorPlugin';

    execute(bp: ActivityBlueprint, utils: any): InjectionResult[] {
        const filePath = path.join(utils.workspaceRoot, 'src/services/generators/registry.ts');
        const result: InjectionResult = { target: filePath, type: 'registry', key: bp.identity.key, success: false };

        if (!fs.existsSync(filePath)) {
            result.error = 'registry.ts bulunamadı';
            return [result];
        }

        let content = utils.readVFS(filePath);
        if (content.includes(`[ActivityType.${bp.identity.key}]`)) {
            result.success = true;
            result.skipped = true;
            utils.log('info', `Registry inject: ${bp.identity.key} zaten mevcut`);
            return [result];
        }

        const PascalCase = bp.identity.key.toLowerCase().split('_').map((w: string) => w[0].toUpperCase() + w.slice(1)).join('');
        const importLine = `import { generate${PascalCase}FromAI } from '../../modules/activities/${utils.slug}/generators';\nimport { generateOffline${PascalCase} } from '../../modules/activities/${utils.slug}/offlineGenerators';\n`;
        const registryEntry = `  [ActivityType.${bp.identity.key}]: {\n    ai: generate${PascalCase}FromAI,\n    offline: generateOffline${PascalCase},\n  },`;

        if (!utils.dryRun) {
            // Marker-based injection
            if (content.includes('// AUTONOM_IMPORTS_START')) {
                content = content.replace('// AUTONOM_IMPORTS_START', `// AUTONOM_IMPORTS_START\n${importLine}`);
            } else {
                const lastImportIdx = content.lastIndexOf('import ');
                const lineEnd = content.indexOf('\n', lastImportIdx);
                content = content.slice(0, lineEnd + 1) + importLine + content.slice(lineEnd + 1);
            }

            if (content.includes('// AUTONOM_REGISTRY_START')) {
                content = content.replace('// AUTONOM_REGISTRY_START', `// AUTONOM_REGISTRY_START\n${registryEntry}`);
            } else {
                const closingIdx = content.lastIndexOf('};');
                if (closingIdx > -1) {
                    content = content.slice(0, closingIdx) + registryEntry + '\n' + content.slice(closingIdx);
                }
            }

            utils.writeVFS(filePath, content);
        }

        result.success = true;
        utils.log('info', `${utils.dryRun ? '[DRY] ' : ''}Registry inject: ${bp.identity.key}`);
        return [result];
    }

}
