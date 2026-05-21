
import { getWordsForDifficulty, getRandomItems, shuffle, syllabifyWord } from '../offlineGenerators/helpers';
import { SuperStudioDifficulty } from '../../types/superStudio';

/**
 * Super Turkce Sablonlari icin Premium Çevrimdışı (Offline) Üretici Motoru
 * AI beklemeden, pedagojik ve "dolu dolu" A4 icerigi uretir.
 */

export const generateOfflineSuperStudioTemplate = (
  templateId: string,
  settings: any,
  grade: string | null,
  topic: string,
  difficulty: SuperStudioDifficulty
): string => {
  const currentTopic = topic || 'Genel Kavramlar';
  const currentGrade = grade || 'İlkokul';
  
  // Baslik ve Meta Bilgisi
  let content = `# ${currentTopic.toUpperCase()} — ETKİNLİK DÜNYASI\n`;
  content += `> **Sınıf:** ${currentGrade} | **Zorluk:** ${difficulty} | **Mod:** Hızlı Üretim (Offline)\n\n`;
  content += `===SAYFA_SONU===\n\n`; // İlk sayfa kapak gibi ama dolu olacak

  switch (templateId) {
    case 'okuma-anlama':
      return generateOkumaAnlamaOffline(settings, currentTopic, difficulty);
    case 'dil-bilgisi':
      return generateDilBilgisiOffline(settings, currentTopic, difficulty);
    case 'mantik-muhakeme':
      return generateMantikMuhakemeOffline(settings, currentTopic, difficulty);
    case 'yaratici-yazarlik':
      return generateYaraticiYazarlikOffline(settings, currentTopic, difficulty);
    case 'yazim-noktalama':
      return generateYazimNoktalamaOffline(settings, currentTopic, difficulty);
    case 'soz-varligi':
      return generateSozVarligiOffline(settings, currentTopic, difficulty);
    case 'hece-ses':
      return generateHeceSesOffline(settings, currentTopic, difficulty);
    case 'kelime-bilgisi':
      return generateKelimeBilgisiOffline(settings, currentTopic, difficulty);
    default:
      return `# ${templateId.toUpperCase()} Etkinliği\n\nBu şablon için offline içerik henüz hazırlanıyor.`;
  }
};

// --- YARDIMCI JENERATÖRLER ---

function generateOkumaAnlamaOffline(settings: any, topic: string, difficulty: string): string {
  const words = getWordsForDifficulty(difficulty as unknown as any, 'animals');
  const story = `Dün sabah erkenden ${words[0]} ile ${words[1]} ormana gitmişler. Orada çok güzel bir ${words[2]} görmüşler. Birdenbire karşılarına bir ${words[3]} çıkmış. Hep birlikte çok eğlenmişler ama akşam olunca eve dönmeleri gerekmiş. Bu harika macerayı hiç unutmamışlar.`;
  
  let md = `# 📖 ${topic} - OKUMA ANLAMA\n\n`;
  md += `### 📝 Metin: ${topic} Macerası\n\n${story}\n\n`;
  md += `══════════════════════════════════════════════════\n\n`;
  
  md += `### 📌 GÖREV 1: Soruları Cevapla\n\n`;
  md += `1. Metinde geçen kahramanlar kimlerdir?\n   Cevap: ________________________________\n\n`;
  md += `2. Kahramanlar nereye gitmişler?\n   Cevap: ________________________________\n\n`;
  md += `3. Karşılarına ne çıkmış?\n   Cevap: ________________________________\n\n`;
  
  md += `### 📌 GÖREV 2: 5N1K Dedektifi\n\n`;
  md += `| SORU | CEVAP |\n| :--- | :--- |\n| **KİM?** | | \n| **NE?** | | \n| **NEREDE?** | | \n| **NASIL?** | | \n\n`;
  
  md += `### 📌 GÖREV 3: Kelime Avı\n`;
  md += `Aşağıdaki heceleri birleştirip metindeki kelimeleri bul.\n\n`;
  words.slice(0, 4).forEach(w => {
    const syls = syllabifyWord(w);
    md += `- **${syls.join(' - ')}** → __________________\n`;
  });

  return md;
}

function generateDilBilgisiOffline(settings: any, topic: string, difficulty: string): string {
  const target = settings.targetDistractors || 'b-d';
  const letters = target.split('-');
  
  let md = `# 🔤 ${topic} - DİL BİLGİSİ STÜDYOSU\n\n`;
  md += `### 📌 GÖREV 1: Harf Dedektifi\n`;
  md += `Aşağıdaki kelimelerde eksik olan **${letters[0]}** veya **${letters[1]}** harfini yazın.\n\n`;
  
  const tasks = ['_alak', '_on_on', 'ara_a', 'ka_ak', '_e_ek', 'tor_a', 'lam_a', 'su_ak'];
  md += tasks.map((t, i) => `${i+1}. ${t}    `).join('    ') + '\n\n';
  
  md += `### 📌 GÖREV 2: Hecelerine Ayır\n\n`;
  const words = ['Kitaplık', 'Okulistik', 'Bilgisayar', 'Mühendis'];
  words.forEach(w => md += `- **${w}** → ________________________\n`);
  
  md += `\n### 📌 GÖREV 3: Cümle Kurma\n`;
  md += `Aşağıdaki kelimeleri kullanarak anlamlı ve kurallı bir cümle kurunuz.\n\n`;
  md += `**bahçede - çocuklar - neşeyle - oynuyorlar**\n`;
  md += `Cevap: ________________________________________________\n`;

  return md;
}

function generateMantikMuhakemeOffline(settings: any, topic: string, difficulty: string): string {
  let md = `# 🧩 ${topic} - MANTIK VE MUHAKEME\n\n`;
  md += `### 📌 GÖREV 1: Sıralama Oyunu\n`;
  md += `Aşağıdaki olayları oluş sırasına göre numaralandırın (1-4).\n\n`;
  md += `( ) Tohumları toprağa ektim.\n( ) Çiçeğim çok güzel açtı.\n( ) Toprağı güzelce havalandırdım.\n( ) Her gün düzenli olarak suladım.\n\n`;
  
  md += `### 📌 GÖREV 2: Farklı Olanı Bul\n`;
  md += `Aşağıdaki gruplarda anlam bakımından farklı olan kelimeyi işaretle.\n\n`;
  md += `1. Çatal - Kaşık - **Defter** - Tabak\n2. Elma - Armut - Muz - **Ispanak**\n3. Otobüs - Tren - **Gemi** - Helikopter (Karayolu)\n\n`;
  
  md += `### 📌 GÖREV 3: Şifreli Mesaj\n`;
  md += `A=1, B=2, C=3 olarak kodlanırsa; **2-1-3-1** şifresi hangi kelimedir?\n\n`;
  md += `Cevap: ________________________________\n`;

  return md;
}

function generateYaraticiYazarlikOffline(settings: any, topic: string, difficulty: string): string {
  let md = `# ✍️ ${topic} - YARATICI YAZARLIK\n\n`;
  md += `### 📌 GÖREV 1: Hikaye Başlatıcı\n`;
  md += `"Bir gün sabah uyandığımda ellerimin maviye boyandığını gördüm..."\n\n`;
  md += `Bu hikayeyi aşağıdaki boşluğa 5 cümleyle devam ettir.\n\n`;
  md += `___________________________________________________________\n`;
  md += `___________________________________________________________\n`;
  md += `___________________________________________________________\n\n`;
  
  md += `### 📌 GÖREV 2: Duygu Radarı\n`;
  md += `Kendini bugün hangi duyguya daha yakın hissediyorsun? Neden?\n\n`;
  md += `😊 Mutlu    😔 Üzgün    🤔 Meraklı    😲 Şaşırmış\n\n`;
  md += `Çünkü: ____________________________________________________\n`;

  return md;
}

function generateYazimNoktalamaOffline(settings: any, topic: string, difficulty: string): string {
  let md = `# 📍 ${topic} - YAZIM VE NOKTALAMA\n\n`;
  md += `### 📌 GÖREV 1: Noktalama Dedektifi\n`;
  md += `Aşağıdaki cümlelerde parantez içine uygun noktalama işaretlerini koyun.\n\n`;
  md += `1. Eyvah ( ) okul otobüsünü kaçırdım ( )\n`;
  md += `2. Annem ( ) pazardan elma ( ) armut ve muz aldı ( )\n`;
  md += `3. Ankara ( )nın başkent olduğunu biliyor musun ( )\n\n`;
  
  md += `### 📌 GÖREV 2: Yazım Yanlışlarını Düzelt\n`;
  md += `Cümlelerdeki hataları bulup doğrusunu yanına yazın.\n\n`;
  md += `- Tdk'nın yeni binasını gördün mü? → ________________\n`;
  md += `- 23 nisan kutlu olsun. → ________________\n`;
  md += `- Kişinin yanına gittin mi? → ________________\n`;

  return md;
}

function generateSozVarligiOffline(settings: any, topic: string, difficulty: string): string {
  let md = `# 📖 ${topic} - SÖZ VARLIĞI (DEYİMLER)\n\n`;
  md += `### 📌 GÖREV 1: Deyim Eşleştirme\n`;
  md += `Deyimleri anlamları ile eşleştirin.\n\n`;
  md += `1. Göze Girmek ( ) Çok sevinmek\n`;
  md += `2. Etekleri Zil Çalmak ( ) İlgi ve sevgi kazanmak\n`;
  md += `3. Kulak Kabartmak ( ) Çaresiz kalmak\n`;
  md += `4. Eli Kolu Bağlanmak ( ) Gizlice dinlemek\n\n`;
  
  md += `### 📌 GÖREV 2: Atasözü Tamamlama\n`;
  md += `- Damlaya damlaya ________ olur.\n`;
  md += `- Sakla samanı, ________ zamanı.\n`;
  md += `- Bakarsan bağ, bakmazsan ________ olur.\n`;

  return md;
}

function generateHeceSesOffline(settings: any, topic: string, difficulty: string): string {
  let md = `# 🔊 ${topic} - HECE VE SES OLAYLARI\n\n`;
  md += `### 📌 GÖREV 1: Ünlü/Ünsüz Ayrımı\n`;
  md += `Aşağıdaki kelimelerdeki ünlü harfleri yuvarlak içine al.\n\n`;
  md += `**OOGMATİK - EĞİTİM - DİSLEKSİ - BAŞARI**\n\n`;
  
  md += `### 📌 GÖREV 2: Ses Olayları\n`;
  md += `Hangi ses olayı olduğunu yaz (Yumuşama, Benzeşme, Düşme).\n\n`;
  md += `1. Kitap - ı → Kitabı : ____________\n`;
  md += `2. Sokak - da → Sokakta : ____________\n`;
  md += `3. Akıl - ı → Aklı : ____________\n`;

  return md;
}

function generateKelimeBilgisiOffline(settings: any, topic: string, difficulty: string): string {
  let md = `# 🔍 ${topic} - KELİME BİLGİSİ\n\n`;
  md += `### 📌 GÖREV 1: Eş Anlamlılarını Bul\n`;
  md += `1. Cevap → __________\n2. Siyah → __________\n3. Mektep → __________\n4. Hediye → __________\n\n`;
  
  md += `### 📌 GÖREV 2: Zıt Anlamlılar\n`;
  md += `1. Uzun x __________\n2. Büyük x __________\n3. Güzel x __________\n4. Açık x __________\n\n`;
  
  md += `### 📌 GÖREV 3: Kelime Bulmacası\n`;
  md += `Harfleri karışık verilen kelimeleri düzelt.\n\n`;
  md += `- **L - U - K - O** → __________\n`;
  md += `- **M - E - L - K - A** → __________\n`;

  return md;
}
