import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateOfflineMapInstruction } from '../src/services/offlineGenerators/mapDetective';
import { generateMapInstructionFromAI } from '../src/services/generators/mapInstruction';
import { generateCreativeMultimodal } from '../src/services/geminiClient';
import { renderToStaticMarkup } from 'react-dom/server';
import { TurkeyMapSVG } from '../src/components/sheets/visual/TurkeyMapSVG';

vi.mock('../src/services/geminiClient', () => ({
  generateCreativeMultimodal: vi.fn(),
}));

const aiResponse = {
  title: 'Harita Dedektifi: Türkiye Haritası',
  instruction: 'Haritayı incele.',
  instructions: ['Birinci yönerge', 'İkinci yönerge', 'Üçüncü yönerge'],
  cities: [],
};

describe('Harita Dedektifi yapılandırma seçenekleri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateCreativeMultimodal).mockResolvedValue(aiResponse);
  });

  it('offline üretimde seçilen soru sayısı ve görünüm ayarlarını korur', async () => {
    const [worksheet] = await generateOfflineMapInstruction({
      worksheetCount: 1,
      itemCount: 3,
      difficulty: 'Orta',
      mapType: 'turkey',
      emphasizedRegion: 'Ege',
      showCityNames: false,
      showRegionLabels: false,
      markerStyle: 'target',
      includeCompass: false,
      useGridSystem: true,
      mapColorMode: 'siyahbeyaz',
      ageGroup: '11-13',
      profile: 'adhd',
      mapInstructionTypes: ['linguistic_geo'],
      customInput: 'data:image/png;base64,custom-map',
    });

    expect(worksheet.instructions).toHaveLength(3);
    expect(worksheet.imageBase64).toBe('data:image/png;base64,custom-map');
    expect(worksheet.settings).toMatchObject({
      showCityNames: false,
      showRegionLabels: false,
      markerStyle: 'target',
      includeCompass: false,
      useGridSystem: true,
      mapColorMode: 'siyahbeyaz',
    });
    expect(worksheet.cities.every((city) => city.region === 'Ege')).toBe(true);
  });

  it('AI üretiminde seçili soru türlerini prompta ve görünüm ayarlarını çıktıya taşır', async () => {
    const [worksheet] = await generateMapInstructionFromAI({
      worksheetCount: 1,
      itemCount: 3,
      difficulty: 'Orta',
      mapType: 'turkey',
      emphasizedRegion: 'Ege',
      showCityNames: false,
      showRegionLabels: false,
      markerStyle: 'target',
      includeCompass: false,
      useGridSystem: true,
      mapColorMode: 'siyahbeyaz',
      ageGroup: '11-13',
      profile: 'adhd',
      mapInstructionTypes: ['linguistic_geo'],
      customInput: 'data:image/png;base64,custom-map',
    });

    const [{ prompt }] = vi.mocked(generateCreativeMultimodal).mock.calls[0] ?? [];
    expect(prompt).toContain('3 adet yönerge');
    expect(worksheet.instructions).toHaveLength(3);
    expect(worksheet.emphasizedRegion).toBe('Ege');
    expect(prompt).toContain('Seçili Soru Tipleri: Dilsel Coğrafya (linguistic_geo)');
    expect(worksheet.settings).toMatchObject({
      showCityNames: false,
      showRegionLabels: false,
      markerStyle: 'target',
      includeCompass: false,
      useGridSystem: true,
      mapColorMode: 'siyahbeyaz',
    });
  });

  it('bölge adlarını büyük ve görünür tutup gereksiz deniz etiketlerini göstermez', () => {
    const markup = renderToStaticMarkup(<TurkeyMapSVG />);

    expect(markup).toContain('font-size="18"');
    expect(markup).toContain('MARMARA');
    expect(markup).not.toContain('EGE DENİZİ');
    expect(markup).not.toContain('font-size="8"');
  });

  it('siyah-beyaz ve pastel renk modlarını harita dolgularına uygular', () => {
    const monochromeMarkup = renderToStaticMarkup(<TurkeyMapSVG mapColorMode="siyahbeyaz" />);
    const pastelMarkup = renderToStaticMarkup(<TurkeyMapSVG mapColorMode="pastel" />);

    expect(monochromeMarkup).toContain('fill="#ffffff"');
    expect(monochromeMarkup).toContain('fill="#0f172a"');
    expect(pastelMarkup).toContain('fill="#ede9fe"');
  });
});
