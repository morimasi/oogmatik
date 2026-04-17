/**
 * BELLEK VERİ HAVUZU (500% Genişletilmiş)
 * Odak: Soyut kavramlar, teknik terimler ve LGS düzeyinde akademik kelimeler.
 */

// Soyut Kavramlar (Analitik Düşünce İçin)
export const SOYUT_KELIMELER = [
    'Adalet', 'Bağımsızlık', 'Bilinç', 'Cumhuriyet', 'Dürüstlük', 'Egemenlik', 'Empati', 'Erdem', 
    'Fikir', 'Gelecek', 'Hakikat', 'Hoşgörü', 'İrade', 'İyilik', 'Karakter', 'Mantık', 'Mefhum', 
    'Namus', 'Özgürlük', 'Paylaşım', 'Refah', 'Saygı', 'Sorumluluk', 'Şuur', 'Tahammül', 'Umut', 
    'Ülkü', 'Vicdan', 'Yenilik', 'Zeka', 'Ahlak', 'Azim', 'Denge', 'Eşitlik', 'Fazilet', 'Gayret', 
    'Huzur', 'İlke', 'İstikrar', 'Kudret', 'Layık', 'Merhamet', 'Nezaket', 'Onur', 'Özlem', 
    'Sadakat', 'Şefkat', 'Tutku', 'Uzlaşı', 'Vefa', 'Zerafet', 'Birlik', 'Dayanışma', 'Güven', 
    'Hoşgörü', 'Kararlılık', 'Sabır', 'Mücadele', 'Fedakarlık', 'Sempati', 'Sistem', 'Analiz', 
    'Sentez', 'Teori', 'Kavram', 'Yöntem', 'İdol', 'Ideal', 'Kritik', 'Objektif', 'Subjektif'
];

// Uzay ve Bilim Terimleri (Akademik Odak)
export const BILIM_KELIMELERI = [
    'Astronomi', 'Atom', 'Bakteri', 'Biyoloji', 'Çekim', 'Deney', 'DNA', 'Ekosistem', 'Enerji', 
    'Evren', 'Fosil', 'Galaksi', 'Genetik', 'Gezegen', 'Hücre', 'Işık', 'Isı', 'Jeoloji', 
    'Kalıtım', 'Laboratuvar', 'Madde', 'Molekül', 'Nebula', 'Optik', 'Organizma', 'Plazma', 
    'Radar', 'Robot', 'Sıvı', 'Teleskop', 'Uydu', 'Uzay', 'Vakum', 'Voltaj', 'Yazılım', 
    'Zaman', 'Atalet', 'Basınç', 'Cisim', 'Direnç', 'Eksen', 'Frekans', 'Gen', 'Hız', 
    'İvme', 'Kütle', 'Lazer', 'Mıknatıs', 'Nükleer', 'Oksijen', 'Proton', 'Radyasyon', 
    'Sıcaklık', 'Teori', 'Uçuş', 'Vektör', 'Yoğunluk', 'Yörünge', 'Zifiri', 'Bilişim', 
    'Yapay Zeka', 'Algoritma', 'Veri', 'Kodlama', 'Siber', 'Blockchain', 'Kripto', 'Sanal'
];

// Türk Edebiyatı ve Kültür (Linguistik Zenginlik)
export const EDEBIYAT_KELIMELERI = [
    'Anlatı', 'Betimleme', 'Cümle', 'Deyim', 'Eser', 'Fıkra', 'Gazel', 'Hikaye', 'İmge', 
    'Jön', 'Kafiye', 'Lirik', 'Masal', 'Nazım', 'Öykü', 'Paragraf', 'Roman', 'Şiir', 
    'Tema', 'Üslup', 'Vezin', 'Yazar', 'Zanaat', 'Ahenk', 'Bent', 'Çehre', 'Dizeler', 
    'Efsane', 'Fesahat', 'Gaye', 'Hiciv', 'Içerik', 'Kaside', 'Lisan', 'Mısra', 'Nesir', 
    'Özgün', 'Piyes', 'Ritm', 'Sözlük', 'Tahlil', 'Uyak', 'Vicahi', 'Yorum', 'Zarafet', 
    'Akım', 'Bağlam', 'Biçem', 'Dönem', 'Eleştiri', 'Gözlem', 'Kurgu', 'Metin', 'Söyleşi', 
    'Tasarı', 'Yazım', 'Noktalama', 'Sözcük', 'Tümce', 'Özne', 'Yüklem', 'Sıfat', 'Zarf'
];

// Doğa ve Coğrafya
export const DOGA_KELIMELERI = [
    'Akarsu', 'Buzul', 'Coğrafya', 'Dağ', 'Erozyon', 'Fırtına', 'Göl', 'Hava', 'Irmak', 
    'Jeoloji', 'Kanyon', 'Liman', 'Mağara', 'Nem', 'Okyanus', 'Ova', 'Plato', 'Rüzgar', 
    'Şelale', 'Toprak', 'Uçurum', 'Vadi', 'Yağmur', 'Zelzele', 'Ada', 'Batı', 'Çöl', 
    'Doğu', 'Ekosistem', 'Flora', 'Güney', 'Iklim', 'Kuzey', 'Lokal', 'Mera', 'Nehir', 
    'Orman', 'Peyzaj', 'Sahil', 'Tabiat', 'Uzak', 'Volkan', 'Yayla', 'Zirve', 
    'Atmosfer', 'Tabaka', 'Kayaç', 'Maden', 'Kaynak', 'Havza', 'Ilıca', 'Körfez', 'Burun'
];

// Tüm Kelimeler (Master Pool)
export const BELLEK_WORDS = [
    ...SOYUT_KELIMELER,
    ...BILIM_KELIMELERI,
    ...EDEBIYAT_KELIMELERI,
    ...DOGA_KELIMELERI
];

export const BELLEK_DATA = {
    beginner: BELLEK_WORDS.slice(0, 100),
    medium: BELLEK_WORDS.slice(50, 200),
    advanced: BELLEK_WORDS.slice(100, 300),
    expert: BELLEK_WORDS
};
