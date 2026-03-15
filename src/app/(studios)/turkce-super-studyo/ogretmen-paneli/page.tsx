'use client';
import React, { useState } from 'react';
import { generateQuestionsFromText } from '../../../modules/turkce-super-studyo/ai/magicGenerator';
import { simplifyText } from '../../../modules/turkce-super-studyo/ai/textSimplifier';
import { Sparkles, Wand2, ArrowDownToLine, Loader2, RefreshCcw } from 'lucide-react';
import { Question } from '../../../modules/turkce-super-studyo/types/schemas';

export default function OgretmenPaneliPage() {
  const [text, setText] = useState('');
  const [gradeLevel, setGradeLevel] = useState<1 | 2 | 3 | 4>(2);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Simulated AI Token Limit for FinOps requirement
  const [tokensRemaining, setTokensRemaining] = useState(5000);

  const handleSimplify = async () => {
    if (!text.trim()) return;
    setIsSimplifying(true);
    try {
      const simplified = await simplifyText({ originalText: text, targetGradeLevel: gradeLevel });
      setText(simplified);
      setTokensRemaining((prev) => Math.max(0, prev - 150));
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
      const newQuestions = await generateQuestionsFromText({ text, count: 3, difficulty: 'ORTA' });
      setQuestions(newQuestions);
      setTokensRemaining((prev) => Math.max(0, prev - 500));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-indigo-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-indigo-500" />
            Soru Fabrikası
          </h1>
          <p className="text-gray-600 font-medium mt-2">
            Metninizi yapıştırın, yapay zeka ile disleksi dostu sorulara ve fasiküllere dönüştürün.
          </p>
        </div>

        {/* FinOps AI Token Widget */}
        <div className="bg-indigo-50 border-2 border-indigo-100 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700">
            <RefreshCcw size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
              Aylık AI Limiti
            </div>
            <div className="text-lg font-bold text-indigo-900">{tokensRemaining} Jeton</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Panel: Metin Girişi */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">1. Metin Girişi</h2>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value) as 1 | 2 | 3 | 4)}
              className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 font-bold"
            >
              <option value={1}>1. Sınıf Seviyesi</option>
              <option value={2}>2. Sınıf Seviyesi</option>
              <option value={3}>3. Sınıf Seviyesi</option>
              <option value={4}>4. Sınıf Seviyesi</option>
            </select>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Hikayeyi veya okuma metnini buraya yapıştırın..."
            className="w-full flex-1 min-h-[300px] p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all resize-none text-lg text-gray-700"
          ></textarea>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSimplify}
              disabled={isSimplifying || !text.trim()}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-teal-50 text-teal-700 border-2 border-teal-200 rounded-xl font-bold hover:bg-teal-100 transition-colors disabled:opacity-50"
            >
              {isSimplifying ? <Loader2 className="animate-spin" /> : <ArrowDownToLine />}
              Seviyeye Göre Sadeleştir
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
              Sihirli Soru Üret
            </button>
          </div>
        </div>

        {/* Sağ Panel: Üretilen Sorular */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-gray-100 flex flex-col h-full bg-slate-50">
          <h2 className="text-xl font-bold text-gray-800 mb-4">2. Üretilen Sorular</h2>

          <div className="flex-1 overflow-y-auto space-y-4">
            {questions.length === 0 && !isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                <Wand2 size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  Henüz soru üretilmedi. Metni girip "Sihirli Soru Üret" butonuna basın.
                </p>
              </div>
            ) : isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-indigo-500 p-8 text-center">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="text-lg font-bold">
                  Yapay zeka metni analiz ediyor ve disleksi dostu sorular üretiyor...
                </p>
                <p className="text-sm text-indigo-400 mt-2">
                  Bu işlem birkaç saniye sürebilir (Semantic Caching devrede).
                </p>
              </div>
            ) : (
              questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {q.type} - {q.targetSkill}
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
                    <ul className="space-y-2">
                      {(q as any).options.map((opt: any, oIdx: number) => (
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
                      Şablon: {(q as any).template}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {questions.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-4">
              <button className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Taslak Kaydet
              </button>
              <button className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                Fasikül Oluştur
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
