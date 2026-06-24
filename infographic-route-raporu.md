# infographic-studio Route Analizi

## 1. Sidebar'da view tanımı: VAR
- `src/components/Sidebar.tsx:117` — `'infographic-studio'` case'i `onOpenInfographicStudio()` çağırıyor
- `src/components/Sidebar.tsx:129` — view string mapping: `'infographic-studio'` → `'infographic-studio'`
- `src/components/Sidebar.tsx:53` — prop tanımı: `onOpenInfographicStudio?: () => void`
- `src/constants/studios.ts:91` — studio listesinde `id: 'infographic-studio'` tanımlı

## 2. App.tsx'te Sidebar'a props eksik
- `App.tsx:526-552` — `<Sidebar>` bileşenine şu `onOpen*` propları geçiliyor: `onOpenOCR`, `onOpenCurriculum`, `onOpenReadingStudio`, `onOpenMathStudio`, `onOpenSuperTurkce`, `onOpenActivityStudio`, `onOpenScreening`, `onOpenSinavStudyosu`, `onOpenMatSinavStudyosu`, `onOpenSariKitapStudio`, `onOpenKelimeCumleStudio`, `onOpenFascicleStudio`
- **`onOpenInfographicStudio` hiç geçilmiyor** → Sidebar'da tıklanınca `typeof` guard'ı true olmuyor, callback çalışmıyor

## 3. App.tsx render bloğu (AnimatePresence): satır 587-737
- Array (588-604): `['curriculum', 'reading-studio', 'math-studio', 'super-turkce', 'activity-studio', 'ocr', 'profile', 'students', 'admin', 'screening', 'sinav-studyosu', 'mat-sinav-studyosu', 'sari-kitap-studio', 'kelime-cumle-studio', 'fascicle-studio']`
- **`'infographic-studio'` listede YOK**
- Conditional render blokları (614-733): `currentView === 'infographic-studio'` diye bir blok yok

## 4. Eksik route: İKİ AŞAMALI
### Aşama 1 — Sidebar callback prop'u eklenmeli
`App.tsx:541-542` satırları arasına:
```tsx
onOpenInfographicStudio={() => handleOpenStudio('infographic-studio')}
```

### Aşama 2 — Render bloğuna route eklenmeli
`App.tsx:603` (array sonu) satırında `'fascicle-studio'` sonrasına `'infographic-studio'` eklenmeli.

Sonra `App.tsx:732` (`'fascicle-studio'` bloğu sonu) ile `App.tsx:734` (`</Suspense>`) arasına:
```tsx
{currentView === 'infographic-studio' && (
  <ProtectedRoute module="infographic-studio" onBack={() => navigateTo('generator')}>
    <React.Suspense fallback={<LoadingPlaceholder />}>
      {/* TODO: InfographicStudio component */}
      <SuperStudio />
    </React.Suspense>
  </ProtectedRoute>
)}
```

## 5. Önerilen çözüm: Seçenek A (SuperStudio'ya yönlendir)
- Ayrı bir `InfographicStudio` bileşeni henüz mevcut değil (sadece `InfographicRenderer.tsx` var)
- `SuperStudio` Türkçe dil etkinlikleri için kapsamlı bir studio — infografik üretimi SuperStudio'nun yetenek alanına giriyor
- **Öneri**: `infographic-studio` route'unu geçici olarak `SuperStudio`'ya yönlendir (`super-turkce` view'ına redirect et), ileride ayrı bir InfographicStudio geliştirilirse route eklenir

Ek not: Sidebar width koşulu (521) zaten `'infographic-studio'` içeriyor — sidebar'ı gizleme kısmı hazır.
