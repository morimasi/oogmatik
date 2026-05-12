import { ActivityBlueprint } from '../types';
import { IScaffoldPlugin } from './IScaffoldPlugin';
import { InjectionResult } from '../ActivityScaffoldEngine';
import * as path from 'path';
import * as fs from 'fs';

export class ExportInjectorPlugin implements IScaffoldPlugin {
    name = 'ExportInjectorPlugin';

    execute(bp: ActivityBlueprint, utils: any): InjectionResult[] {
        const results: InjectionResult[] = [];

        // 1. AI Generator Export
        const aiPath = path.join(utils.workspaceRoot, 'src/services/generators/index.ts');
        const aiExport = `export { generate${bp.identity.key}FromAI } from '../../modules/activities/${utils.slug}/generators';`;
        results.push(this.injectSingleExport(bp, utils, aiPath, aiExport, 'export'));

        // 2. Offline Generator Export
        const offlinePath = path.join(utils.workspaceRoot, 'src/services/offlineGenerators/index.ts');
        const offlineExport = `export { generateOffline${bp.identity.key} } from '../../modules/activities/${utils.slug}/offlineGenerators';`;
        results.push(this.injectSingleExport(bp, utils, offlinePath, offlineExport, 'export'));

        return results;
    }

    private injectSingleExport(bp: ActivityBlueprint, utils: any, filePath: string, exportLine: string, type: 'export'): InjectionResult {
        const result: InjectionResult = { target: filePath, type, key: bp.identity.key, success: false };

        if (!fs.existsSync(filePath)) {
            result.error = 'Dosya bulunamadı';
            utils.log('warn', `Export inject: ${filePath} bulunamadı (atlanıyor)`);
            result.success = true;
            result.skipped = true;
            return result;
        }

        let content = utils.readVFS(filePath);
        if (content.includes(bp.identity.key)) {
            result.success = true;
            result.skipped = true;
            return result;
        }

        const PascalCase = bp.identity.key.toLowerCase().split('_').map((w: string) => w[0].toUpperCase() + w.slice(1)).join('');
        const lineToInject = filePath.includes('offlineGenerators') 
            ? `export { generateOffline${PascalCase} } from '../../modules/activities/${utils.slug}/offlineGenerators';`
            : `export { generate${PascalCase}FromAI } from '../../modules/activities/${utils.slug}/generators';`;

        if (!utils.dryRun) {
            if (content.includes('// AUTONOM_EXPORTS_START')) {
                content = content.replace('// AUTONOM_EXPORTS_START', `// AUTONOM_EXPORTS_START\n${lineToInject}`);
            } else {
                content = content.trimEnd() + '\n' + lineToInject + '\n';
            }
            utils.writeVFS(filePath, content);
        }

        result.success = true;
        utils.log('info', `${utils.dryRun ? '[DRY] ' : ''}Export inject: ${bp.identity.key} (${type})`);
        return result;
    }

}
