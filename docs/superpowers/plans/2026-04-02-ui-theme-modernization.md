# UI/UX Theme Modernization — Tam Modernizasyon (Seçenek C)

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tüm uygulama bileşenlerinde (Header, Sidebar, ContentArea, Admin, Student modülleri) z-index hiyerarşisini düzeltemek, glassmorphism saydamlık sorununu çözmek ve her tema değiştiğinde tüm UI'ın tam senkronize olmasını sağlamak.

**Architecture:** `index.html` içindeki `--accent-color / --bg-primary` değişken sistemi ile `theme-tokens.css` içindeki `--panel-bg-solid / --surface-glass` sistemi arasındaki çakışmayı, bridge CSS değişkenleri ekleyerek giderilecek. `theme-tokens.css` tüm panel/yüzey renklerini `var(--bg-paper)` üzerinden index.html'ye bağlanacak; böylece tema değişimi her iki sistemi birden güncelleyecek. Tüm bileşenler inline sabit renkler yerine CSS token kullanacak.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

## Sorun Özeti

| Problem | Kök Neden | Etkilenen Dosyalar |
|---------|-----------|-------------------|
| Header menülerin altında kalıyor | AppHeader `z-[90]`, stüdyo containerları `z-[60]` / admin `z-[75]` | AppHeader.tsx, App.tsx |
| Sidebar menü yarı saydam | `glass-panel` class → `background: var(--surface-glass)` + `backdrop-filter` | Sidebar.tsx, theme-tokens.css |
| Tema değişince paneller eski renkte kalıyor | `theme-tokens.css` hardcoded hex (`#0c0c0e`) index.html tema tokenlarına bağlı değil | theme-tokens.css |
| `theme-space` cyberpunk kırmızısı gösteriyor | `.theme-space, .theme-neon, .theme-cyberpunk` bloğu yanlış accent (`--accent-h: 350` = kırmızı) | theme-tokens.css |
| Stüdyo görünümleri `bg-white dark:bg-zinc-900` ile açılıyor | Tailwind dark class, tema token değil | ContentArea.tsx |
| Admin paneller `backdrop-blur-xl` + `from-zinc-900/80` kullanıyor | Hardcoded koyu renkler | AdminAgentManagement.tsx, AdminDraftReview.tsx |
| Student modüller `bg-white/10` + `backdrop-blur` kullanıyor | Yarı-saydam overlay'ler, tema uyumsuz | 5 student modül dosyası |

---

## Dosya Haritası

**Değiştirilecek dosyalar:**
- `src/styles/theme-tokens.css` — Bridge değişkenleri, hatalı grup düzeltmesi, opak surface
- `src/components/AppHeader.tsx` — `relative z-[90]` → `sticky top-0 z-[100]`
- `src/components/Sidebar.tsx` — `glass-panel` → `bg-[var(--panel-bg-solid)] border-r border-[var(--border-color)]`
- `src/components/ContentArea.tsx` — Stüdyo overlay'leri `bg-[var(--bg-primary)]` kullanacak
- `src/App.tsx` — Stüdyo container'da `bg-white dark:bg-zinc-900` → `bg-[var(--bg-primary)]`
- `src/components/AdminDraftReview.tsx` — Glassmorphism → theme token
- `src/components/AdminAgentManagement.tsx` — `from-zinc-900/80 backdrop-blur-xl` → theme token
- `src/components/Student/modules/AIInsightsModule.tsx` — `bg-white/10 backdrop-blur-md` → theme token
- `src/components/Student/modules/BehaviorModule.tsx` — `bg-white/10 backdrop-blur-md` → theme token
- `src/components/Student/modules/OverviewModule.tsx` — `bg-white/10 backdrop-blur-sm` → theme token
- `src/components/Student/modules/PortfolioModule.tsx` — `bg-white/20 backdrop-blur-md` → theme token
- `src/components/Student/modules/IEPModule.tsx` — `backdrop-blur-sm` modal → theme token

---

## Task 1: theme-tokens.css — Bridge Değişkenleri & Hatalı Grup Düzeltmesi

**Files:**
- Modify: `src/styles/theme-tokens.css`

Bu task mevcut iki CSS değişken sistemini köprüler:
- `index.html` → `--accent-color`, `--bg-primary`, `--bg-secondary`, `--bg-paper`, `--surface-glass`
- `theme-tokens.css` → `--panel-bg-solid`, `--panel-bg-subtle`, `--surface-glass`, `--accent-h/s/l`

**Çözüm:** theme-tokens.css'deki her hardcoded hex değeri, index.html sisteminin ilgili değişkeniyle (`var(--bg-paper)` vb.) değiştirilecek.

- [ ] **Step 1: theme-tokens.css `:root` bölümüne bridge computed değişkenleri ekle**

`:root` bloğuna mevcut HSL değişkenlerinin ALTINA ekle:

```css
/* BRIDGE: index.html değişken sistemine computed bağlantı (fallback) */
--accent-color: hsl(var(--accent-h), var(--accent-s), var(--accent-l));
--accent-hover: hsl(var(--accent-h), var(--accent-s), calc(var(--accent-l) - 8%));
--accent-muted: hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.1);
--bg-primary: hsl(var(--bg-h), var(--bg-s), var(--bg-l));
```

**Not:** index.html'deki `:root.theme-X` blokları daha yüksek özgüllük (0,2,0 vs 0,1,0) sayesinde bu computed fallback'leri geçersiz kılacak. Bu değişkenler yalnızca tema class'ı olmayan durumlarda devreye girer.

- [ ] **Step 2: Tüm tema bloklarındaki hardcoded `--panel-bg-solid` ve `--panel-bg-subtle` değerlerini bridge ile değiştir**

Her tema bloğundaki (`.theme-dark`, `.theme-space`, `.theme-ocean`, `.theme-nature`, `.theme-royal`, `.theme-light`) hardcoded hex değerlerini kaldırıp şununla değiştir:

```css
--panel-bg-solid: var(--bg-paper);
--panel-bg-subtle: var(--bg-secondary);
```

**Neden:** index.html `--bg-paper` her tema için doğru panel rengini zaten tanımlıyor (örn: `theme-space` için `rgb(15, 23, 42)` navy blue). Böylece tema değişince panel renkleri otomatik güncellenir.

- [ ] **Step 3: `--surface-glass` değerlerini opak yap**

Her tema bloğundaki `--surface-glass: rgba(...)` değerlerini şununla değiştir:

```css
--surface-glass: var(--bg-paper);
```

`:root` default'unu da güncelle:
```css
--surface-glass: hsl(var(--bg-h), var(--bg-s), calc(var(--bg-l) + 2%));
```

- [ ] **Step 4: Hatalı `.theme-space, .theme-neon, .theme-cyberpunk` grubunu düzelt**

Mevcut grup `.theme-space, .theme-neon, .theme-cyberpunk` tüm bunlara kırmızı/cyberpunk accent atıyor (`--accent-h: 350`). AppTheme type'da bu adların anlamı farklı.

Grubu BÖLEREK:
```css
/* Space Theme */
.theme-space {
  --bg-h: 222;
  --bg-s: 84%;
  --bg-l: 5%;
  --accent-h: 199;
  --accent-s: 89%;
  --accent-l: 57%;   /* sky blue - index.html #38bdf8 ile uyumlu */
  --panel-bg-solid: var(--bg-paper);
  --panel-bg-subtle: var(--bg-secondary);
  --border-color: rgba(56, 189, 248, 0.12);
  --text-primary: #f1f5f9;
  --text-secondary: #7dd3fc;
  --text-muted: #38bdf8;
  --glass-blur: 20px;
  --shadow-premium: 0 15px 45px rgba(0, 0, 0, 0.4);
  --surface-glass: var(--bg-paper);
}
```

- [ ] **Step 5: `theme-anthracite-gold` ve `theme-anthracite-cyber` için ayrı CSS blokları ekle**

Mevcut theme-tokens.css'de bu alt temalar yok (sadece index.html'de var). theme-tokens.css'e panel değişkenlerini içeren bloklar ekle:

```css
.theme-anthracite-gold {
  --bg-h: 30;
  --bg-s: 5%;
  --bg-l: 7%;
  --accent-h: 43;
  --accent-s: 96%;
  --accent-l: 56%;
  --panel-bg-solid: var(--bg-paper);
  --panel-bg-subtle: var(--bg-secondary);
  --border-color: rgba(251, 191, 36, 0.15);
  --text-primary: #fef9ee;
  --text-secondary: #fcd34d;
  --text-muted: #a07f2a;
  --glass-blur: 20px;
  --shadow-premium: 0 15px 50px rgba(0, 0, 0, 0.5);
  --surface-glass: var(--bg-paper);
}

.theme-anthracite-cyber {
  --bg-h: 300;
  --bg-s: 5%;
  --bg-l: 2%;
  --accent-h: 326;
  --accent-s: 100%;
  --accent-l: 60%;
  --panel-bg-solid: var(--bg-paper);
  --panel-bg-subtle: var(--bg-secondary);
  --border-color: rgba(236, 72, 153, 0.2);
  --text-primary: #ffffff;
  --text-secondary: #f9a8d4;
  --text-muted: #ec4899;
  --glass-blur: 20px;
  --shadow-premium: 0 0 30px rgba(236, 72, 153, 0.2);
  --surface-glass: var(--bg-paper);
}
```

- [ ] **Step 6: Build kontrolü**

```bash
cd /home/runner/work/oogmatik/oogmatik && npm run build 2>&1 | tail -20
```

Expected: Başarılı build, CSS uyarısı yok.

- [ ] **Step 7: Commit**

```bash
git add src/styles/theme-tokens.css
git commit -m "fix(theme): bridge CSS variables between index.html and theme-tokens.css, fix theme-space accent, add anthracite sub-theme blocks"
```

---

## Task 2: AppHeader — Z-Index & Sticky Position

**Files:**
- Modify: `src/components/AppHeader.tsx`

AppHeader şu an `relative z-[90]`. ContentArea'daki stüdyo container'lar `z-[60]`, admin view `z-[75]`. Header'ın her zaman üstte olması için `sticky top-0 z-[100]` yapılacak.

- [ ] **Step 1: AppHeader'ın `<header>` elementinin className'ini güncelle**

`src/components/AppHeader.tsx` satır ~112:

```tsx
// ÖNCE:
className={`relative bg-[var(--panel-bg-solid)] border-b border-[var(--border-color)] shadow-premium z-[90] ...`}

// SONRA:
className={`sticky top-0 bg-[var(--panel-bg-solid)] border-b border-[var(--border-color)] shadow-[var(--shadow-premium)] z-[100] ...`}
```

Tam değer:
```tsx
className={`sticky top-0 bg-[var(--panel-bg-solid)] border-b border-[var(--border-color)] shadow-[var(--shadow-premium)] z-[100] transition-all duration-500 ${zenMode ? '-mt-24 opacity-0 pointer-events-none' : 'mt-0 opacity-100'}`}
```

- [ ] **Step 2: Build & commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/AppHeader.tsx
git commit -m "fix(header): sticky top-0 z-[100] — header always above studio views"
```

---

## Task 3: Sidebar — Glassmorphism'den Opak Panel'e

**Files:**
- Modify: `src/components/Sidebar.tsx`

Sidebar şu an `glass-panel` class kullanıyor → `background: var(--surface-glass)` + `backdrop-filter: blur(...)`. Task 1'de `--surface-glass` opak yapıldı, ama `backdrop-filter` hâlâ aktif. Bunu temizleyelim.

- [ ] **Step 1: Sidebar `<aside>` elementinin `glass-panel` class'ını değiştir**

`src/components/Sidebar.tsx` satır ~417:

```tsx
// ÖNCE:
className={`fixed inset-y-0 left-0 z-30 glass-panel transition-all duration-700 ...`}

// SONRA:
className={`fixed inset-y-0 left-0 z-30 bg-[var(--panel-bg-solid)] border-r border-[var(--border-color)] shadow-[var(--shadow-premium)] transition-all duration-700 ...`}
```

- [ ] **Step 2: Build & commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/Sidebar.tsx
git commit -m "fix(sidebar): remove glassmorphism, use solid panel-bg-solid token"
```

---

## Task 4: ContentArea — Studio Overlay'leri Tema Token Kullanacak

**Files:**
- Modify: `src/components/ContentArea.tsx`

ContentArea'daki stüdyo overlay'leri (`assessment`, `screening`, `sinav-studyosu`, `mat-sinav-studyosu`) `bg-white dark:bg-zinc-900` kullanıyor. Tema değişince bu overlay'ler tema rengini yansıtmıyor.

- [ ] **Step 1: 4 stüdyo overlay div'inin bg class'larını güncelle**

Satırlar ~438, ~457, ~475, ~489 — her birinde:

```tsx
// ÖNCE:
className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] overflow-y-auto"

// SONRA:
className="absolute inset-0 bg-[var(--bg-primary)] z-[60] overflow-y-auto"
```

- [ ] **Step 2: Build & commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/ContentArea.tsx
git commit -m "fix(content-area): studio overlays use bg-primary token instead of hardcoded bg-white/zinc-900"
```

---

## Task 5: App.tsx — Studio Container Tema Token

**Files:**
- Modify: `src/App.tsx`

App.tsx satır ~822'deki büyük stüdyo container div'i `bg-[var(--bg-primary)]` zaten kullanıyor — bu zaten doğru. Kontrol et ve gerekirse sabit dark background varsa düzelt.

- [ ] **Step 1: App.tsx satır 822'yi kontrol et ve `bg-[var(--bg-primary)]` olduğunu doğrula**

```bash
grep -n "absolute inset-0 bg-" src/App.tsx
```

Eğer `bg-white` veya `bg-zinc-900` varsa `bg-[var(--bg-primary)]` ile değiştir.

- [ ] **Step 2: Sidebar overlay backdrop'unu kontrol et (z-40, md:hidden)**

Satır ~743-745: `bg-black/50 z-40` — bu mob sidebar overlay, header'ın altında kaldığı için OK. Değiştirme.

- [ ] **Step 3: Build & commit**

```bash
npm run build 2>&1 | tail -5
git add src/App.tsx
git commit -m "fix(app): verify studio container uses bg-primary token"
```

---

## Task 6: AdminDraftReview — Glassmorphism Temizliği

**Files:**
- Modify: `src/components/AdminDraftReview.tsx`

Bu admin bileşeni `bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl`, `bg-white/50 dark:bg-zinc-950/20` gibi saydam ve sabit koyu renkler kullanıyor.

- [ ] **Step 1: Sol panel ve header glassmorphism'i değiştir**

Satır ~77-78 (sol panel):
```tsx
// ÖNCE:
<div className="w-80 border-r border-zinc-200 dark:border-white/5 flex flex-col bg-white dark:bg-black/20">
  <div className="p-8 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/10">

// SONRA:
<div className="w-80 border-r border-[var(--border-color)] flex flex-col bg-[var(--panel-bg-solid)]">
  <div className="p-8 border-b border-[var(--border-color)] bg-[var(--panel-bg-subtle)]">
```

- [ ] **Step 2: Sağ panel ve içerik alanı glassmorphism'i değiştir**

Satır ~116, ~120 (sağ panel):
```tsx
// ÖNCE:
<div className="flex-1 flex flex-col bg-white/50 dark:bg-zinc-950/20 overflow-hidden">
  <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl">

// SONRA:
<div className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-hidden">
  <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--panel-bg-solid)]">
```

- [ ] **Step 3: İçerik kartları içindeki sabit renkler**

Satır ~144, ~163 (içerik kartları):
```tsx
// ÖNCE:
<div className="p-8 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 ...">
<div className="space-y-6 bg-white dark:bg-zinc-900 p-10 rounded-[3rem] shadow-2xl border-2 border-zinc-100 dark:border-white/5 ...">

// SONRA:
<div className="p-8 bg-[var(--panel-bg-subtle)] rounded-[2.5rem] border border-[var(--border-color)] ...">
<div className="space-y-6 bg-[var(--panel-bg-solid)] p-10 rounded-[3rem] shadow-[var(--shadow-premium)] border-2 border-[var(--border-color)] ...">
```

- [ ] **Step 4: Refinement overlay backdrop**

Satır ~164 (isRefining overlay):
```tsx
// ÖNCE:
<div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/80 backdrop-blur-sm ...">

// SONRA:
<div className="absolute inset-0 z-10 bg-[var(--panel-bg-solid)]/80 backdrop-blur-sm ...">
```

- [ ] **Step 5: Tag/chip bileşenler**

Satır ~219, ~228 (tag chips):
```tsx
// ÖNCE:
<span ... className="px-3 py-1 bg-white dark:bg-zinc-800 ... border dark:border-zinc-700 rounded-lg text-indigo-500 ...">

// SONRA:
<span ... className="px-3 py-1 bg-[var(--panel-bg-subtle)] ... border border-[var(--border-color)] rounded-lg text-[var(--accent-color)] ...">
```

- [ ] **Step 6: Build & commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/AdminDraftReview.tsx
git commit -m "fix(admin-draft-review): replace glassmorphism with theme tokens"
```

---

## Task 7: AdminAgentManagement — Dark Hardcoded Renkleri Temizle

**Files:**
- Modify: `src/components/AdminAgentManagement.tsx`

Bu bileşen admin paneli için kullanılıyor ve dark-only hardcoded renkler içeriyor.

- [ ] **Step 1: Root container ve header'ı güncelle**

Satır ~201, ~203:
```tsx
// ÖNCE:
<div className="min-h-screen bg-[#0a0a0c] text-white font-['Lexend']">
  <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">

// SONRA:
<div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-['Lexend']">
  <div className="bg-[var(--panel-bg-solid)] border-b border-[var(--border-color)] sticky top-0 z-50">
```

- [ ] **Step 2: Agent kart bileşenlerindeki glassmorphism**

Satır ~84 (agent card):
```tsx
// ÖNCE:
className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 backdrop-blur-xl p-8 ..."

// SONRA:
className="group relative overflow-hidden rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--panel-bg-solid)] p-8 ..."
```

- [ ] **Step 3: Tab/stats kartları**

Satırlar ~260, ~322, ~331:
```tsx
// ÖNCE:
className="rounded-[2.5rem] p-6 border backdrop-blur-xl"
className="rounded-[2.5rem] bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8"

// SONRA:
className="rounded-[2.5rem] p-6 border border-[var(--border-color)] bg-[var(--panel-bg-subtle)]"
className="rounded-[2.5rem] bg-[var(--panel-bg-subtle)] border border-[var(--border-color)] p-8"
```

- [ ] **Step 4: Modal overlay**

Satır ~351:
```tsx
// ÖNCE:
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">

// SONRA:
<div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6">
```

- [ ] **Step 5: Build & commit**

```bash
npm run build 2>&1 | tail -5
git add src/components/AdminAgentManagement.tsx
git commit -m "fix(admin-agent): replace hardcoded dark colors with theme tokens"
```

---

## Task 8: Student Modules — bg-white/10 & backdrop-blur Temizliği

**Files:**
- Modify: `src/components/Student/modules/AIInsightsModule.tsx`
- Modify: `src/components/Student/modules/BehaviorModule.tsx`
- Modify: `src/components/Student/modules/OverviewModule.tsx`
- Modify: `src/components/Student/modules/PortfolioModule.tsx`
- Modify: `src/components/Student/modules/IEPModule.tsx`

Bu modüller Student görünümlerinin iç panelleri. Tema token'larına geçince tüm temalarla uyumlu olacaklar.

**Genel replace stratejisi:**

| Eski Class | Yeni Class |
|-----------|-----------|
| `bg-white/10 backdrop-blur-md` | `bg-[var(--panel-bg-subtle)]` |
| `bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm` | `bg-[var(--panel-bg-subtle)] rounded-3xl border border-[var(--border-color)]` |
| `bg-white dark:bg-zinc-900` | `bg-[var(--panel-bg-solid)]` |
| `bg-zinc-50 dark:bg-black/50` | `bg-[var(--bg-primary)]` |
| `border border-white/10` | `border border-[var(--border-color)]` |
| `border-zinc-200 dark:border-zinc-800` | `border-[var(--border-color)]` |
| `bg-zinc-50 dark:bg-zinc-800` | `bg-[var(--panel-bg-subtle)]` |
| `bg-white/20 backdrop-blur-md` (hover overlay) | `bg-[var(--panel-bg-solid)]/80` |
| `text-zinc-900 dark:text-white` | `text-[var(--text-primary)]` |
| `text-zinc-500` | `text-[var(--text-muted)]` |
| `text-zinc-600 dark:text-zinc-300` | `text-[var(--text-secondary)]` |

- [ ] **Step 1: AIInsightsModule.tsx — `bg-white/10 backdrop-blur-md` değiştir**

Satır ~47:
```tsx
// ÖNCE: <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl">
// SONRA: <div className="w-14 h-14 rounded-2xl bg-[var(--panel-bg-subtle)] flex items-center justify-center border border-[var(--border-color)] shadow-xl">
```

Satır ~57:
```tsx
// ÖNCE: <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
// SONRA: <div className="p-6 bg-[var(--panel-bg-subtle)] rounded-3xl border border-[var(--border-color)]">
```

Diğer satırlardaki `bg-white dark:bg-zinc-900` → `bg-[var(--panel-bg-solid)]` ve `border-zinc-200 dark:border-zinc-800` → `border-[var(--border-color)]`

- [ ] **Step 2: BehaviorModule.tsx**

Satır ~133: `bg-white/10 backdrop-blur-md rounded-full border border-white/10` → `bg-[var(--panel-bg-subtle)] rounded-full border border-[var(--border-color)]`

Satır ~142: `bg-white/5 rounded-full` → `bg-[var(--panel-bg-subtle)] rounded-full`

Diğer `bg-white dark:bg-zinc-900` → `bg-[var(--panel-bg-solid)]` replace.

- [ ] **Step 3: OverviewModule.tsx**

Satır ~80: `bg-white/10 rounded-full border border-white/10 backdrop-blur-sm` → `bg-[var(--panel-bg-subtle)] rounded-full border border-[var(--border-color)]`

Satır ~91: `bg-white/5 rounded-2xl border border-white/5` → `bg-[var(--panel-bg-subtle)] rounded-2xl border border-[var(--border-color)]`

Diğer `bg-white dark:bg-zinc-900` → `bg-[var(--panel-bg-solid)]`, `border-zinc-200 dark:border-zinc-800` → `border-[var(--border-color)]`

- [ ] **Step 4: PortfolioModule.tsx**

Satır ~38: `bg-zinc-900/60 group-hover:opacity-100 backdrop-blur-sm` → `bg-[var(--panel-bg-solid)]/80 group-hover:opacity-100`

Satır ~39-44 (hover butonlar): `bg-white/20 backdrop-blur-md` → `bg-[var(--panel-bg-subtle)]`

Satır ~50: `bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md` → `bg-[var(--panel-bg-solid)]`

- [ ] **Step 5: IEPModule.tsx**

Satır ~163: `bg-zinc-50 dark:bg-black/50` → `bg-[var(--bg-primary)]`

Satır ~166: Modal overlay — `bg-black/50 backdrop-blur-sm` → `bg-black/70` (modal overlay'de backdrop-blur kabul edilebilir, kaldırmaya gerek yok)

Satır ~167: Modal içi — `bg-white dark:bg-zinc-900` → `bg-[var(--panel-bg-solid)]`, `border-zinc-200 dark:border-zinc-800` → `border-[var(--border-color)]`

Satır ~246, ~323: Benzer modal/card değişiklikleri

IEPModule'deki tab butonu satır ~150-155: `bg-white dark:bg-zinc-900` → `bg-[var(--panel-bg-subtle)]`, `border-zinc-100 dark:border-zinc-800` → `border-[var(--border-color)]`

- [ ] **Step 6: Build tüm değişikliklerle**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build başarılı, TypeScript hatası yok.

- [ ] **Step 7: Commit**

```bash
git add src/components/Student/modules/
git commit -m "fix(student-modules): replace glassmorphism and hardcoded dark colors with theme tokens"
```

---

## Task 9: Son Doğrulama & Build

- [ ] **Step 1: Tam build çalıştır**

```bash
cd /home/runner/work/oogmatik/oogmatik && npm run build 2>&1
```

Expected: 0 error, yalnızca uyarılar kabul edilebilir.

- [ ] **Step 2: Lint çalıştır**

```bash
npm run lint 2>&1 | tail -20
```

Expected: Yeni ESLint hatası yok.

- [ ] **Step 3: Test çalıştır**

```bash
npm run test:run 2>&1 | tail -20
```

Expected: Tüm mevcut testler geçiyor (UI değişiklikleri business logic test etmiyor).

- [ ] **Step 4: Doğrulama kontrol listesi**

```
□ theme-tokens.css'de `--panel-bg-solid: var(--bg-paper)` tüm tema bloklarında var
□ theme-tokens.css'de `.theme-space` sky blue accent kullanıyor (--accent-h: 199)
□ theme-tokens.css'de `.theme-anthracite-gold` ve `.theme-anthracite-cyber` blokları eklendi
□ AppHeader.tsx `sticky top-0 z-[100]` kullanıyor
□ Sidebar.tsx `glass-panel` yerine `bg-[var(--panel-bg-solid)]` kullanıyor
□ ContentArea.tsx studio overlay'leri `bg-[var(--bg-primary)]` kullanıyor
□ AdminDraftReview.tsx `backdrop-blur-xl` kaldırıldı
□ AdminAgentManagement.tsx `bg-[#0a0a0c]` → `bg-[var(--bg-primary)]` değiştirildi
□ Student modülleri `bg-white/10` → `bg-[var(--panel-bg-subtle)]` değiştirildi
□ npm run build ✓
□ npm run test:run ✓
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(ui): full theme modernization — z-index hierarchy, opaque panels, token sync across all components"
```

---

## Teknik Notlar

### CSS Özgüllük Tablosu

| Kaynak | Selector | Özgüllük | Kazanan mı? |
|--------|----------|-----------|-------------|
| index.html | `:root` | 0,1,0 | Fallback (CSS load sırasına göre) |
| theme-tokens.css | `:root` | 0,1,0 | Son yüklenen kazanır |
| index.html | `:root.theme-dark` | 0,2,0 | ✅ Tema override kazanır |
| theme-tokens.css | `.theme-dark` | 0,1,0 | Yalnızca index.html'de tanımlanmayan vars için |

### Z-Index Hiyerarşisi (Sonuç Durumu)

| Katman | Z-Index | Bileşen |
|--------|---------|---------|
| Modaller | 100-10000 | PrintPreview, Settings, ActivityImporter |
| **Header** | **100** | **AppHeader — STICKY** |
| Admin View | 75 | App.tsx studio container (admin) |
| Studio Views | 60 | App.tsx studio container, ContentArea overlays |
| Toolbar | 60 | Toolbar.tsx |
| Sidebar mobile | 30 | Sidebar.tsx |
| Sidebar backdrop | 40 | App.tsx mobile overlay |

### `--surface-glass` Kullanım Notu

`glass-panel` CSS class'ı (`backdrop-filter: blur(...)` içeriyor) hâlâ `theme-tokens.css`'de mevcut ve Worksheet gibi başka bileşenlerde kullanılıyor. Sidebar'da bu class kaldırıldı ancak diğer yerlerde aynı class korunuyor — `--surface-glass` token'ı artık opak olduğu için `backdrop-filter` etkisiz kalacak ama DOM'a zarar vermez.
