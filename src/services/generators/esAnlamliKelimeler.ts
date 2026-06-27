import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';

export const generateEsAnlamliKelimelerFromAI = async (
  options: GeneratorOptions
): Promise<any> => {
  const opts = options as unknown as Record<string, unknown>;
  const topic = (opts.topic as string) || 'Genel Türkçe';
  const difficulty = options.difficulty || 'Orta';

  const prompt = `
İsim: Dil Bilgisi Profesörü & Bulmaca Tasarımcısı
Görev: "${topic}" temalı, disleksi dostu bir "Eş Anlamlı Kelimeler: Bağlama" etkinliği üret.

KURAL 1: Veri Yapısı (JSON)
{
  "id": "eak_ai_v2",
  "activityType": "ES_ANLAMLI_KELIMELER",
  "title": "${topic} - Anlam Yolculuğu",
  "instruction": "Kelimeleri anlamdaşları ile eşleştir ve cümleleri uygun kelimelerle tamamla.",
  "pedagogicalNote": "Semantik bağlama ve akıcılık odaklıdır.",
  "content": {
    "pairs": [
      { "word": "Kavram1", "synonym": "Anlamdaş1" }
    ],
    "leftColumn": ["Kavram1", "Kavram2", "Kavram3"],
    "rightColumn": ["Anlamdaş2", "Anlamdaş1", "Anlamdaş3"],
    "fillInTheBlanks": [
       { "sentence": "Cümle yapısı (boşluklu)", "answer": "eş anlamlısı" }
    ],
    "insight": {
       "title": "Kısa Bilgi",
       "text": "Kelime kökeni veya ilginç bir kullanım notu."
    }
  }
}

KURAL 2: Zorluk Seviyesi (${difficulty})
- Kelimeler birbirine çok benzememeli (zıt anlamlılar ile karıştırma riski minimizasyonu).
- ${difficulty === 'Zor' ? 'Akademik ve edebi kelimeler seç.' : 'Basit ve günlük kelimeler seç.'}

ZORUNLU: Sadece JSON döndür.
  `;

  const parsedData = await generateCreativeMultimodal({
    prompt: prompt,
    temperature: 0.4,
  });

  return parsedData;
};
