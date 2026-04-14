import { ActivityType } from '../../../types';
import { PromptTemplate } from './readingPrompts';

/**
 * OOGMATIK — SARI KİTAP ETKİNLİK STÜDYOSU PROMPTS
 * 
 * Bu dosya, Sarı Kitap serisindeki özel etkinliklerin AI tarafından 
 * üretilmesi için gerekli olan sistem ve kullanıcı prompt şablonlarını içerir.
 */

export const SARI_KITAP_PROMPTS: Partial<Record<ActivityType, PromptTemplate>> = {
  [ActivityType.SARI_KITAP_PENCERE]: {
    systemPromptSuffix: `
Görevin: "Sarı Kitap: Pencere" etkinliği üret.
YAPI:
- 10x10'luk bir sembol/harf ızgarası oluştur.
- "Pencere" metaforu kullan: Öğrencinin odaklanması gereken 3-4 farklı "pencere" (bölge) tanımla.
- Her pencere için bir hedef (örn: "Pencere 1'de kaç tane 'b' var?") belirle.
- Görsel hiyerarşi ve odaklanma stratejisi vurgulanmalı.
BİLİŞSEL HEDEF: Görsel tarama, seçici dikkat ve odaklanma.`,
    userPromptSuffix: 'Pencere metaforuyla odaklanma ve dikkat tarama etkinliği üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.SARI_KITAP_NOKTA]: {
    systemPromptSuffix: `
Görevin: "Sarı Kitap: Nokta" etkinliği üret.
YAPI:
- Nokta birleştirme veya nokta sayma tabanlı bir yapı oluştur.
- Karmaşık bir nokta bulutu içinde belirli örüntüleri (örn: "3'lü nokta grupları") buldur.
- Noktaların yerleşimi disleksi dostu olmalı (aşırı kalabalık değil, net ayrışmış).
- Zorluk seviyesine göre nokta yoğunluğunu ayarla.
BİLİŞSEL HEDEF: Görsel-uzamsal algı ve ince motor koordinasyon.`,
    userPromptSuffix: 'Nokta tabanlı örüntü tanıma ve dikkat etkinliği üret.',
    drillCount: 2,
    layoutHint: 'grid'
  },

  [ActivityType.SARI_KITAP_KOPRU]: {
    systemPromptSuffix: `
Görevin: "Sarı Kitap: Köprü" etkinliği üret.
YAPI:
- İki kavram veya kelime grubu arasında "Köprü" kurma (ilişkilendirme).
- 8 adet başlangıç ve 8 adet bitiş noktası ver.
- Ortadaki "Köprü" kuralları: "Anlamdaş", "Zıt", "Kategori" veya "Ses Benzerliği".
- Öğrencinin bu köprüleri çizerek veya yazarak kurmasını sağla.
BİLİŞSEL HEDEF: İlişkisel muhakeme, semantik ağ kurma ve zihinsel esneklik.`,
    userPromptSuffix: 'Kavramlar arası mantıksal köprü kurma etkinliği üret.',
    drillCount: 3,
    layoutHint: 'dual_column'
  },

  [ActivityType.SARI_KITAP_CIFT_METIN]: {
    systemPromptSuffix: `
Görevin: "Sarı Kitap: Çift Metin" etkinliği üret.
YAPI:
- Birbirine paralel, benzer konulu ama farklı detaylara sahip 2 kısa metin (50-70 kelime).
- Metin 1: Olayı A kişisinin gözünden anlatır.
- Metin 2: Olayı B kişisinin gözünden veya farklı bir perspektifle anlatır.
- Karşılaştırma Soruları: 5 adet (Ortak noktalar, farklılıklar, çıkarımlar).
- Disleksi dostu: Lexend font, 1.8 satır aralığı.
BİLİŞSEL HEDEF: Karşılaştırmalı okuma, perspektif alma ve detay analizi.`,
    userPromptSuffix: 'İki farklı metin üzerinden karşılaştırmalı okuma anlama etkinliği üret.',
    drillCount: 1,
    layoutHint: 'dual_column'
  },

  [ActivityType.SARI_KITAP_BELLEK_DERNEK]: {
    systemPromptSuffix: `
Görevin: "Sarı Kitap: Bellek Dernek" etkinliği üret.
YAPI:
- 12 adet kelime/görsel çifti ver.
- Bellek Sarayı veya Hikayeleştirme tekniklerini kullanacak "Dernekler" (çağrışımlar) oluştur.
- Öğrencinin bu çiftleri ezberlemesi için 1 dakika süre ver, sonra kapatıp (arka sayfa veya alt bölüm) hatırlat.
- Hatırlama soruları: "Elma ile ne eşleşmişti?"
BİLİŞSEL HEDEF: Kısa süreli bellek, çağrışım kurma ve geri çağırma (retrieval).`,
    userPromptSuffix: 'Bellek teknikleri ve çağrışım tabanlı hatırlama etkinliği üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.SARI_KITAP_HIZLI_OKUMA]: {
    systemPromptSuffix: `
Görevin: "Sarı Kitap: Hızlı Okuma" etkinliği üret.
YAPI:
- Sütun halinde dizilmiş, genişliği kademeli artan kelime listeleri (Takistoskop etkisi).
- Göz sıçraması (Saccades) egzersizleri: Sayfanın sol ve sağ tarafına dizilmiş kelimeler.
- 1 dakikalık okuma metni ve kelime sayacı.
- Anlama kontrolü için 3 hızlı soru.
BİLİŞSEL HEDEF: Okuma hızı, göz kası koordinasyonu ve anlık kavrama.`,
    userPromptSuffix: 'Göz egzersizleri ve hız odaklı okuma çalışması üret.',
    drillCount: 3,
    layoutHint: 'list'
  }
};
