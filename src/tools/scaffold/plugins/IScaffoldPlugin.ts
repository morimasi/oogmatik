import { ActivityBlueprint } from '../types';
import { InjectionResult } from '../ActivityScaffoldEngine';
import * as fs from 'fs';
import * as path from 'path';

export interface PluginUtils {
    workspaceRoot: string;
    slug: string;
    dryRun: boolean;
    readVFS: (f: string) => string;
    writeVFS: (f: string, content: string) => void;
    log: (level: 'info' | 'warn' | 'error', msg: string) => void;
}

/**
 * Motorun yeteneklerini dışarıdan eklenen pluginlerle yöneten yapı.
 */
export interface IScaffoldPlugin {
    name: string;

    /**
     * Plugin'i çalıştırır. Değiştirilmesi gereken dosyalar için VFS arayüzünü kullanır.
     */
    execute(bp: ActivityBlueprint, utils: PluginUtils): InjectionResult[];

    /**
     * AI tabanlı veya network gerektiren pluginler için asenkron metod. (Opsiyonel)
     */
    executeAsync?(bp: ActivityBlueprint, utils: PluginUtils): Promise<InjectionResult[]>;
}
