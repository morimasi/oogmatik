# Ultra Professional Clock & Money Activities Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Clock Reading and Money Counting activities to be ultra-professional, compact, and optimized for A4 printing.

**Architecture:** 
- Enhance `AnalogClock` in `common.tsx` with numbers and ticks.
- Refactor `clockReading.ts` and `financialMath.ts` generators for better precision and distractor logic.
- Optimize `ClockReadingSheet.tsx` and `MoneyCountingSheet.tsx` renderers for A4 grid layouts (15 clocks / 8 wallets).

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Vitest

---

### Task 1: Enhance AnalogClock Component

**Files:**
- Modify: `src/components/sheets/common.tsx`

- [ ] **Step 1: Read existing component**
- [ ] **Step 2: Add `showNumbers` and `showTicks` support to `AnalogClock`**

```typescript
// src/components/sheets/common.tsx

export const AnalogClock = ({
  hour,
  minute,
  className,
  showHands = true,
  showNumbers = true,
  showTicks = true,
}: {
  hour: number;
  minute: number;
  className?: string;
  showNumbers?: boolean;
  showTicks?: boolean;
  showHands?: boolean;
}) => {
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const isHour = i % 5 === 0;
    const angle = (i * Math.PI) / 30;
    const x1 = 50 + (isHour ? 42 : 45) * Math.sin(angle);
    const y1 = 50 - (isHour ? 42 : 45) * Math.cos(angle);
    const x2 = 50 + 48 * Math.sin(angle);
    const y2 = 50 - 48 * Math.cos(angle);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={isHour ? 1.5 : 0.5} />;
  });

  const numbers = Array.from({ length: 12 }).map((_, i) => {
    const num = i + 1;
    const angle = (num * Math.PI) / 6;
    const x = 50 + 36 * Math.sin(angle);
    const y = 50 - 36 * Math.cos(angle);
    return (
      <text
        key={num}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="8"
        fontWeight="bold"
        fontFamily="Lexend"
      >
        {num}
      </text>
    );
  });

  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="white" stroke="black" strokeWidth="2" />
      {showTicks && ticks}
      {showNumbers && numbers}
      {showHands && (
        <>
          <line
            x1="50"
            y1="50"
            x2={50 + 25 * Math.sin(((hour + minute / 60) * Math.PI) / 6)}
            y2={50 - 25 * Math.cos(((hour + minute / 60) * Math.PI) / 6)}
            stroke="black"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="50"
            x2={50 + 35 * Math.sin((minute * Math.PI) / 30)}
            y2={50 - 35 * Math.cos((minute * Math.PI) / 30)}
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      <circle cx="50" cy="50" r="2.5" fill="black" />
    </svg>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sheets/common.tsx
git commit -m "feat(ui): enhance AnalogClock with numbers and ticks"
```

---

### Task 2: Upgrade Clock Reading Generator

**Files:**
- Modify: `src/services/offlineGenerators/clockReading.ts`
- Test: `tests/generators/clockReading.test.ts` (create if missing)

- [ ] **Step 1: Update generator with rich Turkish verbal support and precision**

```typescript
// Update verbalTime logic in clockReading.ts
const getVerbalTime = (hour: number, minute: number): string => {
  const hourWords = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz", "On", "On Bir", "On İki"];
  const h = hour % 12 || 12;
  const nextH = (h % 12) + 1;
  
  if (minute === 0) return `Saat tam ${hourWords[h]}`;
  if (minute === 30) return `${hourWords[h]} buçuk`;
  if (minute === 15) return `${hourWords[h]}ı çeyrek geçiyor`;
  if (minute === 45) return `${hourWords[nextH]}e çeyrek var`;
  
  if (minute < 30) return `${hourWords[h]}ı ${minute} geçiyor`;
  return `${hourWords[nextH]}e ${60 - minute} var`;
};
```

- [ ] **Step 2: Support precision levels and itemCount=15**
- [ ] **Step 3: Verify with tests**
- [ ] **Step 4: Commit**

---

### Task 3: Optimize Clock Reading Sheet for A4

**Files:**
- Modify: `src/components/sheets/math/ClockReadingSheet.tsx`

- [ ] **Step 1: Fix grid to 3x5 for 15 clocks**
- [ ] **Step 2: Adjust clock size to `w-28 h-28`**
- [ ] **Step 3: Refine styling for "Ultra Prof" look**
- [ ] **Step 4: Commit**

---

### Task 4: Upgrade Money Counting Generator

**Files:**
- Modify: `src/services/offlineGenerators/financialMath.ts`

- [ ] **Step 1: Increase itemCount to 8**
- [ ] **Step 2: Improve distractor logic (ensure variety and realistic options)**
- [ ] **Step 3: Commit**

---

### Task 5: Ultra Professional Money Counting Sheet

**Files:**
- Modify: `src/components/sheets/math/MoneyCountingSheet.tsx`

- [ ] **Step 1: Enhance `MoneyIcon` with realistic Turkish Lira colors**

```typescript
const MONEY_COLORS: Record<number, { bg: string, border: string, text: string }> = {
    200: { bg: 'bg-[#f5d0e9]', border: 'border-[#b666a3]', text: 'text-[#8b3d75]' }, // Violet
    100: { bg: 'bg-[#d0e5f5]', border: 'border-[#66a3b6]', text: 'text-[#3d758b]' }, // Blue
    50: { bg: 'bg-[#f5e0d0]', border: 'border-[#b68a66]', text: 'text-[#8b5a3d]' },  // Orange
    20: { bg: 'bg-[#d0f5d5]', border: 'border-[#66b670]', text: 'text-[#3d8b45]' },  // Green
    10: { bg: 'bg-[#f5d0d0]', border: 'border-[#b66666]', text: 'text-[#8b3d3d]' },  // Red
    5: { bg: 'bg-[#e5e5e5]', border: 'border-[#999999]', text: 'text-[#666666]' },   // Grey/Indigo
};
```

- [ ] **Step 2: Update Grid to 2x4 for 8 items**
- [ ] **Step 3: Compact visual layout for A4**
- [ ] **Step 4: Commit**

---

### Task 6: Final Verification

- [ ] **Step 1: Build project**
- [ ] **Step 2: Run all tests**
- [ ] **Step 3: Verify A4 print layout in browser**
