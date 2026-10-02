import type { TemplateSettingsProps as RegistryTemplateSettingsProps } from './registry';

/**
 * Şablon ayar bileşeni prop tipi.
 * Tek doğruluk kaynağı `registry.ts` içindeki generic tanımdır;
 * bu dosya yalnızca geriye uyumlu bir takma ad sunar.
 */
export type TemplateSettingsProps<T = unknown> = RegistryTemplateSettingsProps<T>;
