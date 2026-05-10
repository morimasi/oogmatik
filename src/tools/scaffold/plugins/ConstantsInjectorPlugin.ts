import { ActivityBlueprint } from '../types';
import { IScaffoldPlugin } from './IScaffoldPlugin';
import { InjectionResult } from '../ActivityScaffoldEngine';
import * as path from 'path';
import * as fs from 'fs';

export class ConstantsInjectorPlugin implements IScaffoldPlugin {
    name = 'ConstantsInjectorPlugin';

    execute(bp: ActivityBlueprint, utils: any): InjectionResult[] {
        const filePath = path.join(utils.workspaceRoot, 'src/constants.ts');
        const arrayName = 'ACTIVITIES';
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

        const regex = new RegExp(`export const ${arrayName}: [^=]+ = \\[([^]*?)\\];`, 'm');
        const match = content.match(regex);

        if (!match) {
            result.error = `${arrayName} dizisi bulunamadı`;
            utils.log('error', result.error);
            return [result];
        }

        const objectStr = this.buildActivityObject(bp);
        const arrayBody = match[1];
        const newItem = `\n  ${objectStr},`;
        const newBody = arrayBody.trimEnd() + newItem + '\n';

        if (!utils.dryRun) {
            const newContent = content.replace(arrayBody, newBody);
            utils.writeVFS(filePath, newContent);
        }

        result.success = true;
        utils.log('info', `${utils.dryRun ? '[DRY] ' : ''}Array inject: ${key} → ${arrayName}`);
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
