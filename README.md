# Oogmatik

Oogmatik, yapay zeka destekli etkinlik ve çalışma sayfası üretimi için geliştirilmiş bir web uygulamasıdır.
Proje; içerik üretimi, düzenleme, önizleme, yazdırma ve yönetim ekranlarını tek bir React uygulaması içinde sunar.

## Amaç

- Öğretmenler, uzmanlar ve içerik üreticileri için hızlı çalışma kağıdı üretimi
- Farklı etkinlik türleri için modüler bileşen mimarisi
- AI destekli üretim akışlarını mevcut editör/önizleme altyapısına entegre etmek

## Teknoloji Yığını

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Firebase (Auth/Firestore)
- Vitest + Testing Library

## Proje Yapısı

Depo içinde kademeli bir mimari geçişi olduğu için hem kök klasörde hem de src altında benzer alanlar bulunabilir.

Temel dizinler:

- api: Vercel serverless fonksiyonları ve API uçları
- src: Güncel istemci tarafı bileşenleri, stiller ve yardımcılar
- components: Eski/taşınma sürecindeki bileşenler
- services, utils, hooks, store: Uygulama servisleri ve paylaşılan mantık
- tests: Test dosyaları
- docs: Teknik dokümantasyon ve planlar

## Gereksinimler

- Node.js 20+
- npm 10+

## Kurulum

```bash
npm install
```

## Ortam Değişkenleri

Uygulama Vite yapılandırması üzerinden bazı değişkenleri istemciye tanımlar.

Gerekli başlıca değişkenler:

- API_KEY
- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID

Yerelde çalışmak için proje köküne .env dosyası oluşturup değerleri ekleyin.

## Komutlar

```bash
# geliştirme sunucusu
npm run dev

# production build
npm run build

# build önizleme
npm run preview

# lint
npm run lint

# format
npm run format

# test (watch)
npm run test

# test (tek çalıştırma)
npm run test:run
```

## Geliştirme Notları

- Path alias: @/* -> src/*
- Çıktı paketleme: vendor chunk ayırımı yapılandırılmıştır
- Bazı modüller kök dizin ve src altında paralel olarak bulunabilir; yeni geliştirmelerde src önceliklendirilmelidir

## Dağıtım

Proje Vercel uyumlu olacak şekilde yapılandırılmıştır.

Önerilen akış:

1. Ortam değişkenlerini Vercel proje ayarlarına ekleyin.
2. main branch'e push edin.
3. Vercel otomatik build/deploy sürecini tamamlasın.

## Güvenlik

- Hassas anahtarları repoya commit etmeyin.
- API anahtarlarını sadece ortam değişkenleri üzerinden yönetin.
- Ayrıntılı politika için SECURITY.md dosyasını inceleyin.

## Katkı

1. Yeni bir branch oluşturun.
2. Değişikliği yapın ve testleri çalıştırın.
3. Commit mesajını açık ve kısa yazın.
4. Pull request açın.

## Lisans

Depoda ayrı bir lisans dosyası bulunmuyorsa tüm haklar saklıdır yaklaşımı geçerlidir. Açık kaynak lisanslama planlanıyorsa LICENSE dosyası eklenmelidir.