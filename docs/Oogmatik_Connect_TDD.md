# Oogmatik Connect — Teknik Tasarım Belgesi (TDD)

## 📋 Genel Bakış
Oogmatik platformu için tasarlanan, düşük kaynak tüketimli (Heli-Type) mesajlaşma ve etkinlik paylaşım modülüdür. Amacı, öğretmen ve veli arasındaki iletişimi veri odaklı bir akışa (Stream) dönüştürmektir.

## 🛠️ Mimari Prensipler
1.  **Maliyet Etkinliği**: Sadece en son mesajları yükleyerek Firestore okuma sayısını (read count) minimize eder.
2.  **Optimistic UI**: Mesajlar, veri tabanı onayı beklenmeden ekrana yansıtılır.
3.  **Referans Odaklı Paylaşım**: Etkinlikler kopyalanmaz; sadece `worksheetId` veya `activityId` referanslarıyla paylaşılır.
4.  **Hafif Yükleme**: Mesajlaşma modülü `React.lazy` ile sadece tıklandığında yüklenir.

## 🗄️ Veri Şeması (Firestore)

### `messages` Koleksiyonu (Sub-collection under Students or Global)
```typescript
interface Message {
  id: string;
  senderId: string;
  senderRole: 'teacher' | 'parent';
  text?: string;
  timestamp: Timestamp;
  attachment?: {
    type: 'activity' | 'assessment' | 'file' | 'image';
    id: string; // Referans ID (örn: worksheetId)
    url?: string;
    metadata?: Record<string, any>;
  };
}
```

## 🚀 Performans Stratejisi
-   **Kalıcı Listener Yönetimi**: Sadece modül açıkken `onSnapshot` aktiftir. Modül kapandığında dinleyici (listener) anında imha edilir (cleanup).
-   **Zustand Storage**: Mesajların son hali yerel bellekte tutulur (Persistence), böylece her sekme geçişinde veri tabanına gidilmez.
-   **Batching**: Birden fazla mesaj/etkinlik paylaşıldığında atomik işlemler kullanılır.

## 🎨 Tasarım Standartları
-   **Glassmorphism Lite**: `backdrop-blur: 8px` ve `bg-white/5` kombinasyonu.
-   **Micro-interactions**: Gönderim sonrası hafif "pop" efekti ve etkinlik kartları üzerinde "Hover-Preview".
