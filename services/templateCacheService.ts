/**
 * Template Cache Service
 * Kullanıcı şablonlarını localStorage'da saklar.
 * StyleSettings presetlerini ve özel ayar profillerini yönetir.
 */

import { StyleSettings } from '../types';

export interface TemplatePreset {
  id: string;
  name: string;
  description?: string;
  settings: Partial<StyleSettings>;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'oogmatik_template_presets';
const MAX_TEMPLATES = 50;

export const templateCacheService = {
  /** Tüm kayıtlı şablonları listeler */
  getAll(): TemplatePreset[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /** ID ile şablon getirir */
  getById(id: string): TemplatePreset | null {
    return this.getAll().find((t) => t.id === id) || null;
  },

  /** Yeni şablon kaydeder */
  save(name: string, settings: Partial<StyleSettings>, description?: string): TemplatePreset {
    const all = this.getAll();

    // Limit kontrolü — eski şablonları sil
    if (all.length >= MAX_TEMPLATES) {
      all.sort((a, b) => a.updatedAt - b.updatedAt);
      all.splice(0, all.length - MAX_TEMPLATES + 1);
    }

    const preset: TemplatePreset = {
      id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      description,
      settings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    all.push(preset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return preset;
  },

  /** Mevcut şablonu günceller */
  update(id: string, partial: Partial<Pick<TemplatePreset, 'name' | 'description' | 'settings'>>): boolean {
    const all = this.getAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    all[idx] = { ...all[idx], ...partial, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  },

  /** Şablonu siler */
  remove(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  /** Hazır sistem şablonları */
  getBuiltinPresets(): TemplatePreset[] {
    return [
      {
        id: 'builtin_klasik',
        name: 'Klasik',
        description: 'Standart düz çizgi kenarlık',
        settings: { themeBorder: 'simple', borderColor: '#3f3f46', borderWidth: 4, fontFamily: 'Inter' },
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 'builtin_matematik',
        name: 'Matematik Teması',
        description: 'Matematik sembollerle süslü kenarlık',
        settings: { themeBorder: 'math', borderColor: '#6366f1', borderWidth: 4, fontFamily: 'Inter' },
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 'builtin_sozel',
        name: 'Sözel Tema',
        description: 'Harflerle süslü kenarlık',
        settings: { themeBorder: 'verbal', borderColor: '#10b981', borderWidth: 4, fontFamily: 'Georgia' },
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 'builtin_disleksi',
        name: 'Disleksi Dostu',
        description: 'Geniş satır aralığı, disleksi fontu',
        settings: {
          fontSize: 20,
          lineHeight: 2.2,
          letterSpacing: 2,
          wordSpacing: 4,
          fontFamily: 'OpenDyslexic',
          themeBorder: 'simple',
          borderColor: '#3f3f46',
        },
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 'builtin_minimal',
        name: 'Minimal',
        description: 'Kenarlıksız sade görünüm',
        settings: { themeBorder: 'none', borderWidth: 0, fontFamily: 'Inter', showFooter: true },
        createdAt: 0,
        updatedAt: 0,
      },
    ];
  },
};
