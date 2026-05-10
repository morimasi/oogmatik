import { ActivityBlueprint } from '../types';
import { InjectionResult } from '../ActivityScaffoldEngine';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Motorun yeteneklerini dışarıdan eklenen pluginlerle yöneten yapı.
 */
export interface IScaffoldPlugin {
    name: string;

    /**
     * Plugin'i çalıştırır. Değiştirilmesi gereken dosyalar için VFS arayüzünü (readVFS, writeVFS) kullanır.
     */
    execute(
        bp: ActivityBlueprint,
        utils: {
            workspaceRoot: string,
            slug: string,
            dryRun: boolean,
            readVFS: (f: string) => string,
            writeVFS: (f: string, content: string) => void,
            log: (level: 'info' | 'warn' | 'error', msg: string) => void
        }
    ): InjectionResult[];
}
