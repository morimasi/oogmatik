
import { getWordsForDifficulty, syllabifyWord } from '../offlineGenerators/helpers';
import { SuperStudioDifficulty, GeneratedContentPayload, PageData } from '../../types/superStudio';

/**
 * Super Turkce Sablonlari icin Premium Çevrimdışı (Offline) Üretici Motoru
 * AI beklemeden, pedagojik ve "dolu dolu" A4 icerigi uretir.
 * KVKK: Bu motor öğrenci adı / tanı / skor yazmaz — anonim içerik üretir.
 */

type OfflineSettings = Record<string, unknown>;

const asSettings = (settings: unknown): OfflineSettings => {
  if (typeof settings === 'object' && settings !== null && !Array.isArray(settings)) {
    return settings as OfflineSettings;
  }
  return {};
};

const asString = (value: unknown, fallback: string): string => {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
};

/** Öğretmen notu eki — her offline çıktının sonunda pedagojik gerekçe bulunur. */
const TEACHER_NOTE_FOOTER =
  `\n\n---\n\n> **Öğretmen Notu:** Bu etkinlik disleksi dostu ilkelerle hazırlandı ` +
  `(geniş satır aralığı, sol hizalı metin, kısa yönergeler). ` +
  `İlk görev bilinçli olarak kolay tutuldu; öğrencinin güven kazanması amaçlandı.\n`;

const withTeacherNote = (md: string): string => {
  const trimmed = md.trim();
  if (trimmed.length === 0) return trimmed;
  return `${trimmed}${TEACHER_NOTE_FOOTER}`;
};

export const generateOfflineSuperStudioTemplate = (
  templateId: string,
  settings: unknown,
  grade: string | null,
  topic: string,
  difficulty: SuperStudioDifficulty
): string => {
  const safeSettings = asSettings(settings);
  const currentTopic = topic && topic.trim().length > 0 ? topic.trim() : 'Genel Kavramlar';

  switch (templateId) {
    case 'okuma-anlama':
      return withTeacherNote(generateOkumaAnlamaOffline(safeSettings, currentTopic, difficulty));
    case 'dil-bilgisi':
      return withTeacherNote(generateDilBilgisiOffline(safeSettings, currentTopic, difficulty));
    case 'mantik-muhakeme':
      return withTeacherNote(generateMantikMuhakemeOffline(safeSettings, currentTopic, difficulty));
    case 'yaratici-yazarlik':
      return withTeacherNote(generateYaraticiYazarlikOffline(safeSettings, currentTopic, difficulty));
    case 'yazim-noktalama':
      return withTeacherNote(generateYazimNoktalamaOffline(safeSettings, currentTopic, difficulty));
    case 'soz-varligi':
      return withTeacherNote(generateSozVarligiOffline(safeSettings, currentTopic, difficulty));
    case 'hece-ses':
      return withTeacherNote(generateHeceSesOffline(safeSettings, currentTopic, difficulty));
    case 'kelime-bilgisi':
      return withTeacherNote(generateKelimeBilgisiOffline(safeSettings, currentTopic, difficulty));
    default:
      return withTeacherNote(generateGenericOffline(templateId, currentTopic, difficulty));
  }
};

/**
 * Offline markdown çıktısını GeneratedContentPayload şemasına sarar.
 * Boş / anlamsız içerik geçerse güvenli zengin varsayılan üretilir (boş sayfa koruması).
 */
export const buildOfflinePayload = (
  templateId: string,
  markdown: unknown,
  title: string,
  instruction: string
): GeneratedContentPayload => {
  const raw = typeof markdown === 'string' ? markdown.trim() : '';
  const safeContent = raw.length > 0 ? raw : withTeacherNote(generateGenericOffline(templateId, 'Genel Çalışma', 'Orta'));
  const safeTitle = title.trim().length > 0 ? title : 'Etkinlik Çalışması';
  const pages: PageData[] = safeContent.split(/===SAYFA_SONU===/i)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
    .map((chunk, i) => ({
      title: i === 0 ? safeTitle : `${safeTitle} (devam)`,
      content: chunk,
      instruction,
      pageNumber: i + 1,
      pedagogicalNote: 'Disleksi dostu düzen: sol hizalı, geniş satır aralıklı metin; ilk görev kolay tutuldu.',
    }));
  const finalPages: PageData[] = pages.length > 0
    ? pages.map((p, i) => ({ ...p, totalPages: pages.length, pageNumber: p.pageNumber ?? i + 1 }))
    : [{
        title: safeTitle,
        content: safeContent,
        instruction,
        pageNumber: 1,
        totalPages: 1,
        pedagogicalNote: 'Disleksi dostu düzen: sol hizalı, geniş satır aralıklı metin; ilk görev kolay tutuldu.',
      }];
  return {
    id: `offline-${Date.now()}-${templateId}`,
    templateId,
    pages: finalPages,
    createdAt: Date.now(),
  };
};

// --- YARDIMCI JENERATÖRLER ---

function generateOkumaAnlamaOffline(settings: OfflineSettings, topic: string, difficulty: string): string {
  const words = getWordsForDifficulty(difficulty as string, 'animals');
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

function generateDilBilgisiOffline(settings: OfflineSettings, topic: string, difficulty: string): string {
  const target = asString(settings.targetDistractors, 'b-d');
  const parts = target.split('-').filter((p) => p.trim().length > 0);
  const letters = [parts[0] ?? 'b', parts[1] ?? 'd'];
  
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

function generateMantikMuhakemeOffline(_settings: OfflineSettings, topic: string, _difficulty: string): string {
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

function generateYaraticiYazarlikOffline(_settings: OfflineSettings, topic: string, _difficulty: string): string {
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

function generateYazimNoktalamaOffline(_settings: OfflineSettings, topic: string, _difficulty: string): string {
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

function generateSozVarligiOffline(_settings: OfflineSettings, topic: string, _difficulty: string): string {
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

function generateHeceSesOffline(_settings: OfflineSettings, topic: string, _difficulty: string): string {
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

function generateKelimeBilgisiOffline(_settings: OfflineSettings, topic: string, _difficulty: string): string {
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

/** Bilinmeyen şablonlar için zengin pedagojik varsayılan (placeholder metin yasak). */
function generateGenericOffline(templateId: string, topic: string, difficulty: string): string {
  const label = templateId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  let md = `# 📚 ${topic} - ${label}\n\n`;
  md += `> **Zorluk:** ${difficulty} | **Yönerge:** Her görevi sırayla ve sakin bir tempoda tamamla.\n\n`;
  md += `### 📌 GÖREV 1: Isınma (Kolay Başlangıç)\n`;
  md += `Aşağıdaki kelimeleri sesli oku ve her birini bir cümlede kullan.\n\n`;
  md += `**okul - kitap - arkadaş - bahçe**\n\n`;
  md += `1. ________________________________________________\n`;
  md += `2. ________________________________________________\n\n`;
  md += `### 📌 GÖREV 2: ${topic} Keşfi\n`;
  md += `"${topic}" konusunda bildiklerini üç maddeyle yaz.\n\n`;
  md += `1. ________________________________________________\n`;
  md += `2. ________________________________________________\n`;
  md += `3. ________________________________________________\n\n`;
  md += `### 📌 GÖREV 3: Kendini Değerlendir\n`;
  md += `Bugünkü çalışmada en iyi yaptığın şeyi işaretle.\n\n`;
  md += `⭐ Dikkatli okudum    ⭐ Cevaplarımı kontrol ettim    ⭐ Vazgeçmedim\n`;
  return md;
}
