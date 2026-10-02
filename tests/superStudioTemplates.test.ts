import { describe, it, expect } from 'vitest';
import {
  SUPER_STUDIO_REGISTRY,
  getTemplateById,
} from '../src/components/SuperStudio/templates/registry';
import { DEFAULT_SETTINGS as OkumaAnlamaDefaults, promptBuilder as OkumaAnlamaPrompt } from '../src/components/SuperStudio/templates/OkumaAnlama';
import { DEFAULT_SETTINGS as DilBilgisiDefaults, promptBuilder as DilBilgisiPrompt } from '../src/components/SuperStudio/templates/DilBilgisi';
import { DEFAULT_SETTINGS as MantikMuhakemeDefaults, promptBuilder as MantikMuhakemePrompt } from '../src/components/SuperStudio/templates/MantikMuhakeme';
import { DEFAULT_SETTINGS as YaraticiYazarlikDefaults, promptBuilder as YaraticiYazarlikPrompt } from '../src/components/SuperStudio/templates/YaraticiYazarlik';
import { DEFAULT_SETTINGS as YazimNoktalamaDefaults, promptBuilder as YazimNoktalamaPrompt } from '../src/components/SuperStudio/templates/YazimNoktalama';
import { DEFAULT_SETTINGS as SozVarligiDefaults, promptBuilder as SozVarligiPrompt } from '../src/components/SuperStudio/templates/SozVarligi';
import { DEFAULT_SETTINGS as HeceSesDefaults, promptBuilder as HeceSesPrompt } from '../src/components/SuperStudio/templates/HeceSes';
import { DEFAULT_SETTINGS as KelimeBilgisiDefaults, promptBuilder as KelimeBilgisiPrompt } from '../src/components/SuperStudio/templates/KelimeBilgisi';
import { Settings as OkumaAnlamaSettings } from '../src/components/SuperStudio/templates/OkumaAnlama';
import { Settings as DilBilgisiSettings } from '../src/components/SuperStudio/templates/DilBilgisi';
import { Settings as MantikMuhakemeSettings } from '../src/components/SuperStudio/templates/MantikMuhakeme';
import { Settings as YaraticiYazarlikSettings } from '../src/components/SuperStudio/templates/YaraticiYazarlik';
import { Settings as YazimNoktalamaSettings } from '../src/components/SuperStudio/templates/YazimNoktalama';
import { Settings as SozVarligiSettings } from '../src/components/SuperStudio/templates/SozVarligi';
import { Settings as HeceSesSettings } from '../src/components/SuperStudio/templates/HeceSes';
import { Settings as KelimeBilgisiSettings } from '../src/components/SuperStudio/templates/KelimeBilgisi';

const EXPECTED_IDS = [
  'okuma-anlama',
  'dil-bilgisi',
  'mantik-muhakeme',
  'yaratici-yazarlik',
  'yazim-noktalama',
  'soz-varligi',
  'hece-ses',
  'kelime-bilgisi',
];

const BUILDERS: Record<string, (ctx: { topic: string; studentName?: string; grade?: string | null; difficulty: 'Kolay' | 'Orta' | 'Zor'; settings: unknown }) => string> = {
  'okuma-anlama': OkumaAnlamaPrompt as unknown as (ctx: { topic: string; studentName?: string; grade?: string | null; difficulty: 'Kolay' | 'Orta' | 'Zor'; settings: unknown }) => string,
  'dil-bilgisi': DilBilgisiPrompt as unknown as (ctx: { topic: string; studentName?: string; grade?: string | null; difficulty: 'Kolay' | 'Orta' | 'Zor'; settings: unknown }) => string,
  'mantik-muhakeme': MantikMuhakemePrompt as unknown as (ctx: { topic: string; studentName?: string; grade?: string | null; difficulty: 'Kolay' | 'Orta' | 'Zor'; settings: unknown }) => string,
  'yaratici-yazarlik': YaraticiYazarlikPrompt as unknown as (ctx: { topic: string; studentName?: string; grade?: string | null; difficulty: 'Kolay' | 'Orta' | 'Zor'; settings: unknown }) => string,
  'yazim-noktalama': YazimNoktalamaPrompt as unknown as (ctx: { topic: string; studentName?: string; grade?: string | null; difficulty: 'Kolay' | 'Orta' | 'Zor'; settings: unknown }) => string,
  'soz-varligi': SozVarligiPrompt as unknown as (ctx: { topic: string; studentName?: string; grade?: string | null; difficulty: 'Kolay' | 'Orta' | 'Zor'; settings: unknown }) => string,
  'hece-ses': HeceSesPrompt as unknown as (ctx: { topic: string; studentName?: string; grade?: string | null; difficulty: 'Kolay' | 'Orta' | 'Zor'; settings: unknown }) => string,
  'kelime-bilgisi': KelimeBilgisiPrompt as unknown as (ctx: { topic: string; studentName?: string; grade?: string | null; difficulty: 'Kolay' | 'Orta' | 'Zor'; settings: unknown }) => string,
};

const DEFAULTS: Record<string, unknown> = {
  'okuma-anlama': OkumaAnlamaDefaults,
  'dil-bilgisi': DilBilgisiDefaults,
  'mantik-muhakeme': MantikMuhakemeDefaults,
  'yaratici-yazarlik': YaraticiYazarlikDefaults,
  'yazim-noktalama': YazimNoktalamaDefaults,
  'soz-varligi': SozVarligiDefaults,
  'hece-ses': HeceSesDefaults,
  'kelime-bilgisi': KelimeBilgisiDefaults,
};

const SETTINGS_COMPONENTS: Record<string, unknown> = {
  'okuma-anlama': OkumaAnlamaSettings,
  'dil-bilgisi': DilBilgisiSettings,
  'mantik-muhakeme': MantikMuhakemeSettings,
  'yaratici-yazarlik': YaraticiYazarlikSettings,
  'yazim-noktalama': YazimNoktalamaSettings,
  'soz-varligi': SozVarligiSettings,
  'hece-ses': HeceSesSettings,
  'kelime-bilgisi': KelimeBilgisiSettings,
};

describe('SuperStudio templates registry', () => {
  it('registers all 8 templates', () => {
    expect(SUPER_STUDIO_REGISTRY).toHaveLength(8);
    for (const id of EXPECTED_IDS) {
      expect(getTemplateById(id)).toBeDefined();
    }
  });

  it('every entry has the DEFAULT_SETTINGS + Settings + promptBuilder triple', () => {
    for (const entry of SUPER_STUDIO_REGISTRY) {
      expect(entry.defaultSettings, `${entry.id} defaultSettings`).toBeDefined();
      expect(entry.component, `${entry.id} component`).toBeDefined();
      expect(entry.promptBuilder, `${entry.id} promptBuilder`).toBeDefined();
      expect(typeof entry.promptBuilder).toBe('function');
      expect(DEFAULTS[entry.id]).toBeDefined();
      expect(SETTINGS_COMPONENTS[entry.id]).toBeDefined();
    }
  });
});

describe.each(EXPECTED_IDS)('template %s promptBuilder', (id) => {
  const topic = `Test Konusu ${id}`;
  const grade = '3. Sınıf';
  const difficulty = 'Orta' as const;

  it('output contains topic, grade and difficulty', () => {
    const output = BUILDERS[id]({ topic, grade, difficulty, settings: DEFAULTS[id] });
    expect(output).toContain(topic);
    expect(output).toContain(grade);
    expect(output).toContain(difficulty);
  });

  it('output describes a JSON schema with pedagogicalNote', () => {
    const output = BUILDERS[id]({ topic, grade, difficulty, settings: DEFAULTS[id] });
    expect(output).toContain('JSON');
    expect(output).toContain('pedagogicalNote');
    // JSON örneği parse edilebilir olmalı: ilk { ... } bloğunu doğrula
    const jsonMatch = output.match(/\{[\s\S]*"pedagogicalNote"[\s\S]*?\n\}/);
    expect(jsonMatch, `${id} JSON schema block`).not.toBeNull();
  });

  it('personalizes when studentName is given and truncates long topics', () => {
    const withName = BUILDERS[id]({ topic, grade, difficulty, studentName: 'Elif', settings: DEFAULTS[id] });
    expect(withName).toContain('Elif');
    const longTopic = 'x'.repeat(2500);
    const truncated = BUILDERS[id]({ topic: longTopic, grade, difficulty, settings: DEFAULTS[id] });
    expect(truncated).not.toContain(longTopic);
    expect(truncated).toContain('x'.repeat(100));
  });
});
