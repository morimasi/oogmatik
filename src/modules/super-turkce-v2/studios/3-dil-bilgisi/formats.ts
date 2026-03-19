import { TemplateDef } from '../../core/types';

export const grammarFormats: TemplateDef[] = [
    {
        id: 'GRAM_01_SENTENCE_TREE',
        studioId: 'dil-bilgisi',
        label: 'Cümle Ögeleri Ağacı',
        description: 'Cümleyi yüklemden başlayarak dallarına ayırma.',
        icon: 'fa-tree',
        difficulty: 'zor',
        settings: [
            { key: 'ogeSayisi', label: 'Maks. Öge Sayısı', type: 'range', defaultValue: 5, min: 3, max: 7 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                sentence: { type: "STRING" },
                elements: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            wordSegment: { type: "STRING" },
                            type: { type: "STRING", description: "Özne, Yüklem, Nesne vb." },
                            questionAsked: { type: "STRING", description: "Yükleme sorulan soru (Ne, Kim, Neyi vb)" }
                        },
                        required: ["wordSegment", "type", "questionAsked"]
                    }
                }
            },
            required: ["sentence", "elements"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusunda, karmaşık tamlamalar (isim/sıfat) içeren kurallı bir cümle oluştur (Sınıf: ${grade}).
      Bu cümleyi cümlenin ögelerine (Özne, Yüklem, Nesne, Zarf/Yer Tamlayıcısı) ayır. 
      elements dizisinde her ögenin kelime grubunu (wordSegment), öge adını (type) ve o ögeyi bulmak için Yükleme sorulan 'Soru'yu (questionAsked) ver.
      Toplam öge sayısı en fazla ${s.ogeSayisi} olsun.
    `,
        fastGenerate: () => ({
            sentence: "Küçük çocuk, sabah erkenden dedesinin tarlasındaki olgun elmaları büyük bir sevinçle topladı.",
            elements: [
                { wordSegment: "topladı", type: "Yüklem", questionAsked: "-" },
                { wordSegment: "Küçük çocuk", type: "Özne", questionAsked: "Toplayan Kim?" },
                { wordSegment: "sabah erkenden", type: "Zarf Tamlayıcısı", questionAsked: "Ne zaman?" },
                { wordSegment: "dedesinin tarlasındaki olgun elmaları", type: "Belirtili Nesne", questionAsked: "Neyi?" },
                { wordSegment: "büyük bir sevinçle", type: "Zarf Tamlayıcısı", questionAsked: "Nasıl?" }
            ]
        })
    },
    {
        id: 'GRAM_02_TIME_WHEEL',
        studioId: 'dil-bilgisi',
        label: 'Zamanlar Çarkı (Fiiller)',
        description: 'Aynı olayı 4 farklı zaman kipiyle yeniden yazma.',
        icon: 'fa-clock-rotate-left',
        difficulty: 'orta',
        settings: [
            { key: 'sahisEki', label: 'Şahıs', type: 'select', defaultValue: '1. Tekil (Ben)', options: ['1. Tekil (Ben)', '3. Çoğul (Onlar)', 'Karma'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                rootVerb: { type: "STRING", description: "Mastarsız fiil kök/gövdesi" },
                context: { type: "STRING", description: "Fiilin kullanılacağı durum" },
                tenses: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            tenseName: { type: "STRING", description: "Örn: Şimdiki Zaman" },
                            conjugated: { type: "STRING", description: "Örn: okuyorum" },
                            sentence: { type: "STRING" }
                        },
                        required: ["tenseName", "conjugated", "sentence"]
                    }
                }
            },
            required: ["rootVerb", "context", "tenses"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temalı bir makmek mastarına uygun fiil (rootVerb) ve kısa bağlam (context) belirle.
      Bu fiili ${s.sahisEki} şahsında şu 4 kipe göre çekimle (tenses): Geçmiş Zaman (Di'li), Şimdiki Zaman, Gelecek Zaman, Geniş Zaman.
      Her çekim için kısa bir cümle (sentence) kur (Seviye: ${grade}.sınıf).
    `,
        fastGenerate: () => ({
            rootVerb: "Gözlemle",
            context: "Gökyüzündeki yıldız hareketleri",
            tenses: [
                { tenseName: "Görülen Geçmiş Zaman", conjugated: "gözlemledim", sentence: "Dün gece teleskopla Ay'ı gözlemledim." },
                { tenseName: "Şimdiki Zaman", conjugated: "gözlemliyorum", sentence: "Şu an teleskopla Ay'ı gözlemliyorum." },
                { tenseName: "Gelecek Zaman", conjugated: "gözlemleyeceğim", sentence: "Yarın gece teleskopla Ay'ı gözlemleyeceğim." },
                { tenseName: "Geniş Zaman", conjugated: "gözlemlerim", sentence: "Ben her gece teleskopla Ay'ı gözlemlerim." }
            ]
        })
    },
    // Kalan 8 grammar formatı, sistem gereksinimlerine göre eklenebilir. Basitlik açısından temel olanları tanımlıyorum.
    {
        id: 'GRAM_03_ADJECTIVE_HUNT',
        studioId: 'dil-bilgisi',
        label: 'Sıfat (Önad) Avcısı',
        description: 'Metindeki isme sorulan Nasıl/Hangi sorularının cevabını bul.',
        icon: 'fa-tag',
        difficulty: 'kolay',
        settings: [
            { key: 'hedefSifat', label: 'Bulunacak Sıfat S.', type: 'range', defaultValue: 5, min: 3, max: 8 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                text: { type: "STRING" },
                adjectives: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            noun: { type: "STRING", description: "Nitelenen isim" },
                            adjective: { type: "STRING", description: "Sıfat kelimesi" },
                            type: { type: "STRING", description: "Niteleme veya Belirtme" }
                        },
                        required: ["noun", "adjective", "type"]
                    }
                }
            },
            required: ["text", "adjectives"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      ${grade}. sınıflar için, "${topic}" hakkında betimleyici bir metin yaz.
      Metin içine bilerek çok sayıda Sıfat Tamlaması yerleştir.
      Bunların içinden tam ${s.hedefSifat} tanesini adjectives dizisinde (isim, sıfat ve sıfat çeşidi) belirterek çıkar.
    `,
        fastGenerate: () => ({
            text: "Kırmızı çatılı eski evlerin arasından geçen dar sokağın sonunda, sevimli bir köpek yatıyordu. O köpek, üç gündür orada bekliyordu.",
            adjectives: [
                { noun: "evlerin", adjective: "eski", type: "Niteleme" },
                { noun: "köpek", adjective: "sevimli", type: "Niteleme" },
                { noun: "gündür", adjective: "üç", type: "Belirtme (Asıl Sayı)" },
                { noun: "köpek", adjective: "o", type: "Belirtme (İşaret)" }
            ]
        })
    }
];
