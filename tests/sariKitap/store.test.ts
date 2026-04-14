import { describe, it, expect } from 'vitest';
import { createDefaultConfig, useSariKitapStore } from '../../src/store/useSariKitapStore';

describe('createDefaultConfig', () => {
    const types = ['pencere', 'nokta', 'kopru', 'cift_metin', 'bellek', 'hizli_okuma'] as const;

    types.forEach((type) => {
        it(`${type} tipi için default config oluşturur`, () => {
            const config = createDefaultConfig(type);
            expect(config.type).toBe(type);
            expect(config.ageGroup).toBe('8-10');
            expect(config.difficulty).toBe('Başlangıç');
            expect(config.profile).toBe('dyslexia');
            expect(config.typography).toBeDefined();
            expect(config.typography.fontSize).toBeGreaterThanOrEqual(14);
            expect(config.typography.lineHeight).toBeGreaterThanOrEqual(1.6);
        });
    });
});

describe('useSariKitapStore', () => {
    it('başlangıç durumunu doğru ayarlar', () => {
        const state = useSariKitapStore.getState();
        expect(state.activeType).toBe('pencere');
        expect(state.config.type).toBe('pencere');
        expect(state.isGenerating).toBe(false);
        expect(state.generationMode).toBe('ai');
        expect(state.generatedContent).toBeNull();
        expect(state.error).toBeNull();
        expect(state.previewScale).toBe(1);
        expect(state.showGrid).toBe(false);
    });

    it('setActiveType config ve content sıfırlar', () => {
        const store = useSariKitapStore.getState();
        store.setActiveType('nokta');
        const updated = useSariKitapStore.getState();
        expect(updated.activeType).toBe('nokta');
        expect(updated.config.type).toBe('nokta');
        expect(updated.generatedContent).toBeNull();
        expect(updated.error).toBeNull();
    });

    it('updateConfig mevcut config üzerinde değişiklik yapar', () => {
        const store = useSariKitapStore.getState();
        store.setActiveType('pencere');
        store.updateConfig({ difficulty: 'Orta' });
        const updated = useSariKitapStore.getState();
        expect(updated.config.difficulty).toBe('Orta');
        expect(updated.config.type).toBe('pencere');
    });

    it('setGenerationMode doğru çalışır', () => {
        useSariKitapStore.getState().setGenerationMode('offline');
        expect(useSariKitapStore.getState().generationMode).toBe('offline');
        useSariKitapStore.getState().setGenerationMode('ai');
        expect(useSariKitapStore.getState().generationMode).toBe('ai');
    });

    it('toggleGrid grid durumunu değiştirir', () => {
        const initial = useSariKitapStore.getState().showGrid;
        useSariKitapStore.getState().toggleGrid();
        expect(useSariKitapStore.getState().showGrid).toBe(!initial);
        useSariKitapStore.getState().toggleGrid();
        expect(useSariKitapStore.getState().showGrid).toBe(initial);
    });

    it('setPreviewScale sınır dışı değerleri keser', () => {
        useSariKitapStore.getState().setPreviewScale(0.1);
        expect(useSariKitapStore.getState().previewScale).toBe(0.3);
        useSariKitapStore.getState().setPreviewScale(5);
        expect(useSariKitapStore.getState().previewScale).toBe(1.5);
        useSariKitapStore.getState().setPreviewScale(0.8);
        expect(useSariKitapStore.getState().previewScale).toBe(0.8);
    });

    it('resetStudio tüm değerleri başlangıca döndürür', () => {
        const store = useSariKitapStore.getState();
        store.setActiveType('bellek');
        store.setGenerationMode('offline');
        store.setError('test error');
        store.resetStudio();
        const reset = useSariKitapStore.getState();
        expect(reset.activeType).toBe('pencere');
        expect(reset.generationMode).toBe('ai');
        expect(reset.error).toBeNull();
        expect(reset.generatedContent).toBeNull();
    });
});
