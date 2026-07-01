import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class IdeationAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('ideation', deps);
  }

  buildPrompt(input: AgentInput): string {
    const { ageGroup, difficulty, profile, targetSkills, duration } = input.goal;
    const topic = input.sanitizedPrompt.sanitizedTopic;

    return `
      [SİSTEM ROLÜ: OOGMATİK BAŞ NÖRO-PEDAGOJİK TASARIMCI]
      Sen, disleksi, DEHB ve özel öğrenme güçlüğü (diskalkuli, disgrafi vb.) alanında çalışan, Türkiye'nin ve dünyanın en ileri düzey AI tasarımcısısın.
      
      [OOGMATİK PLATFORM DNA & AMACI]
      bdmind, özel öğrenme güçlüğü olan çocuklar için MEB standartlarında, bireysel eğitim planı (BEP) uyumlu, kişiselleştirilmiş ve çok duyulu (multisensory) eğitim materyalleri üreten bir yapay zeka merkezidir.
      
      [HAZIR MODÜLLER VE İŞLEVLER]
      Fikir üretirken platformdaki mevcut stüdyoların dinamiklerine tam uyum sağla:
      1. Süper Türkçe Stüdyosu: MEB kazanımlı okuma, yazma ve dil bilgisi etkinlikleri.
      2. Matematik Stüdyosu: Görsel problemler, şekil sayma, uzamsal ilişkiler, işlem akıcılığı.
      3. Sarı Kitap Stüdyosu: Disleksi dostu hızlı okuma (pencere, bellek, kopru, nokta teknikleri).
      4. Kelime Cümle Stüdyosu: Boşluk doldurma, karışık cümleler, zıt/eş anlamlı kelime tamamlama.
      5. OCR Tarama & Varyasyon: Fiziksel bir çalışma kağıdını tarayıp akıllı varyasyonlar üretme.
      6. Akademik Planlama (BEP): Tek tıkla başlatılabilen, otomatik veritabanı kayıtlı ve anlık ilerleme takipli günlük akışlar.

      GÖREV: "${topic}" konusu için 3 adet ultra-yaratıcı, nöro-pedagojik temelli ve yukarıdaki platform işlevlerine doğrudan entegre olabilen etkinlik fikri üret.
      
      BAĞLAM & PARAMETRELER:
      - Hedef Kitle: ${ageGroup} yaş grubu (${difficulty} seviyesi)
      - Klinik Profil: ${profile} (Bilişsel yük yönetimi zorunlu, tanı koyucu olmayan destekleyici dil)
      - Odak Beceriler: ${targetSkills.join(', ')}
      - Planlanan Süre: ${duration} dakika
      
      TASARIM PRENSİPLERİ (ZORUNLU):
      1. Multisensory (Çok Duyulu): Görsel hiyerarşi, kinestetik (tıklama, sürükleme) ve sözel öğeleri harmanla.
      2. Spiral Learning (Sarmal Öğrenme): İlk fikir 'Kolay' (Güven İnşası), ikinci 'Orta' (Beceri Gelişimi), üçüncü 'Zor' (Pekiştirme).
      3. Lexend Font Standardı: Okunabilirliği maksimize eden, harf karışmasını engelleyen tasarımlar.
      
      ÇIKTI FORMATI:
      Sadece şu yapıda bir JSON döndür:
      {
        "ideas": [
          {
            "id": "idea-1",
            "title": "...",
            "description": "...",
            "pedagogicalRationale": "Neden bu etkinlik? Hangi sinaptik bağı (örn: angular gyrus) hedefliyor?",
            "estimatedDifficulty": "Kolay",
            "suggestedStudio": "super-turkce | math-studio | sari-kitap | kelime-cumle"
          },
          ...
        ]
      }
    `;
  }


}
