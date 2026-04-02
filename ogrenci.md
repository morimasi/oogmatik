# Oogmatik Öğrenci Yönetimi ve Teknik Mimari Dokümantasyonu

Bu doküman, Oogmatik platformunun öğrenci merkezli yapısını, pedagojik temelini ve teknik mimari kararlarını detaylandırmaktadır.

## 1. Mimari Genel Bakış

Oogmatik, **Modüler Stüdyo Mimarisi** üzerine kurulmuştur. Her eğitim alanı (Matematik, Okuma, Yazarlık vb.) bağımsız birer "Stüdyo" olarak tasarlanmıştır.

### Katmanlar
- **Frontend**: React 18 + TypeScript (Strict Mode).
- **State Yönetimi**: Zustand (Zentralize edilmiş 10 farklı store).
- **Stil Sistemi**: HSL tabanlı dinamik tema motoru + Tailwind CSS.
- **AI Engine**: Google Gemini 2.5 Flash (Kişiselleştirilmiş içerik üretimi).
- **Veri Katmanı**: Firebase Firestore (Senkronizasyon) + IndexedDB (Çevrimdışı Önbellek).

## 2. Veri Modelleri

### Öğrenci Profili (`StudentProfile`)
```typescript
interface StudentProfile {
  id: string;
  name: string;
  age: number;
  grade: string;
  disabilityProfile: 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed';
  bepGoals: BEPGoal[]; // Bireyselleştirilmiş Eğitim Planı hedefleri
  progressScores: Record<string, number>;
}
```

### Aktivite Çıktısı (`ActivityOutput`)
```typescript
interface ActivityOutput {
  items: any[];
  pedagogicalNote: string; // Öğretmen için metodolojik açıklama
  targetSkills: string[];
  difficultyLevel: 'Kolay' | 'Orta' | 'Zor';
}
```

## 3. Pedagojik İlkeler (Elif Yıldız & Dr. Ahmet Kaya)

- **ZPD (Yakınsal Gelişim Alanı)**: Etkinlikler, öğrencinin mevcut seviyesinin tam bir adım üzerinde, başarabileceği zorlukta üretilir.
- **Disleksi Dostu Tasarım**:
  - `Lexend` yazı tipi (harf karışıklığını önler).
  - Geniş satır aralığı (1.6 - 2.0).
  - Yüksek kontrastlı ama göz yormayan renk paletleri.
  - Opak arka planlar (görsel gürültüyü minimize eder).

## 4. Kullanım Kılavuzu

### Yeni Aktivite Oluşturma
1. Sol menüden bir kategori seçin (Örn: Süper Türkçe).
2. Öğrenci profilini seçin veya manuel kriterleri belirleyin.
3. "Yapay Zeka ile Üret" butonuna basın.
4. Çıktıyı A4 editöründe özelleştirin.

### Kitapçık Oluşturma
Aktiviteleri "Kitapçığa Ekle" butonu ile biriktirip, en sonunda toplu PDF olarak dışa aktarabilirsiniz.

## 5. Responsive Yapı ve Erişilebilirlik

Platform; mobil, tablet ve masaüstü cihazlarda kusursuz çalışacak şekilde **Breakpoint-Aware** (Kırılma noktasına duyarlı) tasarlanmıştır.
- **Mobil**: Tek sütun, büyük dokunmatik alanlar.
- **Tablet**: Sidebar daraltılabilir, içerik odaklı görünüm.
- **Desktop**: Çok sütunlu editör ve araç çubukları.

---
*Hazırlayan: Oogmatik AI Ekip Koordinasyonu (Sprint 5)*
