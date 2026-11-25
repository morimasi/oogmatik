import React from 'react';
import type { StyleSettings, WorksheetBlock, WorksheetData } from '../../types';
import { blockTypeLabel, flattenBlocks } from '../../services/a4EditorService';
import {
  auditSummary,
  auditWorksheet,
  buildAnswerKeyPage,
  collectAnswers,
  sanitizeFileBaseName,
  splitTextBlock,
  worksheetToHtml,
  type AuditIssue,
} from '../../services/a4StudioService';
import {
  deleteVersion,
  importVersions,
  loadVersions,
  parseVersionsFile,
  saveVersion,
  serializeVersions,
  type A4VersionEntry,
} from '../../services/a4DraftService';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import { useToastStore } from '../../store/useToastStore';
import { copyHtmlToClipboard, downloadTextFile, htmlToPlainText } from '../../utils/a4ExportUtils';
import { Field, MiniButton, Section, Segmented, TextField, ToggleRow } from './controls';

const SEVERITY_STYLES: Record<AuditIssue['severity'], { color: string; icon: string; label: string }> = {
  error: { color: 'text-rose-500', icon: 'fa-circle-exclamation', label: 'Hata' },
  warn: { color: 'text-amber-500', icon: 'fa-triangle-exclamation', label: 'Uyarı' },
  info: { color: 'text-sky-500', icon: 'fa-circle-info', label: 'Öneri' },
};

/**
 * Denetim paneli — üretim kalitesi, taşma/bölünme, cevap anahtarı, sürümler,
 * inceleme yorumları, kağıt ekonomisi ve dışa aktarma tek yerde.
 */
export const InsightsPanel = ({
  worksheetData,
  styleSettings,
  onStyleChange,
  activityType,
}: {
  worksheetData: WorksheetData;
  styleSettings: StyleSettings;
  onStyleChange?: (settings: StyleSettings) => void;
  activityType?: string;
}) => {
  const activityKey = activityType ?? 'genel';
  const applyMutation = useA4EditorStore((state) => state.applyMutation);
  const selectedBlockIds = useA4EditorStore((state) => state.selectedBlockIds);
  const setSelectedBlockId = useA4EditorStore((state) => state.setSelectedBlockId);
  const setEditorTab = useA4EditorStore((state) => state.setEditorTab);
  const updateBlockStyle = useA4EditorStore((state) => state.updateBlockStyle);
  const updateBlockMeta = useA4EditorStore((state) => state.updateBlockMeta);
  const diagnostics = useA4EditorStore((state) => state.diagnostics);
  const answerKeyMode = useA4EditorStore((state) => state.answerKeyMode);
  const setAnswerKeyMode = useA4EditorStore((state) => state.setAnswerKeyMode);
  const printLayout = useA4EditorStore((state) => state.printLayout);
  const setPrintLayout = useA4EditorStore((state) => state.setPrintLayout);
  const cutLines = useA4EditorStore((state) => state.cutLines);
  const setCutLines = useA4EditorStore((state) => state.setCutLines);
  const history = useA4EditorStore((state) => state.history);
  const future = useA4EditorStore((state) => state.future);
  const historyBytes = useA4EditorStore((state) => state.historyBytes);
  const clearHistory = useA4EditorStore((state) => state.clearHistory);
  const toast = useToastStore();

  const [versions, setVersions] = React.useState<A4VersionEntry[]>(() => loadVersions(activityKey));
  const [versionName, setVersionName] = React.useState('');
  const [importError, setImportError] = React.useState<string | null>(null);
  const importRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setVersions(loadVersions(activityKey));
  }, [activityKey]);

  const entries = React.useMemo(() => flattenBlocks(worksheetData), [worksheetData]);
  const issues = React.useMemo(
    () => auditWorksheet(worksheetData, styleSettings),
    [worksheetData, styleSettings]
  );
  const summary = React.useMemo(() => auditSummary(issues), [issues]);
  const answers = React.useMemo(() => collectAnswers(worksheetData), [worksheetData]);
  const comments = React.useMemo(
    () =>
      entries.filter(
        (entry) => !!entry.block.reviewComment?.trim() && entry.block.reviewResolved !== true
      ),
    [entries]
  );

  const blockById = React.useMemo(() => {
    const map = new Map<string, WorksheetBlock>();
    entries.forEach((entry) => {
      if (entry.block.id) map.set(entry.block.id, entry.block);
    });
    return map;
  }, [entries]);

  const jumpToBlock = (blockId?: string) => {
    if (!blockId) return;
    setSelectedBlockId(blockId);
    setEditorTab('content');
  };

  const applyFix = (issue: AuditIssue) => {
    if (!issue.blockId) return;
    const block = blockById.get(issue.blockId);
    const currentFont = block?.style?.fontSize ?? 16;

    switch (issue.fix) {
      case 'increase-font':
        updateBlockStyle([issue.blockId], { fontSize: Math.max(16, currentFont + 1) });
        toast.success('Punto disleksi eşiğine yükseltildi.');
        break;
      case 'line-height':
        updateBlockStyle([issue.blockId], { lineHeight: 1.6 });
        break;
      case 'letter-spacing':
        updateBlockStyle([issue.blockId], { letterSpacing: 0.4 });
        break;
      case 'contrast':
        updateBlockStyle([issue.blockId], { color: '#1E293B' });
        break;
      case 'split-text':
        applyMutation((data) => splitTextBlock(data, issue.blockId as string));
        break;
      case 'open-content':
        jumpToBlock(issue.blockId);
        break;
      default:
        jumpToBlock(issue.blockId);
        break;
    }
  };

  const shrinkBlock = (blockId: string) => {
    const block = blockById.get(blockId);
    const current = block?.style?.fontSize ?? 16;
    updateBlockStyle([blockId], { fontSize: Math.max(12, current - 1) });
  };

  const tightenPage = () => {
    if (!onStyleChange) return;
    const current = styleSettings.contentScale ?? 1;
    onStyleChange({ ...styleSettings, contentScale: Math.max(0.7, Math.round((current - 0.05) * 100) / 100) });
  };

  const saveCurrentVersion = () => {
    const result = saveVersion(activityKey, versionName, worksheetData);
    setVersions(result.versions);
    if (result.saved) {
      setVersionName('');
      toast.success('Sürüm kaydedildi.');
    } else {
      toast.error('Sürüm kaydedilemedi — tarayıcı depolaması kapalı olabilir.');
    }
  };

  const restoreVersion = (entry: A4VersionEntry) => {
    applyMutation(() => entry.data);
    toast.success(`"${entry.name}" sürümü geri yüklendi.`);
  };

  const removeVersion = (entry: A4VersionEntry) => {
    setVersions(deleteVersion(activityKey, entry.id));
    toast.info('Sürüm silindi.');
  };

  const exportVersions = () => {
    if (!versions.length) {
      toast.warning('Dışa aktarılacak sürüm yok.');
      return;
    }
    const ok = downloadTextFile(
      serializeVersions(versions),
      `${sanitizeFileBaseName(worksheetData?.[0]?.title ?? 'bdmind-etkinlik')}-surumler.json`,
      'application/json;charset=utf-8'
    );
    if (ok) toast.success('Sürüm dosyası indirildi.');
    else toast.error('Sürüm dosyası oluşturulamadı.');
  };

  const importVersionFile = async (file: File) => {
    try {
      const raw = await file.text();
      const parsed = parseVersionsFile(raw);
      if (!parsed.length) {
        setImportError('Dosyada geçerli sürüm bulunamadı.');
        return;
      }
      setVersions(importVersions(activityKey, parsed));
      setImportError(null);
      toast.success(`${parsed.length} sürüm içe aktarıldı.`);
    } catch {
      setImportError('Dosya okunamadı.');
    }
  };

  const downloadWord = (withAnswers: boolean) => {
    const html = worksheetToHtml(worksheetData, {
      title: worksheetData?.[0]?.title,
      includeAnswers: withAnswers,
    });
    const ok = downloadTextFile(
      html,
      `${sanitizeFileBaseName(worksheetData?.[0]?.title ?? 'bdmind-etkinlik')}.doc`,
      'application/msword;charset=utf-8'
    );
    if (ok) toast.success('Word belgesi indirildi.');
    else toast.error('Word belgesi oluşturulamadı.');
  };

  const copySelected = async () => {
    const ids = selectedBlockIds.length
      ? selectedBlockIds
      : entries.map((entry) => entry.block.id).filter((id): id is string => !!id);
    const html = worksheetToHtml(worksheetData, { onlyBlockIds: ids });
    const ok = await copyHtmlToClipboard(html, htmlToPlainText(html));
    if (ok) toast.success('Bileşenler panoya kopyalandı.');
    else toast.error('Panoya kopyalama izni verilmedi.');
  };

  const vectorPrint = async () => {
    try {
      document.body.classList.add('a4-vector-print');
      const { forceRenderAllPages, ensurePrintStyle } = await import('../../utils/print/CSSInjector');
      const { usePaperSizeStore } = await import('../../store/usePaperSizeStore');
      forceRenderAllPages();
      ensurePrintStyle(usePaperSizeStore.getState().paperSize);
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      window.print();
    } catch {
      toast.error('Vektörel yazdırma başlatılamadı.');
    } finally {
      window.setTimeout(() => document.body.classList.remove('a4-vector-print'), 900);
    }
  };

  const answerKeyPage = React.useMemo(() => buildAnswerKeyPage(worksheetData), [worksheetData]);
  const marginValue = styleSettings.margin ?? 5;
  const safeMargin = styleSettings.safeMarginMm ?? 12;

  return (
    <div className="space-y-3 p-3">
      <Section
        title="Üretim Denetimi"
        icon="fa-shield-heart"
        description="Disleksi dostu okunabilirlik, kontrast ve erişilebilirlik eşikleri."
        action={
          <span
            className={`rounded-lg px-2 py-1 text-[10px] font-black ${
              summary.score >= 85
                ? 'bg-emerald-500/15 text-emerald-500'
                : summary.score >= 60
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'bg-rose-500/15 text-rose-500'
            }`}
          >
            {summary.score}/100
          </span>
        }
      >
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {(['error', 'warn', 'info'] as const).map((severity) => (
            <div
              key={severity}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5"
            >
              <p className={`text-[13px] font-black ${SEVERITY_STYLES[severity].color}`}>
                {severity === 'error'
                  ? summary.errors
                  : severity === 'warn'
                    ? summary.warnings
                    : summary.infos}
              </p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                {SEVERITY_STYLES[severity].label}
              </p>
            </div>
          ))}
        </div>

        {issues.length === 0 ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
            <i className="fa-solid fa-circle-check mr-1"></i>
            Tüm denetimler temiz. Baskıya hazır.
          </p>
        ) : (
          <ul className="max-h-[280px] space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
            {issues.slice(0, 40).map((issue) => {
              const meta = SEVERITY_STYLES[issue.severity];
              return (
                <li
                  key={issue.id}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] px-2 py-1.5"
                >
                  <div className="flex items-start gap-1.5">
                    <i className={`fa-solid ${meta.icon} mt-0.5 text-[9px] ${meta.color}`}></i>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-[var(--text-primary)]">
                        {issue.title}
                      </p>
                      <p className="text-[8px] leading-relaxed text-[var(--text-muted)]">
                        {issue.detail}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {issue.fix && issue.fix !== 'open-content' && (
                      <MiniButton
                        icon="fa-wand-magic-sparkles"
                        label="Düzelt"
                        title="Öneriyi tek tıkla uygula"
                        onClick={() => applyFix(issue)}
                      />
                    )}
                    {issue.blockId && (
                      <MiniButton
                        icon="fa-crosshairs"
                        label="Bileşene Git"
                        title="Bu bileşeni seç ve içerik sekmesini aç"
                        onClick={() => jumpToBlock(issue.blockId)}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section
        title="Taşma ve Bölünme"
        icon="fa-ruler-combined"
        description={`${diagnostics.measuredPages} sayfa ölçüldü. Ölçüm gerçek render yüksekliğine dayanır.`}
      >
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5 text-[9px] font-bold text-[var(--text-secondary)]">
          <span>
            <i className="fa-solid fa-scissors mr-1"></i>
            Bölünen bileşen
          </span>
          <span className={diagnostics.splitBlockIds.length ? 'text-amber-500' : 'text-emerald-500'}>
            {diagnostics.splitBlockIds.length}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5 text-[9px] font-bold text-[var(--text-secondary)]">
          <span>
            <i className="fa-solid fa-arrow-up-from-bracket mr-1"></i>
            Sayfaya sığmayan
          </span>
          <span className={diagnostics.overflowBlockIds.length ? 'text-rose-500' : 'text-emerald-500'}>
            {diagnostics.overflowBlockIds.length}
          </span>
        </div>

        {[...new Set([...diagnostics.splitBlockIds, ...diagnostics.overflowBlockIds])].length === 0 ? (
          <p className="text-[9px] leading-relaxed text-[var(--text-muted)]">
            Taşma yok. Her bileşen kendi A4 alanına sığıyor.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {[...new Set([...diagnostics.splitBlockIds, ...diagnostics.overflowBlockIds])]
              .slice(0, 12)
              .map((blockId) => {
                const block = blockById.get(blockId);
                const isSplit = diagnostics.splitBlockIds.includes(blockId);
                return (
                  <li
                    key={blockId}
                    className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] px-2 py-1.5"
                  >
                    <p className="text-[9px] font-black text-[var(--text-primary)]">
                      {blockTypeLabel(block?.type ?? 'text')}
                      <span className="ml-1 rounded bg-[var(--bg-secondary)] px-1 text-[8px] font-bold text-[var(--text-muted)]">
                        {isSplit ? 'iki sayfaya bölünüyor' : 'sayfaya sığmıyor'}
                      </span>
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <MiniButton
                        icon="fa-text-height"
                        label="Punto Küçült"
                        title="Bir punto küçült (en az 12px)"
                        onClick={() => shrinkBlock(blockId)}
                      />
                      {block && (block.type === 'text' || block.type === 'cloze_test') && (
                        <MiniButton
                          icon="fa-scissors"
                          label="İkiye Böl"
                          title="Metni cümle sınırından ikiye böl"
                          onClick={() =>
                            applyMutation((data) => splitTextBlock(data, blockId))
                          }
                        />
                      )}
                      {onStyleChange && (
                        <MiniButton
                          icon="fa-compress"
                          label="Sayfayı Sık"
                          title="İçerik ölçeğini %5 küçült"
                          onClick={tightenPage}
                        />
                      )}
                      <MiniButton
                        icon="fa-crosshairs"
                        title="Bileşeni seç"
                        onClick={() => setSelectedBlockId(blockId)}
                      />
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </Section>

      <Section
        title="Cevap Anahtarı"
        icon="fa-key"
        description="Tek içerikten iki nüsha: öğrenci sayfası ve öğretmen cevap anahtarı."
      >
        <Segmented
          ariaLabel="Cevap anahtarı görünümü"
          value={answerKeyMode}
          options={[
            { value: 'off', label: 'Kapalı' },
            { value: 'overlay', label: 'Rozet' },
            { value: 'appendix', label: 'Ayrı Sayfa' },
          ]}
          onChange={(mode) => setAnswerKeyMode(mode)}
        />
        <p className="text-[9px] leading-relaxed text-[var(--text-muted)]">
          <i className="fa-solid fa-user-shield mr-1"></i>
          {answerKeyMode === 'off'
            ? 'Cevap anahtarı hiçbir nüshada görünmez.'
            : answerKeyMode === 'overlay'
              ? 'Cevaplar yalnızca düzenleme görünümünde rozet olarak görünür; öğrenci çıktısına girmez.'
              : 'Cevap anahtarı öğretmen nüshasında ayrı A4 sayfası olarak eklenir.'}
        </p>
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5 text-[9px] font-bold text-[var(--text-secondary)]">
          <span>Türetilen cevap</span>
          <span>{answers.length}</span>
        </div>
        {answers.length === 0 && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[9px] text-amber-600 dark:text-amber-400">
            Cevap bulunamadı. İçerik sekmesinden cevap metni ekleyin veya boşlukları [cevap]
            biçiminde yazın.
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          <MiniButton
            icon="fa-file-word"
            label="Anahtarı Word İndir"
            title="Cevap anahtarı dahil Word belgesi indir"
            onClick={() => downloadWord(true)}
            disabled={!answerKeyPage}
          />
          <MiniButton
            icon="fa-eye"
            label="Önizle"
            title="Cevap anahtarı görünümünü aç/kapat"
            onClick={() => setAnswerKeyMode(answerKeyMode === 'appendix' ? 'off' : 'appendix')}
          />
        </div>
      </Section>

      <Section
        title="Kağıt Ekonomisi ve Baskı"
        icon="fa-print"
        description="Sınıf ölçeğinde fotokopi maliyeti ve baskı güvenliği."
      >
        <ToggleRow
          label="Yaprak başına 2 sayfa"
          hint="N-up: yazdırmada iki A4 sayfası tek yaprağa"
          icon="fa-copy"
          checked={printLayout === 'nup2'}
          onChange={(checked) => setPrintLayout(checked ? 'nup2' : 'single')}
        />
        <ToggleRow
          label="Kesme çizgileri"
          hint="Baskıda kesme/katlama kılavuzu"
          icon="fa-scissors"
          checked={cutLines}
          onChange={setCutLines}
        />
        <div
          className={`rounded-lg border px-2 py-1.5 text-[9px] leading-relaxed ${
            marginValue < safeMargin
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'
          }`}
        >
          <i className="fa-solid fa-vector-square mr-1"></i>
          Kenar boşluğu {marginValue}mm — güvenli baskı sınırı {safeMargin}mm.
          {marginValue < safeMargin
            ? ' Çoğu yazıcı bu alanı keser; Sayfa sekmesinden artırın.'
            : ' Güvenli.'}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <MiniButton
            icon="fa-file-pdf"
            label="Vektörel PDF"
            title="Tarayıcı baskı motoruyla metin seçilebilir PDF"
            onClick={() => void vectorPrint()}
          />
          <MiniButton
            icon="fa-file-word"
            label="Öğrenci Word"
            title="Cevapsız Word belgesi indir"
            onClick={() => downloadWord(false)}
          />
          <MiniButton
            icon="fa-copy"
            label="Panoya Kopyala"
            title="Seçili (veya tüm) bileşenleri HTML olarak kopyala"
            onClick={() => void copySelected()}
          />
        </div>
      </Section>

      <Section
        title="Sürümler"
        icon="fa-clock-rotate-left"
        description="Adlandırılmış anlık görüntüler bu cihazda saklanır; arşive kaydetme bulut kopyasını oluşturur."
      >
        <Field label="Sürüm Adı">
          <TextField
            value={versionName}
            onChange={setVersionName}
            placeholder={`Sürüm ${versions.length + 1} — ör. Veli görüşü öncesi`}
          />
        </Field>
        <div className="flex flex-wrap gap-1.5">
          <MiniButton
            icon="fa-camera"
            label="Sürüm Kaydet"
            title="Geçerli tasarımın anlık görüntüsünü sakla"
            onClick={saveCurrentVersion}
          />
          <MiniButton
            icon="fa-download"
            label="Dışa Aktar"
            title="Tüm sürümleri JSON olarak indir"
            onClick={exportVersions}
          />
          <MiniButton
            icon="fa-upload"
            label="İçe Aktar"
            title="Sürüm JSON dosyasını yükle"
            onClick={() => importRef.current?.click()}
          />
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importVersionFile(file);
              event.target.value = '';
            }}
          />
        </div>
        {importError && (
          <p className="text-[9px] font-bold text-rose-500">{importError}</p>
        )}
        {versions.length === 0 ? (
          <p className="text-[9px] text-[var(--text-muted)]">
            Henüz sürüm yok. Büyük değişiklik öncesi sürüm kaydetmek geri dönüş güvencesi verir.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {versions.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] px-2 py-1.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-black text-[var(--text-primary)]">
                    {entry.name}
                  </p>
                  <p className="text-[8px] text-[var(--text-muted)]">
                    {new Date(entry.createdAt).toLocaleString('tr-TR')} • {entry.blockCount} bileşen
                  </p>
                </div>
                <MiniButton
                  icon="fa-rotate-left"
                  title="Bu sürümü geri yükle"
                  onClick={() => restoreVersion(entry)}
                />
                <MiniButton
                  icon="fa-trash-can"
                  title="Sürümü sil"
                  danger
                  onClick={() => removeVersion(entry)}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="İnceleme Yorumları"
        icon="fa-comments"
        description="Zümre öğretmeni veya uzmanın bileşen bazlı notları."
      >
        {comments.length === 0 ? (
          <p className="text-[9px] leading-relaxed text-[var(--text-muted)]">
            Açık yorum yok. İçerik sekmesindeki “İnceleme Yorumu” alanından not bırakabilirsiniz.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {comments.map((entry) => {
              const block = entry.block;
              return (
                <li
                  key={block.id ?? `${entry.pageIndex}-${entry.index}`}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] px-2 py-1.5"
                >
                  <p className="text-[8px] font-black uppercase tracking-widest text-[var(--accent-color)]">
                    {blockTypeLabel(block.type)}
                  </p>
                  <p className="mt-0.5 text-[9px] leading-relaxed text-[var(--text-secondary)]">
                    {block.reviewComment}
                  </p>
                  <div className="mt-1 flex gap-1">
                    <MiniButton
                      icon="fa-crosshairs"
                      label="Bileşene Git"
                      title="Yorumun bulunduğu bileşene git"
                      onClick={() => jumpToBlock(block.id)}
                    />
                    <MiniButton
                      icon="fa-check"
                      label="Çözüldü"
                      title="Yorumu çözüldü olarak işaretle"
                      onClick={() =>
                        block.id && updateBlockMeta(block.id, { reviewResolved: true })
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section
        title="Performans"
        icon="fa-gauge-high"
        description="Geçmiş anlık görüntüleri bellek bütçesiyle sınırlanır."
      >
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1.5">
            <p className="text-[12px] font-black text-[var(--text-primary)]">{history.length}</p>
            <p className="text-[8px] uppercase tracking-widest text-[var(--text-muted)]">Geri</p>
          </div>
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1.5">
            <p className="text-[12px] font-black text-[var(--text-primary)]">{future.length}</p>
            <p className="text-[8px] uppercase tracking-widest text-[var(--text-muted)]">İleri</p>
          </div>
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1.5">
            <p className="text-[12px] font-black text-[var(--text-primary)]">
              {Math.round(historyBytes / 1024)} KB
            </p>
            <p className="text-[8px] uppercase tracking-widest text-[var(--text-muted)]">Bellek</p>
          </div>
        </div>
        <MiniButton
          icon="fa-broom"
          label="Geçmişi Temizle"
          title="Geri al geçmişini boşalt (veri silinmez)"
          onClick={() => {
            clearHistory();
            toast.info('Geçmiş temizlendi.');
          }}
        />
      </Section>
    </div>
  );
};
