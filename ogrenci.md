# Oogmatik - Premium Öğrenci Yönetim Stüdyosu (v2.0)

## Genel Bakış

Mevcut parçalı ve hantal (bloated) "Öğrencilerim" modülü, özel eğitim, klinik takip ve akademik yönetimin tek ekrandan (360-derece) sağlanabildiği profesyonel, entegre ve yüksek performanslı **Premium Öğrenci Yönetim Stüdyosu**'na dönüştürülmüştür.

Eski yapıda bulunan ve performansı düşüren gereksiz `FinancialModule`, `BehaviorModule`, `AttendanceModule`, `SettingsModule` gibi birbirinden kopuk çok sayıda dosya sistemden temizlenmiştir. Yeni mimari; tek sayfa uygulaması (SPA) akıcılığında, "Dark Glassmorphism" UX trendlerine uygun ve rol bazlı güvenlik standartlarına sahip bütünleşik bir stüdyo olarak tasarlanmıştır.

---

## Mimari Kararlar ve Geliştirmeler

### 1. Performans ve Kod Temizliği (Refactoring)

- **Gereksiz Modüllerin Silinmesi:** Finans, Yoklama vb. gibi Oogmatik'in ana eğitsel misyonundan uzaklaşan, sistemi hantallaştıran 10'a yakın alt bileşen (`modules/` klasörü altındakiler) tamamen silindi.
- **Tek Merkezli Mimari:** Modüller arası state aktarımı zorluğunu aşmak için tüm öğrenci operasyonları `AdvancedStudentManager.tsx` içerisine entegre edildi.
- **Hızlı Yükleme:** Bileşen, `App.tsx` üzerinde React.lazy ile yüklenerek sistem ilk açıldığında bellekte yük oluşturması engellendi. Sadece "Öğrencilerim" menüsüne tıklandığında yüklenir.

### 2. Kapsamlı Öğrenci Profili (360 Derece Görünüm)

Öğrencinin her verisi birbiriyle konuşur hale getirildi. Seçilen bir öğrencinin sayfasında 5 ana sekme üzerinden tam kontrol sağlandı:

1. **Dashboard (Özet):** AI Öngörüsü (Bilişsel gelişim tahmini), son etkinlik sayıları, genel ilerleme çubukları, ilgi alanları ve tanı grupları.
2. **Materyaller (Arşiv):** Öğrenci için bugüne kadar üretilmiş tüm PDF çalışma kağıtları ve AI etkinliklerinin listelendiği arşiv. Tıklandığında doğrudan ilgili stüdyoda açılır.
3. **Bilişsel Analiz:** Geçmiş değerlendirmelere (`SavedAssessment`) dayanarak Radar ve Line grafikleriyle çocuğun dikkat, görsel algı vb. konulardaki gelişimi.
4. **Akademik Plan (BEP/IEP):** Günlük/Haftalık atanmış hedeflerin, "Eğitim Yol Haritası" üzerinden takibi ve yüzde (%) bazlı başarı grafiği.
5. **Klinik Notlar:** Özel eğitim uzmanı veya öğretmenin doğrudan tarih damgalı, otomatik kaydedilen vaka gözlemleri tutabildiği serbest metin alanı.

### 3. Gelişmiş Veri ve Sınıf Yönetimi

- **Dinamik Gruplama:** Sol taraftaki öğrenci listesi (Sidebar) artık `Sınıf`, `Yaş` veya `Tümü` şeklinde dinamik klasörlenebilir (Accordion yapısında). Öğretmen kendi sınıflarını çok rahat yönetebilir.
- **Hızlı Filtreleme:** İsim veya numaraya göre anında arama (Search) yapabilme eklendi.
- **Gelişmiş Form:** Öğrenci ekleme ekranı (Modal), `Kimlik`, `Akademik`, `Veli` olarak 3 adımda profesyonel bir Wizard'a dönüştürüldü. İlgi alanları (Uzay, Arabalar vb.) ve güçlükler anında etiket (tag) olarak eklenebilmektedir.

### 4. Rol Bazlı Erişim ve Güvenlik (RBAC)

`useStudentStore.ts` üzerindeki veri çekme (`fetchStudents`) fonksiyonu doğrudan `useAuthStore`'daki role (`authStore.role`) göre yetkilendirildi.

- **Öğretmen / Uzman Rolü:** Yalnızca kendi oluşturduğu (veya atandığı) öğrencilerin listesini ve verilerini görür. Veritabanı sorgusu `where('teacherId', '==', user.id)` şeklinde sınırlandırılmıştır.
- **Admin Rolü:** Tüm sistemdeki öğrencileri (gerekirse öğretmenleri de yönetmek adına) sınırlama olmaksızın listeleyebilir ve müdahale edebilir.

---

## Veri Modelleri (Types)

### `Student` (Temel Yapı)

```typescript
interface Student {
  id: string;
  teacherId: string;
  name: string;
  age: number;
  grade: string;
  avatar: string;
  diagnosis: string[];
  interests: string[];
  strengths: string[];
  weaknesses: string[];
  learningStyle: 'Görsel' | 'İşitsel' | 'Kinestetik' | 'Karma';
  parentName?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  createdAt: string;
}
```

_Genişletilmiş özellikler `AdvancedStudent` ve `StudentPrivacySettings` (KVKK uyumu) aracılığıyla `types/student-advanced.ts` dosyasında korunarak, gerektiğinde alt modüllerde genişletilebilir şekilde bırakıldı._

---

## Nasıl Kullanılır? (Kullanım Kılavuzu)

1. **Öğrenci Ekleme:** Sol menüdeki "+" ikonuna basıldığında açılan Premium Modal üzerinden öğrencinin temel kimlik, tanı ve öğrenme stilleri girilir. Öğrencinin ilgi alanları (Örn: "Dinozorlar") girilerek, yapay zeka hikaye üreticisinin bu kelimeleri kullanması sağlanır.
2. **Öğrenci Değiştirme:** Sol menüdeki listeden Sınıfa veya Yaşa göre gruplanmış öğrencilerden birine tıklandığında anında profil değişir (Sayfa yenilenmez).
3. **Analiz İnceleme:** Bilişsel Analiz sekmesine tıklandığında, sistem öğrencinin eski raporlarını tarar ve zayıf olduğu yönleri radar grafikte göstererek öğretmene otomatik tavsiyelerde bulunur.
4. **Çalışma Atama:** "Materyaller" sekmesinden önceden bu öğrenciyle çalışılmış materyaller açılabilir. Herhangi bir stüdyoda etkinlik üretirken sağ üstten "Kitapçığa Ekle" diyerek seçili öğrenci için fasikül oluşturulabilir.

---

**Tasarım Dili Notu:** Bütün bileşenlerde Tailwind CSS ile `bg-zinc-900`, `backdrop-blur`, `glass-panel` ve `shadow-2xl` sınıfları harmanlanarak Oogmatik Premium teması sağlanmıştır. Karanlık mod ile tam uyumludur.
