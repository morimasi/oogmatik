import { ActivityBlueprint } from '../types';
import { IScaffoldPlugin } from './IScaffoldPlugin';
import { InjectionResult } from '../ActivityScaffoldEngine';
import * as path from 'path';
import * as fs from 'fs';

export class ConstantsInjectorPlugin implements IScaffoldPlugin {
    name = 'ConstantsInjectorPlugin';

    execute(bp: ActivityBlueprint, utils: any): InjectionResult[] {
        const filePath = path.join(utils.workspaceRoot, 'src/constants.ts');
        const key = bp.identity.key;

        const result: InjectionResult = { target: filePath, type: 'array', key, success: false };

        if (!fs.existsSync(filePath)) {
            result.error = 'Dosya bulunamadı';
            return [result];
        }

        let content = utils.readVFS(filePath);
        if (content.includes(`ActivityType.${key}`)) {
            result.success = true;
            result.skipped = true;
            utils.log('info', `Array inject: ${key} zaten mevcut (atlanıyor)`);
            return [result];
        }

        const objectStr = this.buildActivityObject(bp);
        const newItem = `\n  ${objectStr},`;

        if (!utils.dryRun) {
            if (content.includes('// AUTONOM_ACTIVITIES_START')) {
                content = content.replace('// AUTONOM_ACTIVITIES_START', `// AUTONOM_ACTIVITIES_START\n${newItem}`);
            } else {
                // Fallback to end of array
                const arrayHeader = 'export const ACTIVITIES: Activity[] = [';
                const startIdx = content.indexOf(arrayHeader);
                if (startIdx > -1) {
                    const closingIdx = content.indexOf('];', startIdx);
                    if (closingIdx > -1) {
                        content = content.slice(0, closingIdx) + newItem + '\n' + content.slice(closingIdx);
                    }
                }
            }
            utils.writeVFS(filePath, content);
        }

        result.success = true;
        utils.log('info', `${utils.dryRun ? '[DRY] ' : ''}Array inject: ${key}`);
        return [result];
    }


    private buildActivityObject(bp: ActivityBlueprint): string {
        const categoryMap: Record<string, string> = {
            'okuma': "['Okuma', 'Disleksi', 'Görsel Algı']",
            'matematik': "['Matematik', 'Diskalkuli', 'Mantık']",
            'dikkat': "['Dikkat', 'Hafıza', 'DEHB']"
        };
        const defaultCats = "['Bilişsel Beceriler', 'Analitik Düşünme']";
        const cats = categoryMap[(bp.identity.categoryId || '').toLowerCase()] || defaultCats;
        const diff = (bp.pedagogical as any)?.difficultyLevel || 'Orta';

        return `{
    id: ActivityType.${bp.identity.key},
    title: '${bp.identity.title}',
    description: '${bp.identity.description}',
    categories: ${cats},
    difficulty: '${diff}',
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
  }`;
    }
}
