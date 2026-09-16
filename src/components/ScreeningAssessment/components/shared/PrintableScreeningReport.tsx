import React from 'react';
import type { ScreeningResult, EvaluationCategory } from '../../../../types/screening';
import { CATEGORY_LABELS } from '../../../../data/screeningQuestions';
import type { AIAnalysisResult } from '../../services/assessmentEngineService';

interface PrintableScreeningReportProps {
  screening: ScreeningResult;
  aiAnalysis: AIAnalysisResult | null;
  professionalReport: {
    summary: string;
    recommendations: string[];
    cautions: string[];
    strengths: string[];
    bePGoals: string[];
  } | null;
}

export const PrintableScreeningReport: React.FC<PrintableScreeningReportProps> = ({
  screening,
  aiAnalysis,
  professionalReport,
}) => {
  return (
    <div
      id="printable-report"
      className="printable-screening-report print-exact worksheet-page a4-page bg-white text-zinc-900 font-lexend p-8 max-w-[210mm] mx-auto print:p-6 print:max-w-none print:w-full print:m-0"
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        colorAdjust: 'exact',
        backgroundColor: '#ffffff',
        color: '#18181b',
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        display: 'block',
      }}
    >
      {/* Kurumsal Başlık */}
      <div className="border-b-2 border-indigo-600 pb-4 mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">bdmind EdTech Platformu</span>
            <span className="text-zinc-300">|</span>
            <span className="text-xs font-bold text-zinc-500">Bursa Disleksi 2004</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 mt-1 uppercase">
            Bilişsel Tarama & Pedagojik Değerlendirme Raporu
          </h1>
        </div>
        <div className="text-right">
          <div className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-black text-indigo-700 uppercase tracking-wider">
            {screening.riskLevel === 'high' ? 'Öncelikli Destek' : screening.riskLevel === 'medium' ? 'İzleme & Destek' : 'Gelişim Normal'}
          </div>
          <p className="text-[10px] text-zinc-400 font-medium mt-1">
            Tarih: {new Date(screening.generatedAt || screening.date).toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>

      {/* Öğrenci Bilgi Kartı */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6 grid grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-zinc-400 font-bold block uppercase text-[9px] tracking-wider">Öğrenci</span>
          <span className="font-black text-zinc-800 text-sm">{screening.studentName}</span>
        </div>
        <div>
          <span className="text-zinc-400 font-bold block uppercase text-[9px] tracking-wider">Yaş / Sınıf</span>
          <span className="font-bold text-zinc-800">{screening.age} Yaş · {screening.grade}</span>
        </div>
        <div>
          <span className="text-zinc-400 font-bold block uppercase text-[9px] tracking-wider">Genel Bilişsel Skor</span>
          <span className="font-black text-indigo-600 text-sm">%{screening.overallScore}</span>
        </div>
        <div>
          <span className="text-zinc-400 font-bold block uppercase text-[9px] tracking-wider">Değerlendiren</span>
          <span className="font-bold text-zinc-800 uppercase">{screening.respondentRole || 'Uzman'}</span>
        </div>
      </div>

      {/* Kategori Skorları Tablosu */}
      <div className="mb-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700 mb-3 border-l-4 border-indigo-600 pl-2">
          1. Bilişsel Alan Performans Dağılımı
        </h3>
        <table className="w-full text-xs border border-zinc-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-zinc-100 text-zinc-600 text-left">
              <th className="p-2.5 font-bold">Bilişsel Alan</th>
              <th className="p-2.5 font-bold text-center">Başarı Skoru</th>
              <th className="p-2.5 font-bold text-center">Risk Durumu</th>
              <th className="p-2.5 font-bold">Gözlem & Bulgular</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {(Object.keys(screening.categoryScores) as EvaluationCategory[]).map((cat) => {
              const data = screening.categoryScores[cat];
              if (!data) return null;
              const isHigh = data.riskLevel === 'high';
              const isModerate = data.riskLevel === 'moderate';
              return (
                <tr key={cat} className="hover:bg-zinc-50/50">
                  <td className="p-2.5 font-bold text-zinc-800">{CATEGORY_LABELS[cat] || cat}</td>
                  <td className="p-2.5 text-center font-black">
                    <span className={isHigh ? 'text-rose-600' : isModerate ? 'text-amber-600' : 'text-emerald-600'}>
                      %{data.score}
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : isModerate
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {data.riskLabel}
                    </span>
                  </td>
                  <td className="p-2.5 text-zinc-600 text-[11px] leading-relaxed">
                    {data.findings && data.findings.length > 0
                      ? data.findings.join('; ')
                      : 'Yaş normlarına uygun gelişim izlenmektedir.'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Uzman Değerlendirme Mektubu */}
      {aiAnalysis && (
        <div className="mb-6 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40">
          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-800 mb-2">
            2. Klinik & Pedagojik Durum Özeti (AI Uzman Mektubu)
          </h3>
          <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-line mb-3">
            {aiAnalysis.letter}
          </p>
          {aiAnalysis.actionSteps && aiAnalysis.actionSteps.length > 0 && (
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider block mb-1.5">
                Öncelikli Eylem Basamakları:
              </span>
              <ul className="list-disc list-inside text-xs text-zinc-700 space-y-1">
                {aiAnalysis.actionSteps.map((step: string, idx: number) => (
                  <li key={idx} className="leading-snug">{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* BEP ve Müfredat Önerileri */}
      {professionalReport && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1.5">
              Güçlü Bilişsel Yönler
            </h4>
            <ul className="list-disc list-inside text-xs text-emerald-950 space-y-1">
              {(professionalReport.strengths.length > 0 ? professionalReport.strengths : ['Gözlem verisi toplanıyor.']).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-purple-800 mb-1.5">
              Bireyselleştirilmiş Eğitim Planı (BEP) Hedefleri
            </h4>
            <ul className="list-disc list-inside text-xs text-purple-950 space-y-1">
              {(professionalReport.bePGoals.length > 0 ? professionalReport.bePGoals : ['Hedefler oluşturuluyor.']).map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Yasal Uyarı & Dipnot */}
      <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-[9px] text-zinc-400">
        <span>* Bu tarama raporu klinik tıbbi tanı yerine geçmez; eğitsel ve pedagojik destek amacıyla üretilmiştir.</span>
        <span className="font-bold">MEB 573 KHK & Özel Eğitim Standartları Uyumlu</span>
      </div>
    </div>
  );
};
