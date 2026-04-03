import React, { useState } from 'react';
import { generateWithSchema } from '../services/geminiClient';
import { AppError } from '../utils/AppError';
import { useToastStore } from '../store/useToastStore';

type Difficulty = 'Kolay' | 'Orta' | 'Zor';
type QuestionType = 'coktan_secmeli' | 'dogru_yanlis' | 'bosluk_doldurma' | 'acik_uclu';

interface ExamQuestion {
  id: string;
  soruMetni: string;
  secenekler?: { A: string; B: string; C: string; D: string };
  dogruCevap: string;
  puan: number;
  kazanim: string;
  zorluk: Difficulty;
}

interface GeneratedExam {
  id: string;
  baslik: string;
  sinif: string;
  sorular: ExamQuestion[];
  toplamPuan: number;
  pedagogicalNote: string;
  createdAt: number;
}

const CLASS_OPTIONS = ['3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'];
const TOPIC_OPTIONS = [
  'Okuma Anlama',
  'Yazma',
  'Dil Bilgisi',
  'Sözcükte Anlam',
  'Cümlede Anlam',
  'Paragrafta Anlam',
  'Yazım Kuralları',
  'Noktalama İşaretleri',
];

const EXAM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    baslik: { type: 'STRING', description: 'Sınav başlığı' },
    sorular: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          soruMetni: { type: 'STRING', description: 'Soru metni' },
          secenekler: {
            type: 'OBJECT',
            properties: {
              A: { type: 'STRING' },
              B: { type: 'STRING' },
              C: { type: 'STRING' },
              D: { type: 'STRING' },
            },
            required: ['A', 'B', 'C', 'D'],
          },
          dogruCevap: { type: 'STRING', description: 'Doğru şık (A, B, C veya D)' },
          puan: { type: 'NUMBER', description: 'Soru puanı' },
          kazanim: { type: 'STRING', description: 'MEB kazanım kodu' },
          zorluk: { type: 'STRING', description: 'Kolay, Orta veya Zor' },
        },
        required: ['soruMetni', 'dogruCevap', 'puan', 'kazanim', 'zorluk'],
      },
    },
    pedagogicalNote: { type: 'STRING', description: 'Öğretmene pedagojik not (en az 50 karakter)' },
  },
  required: ['baslik', 'sorular', 'pedagogicalNote'],
};

export const SinavStudyosu: React.FC = () => {
  const { addToast } = useToastStore();
  const [sinif, setSinif] = useState('5. Sınıf');
  const [topic, setTopic] = useState('Okuma Anlama');
  const [difficulty, setDifficulty] = useState<Difficulty>('Orta');
  const [questionCount, setQuestionCount] = useState(10);
  const [questionType, setQuestionType] = useState<QuestionType>('coktan_secmeli');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exam, setExam] = useState<GeneratedExam | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = `
Sen MEB müfredatına uygun Türkçe sınavı hazırlayan uzman bir öğretmensin.

PARAMETRELER:
- Sınıf: ${sinif}
- Konu: ${topic}
- Zorluk: ${difficulty}
- Soru Sayısı: ${questionCount}
- Soru Tipi: ${questionType}

KURALLAR:
1. Sorular MEB kazanımlarına uygun olmalı
2. ${questionType === 'coktan_secmeli' ? 'Her sorunun A, B, C, D seçenekleri olmalı' : 'Açık uçlu soru formatında olmalı'}
3. pedagojikNot EN AZ 50 karakter olmalı — "neden bu sınav" açıklaması
4. Tanı koyucu dil YASAK
5. Türkçe — tüm içerik Türkçe olmalı
6. Sorular gerçek yaşam bağlantılı olsun
`;

      const response = await generateWithSchema(prompt, EXAM_SCHEMA);
      const questions = (response.sorular || []).map((q: any, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        soruMetni: q.soruMetni || '',
        secenekler: q.secenekler,
        dogruCevap: q.dogruCevap || '',
        puan: q.puan || 10,
        kazanim: q.kazanim || '',
        zorluk: (q.zorluk as Difficulty) || difficulty,
      }));

      if (questions.length === 0) {
        throw new AppError('AI yanıtı boş döndü', 'EMPTY_RESPONSE', 500);
      }

      const note = response.pedagogicalNote || '';
      if (note.length < 20) {
        throw new AppError('Pedagojik not çok kısa', 'SHORT_NOTE', 400);
      }

      setExam({
        id: `exam-${Date.now()}`,
        baslik: response.baslik || `${sinif} ${topic} Sınavı`,
        sinif,
        sorular: questions,
        toplamPuan: questions.reduce((sum: number, q: ExamQuestion) => sum + q.puan, 0),
        pedagogicalNote: note,
        createdAt: Date.now(),
      });

      addToast(`${questions.length} soruluk sınav başarıyla üretildi!`, 'success');
    } catch (error: any) {
      console.error('Sınav üretim hatası:', error);
      addToast(error?.userMessage || 'AI sınav üretimi başarısız.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-lexend">
      {/* Sol Panel: Ayarlar */}
      <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-slate-700/50 bg-slate-800/80 backdrop-blur-md shadow-xl">
        <div className="p-6 border-b border-slate-700/50 bg-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            📝 Türkçe Sınav Stüdyosu
          </h1>
          <p className="text-sm text-slate-400 mt-1">AI Destekli Sınav Üretim Merkezi</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Sınıf */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Sınıf Seviyesi
            </label>
            <select
              value={sinif}
              onChange={(e) => setSinif(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-amber-500 outline-none transition-all"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Konu */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Konu
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-amber-500 outline-none transition-all"
            >
              {TOPIC_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Zorluk */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Zorluk Seviyesi
            </label>
            <div className="flex gap-2">
              {(['Kolay', 'Orta', 'Zor'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 h-12 rounded-xl border font-bold text-sm transition-all ${
                    difficulty === d
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Soru Tipi */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Soru Tipi
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-amber-500 outline-none transition-all"
            >
              <option value="coktan_secmeli">Çoktan Seçmeli</option>
              <option value="dogru_yanlis">Doğru / Yanlış</option>
              <option value="bosluk_doldurma">Boşluk Doldurma</option>
              <option value="acik_uclu">Açık Uçlu</option>
            </select>
          </div>

          {/* Soru Sayısı */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Soru Sayısı
            </label>
            <input
              type="number"
              min={5}
              max={30}
              value={questionCount}
              onChange={(e) =>
                setQuestionCount(Math.min(30, Math.max(5, parseInt(e.target.value) || 5)))
              }
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-amber-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* ÜRET BUTONU (Sabit Alt Kısım) */}
        <div className="p-6 bg-slate-800/90 border-t border-slate-700/50 backdrop-blur-md shrink-0">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${isGenerating ? 'animate-pulse' : ''}`}
          >
            <i
              className={`fa-solid ${isGenerating ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'}`}
            ></i>
            {isGenerating ? 'AI Sınav Üretiyor...' : '🧠 AI ile Sınav Üret'}
          </button>
        </div>
      </div>

      {/* Sağ Panel: Önizleme */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        <div className="h-14 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl flex items-center justify-between px-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sınav Önizleme
          </span>
          {exam && (
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
              >
                <i className="fa-solid fa-file-pdf mr-1"></i> PDF
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
          {isGenerating ? (
            <div className="w-[210mm] min-h-[297mm] bg-white/5 border border-slate-800/50 rounded-2xl flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
              <p className="text-amber-400 font-bold text-lg">AI Sınav Hazırlıyor...</p>
              <p className="text-slate-500 text-sm">Pedagojik katmanlar oluşturuluyor</p>
            </div>
          ) : exam ? (
            <div className="w-[210mm] bg-white text-slate-900 p-16 shadow-2xl rounded-sm font-lexend">
              {/* Header */}
              <div className="text-center border-b-4 border-slate-900 pb-6 mb-8">
                <h1 className="text-3xl font-bold uppercase tracking-tight">{exam.baslik}</h1>
                <p className="text-sm text-slate-500 mt-2">
                  {exam.sinif} • Toplam {exam.toplamPuan} Puan
                </p>
              </div>

              {/* Öğrenci Bilgisi */}
              <div className="grid grid-cols-2 gap-4 text-sm font-bold text-slate-400 mb-8 p-4 bg-slate-50 rounded-xl">
                <div>AD SOYAD: ___________________</div>
                <div>SINIF: {exam.sinif}</div>
                <div>TARİH: ___________________</div>
                <div>NO: ___________________</div>
              </div>

              {/* Sorular */}
              <div className="space-y-8">
                {exam.sorular.map((q, i) => (
                  <div key={q.id} className="p-4 border border-slate-200 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-slate-800">Soru {i + 1}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {q.puan} Puan
                      </span>
                    </div>
                    <p className="text-base font-medium mb-3">{q.soruMetni}</p>
                    {q.secenekler && (
                      <div className="grid grid-cols-2 gap-2 ml-4">
                        {Object.entries(q.secenekler).map(([key, val]) => (
                          <div key={key} className="text-sm">
                            <span className="font-bold">{key})</span> {val}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pedagojik Not */}
              {exam.pedagogicalNote && (
                <div className="mt-8 p-4 bg-amber-50 border-2 border-dashed border-amber-200 rounded-xl text-sm text-amber-800">
                  <span className="font-bold block mb-1">🎓 Eğitici Notu:</span>
                  {exam.pedagogicalNote}
                </div>
              )}
            </div>
          ) : (
            <div className="w-[210mm] min-h-[297mm] bg-white/5 border border-slate-800/50 rounded-2xl flex flex-col items-center justify-center gap-4">
              <div className="text-6xl opacity-20">📝</div>
              <p className="text-slate-400 font-bold text-lg">Henüz sınav üretilmedi</p>
              <p className="text-slate-500 text-sm text-center max-w-md">
                Sol panelden sınıf, konu ve zorluk seçtikten sonra "AI ile Sınav Üret" butonuna
                basın.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SinavStudyosu;
