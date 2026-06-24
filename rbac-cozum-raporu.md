# RBAC İkili Sistem Çakışması (C-3) — Analiz Raporu

**Analist:** Gizem Başar  
**Tarih:** 2026-06-24  
**Kapsam:** `oogmatik/` altındaki RBAC dosyaları

---

## 1. İsim Çakışması Detayı

**Kritik çakışma:** İki farklı dosya da `rbacService` adında export yapıyor:

| Dosya | Export | Tür |
|-------|--------|-----|
| `src/services/rbac.ts` (eski) | `export const rbacService = { ... }` | Düz nesne (object literal) — fonksiyon koleksiyonu |
| `src/services/rbacService.ts` (yeni) | `export const rbacService = new RBACService()` | Class instance — stateful servis |

Bu ikisi **tamamen farklı API'ler** sunar:

- **Eski `rbacService`**: `hasRole()`, `hasPermission()`, `getUserRole()`, `canPerformAction()`, `enforcePermission()`, `getPermissions()`, `getAllRoles()`, `hasHigherPrivilege()`
- **Yeni `rbacService`**: `initialize()`, `getSettings()`, `saveSettings()`, `resetToDefaults()`, `getAllModules()`, `canAccessModule()`, `hasPermission()`, `canAccessCategory()`, `canAccessActivity()`

Ayrıca `Permission` tipi farklı:
- **Eski**: `'create:worksheet' | 'read:worksheet' | ...` (action:resource formatı)
- **Yeni**: `'view' | 'create' | 'edit' | 'delete' | 'manage' | 'approve' | 'export' | 'assign'` (salt action)

---

## 2. Eski Sistemi Kullanan Dosyalar

### Servis import'u (`rbac.ts`)
| Dosya | Import | Kullanım |
|-------|--------|----------|
| `src/middleware/permissionValidator.ts` | `hasPermission`, `hasRole`, `UserRole`, `Permission` from `../services/rbac.js` | `requirePermission()`, `requireRole()` middleware'leri |
| `api/worksheets.ts` | `hasPermission` from `../src/services/rbac.js` | API endpoint yetki kontrolü |
| `api/progress.ts` | `hasPermission` from `../src/services/rbac.js` | API endpoint yetki kontrolü |
| `tests/RBAC.test.ts` | `@/services/rbac` | Test dosyası |

### Tip import'u (`types/rbac` — eski tipler)
| Dosya | Import |
|-------|--------|
| `src/components/ProtectedRoute.tsx` | `PermissionModule` from `../types/rbac` |
| `src/components/Sidebar.tsx` | `PermissionModule` from `../types/rbac` |
| `src/components/Profile/index.tsx` | `PermissionModule` from `../../types/rbac` |
| `src/components/Student/AdvancedStudentManager.tsx` | `PermissionModule` from `../../types/rbac` |

---

## 3. Yeni Sistemi Kullanan Dosyalar

### Servis import'u (`rbacService.ts`)
| Dosya | Import |
|-------|--------|
| `src/hooks/useRBAC.ts` | `rbacService` from `../services/rbacService` |
| `src/components/AdminPermissionsIDE.tsx` | `rbacService` from `../services/rbacService` |
| `src/components/Admin/AdvancedRBACPanel.tsx` | `rbacService` from `../../services/rbacService` |
| `src/App.tsx` | `rbacService` from `./services/rbacService` |
| `src/components/AdminDashboard/PermissionsIDE.tsx` | `rbacService` from `../../services/rbacService` |
| `src/components/AdminDashboard/PermissionManager.tsx` | `useRBAC` (hook üzerinden yeni sistemi kullanır) |

### Tip import'u (`types/rbac-advanced` — yeni tipler)
| Dosya | Import |
|-------|--------|
| `src/hooks/useRBAC.ts` | `PermissionModule`, `PermissionAction` from `../types/rbac-advanced` |
| `src/services/rbacService.ts` | `RBACSettings`, `buildDefaultRBAC`, `PermissionModule`, `PermissionAction`, `ALL_MODULES` |
| `src/components/AdminPermissionsIDE.tsx` | `PermissionModule`, `PermissionAction`, `RBACSettings`, `MODULE_LABELS` |
| `src/components/Admin/AdvancedRBACPanel.tsx` | `buildDefaultRBAC`, `RBACSettings`, `CategoryPermission`, `ActivityPermission`, `MODULE_LABELS` |
| `src/components/AdminDashboard/PermissionsIDE.tsx` | Çeşitli `rbac-advanced` tipleri |
| `src/types/index.ts` | Re-export eder, **ambiguity çözümü**: `rbac-advanced` tiplerine öncelik verir (satır 40-48) |

---

## 4. Tip Uyumsuzluğu Analizi

### Aynı isimdeki tipler — farklı şekillerde tanımlanmış

| Tip | `rbac.ts` | `rbac-advanced.ts` | Fark |
|-----|-----------|---------------------|------|
| `PermissionAction` | Yok (sadece `Permission`) | `'view'\|'create'\|'edit'\|...` | Eski sistemde farklı tip adı |
| `PermissionModule` | Aynı değerler | Aynı değerler | İçerik aynı |
| `ModulePermission` | `{ module, enabled, actions, categoryPermissions? }` | Aynı + `customSettings?` | Yeni `customSettings` alanı var |
| `RolePermissions` | `{ role, modules }` | Aynı + `globalSettings?` | Yeni `globalSettings` alanı var |
| `RBACSettings` | `{ roles, globalSettings }` (4 alan) | Aynı + `auditLoggingEnabled` | Yeni 5. alan var |

`types/index.ts` (satır 40-48) bu ambiguity'i `rbac-advanced` lehine çözer — yani `import { PermissionModule } from '../types'` yapanlar otomatik olarak yeni tipi alır.

**Ancak:** `ProtectedRoute`, `Sidebar`, `Profile/index`, `AdvancedStudentManager` doğrudan `../types/rbac`'den import eder, `../types` veya `../types/rbac-advanced`'den değil. Bu durumda TypeScript eski tip tanımını kullanır.

---

## 5. Geçiş Planı (Adım Adım)

### Aşama 1: API katmanı — eski servis bağımlılığını kaldır (ÖNCELİK: YÜKSEK)

1. **`src/middleware/permissionValidator.ts`**
   - `import { hasPermission, hasRole, UserRole, Permission } from '../services/rbac.js'` → sil
   - Yeni `rbacService`'i import et: `import { rbacService } from '../services/rbacService'`
   - `requirePermission()`: `hasPermission()` çağrısını `rbacService.hasPermission()` ile değiştir (imza farklı: artık `(role, module, action)` formatında)
   - `requireRole()`: `hasRole()` çağrısını ya `rbacService` üzerinden ya da rbac.ts'den sadece `hasRole`'u tutarak çöz

2. **`api/worksheets.ts`** ve **`api/progress.ts`**
   - `hasPermission` import'unu güncelle
   - Yeni imzaya göre düzenle — modül+action bazlı kontrol yap

3. **`tests/RBAC.test.ts`**
   - Testleri yeni API'ye göre güncelle

### Aşama 2: Tip import'larını standartlaştır (ÖNCELİK: ORTA)

4. **`src/components/ProtectedRoute.tsx`**
   - `import { PermissionModule } from '../types/rbac'` → `import { PermissionModule } from '../types/rbac-advanced'`

5. **`src/components/Sidebar.tsx`**
   - Aynı değişiklik

6. **`src/components/Profile/index.tsx`**
   - Aynı değişiklik

7. **`src/components/Student/AdvancedStudentManager.tsx`**
   - Aynı değişiklik

### Aşama 3: Eski sistemi devre dışı bırak (ÖNCELİK: DÜŞÜK — son adım)

8. **`src/services/rbac.ts`**
   - `rbacService` export'unu kaldır (ya da tamamen dosyayı sil)
   - Eğer `hasRole()` gibi yardımcı fonksiyonlar hala API'lerde kullanılıyorsa, onları da yeni sisteme taşı

9. **`src/types/rbac.ts`**
   - Dosyayı sil (tüm tipler `rbac-advanced.ts`'de zaten mevcut)
   - `src/types/index.ts`'den `export * from './rbac'` satırını kaldır

### Aşama 4: Doğrulama

10. `npm run build` ile TypeScript kontrolü
11. `npm run test:run` ile testleri çalıştır
12. RBACSettings Firestore migration'unu test et (eski şema → yeni şema uyumu)

---

## 6. Öncelik Sırası Özeti

| Sıra | Dosya | Neden Kritik? |
|------|-------|---------------|
| 1 | `permissionValidator.ts` | **Canlı API güvenliği** — eski sistemden besleniyor, yanlış yetki kontrolü yapabilir |
| 2 | `api/worksheets.ts` | Canlı API endpoint'i |
| 3 | `api/progress.ts` | Canlı API endpoint'i |
| 4 | `tests/RBAC.test.ts` | Testler güncel değilse regresyon yakalanamaz |
| 5 | `ProtectedRoute.tsx` | Kullanıcı tarafında erişim kontrolü, tip uyumsuzluğu riski |
| 6 | `Sidebar.tsx` | Navigasyon yetkilendirmesi |
| 7 | `Profile/index.tsx` | Kullanıcı profili erişim kontrolü |
| 8 | `AdvancedStudentManager.tsx` | Öğrenci yönetim paneli |
| 9 | `services/rbac.ts` silme | Eski sistem tamamen devre dışı |
| 10 | `types/rbac.ts` silme + index.ts temizliği | Temizlik adımı |

---

## 7. Ek Notlar

- `src/types/index.ts` (satır 40-48) zaten `rbac-advanced` tiplerini önceliklendiriyor — bu iyi bir mimari karar, korunmalı.
- `rbac.ts`'deki `UserRole` (`'admin'|'teacher'|'parent'|'student'`) ile yeni sistemdeki `UserRole` (ayrı tip dosyası `types/user.ts`) farklı olabilir — `permissionValidator.ts` eski `UserRole`'ü kullanırken, `rbacService.ts` `types/user`'dan `UserRole` import eder. Bu da ayrı bir uyumsuzluktur.
- Yeni `rbacService` stateful (settings'i bellekte tutar) ve `initialize()` çağrısı gerektirir. Eski sistem ise tamamen stateless'ti. Migration'da bu fark gözetilmeli.
