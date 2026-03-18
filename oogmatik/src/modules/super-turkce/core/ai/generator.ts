import { ActivitySettings, GradeLevel, Objective } from '../types';

export interface GenerationContext {
    grade: GradeLevel;
    objective: Objective;
    settings: ActivitySettings;
}

/**
 * Hızlı Mod (Algoritmik)
 * Önceden tanımlanmış veri havuzlarından anlık JSON üretir. API maliyeti yoktur, <1 saniye sürer.
 * Klasik eşleştirme, basit dil bilgisi etkinliklerinde kullanılır.
 */
export async function generateByFastEngine(context: GenerationContext): Promise<any> {
    console.log('⚡ Fast Engine running with context:', context);

    // Burada hedef kazanımla eşleşen lokal JSON kütüphanelerinden (verbs, nouns, antonyms vb.)
    // rastgele veri çekilerek etkinlik taslağı oluşturulur.
    // Bu şablonu şimdilik mock olarak oluşturuyorum.

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                engineType: 'fast',
                title: `${context.objective.id} Çalışma Kağıdı`,
                content: `Bu etkinlik Hızlı Mod (Algoritmik şablonlar) kullanılarak oluşturulmuştur. Zorluk: ${context.settings.difficulty}`
            });
        }, 300); // Çok hızlı yanıt simülasyonu
    });
}

/**
 * AI Mod (Üretken Zeka)
 * Gemini veya Claude gibi GenAI modellerine prompt göndererek öğrenci ilgi alanına, disleksi ayarına ve
 * satır sayısına birebir uyan özgün A4 fasikülü içeriği yazar.
 */
export async function generateByAIEngine(context: GenerationContext): Promise<any> {
    console.log('✨ AI Engine running with context:', context);

    // Burada mevcut geminiClient üzerinden JSON structure formatında çağrı atılır.
    /*
      Örnek Prompt: 
      "Sen bir MEB Türkçe öğretmenisin. {grade}. sınıf için {objective.title} hedefli bir metin yaz.
      Öğrenci {settings.audience} özellikli, konu {settings.interestArea} olmalı. 
      Lütfen şu harfleri kullanmamaya özen göster: {settings.avoidLetters}. Maksimum {settings.wordLimit} kelime."
    */

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                engineType: 'ai',
                title: `(AI) ${context.settings.interestArea || 'Özel Konu'} Etkinliği`,
                content: `Bu etkinlik Gemini AI kullanılarak tamamen özgün şekilde üretilmiştir. Konu odağı: ${context.settings.interestArea || 'Belirtilmedi'}`
            });
        }, 1500); // Daha uzun süren API çağrısı simülasyonu
    });
}

// Global Jeneratör Fabrikası
export async function generateActivityData(engineMode: 'fast' | 'ai', context: GenerationContext) {
    if (engineMode === 'fast') {
        return generateByFastEngine(context);
    } else {
        return generateByAIEngine(context);
    }
}
