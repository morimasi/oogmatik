import { ActivityBlueprint } from '../types';
import { IScaffoldPlugin } from './IScaffoldPlugin';
import { InjectionResult } from '../ActivityScaffoldEngine';
import * as path from 'path';
import * as fs from 'fs';

export class ConfigPanelPlugin implements IScaffoldPlugin {
    name = 'ConfigPanelPlugin';

    execute(bp: ActivityBlueprint, utils: any): InjectionResult[] {
        const filePath = path.join(utils.workspaceRoot, 'src/components/activity-configs/index.ts');
        const result: InjectionResult = { target: filePath, type: 'configPanel', key: bp.identity.key, success: false };

        if (!fs.existsSync(filePath)) {
            utils.log('warn', 'activity-configs/index.ts bulunamadı (atlanıyor)');
            result.success = true;
            result.skipped = true;
            return [result];
        }

        let content = utils.readVFS(filePath);
        if (content.includes(bp.identity.key)) {
            result.success = true;
            result.skipped = true;
            return [result];
        }

        const PascalCase = bp.identity.key.toLowerCase().split('_').map((w: string) => w[0].toUpperCase() + w.slice(1)).join('');
        const exportLine = `export { ${PascalCase}Config } from '../../modules/activities/${utils.slug}/ui/ConfigPanel';\n`;

        if (!utils.dryRun) {
            content = content.trimEnd() + '\n' + exportLine;
            utils.writeVFS(filePath, content);
        }

        result.success = true;
        utils.log('info', `${utils.dryRun ? '[DRY] ' : ''}ConfigPanel inject: ${bp.identity.key}`);
        return [result];
    }
}
