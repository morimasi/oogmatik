# Oogmatik - Kusursuz Mesajlaşma Modülü Entegrasyon Planı (v2.0)

Kullanıcı gereksinimlerine, Oogmatik uygulamasının genel mimarisine ve Sıfır Hata Toleransı kuralına dayanılarak genişletilmiş, sistemin diğer parçalarıyla (Profil, Yönetim, RBAC, KVKK) tam entegre Mesajlaşma Modülü planıdır.

## 1. Sistem Entegrasyonu ve Veri Mimarisi Eksikleri (Tamamlanan Analiz)

Sıradan bir mesajlaşma modülünün ötesinde, Oogmatik özel eğitim platformuna özgü aşağıdaki bağlantıların kurulması şarttır:

### A. Rol Tabanlı Erişim ve İletişim Kuralları (RBAC & KVKK)
Projedeki `UserRole` ('admin', 'teacher', 'parent', 'student') yapısına göre sıkı iletişim kuralları (`services/rbac.ts`) uygulanmalıdır. KVKK gereği veri ihlalleri sıfıra indirilmek zorundadır:
- **Admin:** Tüm kullanıcılara genel duyuru yapabilir, destek çağrılarını (Support) yönetebilir.
- **Öğretmen (Teacher):** Sadece atandığı öğrencilerin velileri (`parent`) ve yetkili olduğu öğrencilerle özel iletişim kurabilir.
- **Veli (Parent):** Sadece kendi çocuğunun öğretmeni ve Admin ile iletişim kurabilir. Diğer velileri göremez.
- **Öğrenci (Student):** Modül, yaş grubuna (`AgeGroup`) göre kısıtlanmalı (Örn: 5-7 yaş için modül kapalı, 14+ yaş için sadece öğretmenle akademik iletişim).

### B. Admin Paneli & Denetim (AdminDashboardV2.tsx)
- Otonom yapıya uygun olarak Admin Modülüne **`AdminCommunication.tsx`** sekmesi eklenmelidir.
- Zararlı dil, zorbalık veya spam tespit edilen kelimeleri filtreleyen bir AI Katmanı (Gemini 1.5 Flash ile "Zeminsiz İfadeleri Sansürleme").
- Sistem duyurularının (Broadcast) Firebase üzerinden tüm platforma "Sabitlenmiş Mesaj" olarak iletilmesi.

### C. Profil ve Store Entegrasyonu (`useAuthStore` & `StudentDashboard`)
- Kullanıcının profil işlemleri `useAuthStore` üzerinden alınarak, okundu bilgilerine ve token id'lerine entegre edilecek.
- Öğrenci BEP hedefleri gibi klinik bağlamların konuşulabilmesi için, mesajlaşmaya belge (Öğrenci Raporu) ekleme kısayolları (Deep Integration).

---

## 2. Genişletilmiş Mimari Tasarım ve Dosya Yapısı

```text
src/
├── types/
│   └── messaging.ts             // Sıkı tipler: IMessage, IConversation, IAttachment, QuoteData, ChatMember
├── services/
│   ├── messaging/
│   │   ├── messageService.ts        // Firestore CRUD, onSnapshot (Realtime dinleyici) ve Soft delete
│   │   ├── fileSharingService.ts    // Firebase Storage, Boyut/Format doğrulama, Virüs (Mock) Tarama, Secure Token
│   │   ├── messageScheduler.ts      // 30 gün dolan silinmiş mesajları fiziken temizleme (Admin / Cloud Function)
│   │   └── notificationService.ts   // Native Push API, Toast, Kilit ekranı mahremiyeti
├── store/
│   └── useMessageStore.ts       // Zustand: Aktif sohbet (chatId), Thread durumu, Paginated message cache
└── components/
    ├── Messages/
    │   ├── Core/
    │   │   ├── ConversationList.tsx // Sol bar: Aktif sohbetler, okunmamış rozetleri (Unread badge)
    │   │   ├── ChatWindow.tsx       // Ana ekran: Infinite scroll (Pagination limitleri ile)
    │   │   ├── MessageBubble.tsx    // Gönderici tipi, Alıntı bloğu ve hiyerarşi görünümü
    │   │   └── EnhancedComposer.tsx // Editör: Eklentiler, Emoji, 'Yazıyor...' dinleyicisi
    │   ├── Features/
    │   │   ├── ThreadPanel.tsx      // İkincil panel: Thread edilmiş derin mesajlaşmalar
    │   │   ├── QuoteBlock.tsx       // Alıntı (Üstüne tıklandığında #id via scrollIntoView)
    │   │   └── EditHistory.tsx      // Modal: Düzenlenen (Edited) mesajlar geçmişi
    │   ├── Attachments/
    │   │   ├── MediaGallery.tsx     // MP3 Pleyer, MP4 Video, Resim Tam Ekran
    │   │   └── SafeDocViewer.tsx    // PDF/DOCX güvenli izleme alanı
    │   └── Config/
    │       └── ChatSettings.tsx     // Mute (Sessize alma), Bildirim Tercihleri
    └── Admin/
        └── AdminCommunication.tsx   // [Yeni] AdminDashboardV2'ye eklenecek denetim ve duyuru masası
```

---

## 3. Geliştirme Aşamaları ve Kritik Algoritmalar

### Faz 1: Firestore Şema Kararlılığı ve Güvenlik (Security Rules)
- **Koleksiyon Yapısı:** `conversations/{chatId}/messages/{msgId}` yapısı kullanılacak.
- **Pagination & Offline Destek:** Oogmatik IndexedDB yeteneği (`cacheService.ts`) ile mesajlar offline cache'te tutulacak, sorgular `limit(50)` ve `startAfter` (Infinite Scroll) kullanacak.
- **Firestore Rules:** Katı güvenlik kuralları. Bir sohbete sadece `participants` dizisinde User ID'si olanlar `.read` ve `.write` yapabilir.

### Faz 2: KVKK Uyumlu Medya ve Güvenli Dosya Paylaşımı
- **File Validation & Antivirus:** Backend'de uzantı kontrolü (`.pdf`, `.png`, `.mp4`), mimeType doğrulaması yapılacak. Upload Firebase Storage'a yüklenmeden önce simüle edilmiş bir Antivirüs geçidi test edilecek.
- **Güvenli Erişim:** Hassas rapor vb. dokümanlar için Native İndirme yerine "Token tabanlı tek kullanımlık süreli URL"ler (Signed URL) üretilecek. `AppError` sınıfı kullanılarak hatalar merkezi fırlatılacak.

### Faz 3: Alıntı Hiyerarşisi ve Thread Yönetimi
- **Quote Data:** Bir mesaja alıntı tıklandığında `QuoteData` objesi (Orijinal ID, Ad, Kısa metin) gönderilen mesajın metadata'sına eklenir. `MessageBubble` tıklandığında DOM üzerinde scroll gerçekleştirir.
- **Thread:** Bir thread başlatıldığında objeye `threadId` veya `isReplyTo` işlenir. Ana ekranda kalabalık etmemesi için, replies altına birikip, sağ panelde açılır bir yapı (`ThreadPanel`) planlanır.

### Faz 4: Yönetim (Profil & Admin) Bağlantısı
- **Profile Link:** Kullanıcının üst barında veya Sidebar'ında yeni mesaj geldiğinde Bildirim Noktası (Badge) yanacak (`useMessageStore` - `totalUnread` state).
- **Admin Kontrol Merkezi:** Sistem mesajları atma, raporlanan toksik mesajları inceleme ve uygunsuz içerik filtreleme yetenekleri için `AdminCommunication` bileşenine erişim.

### Faz 5: Native Bildirim / Desktop API
- Kullanıcı tarayıcı dışında da bildirim alsın diye Web Notification API ile entegre edilecek.
- Gelen bildirim formatı: "Elif Öğretmen: Gönderilen ödevler..." (100 karaktere truncate edilir).
- Deep Linking desteği: Bildirime tıklandığında uygulama arka plandan öne çıkarılır, ilgili `chatId` rotası yüklenip (#msgId) vurgulanır.

## 4. Oogmatik Standartlarına Uygunluk Kontrolü
1. **Any Tipi Olmayacak:** Modül içindeki tüm payload'lar Zod (`utils/schemas.ts`) üzerinden geçirilecek. 
2. **AppError:** Tüm try/catch blokları projede standart olan `AppError` fırlatacak. Console.log kalmayacak.
3. **Lexend Font & Premium UI:** "Dark Glassmorphism" stiline sadık kalınacak. Okunabilirliği arttıran kontrast oranları disleksi uyumlu (`Lexend`) olacak.
4. **Test Odaklı:** E2E ve unit testler (Vitest) ile mesaj modülünün işlevi test edilecek.

**Lütfen güncellenen ve ana sistemle %100 senkronize planın uygulanmasına geçilmesi için onayınızı verin.**
