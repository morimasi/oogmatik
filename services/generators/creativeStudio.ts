
import { Type } from "@google/genai";
import { generateCreativeMultimodal, generateWithSchema, MultimodalFile } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

// ============================================================
// PHASE 1: NEURO-ENGINE v2.0 — Style & Vibe DNA + Recursive Fill
// ============================================================

/**
 * analyzeReferenceFiles: GÖRSELİN MİMARİ + STİL DNA'SINI ÇIKARIR (Thinking Mode v2)
 * - Tablo/grid yapısı (Mimari DNA)
 * - Renk paleti, font boyutu, boşluk yoğunluğu (Style & Vibe DNA)
 * - Klinik çeldirici stratejisi
 */
export const analyzeReferenceFiles = async (files: MultimodalFile[], currentPrompt: string): Promise<string> => {
  const prompt = `
    [GÖREV: NEURO-ARCHITECTURAL + STYLE & VIBE REVERSE ENGINEERING — v2.0]
    Bu görseli aynı anda iki uzman rolüyle analiz et:
    (A) Özel Eğitim Mimarı: Pedagojik yapıyı, soru mantığını ve klinik çeldirici stratejilerini çöz.
    (B) Grafik Tasarımcı / UX Analisti: Görsel düzeni, renk paletini, yazı tipi boyutlarını ve boşluk yoğunluğunu tespit et.

    ANALİZ ADIMLARI:
    1. MİMARİ DNA:
       - Görseldeki her bir tabloyu 'grid' veya 'table' bloğu olarak tanımla (satır x sütun).
       - Soru tiplerini belirle (Örn: ayna harfler, ses ayrıştırma, kelime tamamlama).
       - Çeldirici strateji: Ayna etkisi mi? Fonetik benzerlik mi? Ardışıklık mı?
    2. STİL & VİBE DNA:
       - Baskın renk paleti: en fazla 3 renk hex kodu.
       - Tahmini font büyüklükleri: başlık / soru / seçenek için ayrı ayrı.
       - Boşluk yoğunluğu: Sıkışık / Dengeli / Geniş (birini seç).
       - Genel estetik ton: Oyunsu / Klinik / Minimalist (birini seç).
    3. BLUEPRINT OLUŞTUR:
       Yeni bir üretim isteği için eksiksiz Master Prompt oluştur. 'layoutArchitecture' yapısını,
       tespit ettiğin mimari ve stil verilerini kullanarak detaylıca tarif et.
       Üretilecek içerik: "${currentPrompt || 'Genel pedagojik çalışma sayfası'}"
    `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      architectureDNA: { type: Type.STRING },
      styleVibeDNA: {
        type: Type.OBJECT,
        properties: {
          dominantColors: { type: Type.ARRAY, items: { type: Type.STRING } },
          spacingDensity: { type: Type.STRING },
          aestheticTone: { type: Type.STRING },
        },
        required: ['dominantColors', 'spacingDensity', 'aestheticTone']
      },
      blueprintPrompt: { type: Type.STRING }
    },
    required: ['architectureDNA', 'styleVibeDNA', 'blueprintPrompt']
  };

  const result = await generateCreativeMultimodal({ prompt, schema, files, thinkingBudget: 3000 });
  const styleNote = `[STİL DNA] Ton: ${result.styleVibeDNA.aestheticTone} | Boşluk: ${result.styleVibeDNA.spacingDensity} | Renkler: ${result.styleVibeDNA.dominantColors.join(', ')}`;
  return `[BLUEPRINT_V2.0]\n${result.blueprintPrompt}\n\n[MİMARİ ANALİZ]: ${result.architectureDNA}\n\n${styleNote}`;
};

/**
 * generateCreativeStudioActivity: Multi-stage üretim motoru.
 * - RECURSIVE FILL direktifi: Hiçbir blok boş bırakılamaz.
 * - Dinamik thinkingBudget: options.thinkingBudget'e göre.
 */
export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
  const thinkingBudget = Math.min(Math.max(options.thinkingBudget ?? 4000, 1000), 16000);

  const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}

    [ULTRA-CREATIVE MISSION: NEURO-ARCHITECTURAL GENERATION v2.0]
    GÖREV: Aşağıdaki BLUEPRINT'i kullanarak, klinik derinliği maksimize edilmiş,
    BENTO-GRID düzeninde eksiksiz ve profesyonel bir çalışma sayfası üret.

    [GİRDİ BLUEPRINT]:
    ${enrichedPrompt}

    ══════════════════════════════════════════
    [ÜRETİM STANDARTLARI — ZORUNLU]
    ══════════════════════════════════════════
    1. İÇERİK YOĞUNLUĞU: Her blok minimum ${options.itemCount} alt öğe içermeli. Grid tam dolmalı.
    2. KLİNİK YOĞUNLUK (%${options.clinicalIntensity}): Yüksekse ayna harfler, fonetik tuzaklar ve çeldirici seçenekler ekle.
    3. BİLİŞSEL YÜK (%${options.visualLoad}): Görsel uyaran yoğunluğunu buna göre kalibre et.
    4. ZORLUK: ${options.difficulty}

    ══════════════════════════════════════════
    [🔴 RECURSIVE FILL PROTOKOLÜ — MUTLAK KURAL]
    ══════════════════════════════════════════
    Hiçbir blokun 'content' alanı boş veya eksik OLAMAZ.
    Üretim sonunda kendi çıktını gözden geçir:
    - Boş kalan 'content' var mı? → Doldur.
    - 'items', 'cells', 'rows', 'leftColumn', 'rightColumn' listesi boş mu? → Veri ekle.
    - 'text' alanı boş mu? → Anlamlı içerik yaz.
    Bu adımı ZORUNLU olarak uygula ve sıfır boş alan bırak.

    ══════════════════════════════════════════
    [TEKNİK BLOK REHBERİ]
    ══════════════════════════════════════════
    - 'cloze_test': Min 100 kelime, min 10 [hedef] boşluk.
      İÇERİK: {"text": "Ali bugün [okul] bahçesinde...", "blanks": ["okul"]}

    - 'categorical_sorting': Min 3 kategori, her kategoride min 5 öğe.
      İÇERİK: {"categories": ["Meyveler","Sebzeler"], "items": [{"label":"Elma","category":"Meyveler"}]}

    - 'match_columns': Min 8 karşılıklı çift.
      İÇERİK: {"leftColumn":[{"id":"1","text":"Kedi"}], "rightColumn":[{"id":"a","text":"Miyav","matchId":"1"}]}

    - 'visual_clue_card': Nöro-pedagojik ipucu.
      İÇERİK: {"icon":"fa-brain","title":"İpucu","description":"Parmağınla takip et."}

    - 'neuro_marker': {"neuroType":"saccadic","position":"top-right","label":"Göz Noktası"}

    - 'grid': Tam dolu hücre matrisi.
      İÇERİK: {"rows":4,"cols":4,"cells":[{"row":0,"col":0,"value":"A"}]}

    - 'table': {"headers":["Kelime","Hecesi"],"rows":[["Kalem","Ka-lem"]]}

    - 'text': {"text":"Aşağıdaki kelimeleri okuyun.","style":"bold"}

    Son üretimde tüm bloklar dolu ve eksiksiz olmalı.
    `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      layoutArchitecture: {
        type: Type.OBJECT,
        properties: {
          cols: { type: Type.INTEGER },
          blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: [
                    'header', 'text', 'grid', 'table', 'logic_card',
                    'footer_validation', 'image', 'cloze_test',
                    'categorical_sorting', 'match_columns',
                    'visual_clue_card', 'neuro_marker'
                  ]
                },
                content: { type: Type.OBJECT },
                weight: { type: Type.INTEGER }
              },
              required: ['type', 'content']
            }
          }
        },
        required: ['blocks']
      }
    },
    required: ['title', 'instruction', 'layoutArchitecture']
  };

  return await generateCreativeMultimodal({
    prompt,
    schema,
    files,
    temperature: 0.75,
    thinkingBudget
  });
};

/**
 * refinePromptWithAI: Güçlendirilmiş prompt mühendisliği asistanı.
 * Pedagojik çıktı formatını zorunlu kılar.
 */
export const refinePromptWithAI = async (currentPrompt: string, mode: 'expand' | 'clinical'): Promise<string> => {
  const modeInstructions = mode === 'expand'
    ? `GENIŞLET: Konuyu pedagojik açıdan derinleştir. Öğrenme hedefleri, kullanılacak blok tipleri ve klinik stratejiler ekle. Bloom Taksonomisi basamaklarına göre zorluğu artır.`
    : `KLİNİK TANI EKLE: Öğrencinin olası hata paternlerini (disleksi, disgrafisi, dikkat eksikliği) tespit et. Çeldirici stratejileri (ayna harfler, fonetik tuzaklar, ardışıklık hataları) özelleştir ve prompt'a entegre et.`;

  const systemPrompt = `
    [GÖREV: ULTRA-PROMPT MÜHENDİSİ]
    Sen, Özel Eğitim AI'ı için prompt mühendisliği yapan uzman bir sistemsin.
    Kullanıcı isteğini alıp, Gemini Thinking motorunun maksimum verim çıkaracağı
    teknik bir blueprint talimatına dönüştüreceksin.

    [KULLANICI İSTEMİ]: "${currentPrompt}"
    [MOD]: ${modeInstructions}

    [ÇIKTI KURALLARI]:
    1. Çıktı mutlaka Türkçe olmalı.
    2. Üretilecek blok tiplerini açıkça belirt (grid, table, cloze_test vb.).
    3. Hedef yaş grubu, öğrenme güçlüğü türü ve pedagojik metodoloji belirt.
    4. Min 120 kelime, net ve teknik bir talimat yaz.
    `;

  const result = await generateWithSchema(systemPrompt, {
    type: Type.OBJECT,
    properties: { refined: { type: Type.STRING } },
    required: ['refined']
  });
  return result.refined;
};
