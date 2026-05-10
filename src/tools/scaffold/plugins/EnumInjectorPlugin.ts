import { ActivityBlueprint } from '../types';
import { IScaffoldPlugin } from './IScaffoldPlugin';
import { InjectionResult } from '../ActivityScaffoldEngine';
import * as path from 'path';
import * as fs from 'fs';

export class EnumInjectorPlugin implements IScaffoldPlugin {
    name = 'EnumInjectorPlugin';

    execute(bp: ActivityBlueprint, utils: any): InjectionResult[] {
        const filePath = path.join(utils.workspaceRoot, 'src/types/activity.ts');
        const enumName = 'ActivityType';
        const key = bp.identity.key;
        const value = bp.identity.enumValue || bp.identity.key.toLowerCase().replace(/_/g, '-');

        const result: InjectionResult = { target: filePath, type: 'enum', key, success: false };

        if (!fs.existsSync(filePath)) {
            result.error = 'Dosya bulunamadı';
            utils.log('error', `Enum inject: ${filePath} bulunamadı`);
            return [result];
        }

        let content = utils.readVFS(filePath);
        if (content.includes(`${key} =`)) {
            result.success = true;
            result.skipped = true;
            utils.log('info', `Enum inject: ${key} zaten mevcut (atlanıyor)`);
            return [result];
        }

        const regex = new RegExp(`export enum ${enumName} \\{([^]*?)\\}`, 'm');
        const match = content.match(regex);

        if (!match) {
            result.error = `${enumName} enum bulunamadı`;
            utils.log('error', result.error);
            return [result];
        }

        const enumBody = match[1];
        const lines = enumBody.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
        const lastIdx = lines.length - 1;
        if (lastIdx >= 0 && !lines[lastIdx].endsWith(',')) {
            lines[lastIdx] = lines[lastIdx] + ',';
        }
        lines.push(`${key} = '${value}',`);
        const newBody = '\n  ' + lines.join('\n  ') + '\n';

        if (!utils.dryRun) {
            const newContent = content.replace(enumBody, newBody);
            utils.writeVFS(filePath, newContent);
        }

        result.success = true;
        utils.log('info', `${utils.dryRun ? '[DRY] ' : ''}Enum inject: ${key} → ${enumName}`);
        return [result];
    }
}
