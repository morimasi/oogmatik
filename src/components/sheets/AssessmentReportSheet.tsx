import React from 'react';
import { SavedAssessment, ClinicalObservation } from '../../types';

interface AssessmentReportSheetProps {
    data: SavedAssessment;
}

const RiskBadge: React.FC<{ level: 'low' | 'moderate' | 'high' }> = ({ level }) => {
    const map = {
        low: { label: 'Düşük Risk', cls: 'bg-green-100 text-green-700 border-green-200' },
        moderate: { label: 'Orta Risk', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
        high: { label: 'Yüksek Risk', cls: 'bg-red-100 text-red-700 border-red-200' }
    };
    const { label, cls } = map[level] ?? map['low'];
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${cls}`}>{label}</span>
    );
};

export const AssessmentReportSheet: React.FC<AssessmentReportSheetProps> = ({ data }) => {
    if (!data) return null;

    const report = data.report;
    const scores = report?.scores || {};
    const analysis = report?.analysis || { strengths: [], weaknesses: [], errorAnalysis: [] };
    const roadmap = report?.roadmap || [];

    return (
        <div className="w-full flex flex-col gap-6 p-8 font-lexend bg-white text-zinc-900 print:p-2">
            <div className="border-b-4 border-indigo-600 pb-4 mb-4">
                <h1 className="text-4xl font-black text-indigo-900 uppercase tracking-widest">{data.studentName || 'Öğrenci'} - Gelişim Analiz Raporu</h1>
                <p className="text-zinc-500 font-bold mt-2">Oluşturulma Tarihi: {new Date(data.createdAt).toLocaleDateString('tr-TR')}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 print:gap-4">
                <div className="bg-zinc-50 border-2 border-zinc-200 p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-black text-zinc-800 mb-4 uppercase tracking-wider"><i className="fa-solid fa-chart-pie mr-2"></i> Kategori Skorları</h2>
                    <div className="space-y-3">
                        {Object.entries(scores).map(([category, scoreData]: [string, any]) => (
                            <div key={category} className="flex justify-between items-center border-b border-zinc-200 pb-2">
                                <span className="font-bold text-zinc-700 capitalize">{category}</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-lg">{scoreData.score ?? 0}</span>
                                    <RiskBadge level={scoreData.riskLevel ?? 'low'} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-black text-indigo-800 mb-4 uppercase tracking-wider"><i className="fa-solid fa-lightbulb mr-2"></i> Güçlü Alanlar</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        {(analysis.strengths || []).map((strength: string, idx: number) => (
                            <li key={idx} className="font-medium text-zinc-700 leading-tight">{strength}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-2xl shadow-sm mt-4">
                <h2 className="text-xl font-black text-rose-800 mb-4 uppercase tracking-wider"><i className="fa-solid fa-triangle-exclamation mr-2"></i> Gelişime Açık Alanlar</h2>
                <ul className="list-disc pl-5 space-y-2">
                    {(analysis.weaknesses || []).map((weakness: string, idx: number) => (
                        <li key={idx} className="font-medium text-zinc-700 leading-tight">{weakness}</li>
                    ))}
                </ul>
            </div>

            <div className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-2xl shadow-lg mt-4 text-white">
                <h2 className="text-xl font-black text-zinc-100 mb-4 uppercase tracking-wider"><i className="fa-solid fa-route mr-2"></i> Önerilen Yol Haritası</h2>
                <div className="space-y-4">
                    {(roadmap || []).map((step: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-4 bg-white/10 p-4 rounded-xl border border-white/10">
                            <div className="w-8 h-8 shrink-0 bg-indigo-500 rounded-lg flex items-center justify-center font-black text-white">{idx + 1}</div>
                            <div>
                                <h3 className="font-bold text-indigo-200 mb-1">{step.area || 'Genel Gelişim'}</h3>
                                <p className="text-sm font-medium opacity-90">{step.intervention || step}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="mt-auto pt-8 flex justify-between items-center px-4 border-t border-zinc-200 opacity-50">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Oogmatik EduMind AI</span>
                <i className="fa-solid fa-brain text-xl"></i>
            </div>
        </div>
    );
};
