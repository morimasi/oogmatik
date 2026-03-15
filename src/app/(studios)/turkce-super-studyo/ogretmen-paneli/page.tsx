'use client';
import React, { useState, useEffect } from 'react';
import {
  generateQuestionsFromText,
} from '../../../../modules/turkce-super-studyo/ai/magicGenerator';
import { simplifyText, calculateReadabilityScore } from '../../../../modules/turkce-super-studyo/ai/textSimplifier';
import { Sparkles, Wand2, ArrowDownToLine, Loader2, RefreshCcw, Save, Check, BookOpen, BarChart2, FileDown } from 'lucide-react';
import { Question } from '../../../../modules/turkce-super-studyo/types/schemas';
import { motion, AnimatePresence } from 'framer-motion';

const DRAFT_KEY = 'turkce_studyo_draft';

interface Draft {
  text: string;
  gradeLevel: number;
  questions: Question[];
  savedAt: string;
}

export default function OgretmenPaneliPage() {
  const [text, setText] = useState('');
  const [gradeLevel, setGradeLevel] = useState<1 | 2 | 3 | 4>(2);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [savedDraft, setSavedDraft] = useState<Draft | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [readabilityScore, setReadabilityScore] = useState<number | null>(null);
  const [fasikulBridged, setFasikulBridged] = useState(false);

  // Load any existing draft on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (stored) setSavedDraft(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Recalculate readability whenever text changes
  useEffect(() => {
    if (text.trim().length > 20) {
      setReadabilityScore(calculateReadabilityScore(text));
    } else {
      setReadabilityScore(null);
    }
  }, [text]);

  const tokensRemaining = 5000;

  const handleSimplify = async () => {
    if (!text.trim()) return;
    setIsSimplifying(true);
    try {
      const simplified = await simplifyText({ originalText: text, targetGradeLevel: gradeLevel });
      setText(simplified);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setQuestions([]);
    try {
      const newQuestions = await generateQuestionsFromText({
        text,
        count: 3,
        difficulty: 'ORTA',
        gradeLevel,
      });
      setQuestions(newQuestions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = () => {
    const draft: Draft = {
      text,
      gradeLevel,
      questions,
      savedAt: new Date().toLocaleString('tr-TR'),
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setSavedDraft(draft);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch { /* storage full */ }
  };

  const handleLoadDraft = () => {
    if (!savedDraft) return;
    setText(savedDraft.text);
    setGradeLevel(savedDraft.gradeLevel as 1 | 2 | 3 | 4);
    setQuestions(savedDraft.questions || []);
  };

  // FAZ D2: Fasikül bridge — soruları calisma-kagidi'ne localStorage üzerinden taşı
  const handleCreateFasikul = () => {
    if (questions.length === 0 || !text.trim()) return;
    const bridgeData = {
      passage: { title: 'Öğretmen Paneli Metni', content: text, gradeLevel },
      questions,
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('fasikul_bridge_data', JSON.stringify(bridgeData));
      setFasikulBridged(true);
      setTimeout(() => setFasikulBridged(false), 3000);
    } catch { /* storage full */ }
  };

  const scoreColor =
    readabilityScore === null
      ? ''
      : readabilityScore >= 70
        ? 'text-green-600'
        : readabilityScore >= 45
          ? 'text-yellow-600'
          : 'text-red-600';

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-indigo-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-indigo-500" />
            Soru Fabrikası
          </h1>
          <p className="text-gray-600 font-medium mt-2">
            Metninizi yapıştırın, Gemini AI ile disleksi dostu sorulara dönüştürün.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Okunabilirlik skoru */}
          {readabilityScore !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-gray-100 px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-sm"
            >
              <BarChart2 size={16} className="text-gray-400" />
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Okunabilirlik
                </div>
                <div className={`text-lg font-bold ${scoreColor}`}>{readabilityScore}/100</div>
              </div>
            </motion.div>
          )}

          {/* AI Token Widget */}
          <div className="bg-indigo-50 border-2 border-indigo-100 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
            <RefreshCcw size={16} className="text-indigo-400" />
            <div>
              <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                AI Limiti
              </div>
              <div className="text-lg font-bold text-indigo-900">{tokensRemaining} Jeton</div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Draft Banner */}
      <AnimatePresence>
        {savedDraft && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-3 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 text-amber-800">
              <BookOpen size={16} />
              <span className="font-bold text-sm">
                Kaydedilmiş taslak: {savedDraft.savedAt}
              </span>
            </div>
            <button
              onClick={handleLoadDraft}
              className="text-sm font-bold text-amber-700 underline hover:text-amber-900 transition-colors"
            >
              Yükle
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Panel: Metin Girişi */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">1. Metin Girişi</h2>
            <select
              value={gradeLevel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGradeLevel(Number(e.target.value) as 1 | 2 | 3 | 4)}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 font-bold"
            >
              {[1, 2, 3, 4].map((g) => (
                <option key={g} value={g}>{g}. Sınıf Seviyesi</option>
              ))}
            </select>
          </div>

          <textarea
            value={text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            placeholder="Hikayeyi veya okuma metnini buraya yapıştırın..."
            className="w-full flex-1 min-h-[300px] p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all resize-none text-lg text-gray-700"
            style={{ fontFamily: 'var(--dyslexia-font-family)' }}
          />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <motion.button
              onClick={handleSimplify}
              disabled={isSimplifying || !text.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-teal-50 text-teal-700 border-2 border-teal-200 rounded-xl font-bold hover:bg-teal-100 transition-colors disabled:opacity-50"
            >
              {isSimplifying ? <Loader2 className="animate-spin" size={18} /> : <ArrowDownToLine size={18} />}
              Sadeleştir
            </motion.button>
            <motion.button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              Sihirli Soru Üret
            </motion.button>
          </div>
        </div>

        {/* Sağ Panel: Üretilen Sorular */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100 flex flex-col h-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4">2. Üretilen Sorular</h2>

          <div className="flex-1 overflow-y-auto space-y-4">
            {questions.length === 0 && !isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                <Wand2 size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  Metni girip &ldquo;Sihirli Soru Üret&rdquo; butonuna basın.
                </p>
              </div>
            ) : isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-indigo-500 p-8 text-center">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="text-lg font-bold">Gemini AI sorular üretiyor...</p>
                <p className="text-sm text-indigo-400 mt-2">Semantic Caching devrede</p>
              </div>
            ) : (
              <AnimatePresence>
                {questions.map((q: Question, idx: number) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {q.type} · {q.targetSkill}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${q.difficulty === 'KOLAY' ? 'bg-green-100 text-green-700' : q.difficulty === 'ORTA' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                      {idx + 1}. {q.instruction}
                    </h3>
                    {q.type === 'MCQ' && (
                      <ul className="space-y-1.5">
                        {(q as any).options?.map((opt: any, oIdx: number) => (
                          <li
                            key={opt.id}
                            className={`p-2 rounded-lg text-sm font-medium ${opt.isCorrect ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}
                          >
                            {String.fromCharCode(65 + oIdx)}) {opt.text}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.type === 'FILL_BLANK' && (
                      <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-200">
                        {(q as any).template}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Actions */}
          {(text.trim() || questions.length > 0) && (
            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
              <motion.button
                onClick={handleSaveDraft}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold rounded-xl transition-all ${draftSaved ? 'bg-green-100 text-green-700 border-2 border-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {draftSaved ? <Check size={18} /> : <Save size={18} />}
                {draftSaved ? 'Kaydedildi!' : 'Taslak Kaydet'}
              </motion.button>
              {questions.length > 0 && (
                <motion.button
                  onClick={handleCreateFasikul}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold rounded-xl transition-all shadow-sm ${fasikulBridged ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  title={fasikulBridged ? 'Çalışma Kağıdı stüdyosuna geçerek fasiküli oluşturabilirsiniz.' : 'Soruları Çalışma Kağıdına aktar'}
                >
                  {fasikulBridged ? <><Check size={18} /> Çalışma Kağıdı'na Aktarıldı!</> : <><FileDown size={18} /> Fasikül Oluştur</>}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
