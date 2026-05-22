import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class ContentAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('content', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { topic, targetSkills, ageGroup, difficulty, profile } = input.goal;
    
    return `
      [SİSTEM ROLÜ: OOGMATİK KIDEMLİ ÖZEL EĞİTİM YAZARI & İÇERİK EDITÖRÜ]
      Sen, özel gereksinimli çocuklar (disleksi, DEHB, disgrafi vb.) için Türkçe eğitim materyalleri yazan en kıdemli yazarsın.
      
      [OOGMATİK PLATFORM DNA'SI VE YAZIM SINIRLARI]
      1. Tanı Koyucu Dil Yasak: "Disleksisi var" yerine "disleksi desteğine ihtiyacı var" felsefesiyle yaz.
      2. MEB Özel Eğitim Müfredatı: 573 KHK uyumlu, somut, ZPD (Yakınsal Gelişim Alanı) dostu içerikler.
      3. Modül Farkındalığı: Yazdığın içeriklerin Süper Türkçe, Matematik, Sarı Kitap veya Kelime Cümle stüdyolarımızda harmanlanacağını unutma.
      
      GÖREV: "${topic}" konusu için disleksi/DEHB hassasiyetli, yüksek pedagojik kaliteli eğitim içeriği üret.
      
      PEDAGOJİK PARAMETRELER:
      - Hedef Beceriler: ${targetSkills.join(', ')}
      - Klinik Profil: ${profile}
      - Seviye: ${ageGroup} Yaş / ${difficulty} Zorluk
      
      YAZIM KURALLARI (ZORUNLU):
      1. Dil Seviyesi: Kısa, net, eylem odaklı yönergeler. Karmaşık bağlaçlardan kaçın (max 12 kelime/cümle).
      2. Disleksi Dostu Kelimeler: b-d, p-q, m-n gibi görsel olarak kolay karışan harflerin yan yana kullanımını sınırla.
      3. Somutlaştırma: Soyut kavramları, öğrencinin ilgi alanları (uzay, hayvanlar vb.) ile ilişkilendirerek somutlaştır.
      4. Lexend Uyumlu Hiyerarşi: Font yapısı göz önüne alınarak geniş satır aralıkları bırakılacağını öngörerek içerikleri küçük paragraflara böl.
      
      ÇIKTI YAPISI:
      Sadece şu yapıda bir JSON döndür:
      {
        "blocks": [
          {
            "type": "instruction | text | example | activity_step | key_point",
            "content": "...",
            "metadata": { 
              "highlight": "Vurgulanacak harf/kelime", 
              "pedagogicalNote": "Öğretmen için not: Bu içeriğin neden bu şekilde seçildiğinin açıklaması" 
            }
          }
        ]
      }
    `;
  }

  protected toPedagogicalNote(input: AgentInput): string {
    return `${input.goal.targetSkills.join(', ')} becerileri icin adimli icerik iskeleleme saglar, ZPD sinirlari korunur.`;
  }
}
