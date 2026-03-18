
import { generateCreativeMultimodal, generateWithSchema, MultimodalFile } from '../geminiClient.js';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts.js';

/**
 * analyzeReferenceFiles: GÖRSELİN MİMARİ DNA'SINI ÇIKARIR (Thinking Mode)
 */
export const analyzeReferenceFiles = async (files: MultimodalFile[], currentPrompt: string): Promise<string> => {
  const prompt = `
    [GÖREV: NEURO-ARCHITECTURAL REVERSE ENGINEERING]
    Bu görseli bir AI Mühendisi ve Özel Eğitim Uzmanı olarak "Thinking" modunda analiz et. 
    Görselin "MİMARİ DNA"sını çıkarman gerekiyor.
    
    ANALİZ ADIMLARI:
    1. TABLO YAPISI: Görseldeki her bir tabloyu 'grid' veya 'table' bloğu olarak tanımla.
    2. SORU MANTIĞI: Sorular nasıl kurgulanmış? (Örn: 'B' harfini 'D' harfinden ayırt etme).
    3. HATA ANALİZİ: Bu etkinlikteki çeldirici stratejisi nedir? (Ayna etkisi mi, ardışıklık mı?)
    
    [ÇIKTI FORMATI: BLUEPRINT_V1.0]
    Yeni bir Gemini isteği için MASTER PROMPT oluştur. Bu prompt, 'layoutArchitecture' yapısını mükemmel şekilde tarif etmeli.
    `;

  const schema = {
    type: 'OBJECT',
    properties: {
      analysis: { type: 'STRING' },
      blueprintPrompt: { type: 'STRING' }
    },
    required: ['analysis', 'blueprintPrompt']
  };

  // Fix: Removed 'useFlash' property from the generateCreativeMultimodal call as it is not part of the defined type
  const result = await generateCreativeMultimodal({ prompt, schema, files });
  return `[BLUEPRINT_V1.0]\n${result.blueprintPrompt}\n\n[ANALİZ]: ${result.analysis}`;
};

export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
  // Profil bazlı ek prompt bölümü
  const profileSection = options.targetProfile ? `
    [KLİNİK PROFİL — ÖÖG HEDEFLEME]
    Güçlük Profili: ${options.targetProfile.disability === 'dyslexia' ? 'DİSLEKSİ' : options.targetProfile.disability === 'dyscalculia' ? 'DİSKALKULİ' : options.targetProfile.disability === 'adhd' ? 'DEHB' : 'KARMA'}
    Yaş Grubu: ${options.targetProfile.ageGroup}
    Hedef Beceriler: ${(options.targetProfile.targetSkills || []).join(', ')}
    Çeldirici Matrisi: ${(options.targetProfile.distractorTypes || []).join(', ')}
    
    ${options.targetProfile.disability === 'dyslexia' ? `
    [DİSLEKSİ ÖZEL KONFİGÜRASYON]:
    - Harf çeldirici matrisi: b↔d, p↔q, m↔n, u↔n, 6↔9
    - Fonolojik farkındalık vurgusu: hece ayırma, ses birimi analizi
    - Tipografi: Lexend veya OpenDyslexic font ailesi, min 14pt
    - Satır aralığı: 1.8x, harf aralığı: 0.05em artırılmış
    ` : ''}
    ${options.targetProfile.disability === 'dyscalculia' ? `
    [DİSKALKULİ ÖZEL KONFİGÜRASYON]:
    - Sayı hissi vurgusu: basamak değeri, miktar karşılaştırma
    - Görsel destek: her matematik işlemi için manipülatif görseller
    - Sembol-anlam eşleştirme: +, -, ×, ÷ sembollerinin somut açıklamaları
    ` : ''}
    ${options.targetProfile.disability === 'adhd' ? `
    [DEHB ÖZEL KONFİGÜRASYON]:
    - Kısa görev blokları: her görev max 3-5 adım
    - Görsel çapa noktaları: her bölüm başına dikkat çekici ikon
    - Ödül sistemi: yıldız, puan veya ilerleme çubuğu
    - Zamanlama ipuçları: tahmini süre göstergeleri
    ` : ''}
    ` : '';

  const formatSection = options.outputFormat && options.outputFormat !== 'bento_grid' ? `
    [ÇIKTI FORMAT TALİMATI: ${options.outputFormat.toUpperCase()}]
    ${options.outputFormat === 'classic_page' ? 'Geleneksel dikey akışlı çalışma kağıdı. Grid yerine dikey bloklar kullan.' : ''}
    ${options.outputFormat === 'lined_notebook' ? 'Çizgili defter formatı. Her satırda yazma alanı bırak. Harf pratiğine uygun.' : ''}
    ${options.outputFormat === 'flashcard' ? 'Kesip kullanılabilir kart formatı. Her kart bağımsız, çerçeveli ve eşit boyutlu.' : ''}
    ${options.outputFormat === 'quiz_card' ? 'Soru-cevap formatı. Ön yüz soru, arka yüz cevap mantığında.' : ''}
    ` : '';

  const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    ${profileSection}
    ${formatSection}
    
    [ULTRA-CREATIVE MISSION: PEDAGOGICAL ASSESSMENT GENERATION]
    GÖREV: Aşağıdaki BLUEPRINT'i kullanarak, klinik derinliği maksimize edilmiş, BENTO-GRID düzeninde profesyonel bir DEĞERLENDİRME MATERYALİ üret.
    
    [KRİTİK İÇERİK KURALLARI - ASLA İHLAL ETME]:
    1. ASLA "Seçenek A", "İkinci Seçenek", "Örnek Soru", "Placeholder" gibi ifadeler kullanma.
    2. TÜM İÇERİK GERÇEK OLMALIDIR: Seçilen konu (Örn: Yazım Kuralları) neyse, o konuda öğrencinin bilgisini ölçecek gerçek sorular, gerçek cümleler ve gerçek kelimeler üret.
    3. ÇELDİRİCİ MANTIĞI: Yanlış seçenekler rastgele olmamalıdır. Hedeflenen yaş grubunun ve klinik profilin yapabileceği "mantıklı hataları" (Örn: de/da yazımı, benzer sesli harf karışıklıkları b-d-p) içermelidir.
    4. EĞİTSEL TUTARLILIK: Üretilen her blok, bir kazanımı ölçmelidir. Bir çalışma kağıdı değil, profesyonel bir "Klinik Değerlendirme Testi" ciddiyetinde içerik üret.
    
    [GİRDİ BLUEPRINT]:
    ${enrichedPrompt}
    
    [ÜRETİM STANDARTLARI]:
    1. İÇERİK YOĞUNLUĞU: Sayfayı sığ bırakma. Her blok, en az ${options.itemCount} adet alt öğe içermelidir. Grid blokları tam dolmalı, tablolar zengin veri barındırmalıdır.
    2. KLİNİK YOĞUNLUK (%${options.clinicalIntensity}): Çeldirmelerin karmaşıklık düzeyini bu orana göre ayarla. Fonolojik ve görsel diskriminasyon hatalarını maksimize et.
    3. BİLİŞSEL YÜK (%${options.visualLoad}): Sayfa düzenindeki görsel kalabalığı ve uyaran yoğunluğunu bu orana göre kurgula. Bento-grid bloklarını sayfa içine dengeli ama sıkıştırılmış şekilde yay.
    
    [PARAMETRELER]:
    - Zorluk Seviyesi: ${options.difficulty}
    - Blok Başı Minimum Veri: ${options.itemCount}
    
    [TEKNİK BLOK REHBERİ VE ÖRNEK JSON İÇERİKLERİ YAKLAŞIMI]:
    Aşağıda her bir blok tipi için 'content' objesinin tam olarak nasıl dolması gerektiğine dair katı bir referans şablon mevcuttur. Çıktılarını buna göre şekillendir!

    - 'cloze_test': Metin yoğun olmalı, en az 100 kelime ve içinde en az 10 adet [hedef] boşluk bulunmalı.
      ÖRNEK CONTENT: {"text": "Ali bugün [okul] bahçesinde oynarken [kırmızı] topunu kaybetti...", "blanks": ["okul", "kırmızı"]}

    - 'categorical_sorting': En az 3-4 kategori ve her kategoride en az 5-6 öğe bulunmalı.
      ÖRNEK CONTENT: {"categories": ["Meyveler", "Sebzeler"], "items": [{"label": "Elma", "category": "Meyveler"}, {"label": "Pırasa", "category": "Sebzeler"}]}

    - 'match_columns': En az 8-10 adet karşılıklı eşleşen öğe (text) içermeli.
      ÖRNEK CONTENT: {"leftColumn": [{"id": "1", "text": "Kedi"}], "rightColumn": [{"id": "a", "text": "Miyav", "matchId": "1"}]}

    - 'visual_clue_card': Profesyonel nöro-pedagojik tavsiyeler içermeli.
      ÖRNEK CONTENT: {"icon": "fa-brain", "title": "İpucu", "description": "Harfleri okurken parmağınızla takip edin."}

    - 'neuro_marker': 'neuroType' ('tracking' | 'focus' | 'saccadic') ve 'position' içermeli.
      ÖRNEK CONTENT: {"neuroType": "saccadic", "position": "top-right", "label": "Göz Sıçrama Noktası"}

    - 'grid': Harf veya rakam matrisleri için. Tam doluluk şart.
      ÖRNEK CONTENT: {"rows": 3, "cols": 3, "cells": [{"row":0, "col":0, "value":"A"}, {"row":0, "col":1, "value":"B"}]}
      
    - 'table': Veri tabloları için.
      ÖRNEK CONTENT: {"headers": ["Kelime", "Hecesi"], "rows": [["Kalem", "Ka-lem"]]}

    - 'text': Basit yönergeler veya metinler için.
      ÖRNEK CONTENT: {"text": "Aşağıdaki kelimeleri okuyun.", "style": "bold"}
      
    DİKKAT: content objesini asla boş bırakma. Seçtiğin 'type' değerine uygun örnek içeriği çoğaltıp detaylandırarak üret.
    `;

  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      instruction: { type: 'STRING' },
      pedagogicalNote: { type: 'STRING' },
      layoutArchitecture: {
        type: 'OBJECT',
        properties: {
          cols: { type: 'INTEGER' },
          blocks: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                type: {
                  type: 'STRING',
                  enum: [
                    'header', 'text', 'grid', 'table', 'logic_card',
                    'footer_validation', 'image', 'cloze_test',
                    'categorical_sorting', 'match_columns',
                    'visual_clue_card', 'neuro_marker'
                  ]
                },
                content: { type: 'OBJECT' },
                weight: { type: 'INTEGER' }
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
    temperature: 0.7,
    thinkingBudget: 4000
  });
};

/**
 * refinePromptWithAI: Prompt mühendisliği asistanı.
 */
export const refinePromptWithAI = async (currentPrompt: string, mode: 'expand' | 'clinical'): Promise<string> => {
  const prompt = `
    GÖREV: Bu kullanıcı komutunu Gemini 3 Pro "Thinking" motoru için teknik bir blueprint üretim talimatına dönüştür.
    İSTEM: "${currentPrompt}"
    MOD: ${mode}
    `;
  const result = await generateWithSchema(prompt, { type: 'OBJECT', properties: { refined: { type: 'STRING' } }, required: ['refined'] });
  return result.refined;
};
