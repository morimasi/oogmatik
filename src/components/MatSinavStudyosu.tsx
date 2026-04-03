import React, { useState } from 'react';
import { generateWithSchema } from '../services/geminiClient';
import { AppError } from '../utils/AppError';
import { useToastStore } from '../store/useToastStore';
import { useMatSinavStore } from '../store/useMatSinavStore';
import type { MatSinav, MatSinavAyarlari } from '../types/matSinav';

type Difficulty = 'Kolay' | 'Orta' | 'Zor';

const CLASS_OPTIONS = [3, 4, 5, 6, 7, 8];
const UNIT_MAP: Record<number, string[]> = {
  3: [
    'Doğal Sayılar',
    'Toplama ve Çıkarma',
    'Çarpma ve Bölme',
    'Kesirler',
    'Geometrik Cisimler',
    'Veri Toplama',
  ],
  4: [
    'Doğal Sayılar',
    'Toplama ve Çıkarma',
    'Çarpma ve Bölme',
    'Kesirler',
    'Geometri ve Ölçme',
    'Veri İşleme',
  ],
  5: ['Doğal Sayılar', 'Kesirler', 'Ondalık Gösterim', 'Yüzdeler', 'Geometri', 'Veri Analizi'],
  6: [
    'Tam Sayılar',
    'Kesirler',
    'Ondalık Gösterim',
    'Oran-Orantı',
    'Cebirsel İfadeler',
    'Geometri',
  ],
  7: [
    'Tam Sayılarla İşlemler',
    'Rasyonel Sayılar',
    'Denklemler',
    'Oran-Orantı',
    'Yüzdeler',
    'Geometri ve Ölçme',
  ],
  8: [
    'Çarpanlar ve Katlar',
    'Üslü İfadeler',
    'Kareköklü İfadeler',
    'Veri Analizi',
    'Olasılık',
    'Geometri',
  ],
};

const EXAM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    baslik: { type: 'STRING', description: 'Matematik sınavı başlığı' },
    sorular: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          soruMetni: { type: 'STRING', description: 'Matematik sorusu metni' },
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
          kazanim: { type: 'STRING', description: 'MEB matematik kazanım kodu' },
          zorluk: { type: 'STRING', description: 'Kolay, Orta veya Zor' },
          cozum_anahtari: { type: 'STRING', description: 'Çözüm açıklaması' },
          gercek_yasam_baglantisi: { type: 'STRING', description: 'Gerçek yaşam bağlantısı' },
        },
        required: ['soruMetni', 'dogruCevap', 'puan', 'kazanim', 'zorluk'],
      },
    },
    pedagogicalNote: { type: 'STRING', description: 'Öğretmene pedagojik not (en az 50 karakter)' },
  },
  required: ['baslik', 'sorular', 'pedagogicalNote'],
};

export const MatSinavStudyosu: React.FC = () => {
  const { addToast } = useToastStore();
  const { setAktifSinav } = useMatSinavStore();

  const [sinif, setSinif] = useState(5);
  const [units, setUnits] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('Orta');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exam, setExam] = useState<MatSinav | null>(null);

  const handleUnitToggle = (unit: string) => {
    setUnits((prev) => (prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]));
  };

  const handleGenerate = async () => {
    if (units.length === 0) {
      addToast('Lütfen en az bir ünite seçin.', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedUnits = units.join(', ');
      const prompt = `
Sen MEB müfredatına uygun matematik sınavı hazırlayan uzman bir öğretmensin.

PARAMETRELER:
- Sınıf: ${sinif}. Sınıf
- Üniteler: ${selectedUnits}
- Zorluk: ${difficulty}
- Soru Sayısı: ${questionCount}

KURALLAR:
1. Sorular MEB matematik kazanımlarına uygun olmalı
2. Her sorunun A, B, C, D seçenekleri olmalı
3. pedagojikNot EN AZ 50 karakter olmalı
4. Sorular gerçek yaşam bağlantılı olsun
5. Tanı koyucu dil YASAK
6. Türkçe — tüm içerik Türkçe olmalı
7. Çözüm anahtarı her soru için açıklanmalı
`;

      const response = await generateWithSchema(prompt, EXAM_SCHEMA);
      const questions = (response.sorular || []).map((q: any, i: number) => ({
        id: `mat-q-${Date.now()}-${i}`,
        tip: 'coktan_secmeli',
        zorluk: (q.zorluk as Difficulty) || difficulty,
        soruMetni: q.soruMetni || '',
        dogruCevap: q.dogruCevap || '',
        kazanimKodu: q.kazanim || '',
        secenekler: q.secenekler,
        puan: q.puan || 10,
        cozum_anahtari: q.cozum_anahtari || '',
        gercek_yasam_baglantisi: q.gercek_yasam_baglantisi || '',
        sinif,
        unite_adi: selectedUnits,
      }));

      if (questions.length === 0) {
        throw new AppError('AI yanıtı boş döndü', 'EMPTY_RESPONSE', 500);
      }

      const note = response.pedagogicalNote || '';
      if (note.length < 20) {
        throw new AppError('Pedagojik not çok kısa', 'SHORT_NOTE', 400);
      }

      const matExam: MatSinav = {
        id: `mat-exam-${Date.now()}`,
        baslik: response.baslik || `${sinif}. Sınıf Matematik Sınavı`,
        sinif,
        secilenKazanimlar: units,
        sorular: questions,
        toplamPuan: questions.reduce((sum: number, q: any) => sum + (q.puan || 10), 0),
        tahminiSure: questions.length * 3 * 60,
        olusturmaTarihi: new Date().toISOString(),
        olusturanKullanici: 'ai-teacher',
        pedagogicalNote: note,
        cevapAnahtari: {
          sorular: questions.map((q: any, i: number) => ({
            soruNo: i + 1,
            dogruCevap: q.dogruCevap,
            puan: q.puan || 10,
            kazanimKodu: q.kazanimKodu,
            cozumAciklamasi: q.cozum_anahtari,
            gercekYasamBaglantisi: q.gercek_yasam_baglantisi,
            seviye: q.zorluk || difficulty,
          })),
        },
      };

      setExam(matExam);
      setAktifSinav(matExam);
      addToast(`${questions.length} soruluk matematik sınavı üretildi!`, 'success');
    } catch (error: any) {
      console.error('Mat sınav üretim hatası:', error);
      addToast(error?.userMessage || 'AI matematik sınavı üretimi başarısız.', 'error');
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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            📐 Matematik Sınav Stüdyosu
          </h1>
          <p className="text-sm text-slate-400 mt-1">AI Destekli Matematik Sınav Üretimi</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Sınıf */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Sınıf Seviyesi
            </label>
            <select
              value={sinif}
              onChange={(e) => {
                setSinif(parseInt(e.target.value));
                setUnits([]);
              }}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}. Sınıf
                </option>
              ))}
            </select>
          </div>

          {/* Üniteler */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Ünite Seçimi
            </label>
            <div className="space-y-2">
              {(UNIT_MAP[sinif] || []).map((unit) => (
                <button
                  key={unit}
                  onClick={() => handleUnitToggle(unit)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    units.includes(unit)
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                      : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {units.includes(unit) ? '✅' : '⬜'} {unit}
                </button>
              ))}
            </div>
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
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                      : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
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
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* ÜRET BUTONU */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${isGenerating ? 'animate-pulse' : ''}`}
          >
            <i
              className={`fa-solid ${isGenerating ? 'fa-circle-notch fa-spin' : 'fa-calculator'}`}
            ></i>
            {isGenerating ? 'AI Matematik Sınavı Üretiyor...' : '🧠 AI ile Matematik Sınavı Üret'}
          </button>
        </div>
      </div>

      {/* Sağ Panel: Önizleme */}
      <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        <div className="h-14 border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl flex items-center justify-between px-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Matematik Sınav Önizleme
          </span>
          {exam && (
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
            >
              <i className="fa-solid fa-file-pdf mr-1"></i> PDF
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
          {isGenerating ? (
            <div className="w-[210mm] min-h-[297mm] bg-white/5 border border-slate-800/50 rounded-2xl flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-blue-400 font-bold text-lg">AI Matematik Sınavı Hazırlıyor...</p>
              <p className="text-slate-500 text-sm">Sorular ve çözümler oluşturuluyor</p>
            </div>
          ) : exam ? (
            <div className="w-[210mm] bg-white text-slate-900 p-16 shadow-2xl rounded-sm font-lexend">
              <div className="text-center border-b-4 border-slate-900 pb-6 mb-8">
                <h1 className="text-3xl font-bold uppercase tracking-tight">{exam.baslik}</h1>
                <p className="text-sm text-slate-500 mt-2">
                  {exam.sinif}. Sınıf • Toplam {exam.toplamPuan} Puan • Tahmini Süre:{' '}
                  {Math.round(exam.tahminiSure / 60)} dk
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-bold text-slate-400 mb-8 p-4 bg-slate-50 rounded-xl">
                <div>AD SOYAD: ___________________</div>
                <div>SINIF: {exam.sinif}</div>
                <div>TARİH: ___________________</div>
                <div>NO: ___________________</div>
              </div>

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

              {exam.pedagogicalNote && (
                <div className="mt-8 p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl text-sm text-blue-800">
                  <span className="font-bold block mb-1">🎓 Eğitici Notu:</span>
                  {exam.pedagogicalNote}
                </div>
              )}
            </div>
          ) : (
            <div className="w-[210mm] min-h-[297mm] bg-white/5 border border-slate-800/50 rounded-2xl flex flex-col items-center justify-center gap-4">
              <div className="text-6xl opacity-20">📐</div>
              <p className="text-slate-400 font-bold text-lg">Henüz matematik sınavı üretilmedi</p>
              <p className="text-slate-500 text-sm text-center max-w-md">
                Sol panelden sınıf, ünite ve zorluk seçtikten sonra "AI ile Matematik Sınavı Üret"
                butonuna basın.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatSinavStudyosu;
