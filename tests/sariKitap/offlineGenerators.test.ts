import { describe, it, expect } from 'vitest';
import {
    generatePencereOffline,
} from '../../src/services/offlineGenerators/sariKitap/pencere.offline';
import {
    generateNoktaOffline,
} from '../../src/services/offlineGenerators/sariKitap/nokta.offline';
import {
    generateKopruOffline,
} from '../../src/services/offlineGenerators/sariKitap/kopru.offline';
import {
    generateCiftMetinOffline,
} from '../../src/services/offlineGenerators/sariKitap/ciftMetin.offline';
import {
    generateBellekOffline,
} from '../../src/services/offlineGenerators/sariKitap/bellek.offline';
import {
    generateHizliOkumaOffline,
} from '../../src/services/offlineGenerators/sariKitap/hizliOkuma.offline';
import { generateOffline } from '../../src/services/offlineGenerators/sariKitap';
import { createDefaultConfig } from '../../src/store/useSariKitapStore';
import type { SariKitapGeneratedContent, PencereConfig, NoktaConfig, KopruConfig, CiftMetinConfig, BellekConfig, HizliOkumaConfig } from '../../src/types/sariKitap';

function expectValidContent(content: SariKitapGeneratedContent) {
    expect(content).toBeDefined();
    expect(content.title).toBeTruthy();
    expect(content.rawText).toBeTruthy();
    expect(content.pedagogicalNote).toBeTruthy();
    expect(content.instructions).toBeTruthy();
    expect(content.heceRows).toBeDefined();
    expect(Array.isArray(content.heceRows)).toBe(true);
    expect(content.generatedAt).toBeTruthy();
    expect(content.model).toBe('gemini-2.5-flash');
}

describe('Pencere Offline Üretici', () => {
    it('geçerli SariKitapGeneratedContent döndürür', () => {
        const config = createDefaultConfig('pencere') as PencereConfig;
        const result = generatePencereOffline(config);
        expectValidContent(result);
        expect(result.heceRows.length).toBeGreaterThan(0);
    });
});

describe('Nokta Offline Üretici', () => {
    it('geçerli SariKitapGeneratedContent döndürür', () => {
        const config = createDefaultConfig('nokta') as NoktaConfig;
        const result = generateNoktaOffline(config);
        expectValidContent(result);
        expect(result.heceRows.length).toBeGreaterThan(0);
    });
});

describe('Köprü Offline Üretici', () => {
    it('geçerli SariKitapGeneratedContent döndürür', () => {
        const config = createDefaultConfig('kopru') as KopruConfig;
        const result = generateKopruOffline(config);
        expectValidContent(result);
    });
});

describe('Çift Metin Offline Üretici', () => {
    it('geçerli SariKitapGeneratedContent döndürür', () => {
        const config = createDefaultConfig('cift_metin') as CiftMetinConfig;
        const result = generateCiftMetinOffline(config);
        expectValidContent(result);
        expect(result.sourceTexts).toBeDefined();
        expect(result.sourceTexts?.a.title).toBeTruthy();
        expect(result.sourceTexts?.b.title).toBeTruthy();
    });
});

describe('Bellek Offline Üretici', () => {
    it('geçerli SariKitapGeneratedContent ve wordBlocks döndürür', () => {
        const config = createDefaultConfig('bellek') as BellekConfig;
        const result = generateBellekOffline(config);
        expectValidContent(result);
        expect(result.wordBlocks).toBeDefined();
        expect(Array.isArray(result.wordBlocks)).toBe(true);
    });
});

describe('Hızlı Okuma Offline Üretici', () => {
    it('geçerli SariKitapGeneratedContent ve wordBlocks döndürür', () => {
        const config = createDefaultConfig('hizli_okuma') as HizliOkumaConfig;
        const result = generateHizliOkumaOffline(config);
        expectValidContent(result);
        expect(result.wordBlocks).toBeDefined();
    });
});

describe('generateOffline Router', () => {
    const types = ['pencere', 'nokta', 'kopru', 'cift_metin', 'bellek', 'hizli_okuma'] as const;
    types.forEach((type) => {
        it(`${type} tipinde geçerli içerik döndürür`, () => {
            const config = createDefaultConfig(type);
            const result = generateOffline(config);
            expectValidContent(result);
        });
    });
});
