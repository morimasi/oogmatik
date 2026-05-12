import { ActivityBlueprint } from '../types';
import { IScaffoldPlugin } from './IScaffoldPlugin';
import { InjectionResult } from '../ActivityScaffoldEngine';
import * as path from 'path';
import * as fs from 'fs';

export class SheetRendererPlugin implements IScaffoldPlugin {
    name = 'SheetRendererPlugin';

    execute(bp: ActivityBlueprint, utils: any): InjectionResult[] {
        const filePath = path.join(utils.workspaceRoot, 'src/components/SheetRenderer.tsx');
        const result: InjectionResult = { target: filePath, type: 'sheetRenderer', key: bp.identity.key, success: false };

        if (!fs.existsSync(filePath)) {
            result.error = 'SheetRenderer.tsx bulunamadı';
            utils.log('warn', 'SheetRenderer.tsx bulunamadı (atlanıyor)');
            result.success = true;
            result.skipped = true;
            return [result];
        }

        let content = utils.readVFS(filePath);
        if (content.includes(`ActivityType.${bp.identity.key}`)) {
            result.success = true;
            result.skipped = true;
            return [result];
        }

        const PascalCase = bp.identity.key.toLowerCase().split('_').map((w: string) => w[0].toUpperCase() + w.slice(1)).join('');
        const lazyImport = `const ${PascalCase}Sheet = React.lazy(() => import('../modules/activities/${utils.slug}/ui/WorksheetUI').then(m => ({ default: m.${PascalCase}Sheet })));\n`;
        const caseBlock = `      case ActivityType.${bp.identity.key}:\n        return <${PascalCase}Sheet data={data} />;\n`;

        if (!utils.dryRun) {
            // Marker-based injection
            if (content.includes('// AUTONOM_LAZY_IMPORTS_START')) {
                content = content.replace('// AUTONOM_LAZY_IMPORTS_START', `// AUTONOM_LAZY_IMPORTS_START\n${lazyImport}`);
            } else {
                // Fallback to top import
                content = lazyImport + content;
            }

            if (content.includes('// AUTONOM_CASES_START')) {
                content = content.replace('// AUTONOM_CASES_START', `// AUTONOM_CASES_START\n${caseBlock}`);
            } else {
                // Original fallback
                const defaultIdx = content.lastIndexOf('default:');
                if (defaultIdx > -1) {
                    content = content.slice(0, defaultIdx) + caseBlock + content.slice(defaultIdx);
                }
            }

            utils.writeVFS(filePath, content);
        }

        result.success = true;
        utils.log('info', `${utils.dryRun ? '[DRY] ' : ''}SheetRenderer inject: ${bp.identity.key}`);
        return [result];
    }

}
