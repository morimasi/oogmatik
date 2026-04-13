import { describe, expect, it } from 'vitest';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';

describe('ActivityStudioStore — Content + Theme + Layout', () => {
  it('has content, themeConfig, compactA4Config, exportSettings fields', () => {
    const store = useActivityStudioStore.getState();

    expect(store.content).toBeDefined();
    expect(store.themeConfig).toBeDefined();
    expect(store.compactA4Config).toBeDefined();
    expect(store.exportSettings).toBeDefined();
    expect(store.pedagogicalNote).toBeDefined();
  });

  it('has setContent, setThemeConfig, setCompactA4Config, setExportSettings, setPedagogicalNote actions', () => {
    const store = useActivityStudioStore.getState();

    expect(typeof store.setContent).toBe('function');
    expect(typeof store.setThemeConfig).toBe('function');
    expect(typeof store.setCompactA4Config).toBe('function');
    expect(typeof store.setExportSettings).toBe('function');
    expect(typeof store.setPedagogicalNote).toBe('function');
  });
});
