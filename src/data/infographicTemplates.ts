export interface InfographicTemplate {
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
    items: [
    {
        "title": "Ortografik Haritalama - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    },
    {
        "title": "Ortografik Haritalama - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin dönme ve harf rotasyon (b/d/p/q) hatalarını engellemek adına, ayna nöronlarını tetikleyen zıt formlu metaforlar kur! Tasarımda zeminle yüksek kontrast (Lexend fontu) yaratarak 'Görsel Kümeleme' (Visual Crowding) etkisini sıfıra indirge. Kapsam: Görsel Ayırt Etme.",
        "hint": "compare"
    },
    {
        "title": "Heceleme ve Fonolojik Bellek - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin hecelere bölünme sürecinde sesleri adım adım ardışık olarak sembolize et (Hece Merdiveni modeli). İlk heceden son heceye uzanan görsel bağlarla işleyen bellek (Working Memory) yükünü azalt. Kapsam: Ses Birimsel Analiz ve Sıralama.",
        "hint": "sequence"
    },
    {
        "title": "Okuduğunu Anlama (5N1K) ve Çıkarım - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - Disleksik profil için: metin sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede vb. sorularını birbiriyle Venn/Kılçık ağında bağla. Uzun cümleler yerine görsel ikona dayalı kısa net kelimeler ver. %40 'Negatif Boşluk' (White Space) ilkesi. Kapsam: 5N1K ve Çıkarım.",
        "hint": "hierarchy"
    },
    {
        "title": "Görsel Hafıza ve Sıralama - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - Disleksik profil için: kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızayı desteklemek için olay örgüsünü birbirine kopmaz halatlarla (zaman tüneli) bağla. Glare (göz kamaşması) engelleyen mat pastel renkler kullan. Kapsam: Olay Akışı Sıralaması.",
        "hint": "timeline"
    },
    {
        "title": "Kafiye Aileleri (Rhymer) - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - Disleksik profil için: kelimelerin bitiş seslerinin aynı form ve renkte bloklardan oluştuğu 'Fonolojik Kafiye Matrisi' kur. Saf, detaysız zemin üzerinde sadece kafiyeli piktogram kümesi yer alsın. Kapsam: Ses Sentezi ve Benzerlik.",
        "hint": "list"
    }
]
  },
  {
    category: 'Diskalkuli',
    items: [
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    },
    {
        "title": "Kümeleme (Subitizing) ve Sayı Hissi - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayıların sembolik anlamlarını (3, 5, 8 vb.) anında algılanabilir, ufaltılamaz zar kümeleriyle eşleştir (Parça-Bütün ilişkisi). Geometrik kalabalığı azaltıp somut nesne sayımına (somut miktar) yönelt! Kapsam: Rakam-Değer Algısı.",
        "hint": "compare"
    },
    {
        "title": "Likit Onluk Bozma ve Basamak Modeli - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Onluk ve Birlik kavramlarını ayrıştırmak için 10'lu kümeleri parçalanamaz büyük bütünler, birlikleri ufak parçalar olarak kur. Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir (Onluklar mavi, Birlikler turuncu). Kapsam: Basamak Değeri.",
        "hint": "hierarchy"
    },
    {
        "title": "Zihinsel Sayı Doğrusu ve Yön - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: sayı doğrusunun ileri-geri mantığını dikey/hiyerarşik bir labirent sistemi gibi konumlandır. Geriye saymanın 'aşağı inmek' vs. somut yer-yön metrikleriyle birleştir (Matrix/Sequence dizilimi). Kapsam: Yönelim ve Ardışıklık.",
        "hint": "sequence"
    },
    {
        "title": "Somut Kesirler ve Bütün Parçalanması - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Kesir sembolünü arasına bir 'çizgi' çekilmiş rakamlar olarak değil, fiziki bir bütünün ayrılması (örn. makasla kesilmiş boşluklu parçalar) metaforuyla hizala! Payı renkli ve dokulu tasarla. Kapsam: Bütün-Parça İlişkisi.",
        "hint": "list"
    },
    {
        "title": "Çarpım Tablosu Örüntü Motoru - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - Diskalkulik profil için: Çarpma işlemini bir ezber olmaktan çıkarıp 'Tekrarlı Toplanma' mekanizması (çark, döngü vs.) gibi göster. Toplam sonucun (12 vb.) mekanizmanın bütünlüğünü ifade ettiğini Cause-Effect grafiğinde somutlaştır. Kapsam: Çarpma İşleminin Mantığı.",
        "hint": "auto"
    }
]
  },
  {
    category: 'DEHB',
    items: [
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Uzay Gemisi Navigasyonu",
        "prompt": "[Uzay Gemisi Navigasyonu Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Kayıp Dinozor Fosilleri",
        "prompt": "[Kayıp Dinozor Fosilleri Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Okyanus Tabanı Haritası",
        "prompt": "[Okyanus Tabanı Haritası Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Büyülü Orman Aynaları",
        "prompt": "[Büyülü Orman Aynaları Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Geleceğin Şehri Trafiği",
        "prompt": "[Geleceğin Şehri Trafiği Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Müzikal Notalar",
        "prompt": "[Müzikal Notalar Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Antik Mısır Papirüsleri",
        "prompt": "[Antik Mısır Papirüsleri Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Korsan Hazinesi Şifresi",
        "prompt": "[Korsan Hazinesi Şifresi Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Mikro Evren Laboratuvarı",
        "prompt": "[Mikro Evren Laboratuvarı Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Kış Sporları Parkuru",
        "prompt": "[Kış Sporları Parkuru Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Gizli Ajan Görevi",
        "prompt": "[Gizli Ajan Görevi Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Ortaçağ Şatosu Savunması",
        "prompt": "[Ortaçağ Şatosu Savunması Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Arı Kovanı Sistemi",
        "prompt": "[Arı Kovanı Sistemi Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Sihirbazlık Akademisi",
        "prompt": "[Sihirbazlık Akademisi Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Zaman Yolculuğu Treni",
        "prompt": "[Zaman Yolculuğu Treni Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Okyanus Mercanları",
        "prompt": "[Okyanus Mercanları Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - İtfaiye Kurtarma",
        "prompt": "[İtfaiye Kurtarma Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Çiftlik Hasadı",
        "prompt": "[Çiftlik Hasadı Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - İnşaat Vinçleri",
        "prompt": "[İnşaat Vinçleri Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Kristal Mağarası",
        "prompt": "[Kristal Mağarası Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Meyve Bahçesi",
        "prompt": "[Meyve Bahçesi Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Robot Fabrikası",
        "prompt": "[Robot Fabrikası Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    },
    {
        "title": "Bölünmüş Dikkat (Sustained Attention) - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - DEHB profili için: DEHB zihnindeki aşırı tepkiselliği ve dikkat çeldiricilerini yok etmek için arka planı Pure Dark (karanlık) yap. Bilgiyi sadece ortaya vurulan tek bir projektör ışığı altında (Fishbone / Focus Center) görselleştir. 'Visual Crowding' sıfır olmalı. Kapsam: Dış Uyaran Filtrelemesi.",
        "hint": "auto"
    },
    {
        "title": "Zaman Algısı Körlüğü (Time Blindness) - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - DEHB profili için: zaman yönetimindeki zorluğu aşmak için 'Şimdi' ve 'Sonra' kavramlarını renkli iki zıt odacığa (Venn/Flowchart) böl. Süreç geçişlerini aşamalandırılmış kalın oklara bağla. Kapsam: Zaman İzleme ve Hedef.",
        "hint": "compare"
    },
    {
        "title": "Dürtüsellik Organizasyonu - Karınca Kolonisi",
        "prompt": "[Karınca Kolonisi Temalı Ultra-Premium Şablon] - DEHB profili için: sabırsızlığı kontrol altına alıp dürtüleri bastırmak için çok basamaklı ve kalın border zırhlarıyla çevrili planlama tabloları (Grid) kur. Gözün başka satıra kaymasını engelleyen Zebra striping metodunu uygula. Kapsam: Adım Planlama.",
        "hint": "list"
    }
]
  }
];
