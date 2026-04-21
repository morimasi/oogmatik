# Öğrenci Atama Sistemi: Mimari ve Uygulama Planı (Epic Task)

Bu belge, Oogmatik platformunda üretilen etkinliklerin veya çalışma kağıtlarının öğrencilere atanmasını sağlayan büyük ölçekli altyapı değişikliğinin "Öğrenci Atama Sistemi" tasarım detaylarını içerir. Bu plan öğrenci bazlı içerik özelleştirmesini (BEP hedeflerine uyum), rol bazlı güvenliği (RBAC/MEB normları) ve arayüz entegrasyonunu sağlamayı amaçlar.

## Mevcut Durum vs Hedeflenen Durum

*   **Mevcut Durum:** Öğretmen veya Admin ilgili stüdyoda bir PDF üretir, taslağa kaydeder veya PDF olarak export eder. Öğrencilere atanmış veya izlenebilir bir durum yoktur. Her öğrencinin performansı dışarıdan manuel takip edilir.
*   **Hedeflenen Durum:** 
    *   Öğretmen, hazırlanan veya hazır olan bir etkinliği anlık olarak belli öğrenci(ler)ye "atayabilir" (`Assign`).
    *   Öğrenci arayüzünde (veya öğretmen dashboard'unda) o öğrenciye atanmış görevler sekmesi/listesi bulunur.
    *   Performans ve tamamlama verisi (Assignment durumları) veritabanında tutulur, ileride öğrencinin BEP (Bireyselleştirilmiş Eğitim Programı) modeliyle entegre edilebilir.

---

## Önerilen Mimari Model

Bu özelliği iki yeni domain ile yöneteceğiz:
1.  **Assignments (Atamalar):** Çalışma kağıdı (Worksheet) ile Öğrenci arasındaki ilişki `ActivityAssignment` objesi altında tutulacaktır. 
2.  **Student Service:** Zaten var olan `student-advanced.ts` üzerine assignment yapısı bindirilecek.

### 1. Veritabanı Şeması (Firestore)

Yeni Koleksiyon (Collection): `assignments`

```typescript
// types/assignment.ts
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';

export interface ActivityAssignment {
  id: string; // Firebase Doc ID
  worksheetId: string; // Atanan çalışma kağıdının ID'si
  studentId: string; // Atanan öğrencinin ID'si
  assignedBy: string; // Atamayı yapan öğretmenin/adminin ID'si
  assignedAt: string; // ISO Date String
  dueDate?: string; // İsteğe bağlı bitiş/tamamlama hedef tarihi
  status: AssignmentStatus; // Atamanın mevcut durumu
  statusUpdatedAt: string; // Durumun son değiştiği tarih
  
  // Puan, öğrenci notu, süre vb.
  score?: number; 
  teacherNotes?: string; // Öğretmenden notlar (KVKK Uyumlu olmalı!!)
}
```

### 2. Arayüz (UI) Güncellemeleri

#### A. Öğrenci Seçici (Student Selector Modal / Dropdown)
*   **Bileşen:** `components/Student/AssignModal.tsx`
*   **İşlev:** Öğretmen sınıfındaki veya yetkili olduğu öğrencileri listeleyecek. Çoklu ("Select All") seçim destekleyecek.

#### B. Atama Dashboard'u (Öğretmen / Admin Paneli)
*   **Bileşen:** `components/Student/AssignmentList.tsx`
*   Atanan çalışma kağıdının hangi öğrenciler tarafından bitirildiği gösterilecek bir Data Table.

#### C. Öğrenci Paneli / Performans
*   Öğrenci ekranında veya öğretmen gözünden öğrencinin durum ekranına "Görevleri" (`components/Student/StudentDashboard.tsx`) sekmesi eklenecek.

---

## Uygulama Adımları (Plan)

### Aşama 1: Veri Katmanı
*   `types/assignment.ts` oluşturulacak.
*   `services/assignmentService.ts` oluşturularak Firestore entegrasyonu (create, getByStudent, vb.) eklenecek.
*   `store/useAssignmentStore.ts` oluşturularak UI state yönetimi sağlanacak.

### Aşama 2: Yönetim Arayüzleri
*   `components/Student/AssignModal.tsx` oluşturulacak.
*   `components/WorkbookView.tsx` veya `GeneratorView.tsx` içindeki araç çubuğuna (Toolbar) entegre edilecek.

### Aşama 3: Görüntüleme ve Takip
*   `components/Student/StudentDashboard.tsx` ve `components/Student/AssignmentList.tsx` güncellenerek öğrenciye atanan veriler listelenecek.
