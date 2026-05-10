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

        const importLine = `import { generate${bp.identity.key}FromAI } from '../../modules/activities/${utils.slug}/generators';\nimport { generateOffline${bp.identity.key} } from '../../modules/activities/${utils.slug}/offlineGenerators';\n`;
        const registryEntry = `  [ActivityType.${bp.identity.key}]: {\n    ai: generate${bp.identity.key}FromAI,\n    offline: generateOffline${bp.identity.key},\n  },`;

        if (!utils.dryRun) {
            const lastImportIdx = content.lastIndexOf('import ');
            const lineEnd = content.indexOf('\n', lastImportIdx);
            content = content.slice(0, lineEnd + 1) + importLine + content.slice(lineEnd + 1);

            const closingIdx = content.lastIndexOf('};');
            if (closingIdx > -1) {
                content = content.slice(0, closingIdx) + registryEntry + '\n' + content.slice(closingIdx);
            }

            utils.writeVFS(filePath, content);
        }

        result.success = true;
        utils.log('info', `${utils.dryRun ? '[DRY] ' : ''}Registry inject: ${bp.identity.key}`);
        return [result];
    }
}
