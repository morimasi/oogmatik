'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateQuestionsFromText } from '../../../../modules/turkce-super-studyo/ai/magicGenerator';
import { simplifyText, calculateReadabilityScore } from '../../../../modules/turkce-super-studyo/ai/textSimplifier';
import { QuestionRenderer } from '../../../../modules/turkce-super-studyo/components/organisms/questions/QuestionRenderer';
import { useTurkceSessionStore } from '../../../../modules/turkce-super-studyo/store/useTurkceSessionStore';
import { useGlobalStore } from '../../../../shared/store/useGlobalStore';
import {
  Sparkles, Wand2, Loader2, RefreshCcw, Save, Check,
  BarChart2, FileDown, Eye, EyeOff, BookOpen, Play, ChevronRight,
  ArrowRight, RotateCcw, Trophy, Zap,
} from 'lucide-react';
import { Question } from '../../../../modules/turkce-super-studyo/types/schemas';
import { motion, AnimatePresence } from 'framer-motion';

const DRAFT_KEY = 'turkce_studyo_draft';
const FASIKUL_BRIDGE = 'fasikul_bridge_data';
const METIN_BRIDGE = 'metin_paragraf_bridge';

interface Draft { text: string; gradeLevel: number; questions: Question[]; savedAt: string; }

type PanelTab = 'editor' | 'preview';

// ─── Okunabilirlik renk yardımcısı ───────────────────────────────────────────
function scoreLabel(score: number | null): { text: string; color: string; bg: string } {
  if (score === null) return { text: '—', color: 'text-gray-400', bg: 'bg-gray-50' };
  if (score >= 90) return { text: '1. Sınıf ✓', color: 'text-green-700', bg: 'bg-green-50' };
  if (score >= 70) return { text: '2. Sınıf ✓', color: 'text-teal-700', bg: 'bg-teal-50' };
  if (score >= 50) return { text: '3. Sınıf', color: 'text-amber-700', bg: 'bg-amber-50' };
  return { text: '4.+ Sınıf ⚠', color: 'text-red-700', bg: 'bg-red-50' };
}

export default function OgretmenPaneliPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [text, setText] = useState('');
  const [gradeLevel, setGradeLevel] = useState<1 | 2 | 3 | 4>(2);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [savedDraft, setSavedDraft] = useState<Draft | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [fasikulBridged, setFasikulBridged] = useState(false);
  const [metinBridged, setMetinBridged] = useState(false);
  const [tab, setTab] = useState<PanelTab>('editor');

  // Önizleme modu state
  const [previewIdx, setPreviewIdx] = useState(0);
  const [previewScore, setPreviewScore] = useState(0);
  const [previewComplete, setPreviewComplete] = useState(false);

  // ── Store bağlantıları ──────────────────────────────────────────────────────
  const { startSession, recordInteraction, endSession } = useTurkceSessionStore();
  const { dyslexiaSettings } = useGlobalStore();

  // ── Okunabilirlik skoru ──────────────────────────────────────────────────
  const readabilityScore = useMemo(
    () => (text.trim().length > 20 ? calculateReadabilityScore(text) : null),
    [text]
  );
  const scoreInfo = scoreLabel(readabilityScore);

  // ── Taslak yükle ────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (stored) setSavedDraft(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const handleSimplify = useCallback(async () => {
    if (!text.trim()) return;
    setIsSimplifying(true);
    try {
      const simplified = await simplifyText({ originalText: text, targetGradeLevel: gradeLevel });
      setText(simplified);
    } finally {
      setIsSimplifying(false);
    }
  }, [text, gradeLevel]);

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setQuestions([]);
    setTab('editor');
    try {
      const newQuestions = await generateQuestionsFromText({
        text, count: 4, difficulty: 'ORTA', gradeLevel,
        skills: ['ANA_FIKIR', 'SOZ_VARLIGI', 'SEBEP_SONUC'],
      });
      setQuestions(newQuestions);
    } finally {
      setIsGenerating(false);
    }
  }, [text, gradeLevel]);

  const handleSaveDraft = useCallback(() => {
    const draft: Draft = { text, gradeLevel, questions, savedAt: new Date().toLocaleString('tr-TR') };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setSavedDraft(draft);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch { /* storage full */ }
  }, [text, gradeLevel, questions]);

  const handleLoadDraft = useCallback(() => {
    if (!savedDraft) return;
    setText(savedDraft.text);
    setGradeLevel(savedDraft.gradeLevel as 1 | 2 | 3 | 4);
    setQuestions(savedDraft.questions || []);
    setSavedDraft(null);
  }, [savedDraft]);

  // ── Fasikül Bridge (D2) ─────────────────────────────────────────────────────
  const handleCreateFasikul = useCallback(() => {
    if (questions.length === 0 || !text.trim()) return;
    const bridge = { passage: { title: 'Öğretmen Paneli Metni', content: text, gradeLevel }, questions, createdAt: new Date().toISOString() };
    try {
      localStorage.setItem(FASIKUL_BRIDGE, JSON.stringify(bridge));
      setFasikulBridged(true);
      setTimeout(() => setFasikulBridged(false), 3500);
    } catch { /* storage full */ }
  }, [questions, text, gradeLevel]);

  // ── Metin Paragraf Bridge ────────────────────────────────────────────────────
  const handleSendToMetin = useCallback(() => {
    if (!text.trim()) return;
    const bridge = { text, gradeLevel, sentAt: new Date().toISOString() };
    try {
      localStorage.setItem(METIN_BRIDGE, JSON.stringify(bridge));
      setMetinBridged(true);
      setTimeout(() => setMetinBridged(false), 3500);
    } catch { /* storage full */ }
  }, [text, gradeLevel]);

  // ── Önizleme Modu — useTurkceSessionStore entegrasyonu ─────────────────────
  const startPreview = useCallback(() => {
    if (questions.length === 0) return;
    setPreviewIdx(0);
    setPreviewScore(0);
    setPreviewComplete(false);
    setTab('preview');
    // Oturumu başlat (öğretmen kendi materyalini test ediyor)
    startSession('ogretmen-preview', 'METIN_PARAGRAF');
  }, [questions, startSession]);

  const handlePreviewAnswer = useCallback((isCorrect: boolean) => {
    // Skor kaydı — useTurkceSessionStore
    recordInteraction({
      questionId: questions[previewIdx]?.id ?? 'unknown',
      timeSpentMs: 0,
      attempts: 1,
      isCorrect,
      givenAnswer: null,
      hintsUsed: 0,
    });
    if (isCorrect) setPreviewScore(s => s + 1);
    setTimeout(() => {
      const next = previewIdx + 1;
      if (next >= questions.length) {
        setPreviewComplete(true);
        endSession();
      } else {
        setPreviewIdx(next);
      }
    }, 1300);
  }, [previewIdx, questions, recordInteraction, endSession]);

  const resetPreview = useCallback(() => {
    setPreviewIdx(0);
    setPreviewScore(0);
    setPreviewComplete(false);
    startSession('ogretmen-preview', 'METIN_PARAGRAF');
  }, [startSession]);

  const currentPreviewQ = questions[previewIdx];
  const previewProgress = questions.length > 0 ? (previewIdx / questions.length) * 100 : 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="max-w-7xl mx-auto p-4 md:p-8 space-y-6"
      style={{ fontFamily: dyslexiaSettings.fontFamily !== 'System' ? dyslexiaSettings.fontFamily : undefined }}
    >
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-indigo-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-indigo-500" />
            Soru Fabrikası
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">
            Metninizi yapıştırın → Gemini AI ile disleksi dostu sorular üretin → Önizleyin → Fasiküle aktarın.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Okunabilirlik skoru */}
          {readabilityScore !== null && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${scoreInfo.bg} border-gray-100`}>
              <BarChart2 size={15} className={scoreInfo.color} />
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Okunabilirlik</div>
                <div className={`text-sm font-bold ${scoreInfo.color}`}>{readabilityScore}/100 — {scoreInfo.text}</div>
              </div>
            </motion.div>
          )}
          {/* Sınıf */}
          <select value={gradeLevel} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGradeLevel(Number(e.target.value) as 1 | 2 | 3 | 4)}
            className="bg-white border-2 border-indigo-100 text-gray-800 text-sm rounded-xl px-3 py-2 font-bold focus:outline-none">
            {[1, 2, 3, 4].map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
          </select>
        </div>
      </div>

      {/* ─── Taslak Banner ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {savedDraft && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center justify-between bg-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-3">
            <p className="text-amber-800 font-bold text-sm">
              📋 Kaydedilmiş taslak: <span className="opacity-70">{savedDraft.savedAt}</span>
            </p>
            <button onClick={handleLoadDraft} className="text-sm font-bold text-amber-700 underline hover:text-amber-900 ml-4">
              Yükle
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Tab Bar ─────────────────────────────────────────────────────────── */}
      {questions.length > 0 && (
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1 self-start w-fit">
          {[{ id: 'editor', label: 'Editör', icon: Wand2 }, { id: 'preview', label: 'Önizleme', icon: Eye }].map(t => (
            <button key={t.id} onClick={() => t.id === 'preview' ? startPreview() : setTab('editor')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all ${tab === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
              <t.icon size={15} />{t.label}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ══════════════ EDITÖR TABI ════════════════════════════════════════ */}
        {tab === 'editor' && (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Sol: Metin Editörü */}
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-400" />
                    1. Kaynak Metin
                  </h2>
                  <textarea
                    value={text}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                    rows={10}
                    className="w-full font-medium text-gray-800 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-indigo-300 focus:outline-none p-4 resize-none text-base leading-relaxed transition-all"
                    placeholder="Ders kitabından, hikaye kitabından veya kendi yazdığınız metni buraya yapıştırın..."
                    style={{ lineHeight: dyslexiaSettings.lineHeight }}
                  />

                  {/* Eylem butonları */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <motion.button onClick={handleSimplify} disabled={isSimplifying || !text.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="px-4 py-2 bg-teal-50 text-teal-700 border-2 border-teal-200 rounded-xl font-bold text-sm hover:bg-teal-100 disabled:opacity-50 flex items-center gap-1.5">
                      {isSimplifying ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                      Sadeleştir
                    </motion.button>

                    <motion.button onClick={handleGenerate} disabled={isGenerating || !text.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md disabled:opacity-50 flex items-center gap-1.5">
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {isGenerating ? 'Üretiliyor...' : 'AI Soru Üret (4 soru)'}
                    </motion.button>

                    {/* Metin Paragraf'a Gönder */}
                    <motion.button onClick={handleSendToMetin} disabled={!text.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 border-2 transition-all disabled:opacity-40 ${metinBridged ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        }`}
                      title="Metni Metin Paragraf stüdyosuna aktar">
                      {metinBridged ? <><Check size={14} /> Metin Aktarıldı!</> : <><ArrowRight size={14} /> Metin Paragraf'a Gönder</>}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Sağ: Üretilen Sorular */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles size={18} className="text-indigo-400" />
                    2. Üretilen Sorular {questions.length > 0 && <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">{questions.length}</span>}
                  </h2>
                  {questions.length > 0 && (
                    <button onClick={startPreview}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                      <Play size={12} /> Önizle
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px]">
                  {questions.length === 0 && !isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl min-h-[200px]">
                      <Wand2 size={48} className="mb-4 opacity-50" />
                      <p className="text-base font-medium text-gray-400">Metni girip AI Soru Üret'e basın.</p>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="flex flex-col items-center justify-center text-indigo-500 p-8 text-center min-h-[200px]">
                      <Loader2 size={40} className="animate-spin mb-4" />
                      <p className="text-base font-bold">Gemini soru üretiyor...</p>
                    </div>
                  )}
                  <AnimatePresence>
                    {questions.map((q, idx) => (
                      <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${q.type === 'MCQ' ? 'bg-violet-100 text-violet-700' :
                              q.type === 'TRUE_FALSE' ? 'bg-green-100 text-green-700' :
                                q.type === 'FILL_BLANK' ? 'bg-amber-100 text-amber-700' :
                                  q.type === 'OPEN_ENDED' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                            }`}>{q.type}</span>
                          <span className="text-[10px] font-bold text-gray-400">{q.difficulty}</span>
                          <span className="text-[10px] text-gray-400 ml-auto">Soru {idx + 1}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 leading-snug">{q.instruction}</p>
                        {q.type === 'TRUE_FALSE' && (q as any).statement && (
                          <p className="mt-1 text-xs text-gray-500 italic">"{(q as any).statement}"</p>
                        )}
                        {q.type === 'MCQ' && (q as any).options && (
                          <ul className="mt-1.5 space-y-0.5">
                            {(q as any).options.map((o: any) => (
                              <li key={o.id} className={`text-xs font-medium ${o.isCorrect ? 'text-green-700' : 'text-gray-500'}`}>
                                {o.isCorrect ? '✓' : '·'} {o.text}
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Alt aksiyon butonları */}
                {(text.trim() || questions.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 flex-wrap">
                    <motion.button onClick={handleSaveDraft} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className={`flex-1 min-w-0 py-2.5 flex items-center justify-center gap-1.5 font-bold rounded-xl text-sm transition-all ${draftSaved ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>
                      {draftSaved ? <Check size={15} /> : <Save size={15} />}
                      {draftSaved ? 'Kaydedildi!' : 'Taslak Kaydet'}
                    </motion.button>

                    {questions.length > 0 && (
                      <motion.button onClick={handleCreateFasikul} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className={`flex-1 min-w-0 py-2.5 flex items-center justify-center gap-1.5 font-bold rounded-xl text-sm transition-all shadow-sm ${fasikulBridged ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        title={fasikulBridged ? 'Çalışma Kağıdı stüdyosuna gidin.' : 'Soruları Çalışma Kağıdına aktar'}>
                        {fasikulBridged ? <><Check size={15} /> Fasikül Hazır!</> : <><FileDown size={15} /> Fasikül Oluştur</>}
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════ ÖNİZLEME TABI ════════════════════════════════════ */}
        {tab === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border-2 border-indigo-50">

            {/* Preview header */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setTab('editor')}
                className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
                ← Editöre Dön
              </button>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-2 bg-indigo-500 rounded-full" animate={{ width: `${previewProgress}%` }} transition={{ duration: 0.4 }} />
              </div>
              <span className="text-sm font-bold text-gray-600">
                {Math.min(previewIdx + 1, questions.length)}/{questions.length}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold flex items-center gap-1">
                <Trophy size={14} />{previewScore} puan
              </span>
            </div>

            {/* Soru render */}
            <AnimatePresence mode="wait">
              {!previewComplete && currentPreviewQ && (
                <motion.div key={currentPreviewQ.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-3 flex items-center gap-2">
                    <Eye size={15} className="text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Öğretmen Önizleme Modu</span>
                  </div>
                  {/* useTurkceSessionStore entegreli QuestionRenderer */}
                  <QuestionRenderer question={currentPreviewQ} onAnswer={handlePreviewAnswer} />
                </motion.div>
              )}

              {/* Önizleme Tamamlandı */}
              {previewComplete && (
                <motion.div key="complete" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-extrabold text-indigo-800 mb-2">Önizleme Tamamlandı!</h2>
                  <p className="text-lg font-bold text-indigo-600 mb-1">{previewScore}/{questions.length} doğru</p>
                  <p className="text-sm text-gray-500 mb-8">Oturum kaydedildi — useTurkceSessionStore güncellendi.</p>
                  <div className="flex gap-3 justify-center">
                    <motion.button onClick={resetPreview} whileHover={{ scale: 1.02 }}
                      className="px-6 py-3 bg-white border-2 border-indigo-200 text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 flex items-center gap-2">
                      <RotateCcw size={16} /> Tekrar Test Et
                    </motion.button>
                    <motion.button onClick={handleCreateFasikul} whileHover={{ scale: 1.02 }}
                      className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 flex items-center gap-2 shadow-md">
                      <FileDown size={16} /> Fasikül Oluştur
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
