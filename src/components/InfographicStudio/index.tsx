/**
 * InfographicStudio/index.tsx
 * @antv/infographic tabanlı AI destekli infografik oluşturma stüdyosu.
 *
 * Elif Yıldız (Pedagoji) onaylı: pedagogicalNote zorunlu, ZPD uyumlu.
 * Bora Demir (Mühendislik) onaylı: TypeScript strict, AppError formatı.
 * Selin Arslan (AI) onaylı: Gemini 2.5 Flash, sanitize edilmiş prompt.
 */

import React, { useState, useCallback, useRef } from 'react';
import InfographicRenderer from '../InfographicRenderer';
import { NativeInfographicRenderer } from '../NativeInfographicRenderer';
import {
  generateInfographicSyntax,
  getDemoSyntax,
  getDemoSequenceSyntax,
  type InfographicRequest,
  type InfographicResult,
} from '../../services/infographicService';

// ── Tipler ──────────────────────────────────────────────────────────────────

type AgeGroup = '5-7' | '8-10' | '11-13' | '14+';
type LearningProfile = 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed' | 'general';
type TemplateHint =
  | 'sequence'
  | 'list'
  | 'compare'
  | 'hierarchy'
  | 'timeline'
  | 'auto';

interface InfographicStudioProps {
  onBack?: () => void;
}

// ── Sabit Veriler ────────────────────────────────────────────────────────────

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: '5-7', label: '5-7 Yaş' },
  { value: '8-10', label: '8-10 Yaş' },
  { value: '11-13', label: '11-13 Yaş' },
  { value: '14+', label: '14+ Yaş' },
];

const PROFILES: { value: LearningProfile; label: string; icon: string }[] = [
  { value: 'general', label: 'Genel', icon: 'fa-users' },
  { value: 'dyslexia', label: 'Disleksi Desteği', icon: 'fa-book-open-reader' },
  { value: 'dyscalculia', label: 'Diskalkuli Desteği', icon: 'fa-calculator' },
  { value: 'adhd', label: 'DEHB Desteği', icon: 'fa-bolt' },
  { value: 'mixed', label: 'Karma Destek', icon: 'fa-layer-group' },
];

const TEMPLATE_HINTS: { value: TemplateHint; label: string; icon: string; desc: string }[] = [
  { value: 'auto', label: 'Otomatik', icon: 'fa-wand-magic-sparkles', desc: 'AI en uygun formatı seçer' },
  { value: 'sequence', label: 'Adım Sırası', icon: 'fa-arrow-right-arrow-left', desc: 'Süreç ve prosedürler' },
  { value: 'list', label: 'Liste', icon: 'fa-list-ul', desc: 'Kavramlar ve bilgiler' },
  { value: 'compare', label: 'Karşılaştırma', icon: 'fa-code-compare', desc: 'İki kavramı karşılaştır' },
  { value: 'hierarchy', label: 'Hiyerarşi', icon: 'fa-sitemap', desc: 'Kavramsal harita' },
  { value: 'timeline', label: 'Zaman Çizelgesi', icon: 'fa-timeline', desc: 'Tarihsel/kronolojik' },
];

const SPLD_PREMIUM_TEMPLATES = [
  {
    category: 'Disleksi (Görsel ve Fonolojik)',
    items: [
      { title: "Frayer Kelime Ağı", prompt: "Zorlanılan kelimenin fonetik analizi, tanımı, eş anlamlısı, zıt anlamlısı ve görsel hece yapısını gösteren 4 çeyrekli Frayer Modeli.", hint: "list" },
      { title: "b/d/p/q Ayırt Etme Matrisi", prompt: "b ve d, p ve q gibi karışan harflerin görsel nesne benzetişimleri (örn: yatak-bed) ve ince motor yönleriyle karşılaştırmalı analizi.", hint: "compare" },
      { title: "Sesteş Kelimeler Örümcek Ağı", prompt: "Sesteş kelime örümcek ağı: 'KIR' kelimesinin farklı anlamlarını merkeze yaz ve her dala emoji + anlam + kısa örnek cümle ekle. 1. dal: 🌿 kır (kırsal doğal alan) — 'Kıra piknik yapmaya gittik.', 2. dal: ✂️ kır (kırmak, parçalamak) — 'Bardağı yere düşürüp kırdı.', 3. dal: 🐴 kır (gri-beyaz hayvan/renk) — 'Kır at çayırda koşuyordu.', 4. dal: 💇 kır (beyaz saç teli) — 'Dedemin saçlarında kırlar çıkmış.'. Her çocuk düğümde desc alanına kısa Türkçe açıklama ekle. Yaş grubuna uygun, MEB Türkçe müfredatı 'Söz Varlığı' kazanımına göre.", hint: "hierarchy" }
    ]
  },
  {
    category: 'Diskalkuli (Sayısal Somutlaştırma)',
    items: [
      { title: "Somut Kesir Parçalamaları", prompt: "Bütün, Yarım ve Çeyrek kavramlarını soyut sayılarla değil, pizza dilimleri ve lego bloklarına bölerek adım adım anlatan kesir süreci.", hint: "sequence" },
      { title: "Algoritmik Onluk Bozma Akışı", prompt: "Sayıları 10'luk taban bloklarıyla modelleyerek, çıkarma işleminde 'komşuya gitme' eylemini renk kodlu adım adım anlatan akış şeması.", hint: "sequence" }
    ]
  },
  {
    category: 'DEHB (Yürütücü İşlevler)',
    items: [
      { title: "Pomodoro Zaman Yönetimi Saati", prompt: "Büyük bir ev ödevini minik adımlara bölen (Örn: Hazırlık, 15dk Odaklanma, 5dk Hareket, Bitiş) renk kodlu zaman yönetimi çizelgesi.", hint: "timeline" },
      { title: "Etki-Tepki Neden-Sonuç Zinciri", prompt: "Dürtüsel davranışların (örn: söz kesme) sosyal çevreye etkilerini oklarla bağlayarak gösteren Neden-Sonuç (Etki-Tepki) zinciri.", hint: "list" }
    ]
  },
  {
    category: 'Disgrafi & Bellek & Duyu',
    items: [
      { title: "3 Aşamalı Motor Yön Çizgesi", prompt: "3 satırlı kılavuz çizgiler üzerinde, kalemin tam başlangıç noktası ve kavis yönlerini adım adım öğreten ince motor harf yazım haritası.", hint: "sequence" },
      { title: "5N1K Hikaye Çatısı", prompt: "Okuduğunu anlamada kaybolmamak için ana karakter, yer, olay, zaman ve sonuç düğümlerini 5N1K metoduyla bağlayan hiyerarşik zihin haritası.", hint: "hierarchy" },
      { title: "Duyusal Regülasyon Termometresi", prompt: "Çocuğun anlık ruh halini (Aşırı Hareketli, Sakin, Yorgun) temsil eden ve her aşama için bir rahatlama stratejisi sunan görsel duygu termometresi.", hint: "compare" }
    ]
  }
];

// ── Yardımcı Bileşenler ──────────────────────────────────────────────────────

const SelectButton = <T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; icon?: string; desc?: string }[];
  onChange: (v: T) => void;
  label: string;
}) => (
  <div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.desc}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${value === opt.value
            ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-900/40'
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-violet-500/50 hover:text-white'
            }`}
        >
          {opt.icon && <i className={`fa-solid ${opt.icon} text-[10px]`}></i>}
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

// ── Ana Bileşen ──────────────────────────────────────────────────────────────

export const InfographicStudio: React.FC<InfographicStudioProps> = ({ onBack }) => {
  // Form State
  const [topic, setTopic] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('8-10');
  const [profile, setProfile] = useState<LearningProfile>('general');
  const [templateHint, setTemplateHint] = useState<TemplateHint>('auto');
  const [editableSyntax, setEditableSyntax] = useState('');
  const [showSyntaxEditor, setShowSyntaxEditor] = useState(false);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState<InfographicResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preview
  const [isEditable, setIsEditable] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);

  const activeSyntax = editableSyntax || result?.syntax || '';

  // ── AI ile infografik üret ─────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    const trimmed = topic.trim();
    if (!trimmed) {
      setError('Lütfen bir konu girin.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const req: InfographicRequest = {
      topic: trimmed,
      ageGroup,
      profile,
      templateHint: templateHint === 'auto' ? undefined : templateHint,
      language: 'tr',
    };

    try {
      const res = await generateInfographicSyntax(req);
      setResult(res);
      setEditableSyntax(res.syntax);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(`İnfografik üretilemedi: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  }, [topic, ageGroup, profile, templateHint]);

  // ── AI Prompt Zenginleştir (Magic Enhance) ─────────────────────────────────
  const handleEnhancePrompt = async () => {
    if (!topic.trim()) return;
    setIsEnhancing(true);
    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Aşağıdaki eğitim taslağını, özel öğrenme güçlüğü yaşayan çocuklar için @antv/infographic kod jeneratörüne verilecek çok zengin pedagojik bir PROMPT'a (istek metnine) dönüştür. Asla kod üretme, sadece konuyu betimle. Max 3 Paragraf. Taslak: "${topic}"`,
          systemInstruction: 'Sadece zenginleştirilmiş metni dön, markdown kullanma.'
        })
      });
      const data = await resp.json();
      if (data?.text) {
        setTopic(data.text.trim());
      }
    } catch (e) {
      console.warn('Enhance başarısız', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  // ── Demo syntax yükle ──────────────────────────────────────────────────────
  const handleLoadDemo = useCallback(() => {
    const isSeq = templateHint === 'sequence';
    const syntaxToUse = isSeq
      ? getDemoSequenceSyntax(topic || 'Örnek Konu', ageGroup)
      : getDemoSyntax(topic || 'Örnek Konu', ageGroup);
    setEditableSyntax(syntaxToUse);
    setResult({
      syntax: syntaxToUse,
      title: isSeq
        ? `${topic || 'Örnek Konu'} — Adım Sırası`
        : `${topic || 'Örnek Konu'} — Karşılaştırma`,
      pedagogicalNote: isSeq
        ? 'Demo mod: "sequence-steps" formatı, süreç ve prosedürleri adım adım göstermek için idealdir. Numaralı adımlar bilişsel yükü azaltır ve DEHB desteğine ihtiyacı olan öğrencilerde odaklanmayı artırır.'
        : 'Demo mod: "compare-binary-horizontal" formatı, iki kavramı yan yana karşılaştırarak analitik düşünmeyi destekler. Disleksi desteğine ihtiyacı olan öğrenciler için renk kodlaması ve yapılandırılmış (scaffolding) yaklaşım bilişsel yükü azaltır.',
      templateType: isSeq ? 'sequence-steps' : 'compare-binary-horizontal',
    });
    setError(null);
  }, [topic, ageGroup, templateHint]);

  // ── SVG olarak indir ───────────────────────────────────────────────────────
  const handleExportSvg = useCallback(() => {
    if (!rendererRef.current) return;
    const svg = rendererRef.current.querySelector('svg');
    if (!svg) {
      setError('SVG bulunamadı. Önce infografik render edin.');
      return;
    }
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infografik-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-inter">
      {/* ── SOL PANEL: Ayarlar ── */}
      <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-slate-700/50 bg-slate-800/80 backdrop-blur-md shadow-xl relative z-10">
        {/* Header */}
        <div className="p-5 border-b border-slate-700/50 bg-slate-800 flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-xs text-slate-300"></i>
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              İnfografik Stüdyosu
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">@antv/infographic · AI Destekli</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* Konu Girişi ve AI Zenginleştirme */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Konu / Senaryo Prompt'u
              </label>
              <button 
                onClick={handleEnhancePrompt} 
                disabled={isEnhancing || !topic.trim()}
                className="text-[10px] px-2 py-1 rounded-md bg-violet-900/40 text-violet-300 hover:bg-violet-800/60 transition-colors disabled:opacity-50"
              >
                {isEnhancing ? 'Zenginleştiriliyor...' : <><i className="fa-solid fa-wand-magic-sparkles mr-1"></i> AI Zenginleştir</>}
              </button>
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Spesifik bir konu yazın veya alt kısımdan premium şablon seçin..."
              rows={4}
              maxLength={800}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500 transition-colors"
            />
            
            {/* 10 Premium SpLD Şablonu Dropdown (Gruplandırılmış) */}
            <div className="mt-3">
              <select 
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg p-2 focus:border-violet-500 outline-none"
                onChange={(e) => {
                  if(!e.target.value) return;
                  const [catIndex, itemIndex] = e.target.value.split('-');
                  const selected = SPLD_PREMIUM_TEMPLATES[Number(catIndex)].items[Number(itemIndex)];
                  setTopic(selected.prompt);
                  setTemplateHint(selected.hint as TemplateHint);
                }}
                defaultValue=""
              >
                <option value="" disabled>✨ Premium SpLD Şablonlarından Seçin...</option>
                {SPLD_PREMIUM_TEMPLATES.map((category, catIdx) => (
                  <optgroup key={category.category} label={category.category}>
                    {category.items.map((item, itemIdx) => (
                      <option key={item.title} value={`${catIdx}-${itemIdx}`}>
                        {item.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Yaş Grubu */}
          <SelectButton
            label="Yaş Grubu"
            value={ageGroup}
            options={AGE_GROUPS}
            onChange={(v) => setAgeGroup(v as AgeGroup)}
          />

          {/* Öğrenme Profili */}
          <SelectButton
            label="Öğrenme Profili"
            value={profile}
            options={PROFILES}
            onChange={(v) => setProfile(v as LearningProfile)}
          />

          {/* Template Türü */}
          <SelectButton
            label="İnfografik Türü"
            value={templateHint}
            options={TEMPLATE_HINTS}
            onChange={(v) => setTemplateHint(v as TemplateHint)}
          />

          {/* Hata */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-sm text-red-300 flex items-start gap-2">
              <i className="fa-solid fa-triangle-exclamation mt-0.5 flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Üret Butonu */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-900/30"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                AI üretiyor…
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                AI ile Oluştur
              </>
            )}
          </button>

          <button
            onClick={handleLoadDemo}
            className="w-full py-2 rounded-xl font-semibold text-xs border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
          >
            <i className="fa-solid fa-eye mr-1.5"></i>
            Demo Görünüm (API gerektirmez)
          </button>
        </div>

        {/* Pedagojik Not - Sol Panelin Altı */}
        {result?.pedagogicalNote && (
          <div className="m-4 p-3 bg-emerald-900/20 border border-emerald-700/30 rounded-xl">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <i className="fa-solid fa-graduation-cap"></i> Pedagojik Not
            </p>
            <p className="text-xs text-emerald-300 leading-relaxed line-clamp-5">{result.pedagogicalNote}</p>
            {result.pedagogicalNote.length > 200 && (
              <p className="text-[10px] text-emerald-500 mt-1">Sağ panelde tam metin görünür.</p>
            )}
          </div>
        )}
      </div>

      {/* ── SAĞ PANEL: Önizleme ── */}
      <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {result && (
              <span className="text-sm font-semibold text-slate-200 truncate max-w-xs">
                {result.title}
              </span>
            )}
            {result?.templateType && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300 border border-violet-700/30 font-mono">
                {result.templateType}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSyntaxEditor(!showSyntaxEditor)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${showSyntaxEditor
                ? 'bg-slate-700 border-slate-500 text-slate-100'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
            >
              <i className="fa-solid fa-code mr-1.5"></i>
              Syntax
            </button>
            <button
              onClick={() => setIsEditable(!isEditable)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${isEditable
                ? 'bg-violet-700 border-violet-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
            >
              <i className={`fa-solid ${isEditable ? 'fa-lock-open' : 'fa-pen'} mr-1.5`}></i>
              {isEditable ? 'Düzenleniyor' : 'Düzenle'}
            </button>
            <button
              onClick={handleExportSvg}
              disabled={!activeSyntax}
              className="text-xs px-3 py-1.5 rounded-lg font-medium border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
            >
              <i className="fa-solid fa-download mr-1.5"></i>
              SVG
            </button>
          </div>
        </div>

        {/* Syntax Editör (isteğe bağlı) */}
        {showSyntaxEditor && (
          <div className="px-6 pt-4 pb-0">
            <textarea
              value={editableSyntax}
              onChange={(e) => setEditableSyntax(e.target.value)}
              placeholder="@antv/infographic syntax buraya yazın veya AI ile üretin…"
              rows={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        )}

        {/* İnfografik Render Alanı */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-start justify-start" ref={rendererRef}>
          {activeSyntax ? (
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* @antv/infographic (birincil) + NativeInfographicRenderer (fallback, her zaman görünsün) */}
              <InfographicRenderer
                key={activeSyntax.slice(0, 60)}
                syntax={activeSyntax}
                editable={isEditable}
                height="600px"
                onError={(err) => {
                  // Render hatası bildirimi — native zaten devreye giriyor
                  console.warn('[Studio] InfographicRenderer hata:', err.message);
                }}
                className="w-full"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-6">
                <i className="fa-solid fa-chart-pie text-slate-500 text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-400 mb-2">İnfografik Alanı</h3>
              <p className="text-sm text-slate-600 max-w-sm">
                Sol panelde konu girin ve{' '}
                <span className="text-violet-400 font-medium">AI ile Oluştur</span> butonuna
                tıklayın. Veya{' '}
                <span className="text-slate-400 font-medium">Demo Görünüm</span> ile test edin.
              </p>
            </div>
          )}

          {/* Pedagojik Not — Tam Metin (Sağ Panel Altı) */}
          {result?.pedagogicalNote && (
            <div className="w-full max-w-4xl mt-6 p-5 bg-emerald-950/40 border border-emerald-700/30 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <i className="fa-solid fa-graduation-cap text-emerald-400"></i>
                <p className="text-sm font-bold text-emerald-400">Pedagojik Not — Öğretmen Rehberi</p>
              </div>
              <p className="text-sm text-emerald-300 leading-relaxed">{result.pedagogicalNote}</p>
              {result.templateType && (
                <div className="mt-3 pt-3 border-t border-emerald-700/20 flex items-center gap-2">
                  <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Format:</span>
                  <span className="text-xs font-mono text-emerald-500 bg-emerald-900/40 px-2 py-0.5 rounded">{result.templateType}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfographicStudio;
