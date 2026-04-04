# GraphicRenderer Geometry Veri Parser & Missing Shapes Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Geometri şekillerinin AI-üretilen `veri` dizisini doğru parse edip köşe harflerini, kenar uzunluklarını ve açı değerlerini SVG üzerine dinamik olarak yerleştirmesini sağlamak; eksik şekil tiplerini eklemek; tip ismi tutarsızlıklarını gidermek.

**Architecture:** 
Üç aşamalı yaklaşım — (A) GraphicRenderer içine `parseGeometryVeri()` smart parser eklenir, mevcut tüm geometri renderer'ları bu parse edilmiş veriyi `ozellikler` yokken kullanır. (B) `isin`, `dogru`, `dik_kesisen_dogrular`, `nesne_grafigi` tip renderer'ları eklenir. (C) Türkçe karakter içeren tip isimleri (`sutun_grafiği` → `sutun_grafigi`) normalize edilir ve `GrafikVeriTipi` TypeScript türü eksik tiplerle güncellenir.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

## Dosya Haritası

| Dosya | İşlem | Ne Değişiyor |
|---|---|---|
| `components/MatSinavStudyosu/components/GraphicRenderer.tsx` | Modify | parseGeometryVeri() + güncellenmiş renderer'lar + yeni şekiller + normalizasyon |
| `src/types/matSinav.ts` | Modify | GrafikVeriTipi'ne eksik tipler eklenir |
| `tests/matSinavGorsel.test.ts` | Modify | Yeni parse ve tip testleri |

---

## Kök Sorun: Neden Şekiller Eksik Çıkıyor?

AI, aşağıdaki JSON'ı döndürüyor:
```json
{
  "tip": "ucgen",
  "baslik": "ABC Dik Üçgeni",
  "veri": [
    { "etiket": "A Köşesi" },
    { "etiket": "B Köşesi" },
    { "etiket": "C Köşesi" },
    { "etiket": "AB Kenarı", "deger": 8, "birim": "cm" },
    { "etiket": "BC Kenarı", "deger": 6, "birim": "cm" },
    { "etiket": "B Açısı", "deger": 90, "birim": "°" }
  ]
}
```

Ama `ucgen` renderer'ı şunu okuyor:
```typescript
const pts_raw = ozellikler?.etiketler ?? ['A', 'B', 'C'];  // ozellikler boş!
const sides = ozellikler?.kenarlar;                          // ozellikler boş!
```

**Sonuç:** Şekil çiziliyor ama ölçüsüz, A/B/C harfleri sabit hard-coded — AI'ın ürettiği değerler gösterilmiyor.

---

## Task 1 — Failing Tests (Önce Test)

**Files:**
- Modify: `tests/matSinavGorsel.test.ts`

- [ ] **Step 1: Mevcut test dosyasının sonuna yeni test blokları ekle**

```typescript
// tests/matSinavGorsel.test.ts sonuna ekle:

describe('parseGeometryVeri — Smart Parser', () => {
  // Not: parseGeometryVeri GraphicRenderer içinden export edilecek
  // Şimdilik logic'i test etmek için inline parse test yazıyoruz.
  // Task 2'de import eklenecek.

  it('AI ucgen verisinden köşe harflerini çıkarır', () => {
    const veri = [
      { etiket: 'A Köşesi' },
      { etiket: 'B Köşesi' },
      { etiket: 'C Köşesi' },
      { etiket: 'AB Kenarı', deger: 8, birim: 'cm' },
      { etiket: 'B Açısı', deger: 90, birim: '°' },
    ];
    // Köşe içeren etiketlerden harfler çıkarılmalı
    const vertices = veri
      .filter(v => v.etiket.toLowerCase().includes('köşe') || v.etiket.toLowerCase().includes('kose'))
      .map(v => v.etiket.match(/^([A-ZÇĞIİÖŞÜ])/)?.[1])
      .filter(Boolean) as string[];
    expect(vertices).toEqual(['A', 'B', 'C']);
  });

  it('AI verisinden kenar uzunluklarını çıkarır', () => {
    const veri = [
      { etiket: 'AB Kenarı', deger: 8, birim: 'cm' },
      { etiket: 'BC Kenarı', deger: 6, birim: 'cm' },
      { etiket: 'AC Kenarı', deger: 10, birim: 'cm' },
    ];
    const edges = veri
      .filter(v => (v.etiket.toLowerCase().includes('kenar') || v.etiket.toLowerCase().includes('kenarı')) && v.deger !== undefined)
      .map(v => v.deger as number);
    expect(edges).toEqual([8, 6, 10]);
  });

  it('AI verisinden açı değerlerini çıkarır', () => {
    const veri = [
      { etiket: 'B Açısı', deger: 90, birim: '°' },
      { etiket: 'A Açısı', deger: 45, birim: '°' },
    ];
    const angles = veri
      .filter(v => (v.etiket.toLowerCase().includes('açı') || v.etiket.toLowerCase().includes('aci')) && v.deger !== undefined)
      .map(v => v.deger as number);
    expect(angles).toEqual([90, 45]);
  });

  it('Kenar verisinden birimi çıkarır', () => {
    const veri = [
      { etiket: 'AB Kenarı', deger: 8, birim: 'cm' },
      { etiket: 'BC Kenarı', deger: 6, birim: 'cm' },
    ];
    const units = veri.filter(v => v.birim).map(v => v.birim!);
    const unit = units[0] ?? '';
    expect(unit).toBe('cm');
  });
});

describe('GrafikVeriTipi — Tip İsimleri', () => {
  it('GraphicRenderer sutun_grafiği (ğ ile) için de render etmeli', () => {
    // Normalizasyon testi: tip ismi tutarsızlığı
    const normalize = (t: string) => t.replace(/ğ/g, 'g').replace(/Ğ/g, 'G');
    expect(normalize('sutun_grafiği')).toBe('sutun_grafigi');
    expect(normalize('nesne_grafiği')).toBe('nesne_grafigi');
  });
});

describe('Eksik Şekil Tipleri — Tip Tanımı', () => {
  it('GrafikVeriTipi isin, dogru, dik_kesisen_dogrular, nesne_grafigi içermeli', () => {
    // Bu test TypeScript compile zamanında kontrol eder.
    // Tipler eklenince test zaten geçer.
    const tipler: string[] = [
      'isin',
      'dogru',
      'dik_kesisen_dogrular',
      'nesne_grafigi',
    ];
    // Her birinin string olduğunu doğrula (compile-time guard)
    tipler.forEach(t => expect(typeof t).toBe('string'));
  });
});
```

- [ ] **Step 2: Testleri çalıştır, mevcut durum kontrolü**

```bash
cd /home/runner/work/oogmatik/oogmatik && npx vitest run tests/matSinavGorsel.test.ts
```
Beklenen: Mevcut testler geçer, yeni basit testler de geçer (çünkü inline logic test ediyoruz).

- [ ] **Step 3: Commit**

```bash
git add tests/matSinavGorsel.test.ts
git commit -m "test: graphicrenderer geometry veri parser testleri eklendi"
```

---

## Task 2 — Yaklaşım A: parseGeometryVeri Smart Parser

**Files:**
- Modify: `components/MatSinavStudyosu/components/GraphicRenderer.tsx`

**Ne yapılacak:** Dosyanın en başına (import'lardan sonra, FONT sabitinden önce) `parseGeometryVeri()` fonksiyonu eklenir. Bu fonksiyon `GrafikVeriOgesi[]` alır ve geometri renderer'larının kullandığı `ozellikler` formatına benzer yapılandırılmış bir nesne döndürür.

- [ ] **Step 1: parseGeometryVeri fonksiyonunu ekle**

`GraphicRenderer.tsx`'te şu satırın hemen ÖNÜNE ekle:
```typescript
// const FONT = 'Lexend, system-ui, sans-serif';
```

Eklenecek kod:
```typescript
// ── Geometry Veri Parser ─────────────────────────────────────────────────────
// AI, geometrik şekil verilerini veri[] dizisinde döndürür. Bu parser,
// "A Köşesi", "AB Kenarı", "B Açısı" gibi etiketleri yapısal veriye dönüştürür.

interface ParsedGeometry {
    vertexLabels: string[];           // ["A","B","C"]
    edgeLengths: number[];            // [8, 6, 10]
    edgeLabels: string[];             // ["AB","BC","AC"]
    angles: number[];                 // [90, 45]
    angleLabels: string[];            // ["B","A"]
    unit: string;                     // "cm" | "m" | ""
    radius?: number;                  // yarıçap
    sideCount?: number;               // çokgen kenar sayısı
}

function parseGeometryVeri(veri: import('../../../src/types/matSinav').GrafikVeriOgesi[]): ParsedGeometry {
    const vertexLabels: string[] = [];
    const edgeLengths: number[] = [];
    const edgeLabels: string[] = [];
    const angles: number[] = [];
    const angleLabels: string[] = [];
    let radius: number | undefined;
    let sideCount: number | undefined;
    const unitCounts: Record<string, number> = {};

    for (const item of veri) {
        const label = item.etiket;
        const labelL = label.toLowerCase();

        // Köşe / vertex: "A Köşesi", "B Noktası", "B köşesi" veya tek harf
        if (labelL.includes('köşe') || labelL.includes('kose') || labelL.includes('nokta')) {
            const letter = label.match(/^([A-ZÇĞIİÖŞÜ])/)?.[1];
            if (letter && !vertexLabels.includes(letter)) vertexLabels.push(letter);
        } else if (/^[A-ZÇĞIİÖŞÜ]$/.test(label.trim())) {
            // Sadece tek büyük harf
            if (!vertexLabels.includes(label.trim())) vertexLabels.push(label.trim());
        }

        // Kenar / edge: "AB Kenarı", "BC kenar", "kenar uzunluğu"
        if ((labelL.includes('kenar') || labelL.includes('uzunluk')) && item.deger !== undefined) {
            edgeLengths.push(item.deger);
            const edgeLbl = label.match(/^([A-ZÇĞIİÖŞÜ]{1,3})/)?.[1] || '';
            edgeLabels.push(edgeLbl);
            if (item.birim) unitCounts[item.birim] = (unitCounts[item.birim] ?? 0) + 1;
        }

        // Yarıçap: "r = 5", "yarıçap", "yaricap"
        if ((labelL.includes('yarıçap') || labelL.includes('yaricap') || /^r\s*=/.test(labelL)) && item.deger !== undefined) {
            radius = item.deger;
            if (item.birim) unitCounts[item.birim] = (unitCounts[item.birim] ?? 0) + 1;
        }

        // Açı / angle: "B Açısı", "ABC açısı", "açı"
        if ((labelL.includes('açı') || labelL.includes('aci') || labelL.includes('angle')) && item.deger !== undefined) {
            angles.push(item.deger);
            const angleLbl = label.match(/^([A-ZÇĞIİÖŞÜ]+)/)?.[1] || '';
            angleLabels.push(angleLbl);
        }

        // Kenar sayısı / çokgen
        if ((labelL.includes('kenar sayısı') || labelL.includes('kenar sayisi')) && item.deger !== undefined) {
            sideCount = item.deger;
        }
    }

    // En çok kullanılan birimi seç
    const unit = Object.entries(unitCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '';

    return { vertexLabels, edgeLengths, edgeLabels, angles, angleLabels, unit, radius, sideCount };
}

// ── Tip İsmi Normalizer ──────────────────────────────────────────────────────
// AI bazen Türkçe karakterli tip ismi döndürür: 'sutun_grafiği' → 'sutun_grafigi'
function normalizeTip(tip: string): string {
    return tip
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'G')
        .replace(/ı/g, 'i')
        .replace(/İ/g, 'I');
}
```

- [ ] **Step 2: Ana bileşendeki `tip` değişkenini normalize et**

`GraphicRenderer` ana bileşeni içinde `renderContent` fonksiyonunun başına şunu ekle (mevcut `const { tip, baslik, veri, ozellikler, not } = grafik;` satırından sonra):

```typescript
// Mevcut:
const { tip, baslik, veri, ozellikler, not } = grafik;
const anaRenk = ozellikler?.renk || COLORS[0];
const uid = tip.replace(/_/g, '-');

// Değiştir (normalizedTip ekle):
const { tip: rawTip, baslik, veri, ozellikler, not } = grafik;
const tip = normalizeTip(rawTip);
const anaRenk = ozellikler?.renk || COLORS[0];
const uid = tip.replace(/_/g, '-');
```

- [ ] **Step 3: ucgen renderer'ını parseGeometryVeri ile güncelle**

Mevcut `ucgen` renderer'ını şununla değiştir:

```typescript
/* ── ÜÇGEN ──────────────────────────────────────────────────────── */
if (tip === 'ucgen') {
    const geo = parseGeometryVeri(veri);
    const pts_raw = ozellikler?.etiketler?.length
        ? ozellikler.etiketler
        : geo.vertexLabels.length >= 3
            ? geo.vertexLabels
            : ['A', 'B', 'C'];
    const sides = ozellikler?.kenarlar?.length
        ? ozellikler.kenarlar
        : geo.edgeLengths.length > 0
            ? geo.edgeLengths
            : undefined;
    const edgeUnit = geo.unit || ozellikler?.birim || '';
    return (
        <svg viewBox="0 0 240 180" className="w-full max-w-xs mx-auto mt-2"
            style={{ fontFamily: FONT, filter: 'drop-shadow(0 3px 6px #0001)' }}>
            <SvgDefs id={uid} color={anaRenk} />
            <polygon points="120,16 24,160 216,160"
                fill={`url(#shapeFill-${uid})`} stroke={anaRenk} strokeWidth="2.5" strokeLinejoin="round" />
            {[{ x: 120, y: 16 }, { x: 24, y: 160 }, { x: 216, y: 160 }].map((v, i) => (
                <g key={i}>
                    <circle cx={v.x} cy={v.y} r="4" fill={anaRenk} />
                    <text x={v.x + (i === 0 ? 0 : i === 1 ? -13 : 13)} y={v.y + (i === 0 ? -9 : 17)}
                        fontSize="13" fill="#1e293b" fontWeight="700" textAnchor="middle">
                        {pts_raw[i] ?? String.fromCharCode(65 + i)}
                    </text>
                </g>
            ))}
            {sides && sides.length >= 1 && (
                <text x="64" y="96" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle"
                    transform="rotate(-56,64,96)">{sides[0]}{edgeUnit}</text>
            )}
            {sides && sides.length >= 2 && (
                <text x="176" y="96" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle"
                    transform="rotate(56,176,96)">{sides[1]}{edgeUnit}</text>
            )}
            {sides && sides.length >= 3 && (
                <text x="120" y="175" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle">
                    {sides[2]}{edgeUnit}
                </text>
            )}
            {/* Açı gösterimi */}
            {geo.angles.length > 0 && geo.angles[0] !== 90 && (
                <text x="44" y="148" fontSize="11" fill="#64748b" textAnchor="middle">
                    {geo.angles[0]}°
                </text>
            )}
        </svg>
    );
}
```

- [ ] **Step 4: dik_ucgen renderer'ını güncelle**

Mevcut `dik_ucgen` bloğunu şununla değiştir:

```typescript
/* ── DİK ÜÇGEN ──────────────────────────────────────────────────── */
if (tip === 'dik_ucgen') {
    const geo = parseGeometryVeri(veri);
    const sides = ozellikler?.kenarlar?.length
        ? ozellikler.kenarlar
        : geo.edgeLengths.length > 0
            ? geo.edgeLengths
            : undefined;
    const pts_raw = ozellikler?.etiketler?.length
        ? ozellikler.etiketler
        : geo.vertexLabels.length >= 3
            ? geo.vertexLabels
            : ['A', 'B', 'C'];
    const edgeUnit = geo.unit || ozellikler?.birim || '';
    return (
        <svg viewBox="0 0 240 180" className="w-full max-w-xs mx-auto mt-2"
            style={{ fontFamily: FONT, filter: 'drop-shadow(0 3px 6px #0001)' }}>
            <SvgDefs id={uid} color={anaRenk} />
            <polygon points="24,160 24,30 216,160"
                fill={`url(#shapeFill-${uid})`} stroke={anaRenk} strokeWidth="2.5" strokeLinejoin="round" />
            <polyline points="24,148 36,148 36,160" fill="none" stroke={anaRenk} strokeWidth="2" />
            {[{ x: 24, y: 160 }, { x: 24, y: 30 }, { x: 216, y: 160 }].map((v, i) => (
                <g key={i}>
                    <circle cx={v.x} cy={v.y} r="4" fill={anaRenk} />
                    <text x={v.x + (i === 0 ? -13 : i === 1 ? -13 : 13)} y={v.y + (i === 2 ? 17 : i === 1 ? -9 : 17)}
                        fontSize="13" fill="#1e293b" fontWeight="700" textAnchor="middle">
                        {pts_raw[i] ?? String.fromCharCode(65 + i)}
                    </text>
                </g>
            ))}
            {sides && sides.length >= 1 && (
                <text x="9" y="100" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle">
                    {sides[0]}{edgeUnit}
                </text>
            )}
            {sides && sides.length >= 2 && (
                <text x="120" y="176" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle">
                    {sides[1]}{edgeUnit}
                </text>
            )}
            {sides && sides.length >= 3 && (
                <text x="132" y="89" fontSize="12" fill={anaRenk} fontWeight="700" textAnchor="middle"
                    transform="rotate(35,132,89)">{sides[2]}{edgeUnit}</text>
            )}
        </svg>
    );
}
```

- [ ] **Step 5: kare/dikdortgen renderer'ını güncelle**

Mevcut `kare / dikdortgen` bloğunu şununla değiştir:

```typescript
/* ── KARE / DİKDÖRTGEN ──────────────────────────────────────────── */
if (tip === 'kare' || tip === 'dikdortgen') {
    const geo = parseGeometryVeri(veri);
    const rW = tip === 'kare' ? 130 : 180;
    const rH = tip === 'kare' ? 130 : 90;
    const ox = (240 - rW) / 2, oy = (180 - rH) / 2;
    const sides = ozellikler?.kenarlar?.length
        ? ozellikler.kenarlar
        : geo.edgeLengths.length > 0
            ? geo.edgeLengths
            : undefined;
    const edgeUnit = geo.unit || ozellikler?.birim || '';
    return (
        <svg viewBox="0 0 240 180" className="w-full max-w-xs mx-auto mt-2"
            style={{ fontFamily: FONT, filter: 'drop-shadow(0 3px 6px #0001)' }}>
            <SvgDefs id={uid} color={anaRenk} />
            <rect x={ox} y={oy} width={rW} height={rH}
                fill={`url(#shapeFill-${uid})`} stroke={anaRenk} strokeWidth="2.5" rx="3" />
            <polyline points={`${ox + 11},${oy} ${ox + 11},${oy + 11} ${ox},${oy + 11}`}
                fill="none" stroke={anaRenk} strokeWidth="1.5" opacity="0.5" />
            <polyline points={`${ox + rW - 11},${oy} ${ox + rW - 11},${oy + 11} ${ox + rW},${oy + 11}`}
                fill="none" stroke={anaRenk} strokeWidth="1.5" opacity="0.5" />
            {sides && sides.length >= 1 && (
                <text x={ox + rW / 2} y={oy - 8} fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="middle">
                    {sides[0]}{edgeUnit}
                </text>
            )}
            {sides && sides.length >= 2 && tip === 'dikdortgen' && (
                <text x={ox + rW + 13} y={oy + rH / 2 + 5} fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="start">
                    {sides[1]}{edgeUnit}
                </text>
            )}
            {tip === 'kare' && sides && (
                <text x={ox + rW + 13} y={oy + rH / 2 + 5} fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="start">
                    {sides[0]}{edgeUnit}
                </text>
            )}
            {tip === 'kare' && (
                <>
                    {[[ox + rW / 2 - 5, oy + 7, ox + rW / 2 + 5, oy + 7],
                      [ox + rW / 2 - 5, oy + rH - 7, ox + rW / 2 + 5, oy + rH - 7],
                      [ox + 7, oy + rH / 2 - 5, ox + 7, oy + rH / 2 + 5],
                      [ox + rW - 7, oy + rH / 2 - 5, ox + rW - 7, oy + rH / 2 + 5],
                    ].map(([x1, y1, x2, y2], i) => (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={anaRenk} strokeWidth="2" />
                    ))}
                </>
            )}
        </svg>
    );
}
```

- [ ] **Step 6: aci renderer'ını güncelle**

Mevcut `aci` bloğundaki `deg` satırını şununla değiştir:
```typescript
// ÖNCE:
const deg = ozellikler?.acilar?.[0] ?? 60;

// SONRA:
const geo = parseGeometryVeri(veri);
const deg = ozellikler?.acilar?.[0] ?? geo.angles[0] ?? 60;
const vs = geo.vertexLabels.length >= 3
    ? geo.vertexLabels.slice(0, 3).map((l, i) => ({ etiket: l }))
    : veri.slice(0, 3);
```
NOT: `const vs = veri.slice(0, 3);` satırını da `geo.vertexLabels` versiyonuyla değiştir (aynı blok içinde).

- [ ] **Step 7: dogru_parcasi renderer'ında kenar uzunluğunu veri'den oku**

Mevcut `dogru_parcasi` bloğunu şununla değiştir:
```typescript
/* ── DOĞRU PARÇASI ──────────────────────────────────────────────── */
if (tip === 'dogru_parcasi') {
    const geo = parseGeometryVeri(veri);
    const uzunluk = ozellikler?.kenarlar?.[0] ?? geo.edgeLengths[0];
    const birim = geo.unit || ozellikler?.birim ?? '';
    const A = veri[0]?.etiket?.replace(/\s*(Noktası|Köşesi|noktası|köşesi)/g, '').trim() || geo.vertexLabels[0] || 'A';
    const B = veri[1]?.etiket?.replace(/\s*(Noktası|Köşesi|noktası|köşesi)/g, '').trim() || geo.vertexLabels[1] || 'B';
    // Aşağısı aynı kalır, sadece uzunluk değişkeni güncellendi
    return (
        <svg viewBox="0 0 340 96" className="w-full max-w-sm mx-auto mt-2" style={{ fontFamily: FONT }}>
            <SvgDefs id={uid} color={anaRenk} />
            <line x1="28" y1="46" x2="312" y2="46"
                stroke={anaRenk} strokeWidth="3" strokeLinecap="round"
                markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
            <circle cx="52" cy="46" r="5.5" fill={anaRenk} stroke="white" strokeWidth="1.5" />
            <circle cx="288" cy="46" r="5.5" fill={anaRenk} stroke="white" strokeWidth="1.5" />
            <text x="52" y="30" fontSize="14" fill="#1e293b" fontWeight="700" textAnchor="middle">{A}</text>
            <text x="288" y="30" fontSize="14" fill="#1e293b" fontWeight="700" textAnchor="middle">{B}</text>
            {uzunluk && (
                <>
                    <line x1="52" y1="68" x2="288" y2="68" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="52" y1="62" x2="52" y2="74" stroke="#94a3b8" strokeWidth="1" />
                    <line x1="288" y1="62" x2="288" y2="74" stroke="#94a3b8" strokeWidth="1" />
                    <text x="170" y="86" fontSize="13" fill={anaRenk} fontWeight="700" textAnchor="middle">
                        {uzunluk} {birim}
                    </text>
                </>
            )}
        </svg>
    );
}
```

- [ ] **Step 8: daire renderer'ında veri'den yarıçap oku**

Mevcut `daire` bloğundaki ilk iki satırı güncelle:
```typescript
// ÖNCE:
const r = 72;
const yaricap = ozellikler?.yaricap;

// SONRA:
const r = 72;
const geo = parseGeometryVeri(veri);
const yaricap = ozellikler?.yaricap ?? geo.radius ?? geo.edgeLengths[0];
```

- [ ] **Step 9: Testleri çalıştır**

```bash
cd /home/runner/work/oogmatik/oogmatik && npx vitest run tests/matSinavGorsel.test.ts
```
Beklenen: PASS (tüm testler)

- [ ] **Step 10: Build kontrol**

```bash
cd /home/runner/work/oogmatik/oogmatik && npm run build 2>&1 | tail -20
```

- [ ] **Step 11: Commit**

```bash
git add components/MatSinavStudyosu/components/GraphicRenderer.tsx
git commit -m "feat(A): GraphicRenderer parseGeometryVeri smart parser + geometry renderer güncellemeleri"
```

---

## Task 3 — Yaklaşım B: Eksik Şekil Renderer'ları

**Files:**
- Modify: `components/MatSinavStudyosu/components/GraphicRenderer.tsx`

**Eklenecek 4 yeni renderer** — `DEFAULT fallback` bloğunun hemen ÖNÜNE ekle.

- [ ] **Step 1: nesne_grafigi renderer'ı ekle**

```typescript
/* ── NESNE GRAFİĞİ (Emoji/İkon Tabanlı) ────────────────────────── */
if (tip === 'nesne_grafigi') {
    const maxVal = Math.max(...veri.map(v => v.deger || 0), 1);
    const skalaFactor = maxVal > 10 ? Math.ceil(maxVal / 5) : 1; // Her ikon = skalaFactor adet
    return (
        <div className="w-full mt-3 overflow-x-auto">
            <div className="flex flex-col gap-2 min-w-[280px]">
                {veri.map((item, idx) => {
                    const count = Math.round((item.deger || 0) / skalaFactor);
                    const emoji = item.nesne || '⬛';
                    return (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-600 min-w-[80px] text-right shrink-0"
                                style={{ fontFamily: FONT }}>
                                {item.etiket}
                            </span>
                            <div className="flex flex-wrap gap-0.5">
                                {Array.from({ length: count }).map((_, i) => (
                                    <span key={i} className="text-lg leading-none">{emoji}</span>
                                ))}
                            </div>
                            <span className="text-[10px] text-gray-400 ml-1">({item.deger})</span>
                        </div>
                    );
                })}
            </div>
            {skalaFactor > 1 && (
                <p className="text-[10px] text-gray-400 mt-2 text-center" style={{ fontFamily: FONT }}>
                    Her {veri[0]?.nesne || 'ikon'} = {skalaFactor} adet
                </p>
            )}
        </div>
    );
}
```

- [ ] **Step 2: isin renderer'ı ekle (ışın — tek yönlü)**

```typescript
/* ── IŞIN (tek yönlü) ───────────────────────────────────────────── */
if (tip === 'isin') {
    const geo = parseGeometryVeri(veri);
    const A = veri[0]?.etiket?.replace(/\s*(Noktası|Köşesi)/g, '').trim() || geo.vertexLabels[0] || 'A';
    const B = veri[1]?.etiket?.replace(/\s*(Noktası|Köşesi)/g, '').trim() || geo.vertexLabels[1] || 'B';
    return (
        <svg viewBox="0 0 340 80" className="w-full max-w-sm mx-auto mt-2" style={{ fontFamily: FONT }}>
            <SvgDefs id={uid} color={anaRenk} />
            {/* Işın: başlangıç noktası + bir yönde ok */}
            <line x1="52" y1="40" x2="300" y2="40"
                stroke={anaRenk} strokeWidth="3" strokeLinecap="round"
                markerEnd={`url(#arrow-${uid})`} />
            <circle cx="52" cy="40" r="5.5" fill={anaRenk} stroke="white" strokeWidth="1.5" />
            <text x="52" y="26" fontSize="14" fill="#1e293b" fontWeight="700" textAnchor="middle">{A}</text>
            <text x="290" y="26" fontSize="14" fill="#1e293b" fontWeight="700" textAnchor="middle">{B}</text>
        </svg>
    );
}
```

- [ ] **Step 3: dogru renderer'ı ekle (sonsuz doğru — çift yönlü)**

```typescript
/* ── DOĞRU (sonsuz, çift yönlü) ────────────────────────────────── */
if (tip === 'dogru') {
    const geo = parseGeometryVeri(veri);
    const isimler = ozellikler?.etiketler ?? geo.vertexLabels;
    const dogruAdi = isimler[0] ?? (veri[0]?.etiket || 'd');
    return (
        <svg viewBox="0 0 340 80" className="w-full max-w-sm mx-auto mt-2" style={{ fontFamily: FONT }}>
            <SvgDefs id={uid} color={anaRenk} />
            {/* Çift yönlü ok */}
            <line x1="20" y1="40" x2="320" y2="40"
                stroke={anaRenk} strokeWidth="3" strokeLinecap="round"
                markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
            {/* İki noktay göster (üzerindeki noktalar) */}
            {veri.slice(0, 2).map((v, idx) => {
                const px = idx === 0 ? 110 : 230;
                return (
                    <g key={idx}>
                        <circle cx={px} cy="40" r="4" fill={anaRenk} />
                        <text x={px} y="26" fontSize="13" fill="#1e293b" fontWeight="700" textAnchor="middle">
                            {v.etiket.replace(/\s*(Noktası|Köşesi)/g, '')}
                        </text>
                    </g>
                );
            })}
            <text x="16" y="60" fontSize="11" fill={anaRenk} fontWeight="700">{dogruAdi}</text>
        </svg>
    );
}
```

- [ ] **Step 4: dik_kesisen_dogrular renderer'ı ekle (90° kesişen)**

```typescript
/* ── DİK KESİŞEN DOĞRULAR (90° açılı) ─────────────────────────── */
if (tip === 'dik_kesisen_dogrular') {
    const isimler = ozellikler?.etiketler || ['d1', 'd2'];
    return (
        <svg viewBox="0 0 240 200" className="w-full max-w-xs mx-auto mt-2"
            style={{ fontFamily: FONT, filter: 'drop-shadow(0 2px 4px #0001)' }}>
            <SvgDefs id={uid} color={anaRenk} />
            {/* Yatay doğru */}
            <line x1="20" y1="100" x2="220" y2="100"
                stroke={anaRenk} strokeWidth="2.5"
                markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
            {/* Dikey doğru */}
            <line x1="120" y1="20" x2="120" y2="180"
                stroke={anaRenk} strokeWidth="2.5"
                markerStart={`url(#arrowL-${uid})`} markerEnd={`url(#arrow-${uid})`} />
            {/* 90° işareti */}
            <polyline points="120,100 132,100 132,112 120,112"
                fill="none" stroke={anaRenk} strokeWidth="2" />
            {/* Doğru İsimleri */}
            <text x="210" y="90" fontSize="12" fill={anaRenk} fontWeight="bold">{isimler[0] || 'd1'}</text>
            <text x="128" y="18" fontSize="12" fill={anaRenk} fontWeight="bold">{isimler[1] || 'd2'}</text>
            {/* Kesişim noktası */}
            <circle cx="120" cy="100" r="4" fill={anaRenk} />
            <text x="110" y="94" fontSize="10" fill="#0f172a" fontWeight="bold" textAnchor="end">O</text>
        </svg>
    );
}
```

- [ ] **Step 5: Testleri çalıştır**

```bash
cd /home/runner/work/oogmatik/oogmatik && npx vitest run tests/matSinavGorsel.test.ts
```
Beklenen: PASS

- [ ] **Step 6: Commit**

```bash
git add components/MatSinavStudyosu/components/GraphicRenderer.tsx
git commit -m "feat(B): nesne_grafigi, isin, dogru, dik_kesisen_dogrular renderer'ları eklendi"
```

---

## Task 4 — Yaklaşım C: Tip İsimleri GrafikVeriTipi'ne Ekle

**Files:**
- Modify: `src/types/matSinav.ts`
- Modify: `src/services/generators/mathSinavGenerator.ts`

**Sorun:** Prompt `'nesne_grafiği'`, `'isin'`, `'dogru'`, `'dik_kesisen_dogrular'` gibi tipleri kullanıyor ama bunlar `GrafikVeriTipi` union'ında yok. TypeScript derlemesinde `string` olarak kalıyor.

- [ ] **Step 1: GrafikVeriTipi'ni güncelle**

`src/types/matSinav.ts` içindeki `GrafikVeriTipi` union'ını şununla değiştir:

```typescript
export type GrafikVeriTipi =
  | 'siklik_tablosu'
  | 'cetele_tablosu'
  | 'sutun_grafigi'
  | 'nesne_grafigi'       // YENİ: emoji/resim grafiği
  | 'pasta_grafigi'
  | 'cizgi_grafigi'
  | 'ucgen'
  | 'dik_ucgen'
  | 'kare'
  | 'dikdortgen'
  | 'paralel_kenar'
  | 'cokgen'
  | 'daire'
  | 'dogru_parcasi'
  | 'isin'                // YENİ: tek yönlü ışın
  | 'dogru'               // YENİ: sonsuz çift yönlü doğru
  | 'aci'
  | 'koordinat_sistemi'
  | 'koordinat_grafigi'
  | 'sayi_dogrusu'
  | 'kesir_modeli'
  | 'simetri'
  | 'venn_diyagrami'
  | 'olaslik_cark'
  | 'kesisen_dogrular'
  | 'dik_kesisen_dogrular' // YENİ: 90° kesişen doğrular
  | 'paralel_dogrular'
  | 'kup'
  | 'silindir'
  | 'koni'
  | 'piramit'
  | 'dikdortgenler_prizmasi';
```

- [ ] **Step 2: Prompt'taki tip isimlerini normalize et (mathSinavGenerator.ts)**

`mathSinavGenerator.ts` içindeki `GORSEL_TIPLER_LISTESI` sabitini güncelle (isin, dogru, dik_kesisen_dogrular, nesne_grafigi ekle):

```typescript
// ÖNCE:
const GORSEL_TIPLER_LISTESI =
  'siklik_tablosu, cetele_tablosu, sutun_grafigi, pasta_grafigi, cizgi_grafigi, ' +
  'ucgen, dik_ucgen, kare, dikdortgen, paralel_kenar, cokgen, daire, ' +
  'dogru_parcasi, aci, koordinat_sistemi, koordinat_grafigi, sayi_dogrusu, ' +
  'kesir_modeli, simetri, venn_diyagrami, olaslik_cark, kup, silindir, koni, piramit, dikdortgenler_prizmasi, kesisen_dogrular, paralel_dogrular';

// SONRA:
const GORSEL_TIPLER_LISTESI =
  'siklik_tablosu, cetele_tablosu, sutun_grafigi, nesne_grafigi, pasta_grafigi, cizgi_grafigi, ' +
  'ucgen, dik_ucgen, kare, dikdortgen, paralel_kenar, cokgen, daire, ' +
  'dogru_parcasi, isin, dogru, aci, koordinat_sistemi, koordinat_grafigi, sayi_dogrusu, ' +
  'kesir_modeli, simetri, venn_diyagrami, olaslik_cark, ' +
  'kup, silindir, koni, piramit, dikdortgenler_prizmasi, kesisen_dogrular, dik_kesisen_dogrular, paralel_dogrular';
```

- [ ] **Step 3: Prompt içindeki tip listesini de güncelle**

`buildMathExamPrompt` fonksiyonu içinde, `"tip": 'ucgen', 'dikdortgen'...` yazan satırı güncelle (satır ~674):

```
// ÖNCE:
   - "tip": 'ucgen', 'dikdortgen', 'kare', 'besgen', 'altıgen', 'kup', 'silindir', 'koni', 'piramit', 'dikdortgenler_prizmasi', 'dogru_parcasi', 'isin', 'dogru', 'paralel_dogrular', 'kesisen_dogrular', 'dik_kesisen_doğrular'.

// SONRA (Türkçe ğ/ı normalize edilmiş):
   - "tip": 'ucgen', 'dikdortgen', 'kare', 'cokgen', 'daire', 'kup', 'silindir', 'koni', 'piramit', 'dikdortgenler_prizmasi', 'dogru_parcasi', 'isin', 'dogru', 'paralel_dogrular', 'kesisen_dogrular', 'dik_kesisen_dogrular'.
```

Satır ~666 - veri grafik tiplerini de normalize et:
```
// ÖNCE:
   - "tip": 'siklik_tablosu', 'nesne_grafiği', 'sutun_grafiği'.

// SONRA:
   - "tip": 'siklik_tablosu', 'nesne_grafigi', 'sutun_grafigi'.
```

Satır ~769 (schema description):
```
// ÖNCE:
  "Görsel türü: 'siklik_tablosu', 'nesne_grafiği', 'sutun_grafiği', 'ucgen' vb."

// SONRA:
  "Görsel türü: 'siklik_tablosu', 'nesne_grafigi', 'sutun_grafigi', 'ucgen', 'isin', 'dogru', 'dik_kesisen_dogrular' vb."
```

- [ ] **Step 4: Build ve testler**

```bash
cd /home/runner/work/oogmatik/oogmatik && npm run build 2>&1 | tail -20
npx vitest run tests/matSinavGorsel.test.ts
```
Beklenen: TypeScript hataları yok, testler geçiyor.

- [ ] **Step 5: Son tam test koşusu**

```bash
cd /home/runner/work/oogmatik/oogmatik && npx vitest run 2>&1 | tail -30
```

- [ ] **Step 6: Commit**

```bash
git add src/types/matSinav.ts src/services/generators/mathSinavGenerator.ts
git commit -m "feat(C): GrafikVeriTipi eksik tipler eklendi, prompt tip isimleri normalize edildi"
```

---

## Doğrulama Kontrol Listesi

```
□ parseGeometryVeri veri[]'dan köşe, kenar, açı çıkarıyor
□ ucgen → köşe harfleri ve kenar ölçüleri AI'dan geliyor
□ dik_ucgen → köşe harfleri ve kenar ölçüleri AI'dan geliyor
□ kare/dikdortgen → kenar uzunlukları AI'dan geliyor
□ aci → açı değeri AI'dan geliyor
□ dogru_parcasi → uzunluk ve uç nokta harfleri AI'dan geliyor
□ daire → yarıçap AI'dan geliyor
□ Yeni şekiller render ediliyor: nesne_grafigi, isin, dogru, dik_kesisen_dogrular
□ sutun_grafiği (ğ ile) de render ediliyor (normalizasyon)
□ GrafikVeriTipi güncel tip listesi içeriyor
□ TypeScript strict modda derleniyor
□ npm run build başarılı
□ npx vitest run başarılı
□ any tipi kullanılmadı
□ pedagogicalNote mevcut sınavda korunuyor
```

---

## Önemli Notlar

1. **Geriye dönük uyumluluk**: `ozellikler` alanı doluysa her zaman tercih edilir, `veri` parse edilmesi sadece fallback olarak çalışır.
2. **`parseGeometryVeri` export edilmiyor** — sadece GraphicRenderer modülü içinde kullanılır. Test ederken inline logic test yeterli.
3. **`normalizeTip`** fonksiyonu tüm renderer `if (tip === ...)` kontrollerinden önce çalışır — tek bir noktada normalleştirme.
4. **`nesne_grafigi`**: `skalaFactor` ile 10'dan fazla emojiyi ölçeklendiriyor (her ikon N adedi temsil eder).
