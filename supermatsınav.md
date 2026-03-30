# Oogmatik | Ultra Creative Studio - Süper Matematik Modülü Entegrasyon Planı (Vite Sürümü)

Bu belge, mevcut "Süper Matematik Sınav Stüdyosu" uygulamasının, Vercel üzerinde barındırılan ve **React + Vite** altyapısını kullanan **oogmatik.vercel.app** projesine entegre edilmesi için hazırlanmış detaylı teknik plandır.

Her iki proje de Vite ve React kullandığı için entegrasyon oldukça pürüzsüz olacaktır. Ancak Vercel üzerinde güvenliği sağlamak için ufak bir backend (Serverless) dokunuşu gerekecektir.

---

## 1. Klasör Yapısı ve Modül İzolasyonu

Modülü, Oogmatik projesinin `src` dizini altında izole bir klasöre (`src/modules/super-matematik`) yerleştirmeliyiz. Ayrıca Vercel'in API yeteneklerini kullanmak için ana dizine bir `api` klasörü ekleyeceğiz.

```text
oogmatik-vite-project/
├── api/                             # Vercel Serverless Functions (Güvenli Backend)
│   └── generate-quiz.ts             # Gemini API çağrısını yapacak Node.js fonksiyonu
├── src/
│   ├── App.tsx                      # Oogmatik Ana Router'ı
│   ├── modules/
│   │   └── super-matematik/         # Sınav Stüdyosu Modülü
│   │       ├── SuperMatematik.tsx   # Modülün Ana Bileşeni
│   │       ├── components/          
│   │       ├── constants/           
│   │       ├── services/            # (geminiService.ts güncellenecek)
│   │       └── types/               
├── package.json
└── vite.config.ts
```

---

## 2. Yönlendirme (Routing) Entegrasyonu

Her iki proje de muhtemelen `react-router-dom` kullanmaktadır. Oogmatik'in ana yönlendirme dosyasına (genellikle `App.tsx` veya `main.tsx`) modülümüzü bir alt rota (nested route) olarak ekleyeceğiz.

**Oogmatik `src/App.tsx` Örneği:**
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
// Modülü içe aktar
import SuperMatematikModule from './modules/super-matematik/SuperMatematik';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Diğer Oogmatik rotaları... */}
        
        {/* Süper Matematik Modülü Rotası */}
        <Route path="/super-matematik/*" element={<SuperMatematikModule />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 3. Güvenlik ve Vercel Serverless API (Kritik Adım)

Vite projelerinde ortam değişkenleri (`VITE_API_KEY`) tarayıcıya ifşa olur. Gemini API anahtarınızı korumak için Vercel'in sunduğu Serverless Functions özelliğini kullanmalıyız.

### A. Vercel Backend Fonksiyonu (`api/generate-quiz.ts`)
Oogmatik projesinin kök dizinine `api` klasörü açıp bu dosyayı ekleyin. Vercel bunu otomatik olarak bir backend API'sine dönüştürür.

```typescript
// api/generate-quiz.ts (Node.js ortamında çalışır)
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // API Anahtarı Vercel Environment Variables'dan güvenle alınır
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const { prompt, schema } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    res.status(200).json({ text: response.text });
  } catch (error) {
    res.status(500).json({ error: 'API Hatası' });
  }
}
```

### B. Frontend Servisinin Güncellenmesi (`src/modules/super-matematik/services/geminiService.ts`)
Modül içindeki servis, artık doğrudan Google SDK'sını çağırmak yerine kendi Vercel API'mize istek atacaktır.

```typescript
// Eski doğrudan SDK çağrısı yerine:
const response = await fetch('/api/generate-quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, schema })
});
const data = await response.json();
const jsonText = (data.text || '').trim();
```

---

## 4. Tailwind CSS ve Stil Birleştirmesi

1. **Tailwind Config:** Süper Matematik modülünün renk paleti ve özel ayarları, Oogmatik'in kök dizinindeki `tailwind.config.js` (veya `.ts`) dosyasına eklenmelidir.
2. **CSS Çakışmaları:** Oogmatik'in global stillerinin (örneğin global `h1`, `p` etiket stilleri) sınav kağıdı görünümünü bozmasını engellemek için, modülün ana bileşenine `super-matematik-wrapper` gibi bir sınıf verip, modül içi stilleri bu sınıf altında izole edebilirsiniz.

---

## 5. Vercel Dağıtım (Deployment) Adımları

1. Kodları Oogmatik'in GitHub/GitLab deposuna (repository) birleştirin (merge).
2. Vercel paneline gidin -> Oogmatik projesini seçin -> **Settings** -> **Environment Variables**.
3. `GEMINI_API_KEY` adında bir değişken oluşturun ve Gemini API anahtarınızı değer olarak yapıştırın. (Kesinlikle `VITE_` öneki kullanmayın, backend'de kalmalı).
4. Vercel'de yeni bir deployment tetikleyin.
5. `oogmatik.vercel.app/super-matematik` adresine giderek modülün ana uygulama içinde sorunsuz çalıştığını test edin.
