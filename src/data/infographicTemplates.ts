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
        title: 'Frayer Kelime Ağı',
        prompt:
          'Zorlanılan kelimenin fonetik analizi, tanımı, eş anlamlısı, zıt anlamlısı ve görsel hece yapısını gösteren 4 çeyrekli Frayer Modeli.',
        hint: 'list',
      },
      {
        title: 'b/d/p/q Ayırt Etme Matrisi',
        prompt:
          'b ve d, p ve q gibi karışan harflerin görsel nesne benzetişimleri (örn: yatak-bed) ve ince motor yönleriyle karşılaştırmalı analizi.',
        hint: 'compare',
      },
      {
        title: 'Sesteş Kelimeler Örümcek Ağı',
        prompt:
          'Merkezdeki bir kelimenin, okunuşu aynı ama anlamı farklı sesteş türevlerine doğru ayrılan fonolojik örümcek ağı diyagramı.',
        hint: 'hierarchy',
      },
      {
        title: 'Heceleme Basamakları',
        prompt:
          'Uzun kelimelerin renklerle kodlanmış, her basamakta bir hecenin eklendiği, ritmik okuma destekli merdiven diyagramı.',
        hint: 'sequence',
      },
      {
        title: 'Görsel Okuma Rehberi',
        prompt:
          'Okuma sırasında satır atlamayı önleyen, odaklanılacak satırı vurgulayan ve çevreyi maskeleyen görsel şablon simülasyonu.',
        hint: 'timeline',
      },
      {
        title: 'Kafiye Eşleştirme Ağacı',
        prompt:
          'Aynı sesle biten kelimelerin ağaç dalları gibi gruplandırıldığı, görsel ipuçlarıyla desteklenmiş fonolojik farkındalık haritası.',
        hint: 'hierarchy',
      },
      {
        title: 'Sözcük Dağarcığı Şeması',
        prompt:
          'Yeni öğrenilen bir kelimenin günlük hayatta kullanım senaryolarını ve cümle içindeki bağlamlarını gösteren zihin haritası.',
        hint: 'list',
      },
      {
        title: 'Okuduğunu Anlama Çarkı',
        prompt:
          'Metin okunduktan sonra kim, ne, nerede, ne zaman, neden ve nasıl sorularının yanıtlarını görselleştiren dönen çark yapısı.',
        hint: 'auto',
      },
      {
        title: 'Çoklu Duyu Harf Şablonu',
        prompt:
          'Harflerin kuma yazma, havada çizme, hamurla yapma gibi çoklu duyusal öğrenme yöntemleriyle nasıl çalışılacağını gösteren infografik.',
        hint: 'sequence',
      },
      {
        title: 'Zıt Anlamlılar Terazisi',
        prompt:
          'Zıt anlamlı kelime çiftlerini, ağırlıkları dengede olan bir terazi üzerinde göstererek kavramsal zıtlığı görselleştiren yapı.',
        hint: 'compare',
      },
    ],
  },
  {
    category: 'Diskalkuli',
    items: [
      {
        title: 'Somut Kesir Parçalamaları',
        prompt:
          'Bütün, Yarım ve Çeyrek kavramlarını soyut sayılarla değil, pizza dilimleri ve lego bloklarına bölerek adım adım anlatan kesir süreci.',
        hint: 'sequence',
      },
      {
        title: 'Algoritmik Onluk Bozma Akışı',
        prompt:
          "Sayıları 10'luk taban bloklarıyla modelleyerek, çıkarma işleminde 'komşuya gitme' eylemini renk kodlu adım adım anlatan akış şeması.",
        hint: 'sequence',
      },
      {
        title: 'Sayı Doğrusu Serüveni',
        prompt:
          'Toplama ve çıkarma işlemlerini bir kurbağanın sayı doğrusu üzerindeki ileri geri zıplamalarıyla hikayeleştiren görsel çizelge.',
        hint: 'timeline',
      },
      {
        title: 'Çarpım Tablosu Şifreleri',
        prompt:
          "Ezber yerine örüntülere odaklanan, örneğin 9'lar tablosundaki parmak yöntemini veya çapraz kuralları görselleştiren matris.",
        hint: 'hierarchy',
      },
      {
        title: 'Para Yönetimi Kumbarası',
        prompt:
          'Farklı madeni ve kağıt paraların değer ilişkilerini, bir alışveriş senaryosu üzerinden gösteren pratik yaşam matematiği tablosu.',
        hint: 'list',
      },
      {
        title: 'Geometrik Şekiller Dedektifi',
        prompt:
          'Günlük nesnelerin içine gizlenmiş üçgen, kare, dikdörtgen gibi temel geometrik şekilleri ayıklayan görsel analiz raporu.',
        hint: 'auto',
      },
      {
        title: 'Zaman Kavramı Çarkı',
        prompt:
          'Akrep ve yelkovanın hareketini günlük rutinlerle (kahvaltı, okul, uyku) eşleştiren, soyut zamanı somutlaştıran saat şeması.',
        hint: 'compare',
      },
      {
        title: 'Miktar Karşılaştırma Terazisi',
        prompt:
          'Büyüktür, küçüktür ve eşittir sembollerini (<, >, =) aç bir timsahın ağzı metaforuyla anlatan karşılaştırma diyagramı.',
        hint: 'compare',
      },
      {
        title: 'Problem Çözme Basamakları',
        prompt:
          'Matematik problemini okuma, verilenleri yazma, işlemi seçme ve kontrol etme adımlarını içeren görsel yol haritası.',
        hint: 'sequence',
      },
      {
        title: 'Ritmik Sayma Köprüsü',
        prompt:
          "2'şer, 5'er ve 10'ar ritmik saymayı destekleyen, her adımda atlanan sayıların renklendirildiği görsel köprü yapısı.",
        hint: 'timeline',
      },
    ],
  },
  {
    category: 'DEHB',
    items: [
      {
        title: 'Pomodoro Zaman Yönetimi Saati',
        prompt:
          'Büyük bir ev ödevini minik adımlara bölen (Örn: Hazırlık, 15dk Odaklanma, 5dk Hareket, Bitiş) renk kodlu zaman yönetimi çizelgesi.',
        hint: 'timeline',
      },
      {
        title: 'Etki-Tepki Neden-Sonuç Zinciri',
        prompt:
          'Dürtüsel davranışların (örn: söz kesme) sosyal çevreye etkilerini oklarla bağlayarak gösteren Neden-Sonuç (Etki-Tepki) zinciri.',
        hint: 'list',
      },
      {
        title: 'Önceliklendirme Matrisi',
        prompt:
          "'Acil/Önemli' kavramlarını somutlaştıran, yapılması gereken görevleri 4 farklı bölgede sınıflandıran görsel Eisenhower matrisi.",
        hint: 'compare',
      },
      {
        title: 'Duygu Düzenleme Termometresi',
        prompt:
          'Öfke veya hayal kırıklığı anlarında duygu yoğunluğunu gösteren ve her seviye için derin nefes alma gibi stratejiler sunan termometre.',
        hint: 'auto',
      },
      {
        title: 'Görev Başlama Motoru',
        prompt:
          "Bir işe başlamak için gereken motivasyonu tetikleyecek '3-2-1 Başla' gibi adımları içeren görsel roket kalkış şeması.",
        hint: 'sequence',
      },
      {
        title: 'Çalışma Masası Düzeni',
        prompt:
          'Dikkat dağıtıcı unsurların olmadığı, odaklanmayı artıran ideal çalışma ortamı düzenini anlatan görsel checklist.',
        hint: 'hierarchy',
      },
      {
        title: 'Günlük Rutin Çarkı',
        prompt:
          'Sabah kalkıştan akşam yatışa kadar olan rutinleri, görsel ikonlarla desteklenmiş bir çark üzerinde gösteren günlük planlayıcı.',
        hint: 'timeline',
      },
      {
        title: 'İç Ses Kontrol Paneli',
        prompt:
          'Dikkat dağıldığında veya olumsuz düşünceler geldiğinde iç sesi olumlu ve motive edici hale dönüştüren kontrol paneli diyagramı.',
        hint: 'compare',
      },
      {
        title: 'Aktif Dinleme Radar Sistemi',
        prompt:
          'Biriyle konuşurken göz teması kurma, söz kesmeme ve baş sallama gibi aktif dinleme bileşenlerini radar metaforuyla anlatan şema.',
        hint: 'list',
      },
      {
        title: 'Dikkat Toplama İstasyonları',
        prompt:
          'Ders çalışırken mola verildiğinde yapılabilecek esneme veya su içme gibi kısa dikkat toparlayıcı aktiviteleri listeleyen istasyonlar.',
        hint: 'sequence',
      },
    ],
  },
  {
    category: 'Disgrafi/Karma',
    items: [
      {
        title: '3 Aşamalı Motor Yön Çizgesi',
        prompt:
          '3 satırlı kılavuz çizgiler üzerinde, kalemin tam başlangıç noktası ve kavis yönlerini adım adım öğreten ince motor harf yazım haritası.',
        hint: 'sequence',
      },
      {
        title: '5N1K Hikaye Çatısı',
        prompt:
          'Okuduğunu anlamada kaybolmamak için ana karakter, yer, olay, zaman ve sonuç düğümlerini 5N1K metoduyla bağlayan hiyerarşik zihin haritası.',
        hint: 'hierarchy',
      },
      {
        title: 'Duyusal Regülasyon Termometresi',
        prompt:
          'Çocuğun anlık ruh halini (Aşırı Hareketli, Sakin, Yorgun) temsil eden ve her aşama için bir rahatlama stratejisi sunan görsel duygu termometresi.',
        hint: 'compare',
      },
      {
        title: 'Kalem Tutuş Biyomekaniği',
        prompt:
          'Tripod kalem tutuş pozisyonunu renkli noktalar ve doğru/yanlış karşılaştırmalarıyla anlatan el kasları infografiği.',
        hint: 'compare',
      },
      {
        title: 'Zihin Haritası İskeleti',
        prompt:
          'Dağınık fikirleri organize etmek için merkezde ana konu ve etrafında dallanan alt başlıkları gösteren görsel beyin fırtınası şablonu.',
        hint: 'hierarchy',
      },
      {
        title: 'Cümle Kurma Treni',
        prompt:
          'Özne, tümleç ve yüklem öğelerini birbirine bağlanan tren vagonları olarak modelleyen, yapılandırılmış cümle yazma şeması.',
        hint: 'sequence',
      },
      {
        title: 'Boşluk Bırakma Rehberi',
        prompt:
          'Kelimeler arasında parmak boşluğu bırakma kuralını, görsel bir astronotun uzayda atladığı adımlar metaforuyla anlatan infografik.',
        hint: 'timeline',
      },
      {
        title: 'Paragraf Burgeri',
        prompt:
          'Giriş (üst ekmek), gelişme (köfte/sebze) ve sonuç (alt ekmek) bölümlerini içeren lezzetli bir paragraf yazma modeli.',
        hint: 'list',
      },
      {
        title: 'Görsel Hafıza Kartları',
        prompt:
          'Harflerin ve rakamların nasıl yazıldığını akılda tutmak için onları görsel hikayelere dönüştüren (Örn: S harfi yılan) eşleştirme tablosu.',
        hint: 'auto',
      },
      {
        title: 'Kopya Çekme (Tahtadan Yazma) Stratejisi',
        prompt:
          'Tahtadaki yazıyı deftere geçirirken bakma, aklında tutma ve yazma döngüsünü basitleştiren odaklanma akış diyagramı.',
        hint: 'sequence',
      },
    ],
  },
];
