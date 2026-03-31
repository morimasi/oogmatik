const fs = require('fs');
const path = require('path');

const THEMES = [
  "Uzay Gemisi Navigasyonu", "Kayıp Dinozor Fosilleri", "Okyanus Tabanı Haritası",
  "Büyülü Orman Aynaları", "Geleceğin Şehri Trafiği", "Müzikal Notalar",
  "Antik Mısır Papirüsleri", "Korsan Hazinesi Şifresi", "Mikro Evren Laboratuvarı",
  "Kış Sporları Parkuru", "Gizli Ajan Görevi", "Ortaçağ Şatosu Savunması",
  "Arı Kovanı Sistemi", "Sihirbazlık Akademisi", "Zaman Yolculuğu Treni",
  "Okyanus Mercanları", "İtfaiye Kurtarma", "Çiftlik Hasadı", "İnşaat Vinçleri",
  "Kristal Mağarası", "Meyve Bahçesi", "Robot Fabrikası", "Karınca Kolonisi"
];

const CORE_DISLEKSI = [
  {
    skill: "Ortografik Haritalama",
    promptBase: "metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
    hint: "compare"
  },
  {
    skill: "Heceleme ve Fonolojik Bellek",
    promptBase: "kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
    hint: "sequence"
  },
  {
    skill: "Okuduğunu Anlama (5N1K) ve Çıkarım",
    promptBase: "metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
    hint: "hierarchy"
  },
  {
    skill: "Görsel Hafıza ve Sıralama",
    promptBase: "kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
    hint: "timeline"
  },
  {
    skill: "Kafiye Aileleri (Rhymer)",
    promptBase: "kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
    hint: "list"
  }
];

const CORE_DISKALKULI = [
  {
    skill: "Kümeleme (Subitizing) ve Sayı Hissi",
    promptBase: "sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
    hint: "compare"
  },
  {
    skill: "Likit Onluk Bozma ve Basamak Modeli",
    promptBase: "Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
    hint: "hierarchy"
  },
  {
    skill: "Zihinsel Sayı Doğrusu ve Yön",
    promptBase: "sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
    hint: "sequence"
  },
  {
    skill: "Somut Kesirler ve Bütün Parçalanması",
    promptBase: "Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
    hint: "list"
  },
  {
    skill: "Çarpım Tablosu Örüntü Motoru",
    promptBase: "Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
    hint: "auto"
  }
];

const CORE_DEHB = [
  {
    skill: "Bölünmüş Dikkat (Sustained Attention)",
    promptBase: "DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
    hint: "auto"
  },
  {
    skill: "Zaman Algısı Körlüğü (Time Blindness)",
    promptBase: "zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
    hint: "compare"
  },
  {
    skill: "Dürtüsellik Organizasyonu",
    promptBase: "sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
    hint: "list"
  }
];

let itemsDisleksi = [];
let itemsDiskalkuli = [];
let itemsDEHB = [];

THEMES.forEach(theme => {
  CORE_DISLEKSI.forEach(c => {
    itemsDisleksi.push({
      title: \`\${c.skill} - \${theme}\`,
      prompt: \`[\${theme} Temalı Ultra-Premium Şablon] - Disleksik profil için: \${c.promptBase}\`,
      hint: c.hint
    });
  });
  
  CORE_DISKALKULI.forEach(c => {
    itemsDiskalkuli.push({
      title: \`\${c.skill} - \${theme}\`,
      prompt: \`[\${theme} Temalı Ultra-Premium Şablon] - Diskalkulik profil için: \${c.promptBase}\`,
      hint: c.hint
    });
  });
  
  CORE_DEHB.forEach(c => {
    itemsDEHB.push({
      title: \`\${c.skill} - \${theme}\`,
      prompt: \`[\${theme} Temalı Ultra-Premium Şablon] - DEHB profili için: \${c.promptBase}\`,
      hint: c.hint
    });
  });
});

const fileContent = \`export interface InfographicTemplate {
  title: string;
  prompt: string;
  hint: string;
}

export interface TemplateCategory {
  category: string;
  items: InfographicTemplate[];
}

export const SPLD_PREMIUM_TEMPLATES: TemplateCategory[] = [
  {
    category: 'Disleksi',
    items: \${JSON.stringify(itemsDisleksi, null, 4)}
  },
  {
    category: 'Diskalkuli',
    items: \${JSON.stringify(itemsDiskalkuli, null, 4)}
  },
  {
    category: 'DEHB',
    items: \${JSON.stringify(itemsDEHB, null, 4)}
  }
];
\`;

fs.writeFileSync(path.join(__dirname, 'src/data/infographicTemplates.ts'), fileContent, 'utf-8');
console.log('Successfully generated ' + (itemsDisleksi.length + itemsDiskalkuli.length + itemsDEHB.length) + ' Ultra-Premium templates.');
