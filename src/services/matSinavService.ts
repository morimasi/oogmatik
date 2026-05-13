import type { MatSinavAyarlari, MatSinav, MatSoru, MatCevapAnahtari } from '../types/matSinav';
import { generateMathExam, regenerateSingleQuestion } from './generators/mathSinavGenerator';

const createOfflineQuestion = (id: number, sinif: number): MatSoru => {
  const sorular = [
    {
      soruMetni: "15 + 25 işleminin sonucu kaçtır?",
      tip: "coktan_secmeli" as const,
      zorluk: "Kolay" as const,
      dogruCevap: "B",
      kazanimKodu: `M.${sinif}.1.1`,
      gercek_yasam_baglantisi: "Markette 15 elma ve 25 armut alırsanız toplam 40 meyve almış olursunuz.",
      cozum_anahtari: "15 + 25 = 40",
      secenekler: { A: "30", B: "40", C: "50", D: "60" }
    },
    {
      soruMetni: "7 × 8 çarpımının sonucu kaçtır?",
      tip: "coktan_secmeli" as const,
      zorluk: "Orta" as const,
      dogruCevap: "C",
      kazanimKodu: `M.${sinif}.2.1`,
      gercek_yasam_baglantisi: "8 kişiye 7'şer çikolata verirseniz toplam 56 çikolata gerekir.",
      cozum_anahtari: "7 × 8 = 56",
      secenekler: { A: "48", B: "54", C: "56", D: "64" }
    },
    {
      soruMetni: "Bir karenin bir kenarı 5 cm'dir. Karenin alanı kaç cm²'dir?",
      tip: "coktan_secmeli" as const,
      zorluk: "Orta" as const,
      dogruCevap: "C",
      kazanimKodu: `M.${sinif}.3.1`,
      gercek_yasam_baglantisi: "5 cm kenarlı bir karenin üzerine serilecek kumaşın alanını hesaplamak için kullanılır.",
      cozum_anahtari: "Karenin alanı = kenar × kenar = 5 × 5 = 25",
      secenekler: { A: "10", B: "20", C: "25", D: "30" }
    },
    {
      soruMetni: "36 ÷ 4 bölümünün sonucu kaçtır?",
      tip: "coktan_secmeli" as const,
      zorluk: "Kolay" as const,
      dogruCevap: "C",
      kazanimKodu: `M.${sinif}.2.2`,
      gercek_yasam_baglantisi: "36 şekeri 4 arkadaşınıza eşit olarak bölerseniz her biri 9 şeker alır.",
      cozum_anahtari: "36 ÷ 4 = 9",
      secenekler: { A: "7", B: "8", C: "9", D: "10" }
    },
    {
      soruMetni: "Bir üçgenin iç açıları toplamı kaç derecedir?",
      tip: "coktan_secmeli" as const,
      zorluk: "Kolay" as const,
      dogruCevap: "C",
      kazanimKodu: `M.${sinif}.3.2`,
      gercek_yasam_baglantisi: "Mimarlıkta ve mühendislikte üçgen yapıların hesaplanmasında kullanılır.",
      cozum_anahtari: "Her üçgenin iç açıları toplamı 180°'dir.",
      secenekler: { A: "90°", B: "120°", C: "180°", D: "360°" }
    }
  ];

  const soru = sorular[id % sorular.length];
  return {
    id: `soru-${id}`,
    puan: 10,
    tahminiSure: 60,
    ...soru
  };
};

const createOfflineSinav = (settings: MatSinavAyarlari): MatSinav => {
  const sinif = settings.sinif ?? 5;
  const toplamSoru =
    settings.soruDagilimi.coktan_secmeli +
    settings.soruDagilimi.dogru_yanlis +
    settings.soruDagilimi.bosluk_doldurma +
    settings.soruDagilimi.acik_uclu;

  const sorular: MatSoru[] = [];
  for (let i = 0; i < Math.max(toplamSoru, 5); i++) {
    sorular.push(createOfflineQuestion(i, sinif));
  }

  const toplamPuan = sorular.reduce((sum, s) => sum + s.puan, 0);
  const toplamSure = sorular.reduce((sum, s) => sum + s.tahminiSure, 0);

  const cevapAnahtari: MatCevapAnahtari = {
    sorular: sorular.map((s, index) => ({
      soruNo: index + 1,
      dogruCevap: s.dogruCevap,
      puan: s.puan,
      kazanimKodu: s.kazanimKodu,
      cozumAciklamasi: s.cozum_anahtari,
      gercekYasamBaglantisi: s.gercek_yasam_baglantisi,
      seviye: s.zorluk as any
    }))
  };

  return {
    id: `sinav-${Date.now()}`,
    baslik: `${sinif}. Sınıf Matematik Sınavı`,
    sinif,
    secilenKazanimlar: settings.secilenKazanimlar,
    sorular,
    toplamPuan,
    tahminiSure: toplamSure,
    olusturmaTarihi: new Date().toISOString(),
    olusturanKullanici: "Offline Generator",
    cevapAnahtari
  };
};

export const generateMatExam = async (settings: MatSinavAyarlari): Promise<MatSinav> => {
  try {
    return await generateMathExam(settings);
  } catch (error: unknown) {
    console.warn('Gemini API başarısız, fallback olarak offline sorular kullanılıyor:', error);
    return createOfflineSinav(settings);
  }
};

export const refreshSingleQuestion = async (
  soruIndex: number,
  settings: MatSinavAyarlari,
  mevcutSoru: MatSoru
): Promise<MatSoru> => {
  try {
    return await regenerateSingleQuestion(soruIndex, settings, mevcutSoru);
  } catch (error: unknown) {
    console.warn('Gemini API başarısız, fallback olarak offline soru kullanılıyor:', error);
    return createOfflineQuestion(soruIndex + 10, settings.sinif ?? 5);
  }
};
