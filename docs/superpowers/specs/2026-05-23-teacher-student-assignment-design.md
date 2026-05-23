# Öğretmen-Öğrenci Atama Sistemi — Tasarım Dokümanı

## Amaç

Admin/superadmin rollerinin öğretmenlere öğrenci atamasına, öğretmenlerin ise yalnızca kendi öğrencilerini ve atanan öğrencileri görmesine olanak sağlayan eksiksiz bir yetkilendirme sistemi.

## Veri Modeli

### Firestore: `students/{studentId}`

Mevcut alanlara ek:

```ts
assignedTeachers?: string[]  // Öğretmen UID listesi (opsiyonel)
```

Mevcut `teacherId: string` alanı korunur — birincil öğretmen (oluşturan kişi) olarak kalır.
`assignedTeachers` ile çok-öğretmenli atama desteği sağlanır.

### Firestore Sorgu Deseni

```ts
// Öğretmenin görebileceği öğrenciler:
where('teacherId', '==', teacherId)        // kendi öğrencileri
// VE (Firestore OR için iki sorgu):
where('assignedTeachers', 'array-contains', teacherId)  // atanan öğrenciler
```

## Mimari Bileşenler

### 1. Service Katmanı — `teacherService`

| Metod | Açıklama |
|-------|----------|
| `assignStudentToTeacher(teacherId, studentId)` | Tek öğrenciyi öğretmene ata |
| `assignStudentsToTeacher(teacherId, studentIds[])` | Toplu öğrenci atama |
| `removeStudentFromTeacher(teacherId, studentId)` | Atamayı kaldır |
| `getStudentsByTeacher(teacherId)` | `teacherId` + `assignedTeachers` ile öğrencileri getir |

Tüm atama işlemleri `updateDoc` ile `FieldValue.arrayUnion` / `arrayRemove` kullanır.

### 2. Admin UI — Yeni `Öğrenciler` Sekmesi

`AdminDashboard`'a yeni `students` tab'ı eklenir.
`AdminStudentManagement.tsx` bileşeni:
- Tüm öğrencileri listeler
- Her öğrencinin kartında "Öğretmene Ata" butonu
- Butona tıklandığında öğretmen seçim modalı açılır
- Modal içinde arama + öğretmen listesi + atama onayı

### 3. Admin UI — Öğretmen Detayında Öğrenci Atama

`TeacherStudents.tsx`'e "Öğrenci Ata" butonu eklenir:
- Modal ile tüm öğrenciler listelenir (checkbox)
- Seçilen öğrenciler topluca atanır
- `teacherService.assignStudentsToTeacher()` çağrılır

### 4. Admin UI — Öğrenci Önizleme Modalında Atama

`TeacherStudents.tsx` içindeki öğrenci önizleme modalına "Öğretmene Ata" butonu eklenir:
- Modal ile öğretmen listesi gösterilir
- Seçilen öğretmen atanır
- `teacherService.assignStudentToTeacher()` çağrılır

### 5. Görünürlük Filtreleme

`useStudentStore.fetchStudents()` güncellenir:

```ts
fetchStudents: (userId: string, role: UserRole) => {
  if (role === 'superadmin' || role === 'admin') {
    // Tüm öğrenciler (mevcut davranış)
  } else {
    // teacherId === userId VEYA assignedTeachers.includes(userId)
  }
}
```

`StudentDashboard.tsx`'deki `onSnapshot` sorgusu da role göre filtrelenir.

## Rol Bazlı Erişim

| İşlem | superadmin | admin | teacher |
|-------|-----------|-------|---------|
| Tüm öğrencileri gör | ✅ | ✅ | ❌ |
| Kendi öğrencilerini gör | ✅ | ✅ | ✅ |
| Atanan öğrencileri gör | ✅ | ✅ | ✅ |
| Öğretmene öğrenci ata | ✅ | ✅ | ❌ |
| Öğrenciden öğretmen çıkar | ✅ | ✅ | ❌ |

## Bileşen Ağacı

```
AdminDashboard
├── TeacherManagement (mevcut)
│   └── TeacherStudents (mevcut + Öğrenci Ata butonu + modal)
│       └── StudentPreviewModal (mevcut + Öğretmene Ata butonu)
│           └── AssignTeacherModal (yeni — ortak bileşen)
├── AdminStudentManagement (yeni)
│   └── StudentCard (yeni)
│       └── AssignTeacherModal (yeni — ortak bileşen)
```

## Güvenlik

Tüm atama işlemleri client-side'da `useRBAC().isAdmin` kontrolü ile korunur.
Firestore security rules ile de server-side doğrulama yapılabilir.
`assignedTeachers` alanı yalnızca admin/superadmin tarafından yazılabilir.

## Uygulama Sırası

1. `Student` tipine `assignedTeachers?: string[]` ekle
2. `teacherService`'e atama metodlarını ekle
3. `useStudentStore.fetchStudents()`'i role göre filtrele
4. `StudentDashboard` onSnapshot sorgusunu role göre güncelle
5. `AdminStudentManagement.tsx` oluştur
6. AdminDashboard routing + tab'a ekle
7. `TeacherStudents.tsx`'e öğrenci ata butonu + modal ekle
8. `AssignTeacherModal` ortak bileşenini oluştur
9. Build + test
