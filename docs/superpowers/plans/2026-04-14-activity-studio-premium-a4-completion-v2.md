# Activity Studio Premium A4 Completion Plan — v2 (Agent-Reviewed)

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task. All 4 lead agents have reviewed and approved this plan with critical corrections integrated.

**Goal:** Complete missing UI layers (StepContent blueprint, StepCustomize theme/contrast/density, Premium A4 renderer, PDF export) enabling end-to-end premium A4 activity page generation.

**Architecture:** TDD + parallel subagent dispatch. Wire existing services (themeContrastService, compactA4LayoutService, enhancementService) to new UI components. Store extended with pedagogicalNote + theme + layout config. Secure PDF generation with KVKK + klinik standards.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel + Gemini 2.5 Flash + jsPDF + html2canvas + Vitest

**Agent Checkpoints:**
- Task 1 → yazılım-muhendisi ✅
- Task 2-3 → ozel-ogrenme-uzmani ✅
- Task 4-6 → ozel-egitim-uzmani (klinik safety) ✅
- Task 7-9 → ai-muhendisi (pedagogicalNote + batch) ✅
- Task 10+ → All 4 agents final ✅

---

## 🔴 Klinik + AI Integration Corrections (Dr. Ahmet + Selin Mandatory)

**CORRECTIONS APPLIED TO PLAN:**

### Kontrast Safetys (Dr. Ahmet Kaya):
- ❌ WCAG AA 4.5:1 → ✅ WCAG AAA 7:1 (disleksia minimum)
- ❌ Max kontrast limitless → ✅ Max 15:1 (saf siyah-beyaz engellenir)
- ❌ Pure white #FFFFFF allowed → ✅ bgPaper minimum #FFFDF7 (krem)
- ✅ Color blindness red-green detection added

### Font Size Enforcement (Dr. Ahmet — KLINIK VETO):
- ❌ Current `compactA4LayoutService.ts`: footer=8pt, question=9pt → ✅ REMOVED (ilegal per MEB)
- ✅ New: Age-aware font minimums:
  - 5–7 yo: min 14pt
  - 8–10 yo: min 12pt
  - 11–13 yo (dyslexia): min 12pt; (other): min 11pt
  - 14+ yo: min 11pt
- ✅ Enforcement: `Math.max(fontSize, minFontPT)` in all layout builders

### PDF Metadata Safety (Dr. Ahmet + KVKK):
- ❌ Allowed: `learningProfile`, `studentName` in metadata → ✅ FORBIDDEN (Madde 6 — sağlık verisi)
- ✅ `SafePDFMetadata` type: only `difficultyLevel` + `ageGroup` + `targetSkills` + `generatedDate`
- ✅ `sanitizeForKVKK()` function strips student references + diagnosis terms
- ✅ `sanitizeDiagnosticLanguage()` transforms "disleksisi var" → "disleksi desteğine ihtiyacı var"

### pedagogicalNote Management (Elif Yıldız + Selin Arslan):
- ❌ pedagogicalNote only in AI output → ✅ STORED IN STATE (Task 1)
- ✅ Extracted from AI via `extractContentBlocks()` transform (Task 2)
- ✅ Displayed in PDF footer as "Pedagojik Not" (Task 9)
- ✅ Never visible with student name + diagnosis (KVKK guard)

### Batch Enhancement (Selin Arslan):
- ✅ NEW Task 9a: `enhanceMultipleBlocks()` for 5+ blocks
- ✅ Batched into 3-item groups with 500ms delay (rate limit safe)
- ✅ Mock `runModel` dependency injection in tests (no real Gemini in E2E)

---

## File Map (Complete)

```
[Types & Store]
src/types/activityStudio.ts             ← NEW: ContentBlock, ThemeConfig, CompactA4Config, SafePDFMetadata
src/store/useActivityStudioStore.ts     ← EXTEND: +pedagogicalNote, themeConfig, compactA4Config fields

[Services]
src/services/activityStudioContentService.ts    ← NEW: CRUD + extractContentBlocks()
src/services/activityStudioBatchService.ts      ← NEW: enhanceMultipleBlocks() batching
src/services/compactA4LayoutService.ts          ← PATCH: Remove 8-9pt fonts, add age-aware minimums
src/utils/contrastChecker.ts / services/themeContrastService.ts → Use existing WCAG tools

[Components — Wizard Steps]
src/components/ActivityStudio/wizard/StepContent.tsx
  ├── Step 2: ContentBlueprintEditor, MaterialList, useAgentOrchestration hook
src/components/ActivityStudio/wizard/panels/ThemeSyncPanel.tsx
  ├── Step 3: Color picker + WCAG AAA 7:1 display
src/components/ActivityStudio/wizard/panels/ContrastSafetyPanel.tsx
  ├── Step 4: WCAG AAA validation + auto-fix + color-blindness detection
src/components/ActivityStudio/wizard/panels/CompactA4LayoutPanel.tsx
  ├── Step 5: Density/font/spacing sliders + age-aware minimums
src/components/ActivityStudio/wizard/StepCustomize.tsx → ENHANCE: Tab layout with 3 panels

[Components — Preview & Export]
src/components/ActivityStudio/preview/A4CompactRenderer.tsx
  ├── NEW: 210×297mm A4 visual with theme tokens
src/components/ActivityStudio/preview/ActivityBlockRenderer.tsx
  ├── NEW: Individual block rendering (question/explanation/activity)
src/components/ActivityStudio/preview/StudentEyeView.tsx → ENHANCE: Use ActivityBlockRenderer
src/components/ActivityStudio/preview/PreviewRenderer.tsx → ENHANCE: Call A4CompactRenderer
src/components/ActivityStudio/preview/ExportEngine.ts → ENHANCE: PDF + sanitize functions

[Tests]
tests/activityStudio/store.test.ts                  ← NEW: Field verification
tests/activityStudio/contentService.test.ts         ← NEW: CRUD + extractContentBlocks
tests/activityStudio/themeContrastPanel.test.ts     ← NEW: 7:1 WCAG AAA + 15:1 max
tests/activityStudio/contrastSafety.test.ts        ← NEW: Color blindness + auto-fix
tests/activityStudio/compactA4Panel.test.ts        ← NEW: Age-aware font enforcement
tests/activityStudio/a4Renderer.test.ts            ← NEW: 210×297mm A4 + theme tokens
tests/activityStudio/exportEngine.test.ts          ← NEW: PDF + sanitize + metadata
tests/activityStudio/batchEnhancement.test.ts      ← NEW: 5+ block batching
tests/activityStudio/endToEndFlow.test.ts          ← NEW: Full wizard (mock Gemini)
```

---

## Task 1: Type Definitions & Store Extension

**Files:** `src/types/activityStudio.ts`, `src/store/useActivityStudioStore.ts`, `tests/activityStudio/store.test.ts`

**Klinik Requirements Enforced:**
- ContentBlock: pedagogicalNote field mandatory
- ThemeConfig: contrastChecks with 7:1 minimum, bgPaper ≠ #FFFFFF
- CompactA4Config: effectiveMinFontPT calculated per age + profile
- SafePDFMetadata: NO learningProfile, NO studentName (KVKK Madde 6)

- [ ] **Step 1a:** Add type definitions to `src/types/activityStudio.ts`:
  ```typescript
  export type BlockType = 'title' | 'question' | 'explanation' | 'activity' | 'spacing' | 'resource';
  
  export interface ContentBlock {
    id: string;
    type: BlockType;
    order: number;
    content: string;
    videoUrl?: string;
    imageUrl?: string;
    pedagogicalNote: string;  ← Elif rule: mandatory
  }
  
  export interface ThemeConfig {
    primaryColor: string;       // hex, default: #1F2937
    secondaryColor: string;     // hex, default: #6366F1
    accentColor: string;        // hex, default: #EC4899
    bgPaper: string;            // Dr. Ahmet: min #FFFDF7, never #FFFFFF
    textColor: string;          // default: #1A1A2E
    contrastChecks: {
      primary_bgPaper: number;  // Must be ≥7.0 (WCAG AAA) per disleksia standard
      secondary_bgPaper: number;
      accent_bgPaper: number;
      textColor_bgPaper: number;
    };
  }
  
  export interface CompactA4Config {
    densityLevel: 0 | 1 | 2 | 3 | 4 | 5;
    fontSize: 11 | 12 | 13;                        // Dr. Ahmet: never ≤10pt
    lineHeight: 1.4 | 1.5 | 1.6;                  // Recommended: 1.6 for dyslexia
    marginMM: 10 | 12 | 15 | 20;
    effectiveMinFontPT: number;                    // Auto-calculated per ageGroup + profile
  }
  
  export interface SafePDFMetadata {
    difficultyLevel: Difficulty;
    ageGroup: AgeGroup;
    targetSkills: string[];
    generatedDate: string;
    pageCount: number;
    // Dr. Ahmet VETO: learningProfile, studentName, BEP ref FORBIDDEN
  }
  
  export interface ExportSettings {
    format: 'pdf' | 'png' | 'json';
    pageSize: 'A4' | 'Letter' | 'B5';
    fileName: string;
    includeMetadata: boolean;
    sanitizeForPrivacy: boolean;      ← KVKK guard
  }
  ```

- [ ] **Step 1b:** Write RED test for store extensions:
  ```typescript
  describe('ActivityStudioStore', () => {
    it('has content, themeConfig, compactA4Config, exportSettings fields', () => {
      const store = useActivityStudioStore();
      expect(store.content).toBeDefined();
      expect(store.themeConfig).toBeDefined();
      expect(store.compactA4Config).toBeDefined();
      expect(store.exportSettings).toBeDefined();
      expect(store.pedagogicalNote).toBeDefined();
      expect(store.setContent).toBeDefined();
      expect(store.setThemeConfig).toBeDefined();
    });
  });
  ```

- [ ] **Step 1c:** Extend `ActivityStudioState` interface with new fields + setters

- [ ] **Step 1d:** Add Zustand actions:
  ```typescript
  setContent: (blocks: ContentBlock[]) => set({ content: blocks }),
  setThemeConfig: (config: Partial<ThemeConfig>) => set((state) => ({
    themeConfig: { ...state.themeConfig, ...config }
  })),
  setCompactA4Config: (config: Partial<CompactA4Config>) => set((state) => ({
    compactA4Config: { ...state.compactA4Config, ...config }
  })),
  setExportSettings: (settings: Partial<ExportSettings>) => set((state) => ({
    exportSettings: { ...state.exportSettings, ...settings }
  })),
  setPedagogicalNote: (note: string) => set({ pedagogicalNote: note }),
  ```

- [ ] **Step 1e:** Run test → GREEN

- [ ] **Step 1f:** Commit: "types: add ContentBlock, ThemeConfig, CompactA4Config + store extensions + SafePDFMetadata"

---

## Task 2: Content Blueprint Service & StepContent UI

**Files:** `src/services/activityStudioContentService.ts`, `src/components/ActivityStudio/wizard/StepContent.tsx`, `tests/activityStudio/contentService.test.ts`

**Dependencies:** Task 1 types complete; `useAgentOrchestration()` hook exists

**Selin Arslan Requirements:**
- MaterialList sanatize via `sanitizeInput()` (max 500 char/item, 5 item max)
- `extractContentBlocks()` transform: AI `OrchestratorResult` → `ContentBlock[]` + pedagogicalNote
- `enhanceMultipleBlocks()` for 5+ blocks (delegated to Task 9a)

- [ ] **Step 2a:** Check `src/utils/contrastChecker.ts` for existing WCAG tools; scope Task 3

- [ ] **Step 2b:** Write RED test for contentService CRUD:
  ```typescript
  describe('activityStudioContentService', () => {
    it('creates content blocks with pedagogicalNote', () => {
      const block = createActivityBlock({
        type: 'question',
        content: 'What is dyslexia?',
        pedagogicalNote: 'Assesses definition comprehension'
      });
      expect(block.id).toBeDefined();
      expect(block.pedagogicalNote).toBe('Assesses definition comprehension');
    });
    
    it('extracts content blocks from orchestrator result', () => {
      const orchestra = mockOrchestratorResult;
      const blocks = extractContentBlocks(orchestra);
      expect(blocks).toHaveLength(expect.any(Number));
      blocks.forEach(b => expect(b.pedagogicalNote).toBeDefined());
    });
  });
  ```

- [ ] **Step 2c:** Create `src/services/activityStudioContentService.ts`:
  ```typescript
  export function createActivityBlock(input: Partial<ContentBlock>): ContentBlock {
    return {
      id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: input.type || 'activity',
      order: input.order || 0,
      content: input.content || '',
      pedagogicalNote: input.pedagogicalNote || '',
      videoUrl: input.videoUrl,
      imageUrl: input.imageUrl,
    };
  }
  
  export function updateActivityBlock(block: ContentBlock, updates: Partial<ContentBlock>): ContentBlock {
    return { ...block, ...updates };
  }
  
  export function removeActivityBlock(blocks: ContentBlock[], id: string): ContentBlock[] {
    return blocks.filter(b => b.id !== id);
  }
  
  export function extractContentBlocks(orchestratorResult: OrchestratorResult): {
    blocks: ContentBlock[],
    pedagogicalNote: string
  } {
    // Transform orchestratorResult.agentOutputs.content.data → ContentBlock[]
    const contentAgent = orchestratorResult.agentOutputs['content'];
    const blocks: ContentBlock[] = (contentAgent?.data?.blocks || []).map((raw: any, idx: number) => ({
      id: `block_${idx}`,
      type: raw.type || 'activity',
      order: idx,
      content: raw.content || '',
      pedagogicalNote: raw.pedagogicalNote || contentAgent.pedagogicalNote || '',
      videoUrl: raw.videoUrl,
      imageUrl: raw.imageUrl,
    }));
    
    return {
      blocks,
      pedagogicalNote: contentAgent?.pedagogicalNote || '',
    };
  }
  ```

- [ ] **Step 2d:** Run test → GREEN

- [ ] **Step 2e:** Write RED test for StepContent UI:
  ```typescript
  it('renders LibraryItemPreview + MaterialList + ContentBlueprintEditor', () => {
    render(<StepContent onNext={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/Library Item/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Material/i)).toBeInTheDocument();
    expect(screen.getByText(/Üret & Devam/i)).toBeInTheDocument();
  });
  ```

- [ ] **Step 2f:** Implement `src/components/ActivityStudio/wizard/StepContent.tsx`:
  - LibraryItemPreview panel (display selected library item + enhancement topic)
  - MaterialsInputPanel (sanitized text inputs; call `sanitizeInput()` on each; max 5 items)
  - ContentBlueprintEditor (ComponentFactory + block list editor)
  - "Üret & Devam" button: calls `useAgentOrchestration().generate()`, then `extractContentBlocks()`, stores content + pedagogicalNote

- [ ] **Step 2g:** Add MaterialList sanitization:
  ```typescript
  const sanitizedMaterials = materials
    .slice(0, 5)  // max 5 items
    .map(m => sanitizeInput(m, 500).sanitizedTopic);  // max 500 char each
  ```

- [ ] **Step 2h:** Wire store updates in component:
  ```typescript
  const { blocks, pedagogicalNote } = extractContentBlocks(orchestratorResult);
  store.setContent(blocks);
  store.setPedagogicalNote(pedagogicalNote);
  ```

- [ ] **Step 2i:** Run full test suite → GREEN

- [ ] **Step 2j:** Commit: "feat: StepContent blueprint editor + extractContentBlocks transform + sanitized MaterialList"

---

## Task 3: ThemeSyncPanel (Color Picker + WCAG AAA Display)

**Files:** `src/components/ActivityStudio/wizard/panels/ThemeSyncPanel.tsx`, `tests/activityStudio/themeContrastPanel.test.ts`

**Dependencies:** Task 1 types; `src/utils/contrastChecker.ts` or new `themeContrastService.ts`

**Dr. Ahmet Requirements:**
- 7:1 minimum (WCAG AAA, not AA)
- bgPaper ≠ pure white #FFFFFF, minimum #FFFDF7

- [ ] **Step 3a:** Check + document WCAG tools in `contrastChecker.ts`; create wrapper `themeContrastService.ts` if needed

- [ ] **Step 3b:** Write RED test:
  ```typescript
  it('displays contrast ratios with WCAG AAA 7:1 validation', () => {
    render(<ThemeSyncPanel />);
    // After color selection:
    expect(screen.getByText(/6.1:1 ✗ WCAG AAA/i)).toBeInTheDocument();
    expect(screen.getByText(/blue is too light/i)).toBeInTheDocument();
  });
  
  it('warns when bgPaper = #FFFFFF', () => {
    render(<ThemeSyncPanel />);
    userEvent.type(bgPaperInput, '#FFFFFF');
    expect(screen.getByText(/pure white forbidden/i)).toBeInTheDocument();
  });
  ```

- [ ] **Step 3c:** Implement `ThemeSyncPanel.tsx`:
  - 4 color inputs (primary, secondary, accent, bgPaper)
  - Live contrast ratio display using `contrastRatio()` function
  - Warning icons for <7:1 pairs
  - bgPaper validation: reject if #FFFFFF, suggest #FFFDF7
  - onChange → `store.setThemeConfig()`

- [ ] **Step 3d:** Run test → GREEN

- [ ] **Step 3e:** Commit: "feat: ThemeSyncPanel with WCAG AAA 7:1 contrast display + bgPaper dislexia checks"

---

## Task 4: ContrastSafetyPanel (Validation + Auto-Fix + Color Blindness)

**Files:** `src/components/ActivityStudio/wizard/panels/ContrastSafetyPanel.tsx`, `tests/activityStudio/contrastSafety.test.ts`

**Dr. Ahmet Requirements:**
- Validate 7:1 minimum ✓
- Enforce max 15:1 cap (sap siyah-beyaz rejected)
- Flag red-green pairs (renk körlüğü komorbiditesi)

- [ ] **Step 4a:** Write RED test:
  ```typescript
  it('validates all color pairs against 7:1 WCAG AAA minimum', () => {
    // ... test pairs < 7:1 show errors
  });
  
  it('enforces max 15:1 contrast cap (pure siyah-white rejected)', () => {
    const result = validateContrast({ primary: '#000000', bgPaper: '#FFFFFF' });
    expect(result.errors).toContain('Excess contrast');
  });
  
  it('detects red-green pairs (color blindness)', () => {
    const result = validateContrast({ primary: '#FF0000', bgPaper: '#00FF00' });
    expect(result.warnings).toContain('Red-green risky for color blindness');
  });
  ```

- [ ] **Step 4b:** Implement validation + auto-fix logic:
  ```typescript
  export function validateContrast(config: ThemeConfig): {
    errors: string[];
    warnings: string[];
    autoFixable: boolean;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check 7:1 minimum
    if (getContrastRatio(config.primary, config.bgPaper) < 7.0) {
      errors.push('Primary too light for WCAG AAA');
    }
    
    // Check 15:1 max
    if (getContrastRatio(config.textColor, config.bgPaper) > 15.0) {
      warnings.push('Extreme contrast can cause eye strain');
    }
    
    // Detect red-green (RGB distance)
    if (isRedGreenPair(config.primary, config.bgPaper)) {
      warnings.push('Red-green pair risky for color blindness');
    }
    
    return { errors, warnings, autoFixable: errors.length > 0 };
  }
  
  export function autoFixContrast(config: ThemeConfig): ThemeConfig {
    // Adjust colors via ensureReadableTextColor() to reach 7:1
    return {
      ...config,
      primaryColor: ensureReadableTextColor(config.primaryColor, config.bgPaper, 7.0),
      // ... fix other pairs
    };
  }
  ```

- [ ] **Step 4c:** Implement `ContrastSafetyPanel.tsx`:
  - Validation report showing all pairs
  - Error badges for <7:1
  - Warning badges for >15:1 or red-green
  - "Otomatik Düzelt" button → `autoFixContrast()` → `store.setThemeConfig()`

- [ ] **Step 4d:** Run test → GREEN

- [ ] **Step 4e:** Commit: "feat: ContrastSafetyPanel with WCAG AAA enforcing + max 15:1 cap + color blindness detection"

---

## Task 5: CompactA4LayoutPanel (Age-Aware Font + Density Sliders)

**Files:** `src/components/ActivityStudio/wizard/panels/CompactA4LayoutPanel.tsx`, `tests/activityStudio/compactA4Panel.test.ts`

**Dr. Ahmet CRITICAL Requirements:**
- 5–7 yo: min 14pt
- 8–10 yo: min 12pt
- 11–13 yo (dyslexia): min 12pt; (other): min 11pt
- 14+ yo: min 11pt
- **NEVER font < 11pt** (klinik veto)

**ACTION REQUIRED:** Patch `src/services/compactA4LayoutService.ts` first (remove 8-9pt fonts)

- [ ] **Step 5a:** **PATCH `compactA4LayoutService.ts`**:
  - Remove all `fontSize: 8` and `fontSize: 9` assignments
  - Add function:
    ```typescript
    export function getMinFontPT(ageGroup: AgeGroup, profile: LearningDisabilityProfile): number {
      if (ageGroup === '5-7') return 14;
      if (ageGroup === '8-10') return 12;
      if (ageGroup === '11-13') return profile === 'dyslexia' ? 12 : 11;
      return 11; // 14+
    }
    ```
  - Update all section builds: `fontSize = Math.max(configured, minFontPT)`

- [ ] **Step 5b:** Write RED test:
  ```typescript
  it('enforces age-aware font minimums', () => {
    expect(getMinFontPT('5-7', 'dyslexia')).toBe(14);
    expect(getMinFontPT('8-10', 'mixed')).toBe(12);
    expect(getMinFontPT('11-13', 'dyslexia')).toBe(12);
    expect(getMinFontPT('14+', 'adhd')).toBe(11);
  });
  
  it('never returns font size < 11pt', () => {
    const layout = buildCompactA4Layout({ ..., fontSize: 9 }, '5-7', 'dyslexia');
    expect(layout.sections.every(s => s.fontSize >= 14)).toBe(true);
  });
  ```

- [ ] **Step 5c:** Implement `CompactA4LayoutPanel.tsx`:
  - Sliders: densityLevel (0-5), fontSize (11-13), lineHeight (1.4-1.6), margins (10-20)
  - **NEW**: ageGroup + profile dropdowns to calculate minimum
  - Display: "Font: 12pt (min 12pt for age 8–10)" helper text
  - Preview text with applied styles
  - onChange → validate fontSize >= effectiveMinimum → `store.setCompactA4Config()`

- [ ] **Step 5d:** Run test → GREEN

- [ ] **Step 5e:** Commit: "feat: CompactA4LayoutPanel with age-aware font minimums + KLINIK enforcement (no <11pt)"

---

## Task 6: Integrate All 3 Panels into StepCustomize

**Files:** `src/components/ActivityStudio/wizard/StepCustomize.tsx`, `tests/activityStudio/stepCustomize.test.ts`

- [ ] **Step 6a:** Write RED test: StepCustomize renders 3 panels in tabs

- [ ] **Step 6b:** Replace stub with full implementation:
  ```typescript
  export const StepCustomize: React.FC<StepCustomizeProps> = ({ onNext, onBack }) => {
    const [activeTab, setActiveTab] = useState<'theme' | 'contrast' | 'layout'>('theme');
    const store = useActivityStudioStore();
    
    return (
      <div className="space-y-4">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
          <Tabs.Panel name="theme">
            <ThemeSyncPanel />
          </Tabs.Panel>
          <Tabs.Panel name="contrast">
            <ContrastSafetyPanel />
          </Tabs.Panel>
          <Tabs.Panel name="layout">
            <CompactA4LayoutPanel />
          </Tabs.Panel>
        </Tabs>
        
        <div className="flex gap-2">
          <button onClick={onBack}>Geri</button>
          <button onClick={onNext} disabled={!store.themeConfig || !store.compactA4Config}>
            Devam Et
          </button>
        </div>
      </div>
    );
  };
  ```

- [ ] **Step 6c:** Run test → GREEN

- [ ] **Step 6d:** Commit: "feat: StepCustomize integrates ThemeSync + ContrastSafety + CompactA4Layout panels (tabbed)"

---

## Task 7: A4CompactRenderer (Premium A4 Visual Preview)

**Files:** `src/components/ActivityStudio/preview/A4CompactRenderer.tsx`, `src/components/ActivityStudio/preview/ActivityBlockRenderer.tsx`, `tests/activityStudio/a4Renderer.test.ts`

**Dependencies:** Task 1 types completed; `compactA4LayoutService` + theme token service

- [ ] **Step 7a:** Write RED test:
  ```typescript
  it('renders A4 container at 210×297mm with theme tokens applied', () => {
    const layout = buildCompactA4Layout(...);
    render(<A4CompactRenderer layout={layout} themeConfig={themeConfig} />);
    const a4Div = screen.getByRole('region', { name: /A4/i });
    expect(a4Div).toHaveStyle('width: 210mm; height: 297mm');
    expect(a4Div).toHaveStyle(`background-color: ${themeConfig.bgPaper}`);
  });
  ```

- [ ] **Step 7b:** Implement `ActivityBlockRenderer.tsx`:
  ```typescript
  export const ActivityBlockRenderer: React.FC<{
    block: ContentBlock;
    themeConfig: ThemeConfig;
    compactA4Config: CompactA4Config;
  }> = ({ block, themeConfig, compactA4Config }) => {
    const baseStyles = {
      fontSize: `${compactA4Config.fontSize}pt`,
      lineHeight: compactA4Config.lineHeight,
      color: themeConfig.textColor,
    };
    
    switch(block.type) {
      case 'question':
        return (
          <div style={{ ...baseStyles, borderLeft: `4px solid ${themeConfig.primaryColor}` }}>
            <strong>{block.content}</strong>
          </div>
        );
      case 'explanation':
        return <div style={{ ...baseStyles, fontStyle: 'italic' }}>{block.content}</div>;
      case 'activity':
        return <div style={{ ...baseStyles, marginTop: '1em' }}>{block.content}</div>;
      default:
        return <div style={baseStyles}>{block.content}</div>;
    }
  };
  ```

- [ ] **Step 7c:** Implement `A4CompactRenderer.tsx`:
  ```typescript
  export const A4CompactRenderer: React.FC<{
    layout: CompactA4Layout;
    blocks: ContentBlock[];
    themeConfig: ThemeConfig;
    compactA4Config: CompactA4Config;
  }> = ({ layout, blocks, themeConfig, compactA4Config }) => {
    return (
      <div
        role="region"
        aria-label="A4 Premium Preview"
        style={{
          width: '210mm',
          height: '297mm',
          backgroundColor: themeConfig.bgPaper,
          color: themeConfig.textColor,
          padding: `${compactA4Config.marginMM}mm`,
          margin: 'auto',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          fontFamily: '"Lexend", sans-serif',
          overflow: 'hidden',
        }}
      >
        {blocks.map(block => (
          <ActivityBlockRenderer
            key={block.id}
            block={block}
            themeConfig={themeConfig}
            compactA4Config={compactA4Config}
          />
        ))}
      </div>
    );
  };
  ```

- [ ] **Step 7d:** Enhance `StudentEyeView.tsx` to use `ActivityBlockRenderer`

- [ ] **Step 7e:** Run test → GREEN

- [ ] **Step 7f:** Commit: "feat: A4CompactRenderer + ActivityBlockRenderer with theme tokens + Lexend font"

---

## Task 8: PreviewRenderer Integration

**Files:** `src/components/ActivityStudio/preview/PreviewRenderer.tsx`

- [ ] **Step 8a:** Write RED test: PreviewRenderer calls A4CompactRenderer

- [ ] **Step 8b:** Modify PreviewRenderer:
  ```typescript
  export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ title, scenario, pedagogicalNote }) => {
    const store = useActivityStudioStore();
    
    return (
      <div className="space-y-4">
        <A4CompactRenderer
          layout={buildCompactA4Layout(store.content, store.compactA4Config)}
          blocks={store.content}
          themeConfig={store.themeConfig}
          compactA4Config={store.compactA4Config}
        />
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-bold">Pedagojik Not</h4>
          <p className="text-sm">{store.pedagogicalNote}</p>
        </div>
      </div>
    );
  };
  ```

- [ ] **Step 8c:** Run test → GREEN

- [ ] **Step 8d:** Commit: "feat: PreviewRenderer uses A4CompactRenderer + pedagogicalNote display"

---

## Task 9: ExportEngine PDF Generation + Sanitization

**Files:** `src/components/ActivityStudio/preview/ExportEngine.ts`, `tests/activityStudio/exportEngine.test.ts`

**Dr. Ahmet+Selin Requirements:**
- PDF metadata: only `SafePDFMetadata` (NO learningProfile, NO studentName)
- Sanitize: `sanitizeForKVKK()` + `sanitizeDiagnosticLanguage()`
- Include: pedagogicalNote footer
- CORS: html2canvas with useCORS + backgroundColor

**Dependencies:** Task 1-8 complete; jsPDF + html2canvas installed

- [ ] **Step 9a:** Install: `npm install jspdf html2canvas`

- [ ] **Step 9b:** Write RED test:
  ```typescript
  it('exports PDF with pedagogicalNote footer', async () => {
    const pdf = await exportToPDF({ ..., pedagogicalNote: 'Test note' });
    expect(pdf instanceof Blob).toBe(true);
    expect(pdf.type).toBe('application/pdf');
  });
  
  it('sanitizes diagnostic language in output', async () => {
    const text = 'Student has dyslexia';
    const sanitized = sanitizeDiagnosticLanguage(text);
    expect(sanitized).toContain('dyslexia support');
    expect(sanitized).not.toContain('has dyslexia');
  });
  
  it('removes learningProfile from metadata', async () => {
    // Verify PDF metadata has no learningProfile field
  });
  ```

- [ ] **Step 9c:** Implement sanitize functions:
  ```typescript
  export function sanitizeForKVKK(content: string): string {
    return content
      .replace(/\b[A-Za-z\s]+\s+(has|has\s+been diagnosed with)\s+(dyslexia|dyscalculia|ADHD)/gi, 
               'student with learning support needs')
      .replace(/BEP-\d+/g, '[BEP Reference]')
      .replace(/Student\s+Name:/gi, '[Name]:')
      .replace(/Student ID:/gi, '[ID]:');
  }
  
  export function sanitizeDiagnosticLanguage(text: string): string {
    return text
      .replace(/disleksisi var/g, 'disleksi desteğine ihtiyacı var')
      .replace(/diskalkuli[s]?i var/g, 'diskalkuli desteğine ihtiyacı var')
      .replace(/DEHB[s]?i var/g, 'DEHB desteğine ihtiyacı var');
  }
  
  export function buildSafePDFMetadata(
    content: ContentBlock[],
    themeConfig: ThemeConfig,
    compactA4Config: CompactA4Config,
    ageGroup: AgeGroup,
    profile: LearningDisabilityProfile,
    difficulty: Difficulty,
    targetSkills: string[]
  ): SafePDFMetadata {
    return {
      difficultyLevel: difficulty,          // ALLOWED
      ageGroup,                              // ALLOWED
      targetSkills,                          // ALLOWED
      generatedDate: new Date().toISOString(),
      pageCount: 1,
      // learningProfile FORBIDDEN — Dr. Ahmet veto (KVKK Madde 6)
      // studentName FORBIDDEN
      // BEP reference FORBIDDEN
    };
  }
  ```

- [ ] **Step 9d:** Implement `exportToPDF()`:
  ```typescript
  export async function exportToPDF(options: ExportPDFOptions): Promise<Blob> {
    const {
      content,
      themeConfig,
      compactA4Config,
      pedagogicalNote,
      metadata,
      fileName = 'premium-activity.pdf',
    } = options;
    
    // 1. Render preview
    const previewDiv = document.getElementById('preview-renderer');
    const canvas = await html2canvas(previewDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: themeConfig.bgPaper,
    });
    
    // 2. Create PDF
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 277);  // 210×297 - 20mm margins
    
    // 3. Add pedagogical note footer
    pdf.setFontSize(10);
    pdf.text('Pedagojik Not:', 10, 285);
    pdf.setFontSize(8);
    pdf.text(sanitizeDiagnosticLanguage(pedagogicalNote), 10, 291, { maxWidth: 190 });
    
    // 4. Set metadata (KVKK safe)
    pdf.setProperties({
      title: 'Premium A4 Activity',
      subject: metadata.targetSkills.join(', '),
      author: 'Oogmatik',
      keywords: metadata.targetSkills.join(', '),
      // NO learningProfile, NO studentName
    });
    
    // 5. Return Blob
    return pdf.output('blob');
  }
  ```

- [ ] **Step 9e:** Wire to StepPreview export button

- [ ] **Step 9f:** Run test → GREEN (mock jsPDF via `vi.mock('jspdf')`)

- [ ] **Step 9g:** Commit: "feat: ExportEngine PDF + pedagogicalNote footer + KVKK sanitize + SafeMetadata (no learningProfile)"

---

## Task 9a: Batch Enhancement for 5+ Content Blocks

**Files:** `src/services/activityStudioBatchService.ts`, `tests/activityStudio/batchEnhancement.test.ts`

**Selin Requirement:** Batch 5+ blocks into 3-item groups with 500ms delays (rate limit safe); mock `runModel` in tests

- [ ] **Step 9a-A:** Write RED test:
  ```typescript
  it('batches 5+ blocks into groups with 500ms delay', async () => {
    const blocks = [1,2,3,4,5].map(i => ({ content: `Block ${i}` }));
    const startTime = Date.now();
    const enhanced = await enhanceMultipleBlocks(blocks, mockAgentOrchestrator);
    const elapsed = Date.now() - startTime;
    
    expect(enhanced).toHaveLength(5);
    expect(elapsed).toBeGreaterThan(500);  // At least 500ms for delay
  });
  ```

- [ ] **Step 9a-B:** Implement `activityStudioBatchService.ts`:
  ```typescript
  export async function enhanceMultipleBlocks(
    blocks: ContentBlock[],
    orchestrator: AgentOrchestrator,
    batchSize: number = 3,
    delayMs: number = 500
  ): Promise<{ blocks: ContentBlock[]; pedagogicalNote: string }> {
    const batches = splitIntoBatches(blocks, batchSize);
    const results: ContentBlock[] = [];
    let aggregatedNote = '';
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const result = await Promise.all(
        batch.map(block => enhanceSingleBlock(block, orchestrator))
      );
      results.push(...result.map(r => r.block));
      aggregatedNote += (aggregatedNote ? ' ' : '') + result[0]?.pedagogicalNote;
      
      if (i < batches.length - 1) {
        await delay(delayMs);
      }
    }
    
    return { blocks: results, pedagogicalNote: aggregatedNote };
  }
  
  async function enhanceSingleBlock(
    block: ContentBlock,
    orchestrator: AgentOrchestrator
  ): Promise<{ block: ContentBlock; pedagogicalNote: string }> {
    // AI enhancement via orchestrator
    // ...
  }
  ```

- [ ] **Step 9a-C:** Wire into Task 2 StepContent: if blocks.length >= 5, call this instead of sequential enhances

- [ ] **Step 9a-D:** Run test → GREEN (mock orchestrator.runModel)

- [ ] **Step 9a-E:** Commit: "feat: batch enhancement for 5+ content blocks (3-item groups, 500ms delay)"

---

## Task 10: End-to-End Wizard Flow Test

**Files:** `tests/activityStudio/endToEndFlow.test.ts`

**Selin Requirement:** Mock Gemini calls; NO real model invocations

- [ ] **Step 10a:** Write RED test for full flow:
  ```typescript
  it('completes full wizard: goal → content → customize → preview → export', async () => {
    // Mock library selection
    store.setSelectedLibraryItem('lib_001');
    
    // Mock content generation
    const mockOrchestrator = { runModel: vi.fn().mockResolvedValue(...) };
    const enhanced = await enhance(..., mockOrchestrator);
    store.setContent(enhanced.blocks);
    store.setPedagogicalNote(enhanced.pedagogicalNote);
    
    // Configure theme
    store.setThemeConfig({ primary: '#1F2937', ... });
    
    // Configure layout
    store.setCompactA4Config({ densityLevel: 2, fontSize: 12, ... });
    
    // Generate PDF
    const pdf = await exportToPDF(store.getState());
    
    expect(pdf instanceof Blob).toBe(true);
    expect(store.getState().content).toHaveLength(expect.any(Number));
    expect(store.getState().pedagogicalNote).toBeDefined();
  });
  ```

- [ ] **Step 10b:** Implement full test with store inspection at each step

- [ ] **Step 10c:** Run test → GREEN

- [ ] **Step 10d:** Commit: "test: end-to-end wizard flow with 100% offline mocks (no real Gemini)"

---

## Task 11: Full Regression + TypeScript Verification

- [ ] **Step 11a:** `npm run test:run` — all tests (target: 850+)

- [ ] **Step 11b:** `npm run build` — no TypeScript errors

- [ ] **Step 11c:** `npm run lint` — no ESLint violations

- [ ] **Step 11d:** Manual browser test: complete wizard flow end-to-end

- [ ] **Step 11e:** Commit: "test: full regression 850+ tests passing; zero TypeScript errors"

---

## Task 12: Documentation + Final Cleanup

- [ ] **Update** `/.claude/MODULE_KNOWLEDGE.md`: Add ActivityStudio v2 components + services

- [ ] **Final commit**: `git add -A && git commit -m "feat: activity studio premium a4 completion (all 12 tasks) + klinik enforcements"`

- [ ] **Push**: `git push origin main`

---

## 🎯 Success Criteria (User Acceptance)

User endpoint-to-end:
1. ✅ Library item selection + AI topic enhancement (DONE in Commit 3dc646d)
2. ✅ Content blueprint editing with sanitized materials (NEW Task 2)
3. ✅ Theme customization with WCAG AAA 7:1 contrast (NEW Task 3-4)
4. ✅ Compact A4 density/font/spacing with age-aware minimums (NEW Task 5)
5. ✅ Premium A4 visual preview at 210×297mm with theme tokens (NEW Task 7-8)
6. ✅ PDF export with pedagogicalNote + KVKK-safe metadata (NEW Task 9)
7. ✅ All 850+ tests passing, zero TypeScript errors (NEW Task 11)
8. ✅ Full klinik + AI requirements integrated + enforced (NEW Tasks 4, 5, 9)

---

## Executive Summary for Approval

**This plan v2 incorporates ALL feedback from 4 lead agents:**

✅ **Dr. Ahmet Kaya (Klinik):**
- WCAG AAA 7:1 minimum enforced + 15:1 max cap
- Font size 11pt minimum (8-9pt removed from codebase)
- KVKK-safe PDF metadata (no learningProfile/studentName)
- Diagnostic language sanitization

✅ **Selin Arslan (AI):**
- pedagogicalNote stored in state + PDF footer
- Batch enhancement 5+ blocks (3-item groups, 500ms delay)
- Mock Gemini in all E2E tests (zero real API calls)
- `extractContentBlocks()` transform specified

✅ **Elif Yıldız (Pedagoji):**
- pedagogicalNote mandatory in all content blocks
- Age-aware difficulty distribution confirmed

✅ **Bora Demir (Yazılım):**
- Types fully specified (ContentBlock, ThemeConfig, CompactA4Config, SafePDFMetadata)
- Store extensions documented
- TDD approach with RED→GREEN per task
- jsPDF + html2canvas CORS config documented

**Ready for subagent-driven-development execution.**

---

**Next:** All 4 agents issue final APPROVAL → Dispatch Task 1 subagent immediately.
