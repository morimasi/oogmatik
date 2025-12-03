
import React, { useState } from 'react';
import { SavedAssessment, AssessmentReport } from '../types';
import { RadarChart } from './RadarChart';
import { ACTIVITIES } from '../constants';
import { ShareModal } from './ShareModal';
import { assessmentService } from '../services/assessmentService';

interface AssessmentReportViewerProps {
    assessment: SavedAssessment | null;
    onClose: () => void;
    user?: any;
    onManualSave?: () => Promise<void>;
    isSaving?: boolean;
    isSaved?: boolean;
    onAddToWorkbook?: (assessment: SavedAssessment) => void;
    onAutoGenerateWorkbook?: (report: AssessmentReport) => void;
}

export const AssessmentReportViewer: React.FC<AssessmentReportViewerProps> = ({ 
    assessment, 
    onClose, 
    user,
    onManualSave,
    isSaving,
    isSaved,
    onAddToWorkbook,
    onAutoGenerateWorkbook
}) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    if (!assessment) return null;

    const report = assessment.report;

    const handlePrintReport = () => {
        const originalTitle = document.title;
        document.title = `${assessment.studentName}_Degerlendirme_Raporu`;
        window.print();
        document.title = originalTitle;
    };

    const handleShareReport = async (receiverId: string) => {
        if (!assessment || !user) return;
        try {
            await assessmentService.shareAssessment(
                assessment, 
                user.id, 
                user.name, 
                receiverId
            );
            alert('Rapor başarıyla paylaşıldı.');
            setIsShareModalOpen(false);
        } catch (e) {
            console.error(e);
            alert('Paylaşım sırasında hata oluştu.');
        }
    };

    const handleAddToWorkbook = () => {
        if (onAddToWorkbook) {
            onAddToWorkbook(assessment);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block" onClick={onClose}>
            <div className="printable-content bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative print:max-h-none print:w-full print:h-auto print:shadow-none print:rounded-none print:border-none print:overflow-visible" onClick={e => e.stopPropagation()}>
                
                <header className="p-4 bg-zinc-100 border-b border-zinc-200 flex justify-between items-center no-print">
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900">{assessment.studentName} Raporu</h3>
                        <p className="text-xs text-zinc-500">{new Date(assessment.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center text-black"><i className="fa-solid fa-times"></i></button>
                </header>
                
                {/* TOOLBAR */}
                <div className="flex justify-end items-center gap-3 p-3 bg-zinc-50 border-b border-zinc-200 no-print flex-wrap">
                    {onAutoGenerateWorkbook && (
                        <button 
                            onClick={() => onAutoGenerateWorkbook(report)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all shadow-md"
                        >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> Akıllı Rota (Telafi Kitapçığı)
                        </button>
                    )}
                    
                    {onAddToWorkbook && (
                        <button 
                            onClick={(e) => {
                                handleAddToWorkbook();
                                const btn = e.currentTarget;
                                const originalContent = btn.innerHTML;
                                btn.classList.add('bg-green-100', 'text-green-700');
                                btn.innerHTML = '<i class="fa-solid fa-check"></i> Eklendi';
                                setTimeout(() => {
                                    btn.classList.remove('bg-green-100', 'text-green-700');
                                    btn.innerHTML = originalContent;
                                }, 2000);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-all shadow-sm"
                        >
                            <i className="fa-solid fa-plus-circle"></i> Rapora Ekle
                        </button>
                    )}
                    {onManualSave && (
                        <button onClick={onManualSave} disabled={isSaving} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isSaved ? 'bg-green-100 text-green-700' : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-100'}`}>
                            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : isSaved ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-save"></i>}
                            <span className="hidden sm:inline">{isSaved ? 'Kaydedildi' : 'Kaydet'}</span>
                        </button>
                    )}
                    <button 
                        onClick={handlePrintReport} 
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        <i className="fa-solid fa-print"></i> Yazdır
                    </button>
                </div>

                {/* REPORT CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar assessment-report-container print:overflow-visible print:bg-white text-black">
                    <div className="mb-8 border-b-2 border-zinc-800 pb-4">
                        <h1 className="text-3xl font-black text-black">Özel Eğitim Tanılama ve Raporlama</h1>
                        <div className="flex justify-between mt-4 text-black"><p><strong>Öğrenci:</strong> {assessment.studentName}</p><p><strong>Tarih:</strong> {new Date(assessment.createdAt).toLocaleDateString('tr-TR')}</p></div>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-xl text-indigo-900 text-sm leading-relaxed border border-indigo-100 break-inside-avoid print:border-black print:bg-white print:text-black">
                        <h4 className="font-bold mb-2 uppercase tracking-wider">Uzman Görüşü & Özet</h4>
                        {report.overallSummary}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
                        <div className="p-4 border rounded-xl flex flex-col items-center justify-center min-h-[250px] bg-white break-inside-avoid print:border-black">
                            <h4 className="font-bold text-zinc-500 text-xs uppercase mb-2 print:text-black">Becerisel Risk Profili</h4>
                            {report.chartData && <RadarChart data={report.chartData} />}
                        </div>
                        <div className="space-y-3 break-inside-avoid">
                            {Object.entries(report.scores).map(([key, value]) => {
                                const score = value as number;
                                const label = key === 'reading' ? 'Okuma Becerileri' : key === 'math' ? 'Matematik & Mantık' : key === 'attention' ? 'Dikkat & Algı' : key === 'cognitive' ? 'Bilişsel Performans' : 'Yazma Becerisi';
                                const riskLevel = score > 70 ? 'Yüksek Risk' : score > 40 ? 'Orta Risk' : 'Düşük Risk';
                                const colorClass = score > 70 ? 'bg-red-500' : score > 40 ? 'bg-yellow-500' : 'bg-green-500';
                                
                                return (
                                    <div key={key} className="p-3 rounded-lg border border-zinc-200 flex flex-col bg-white print:border-black">
                                        <div className="flex justify-between mb-1">
                                            <span className="capitalize font-bold text-sm text-zinc-700 print:text-black">
                                                {label}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded text-white font-bold print:text-black print:border print:border-black print:bg-white ${colorClass}`}>
                                                {riskLevel} (%{score})
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden print:border print:border-black">
                                            <div 
                                                className={`h-full rounded-full ${colorClass} print:bg-black`} 
                                                style={{ width: `${score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200 break-inside-avoid print:bg-white print:border-black">
                            <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2 print:text-black"><i className="fa-solid fa-thumbs-up"></i> Güçlü Yönler</h4>
                            <ul className="list-disc list-inside text-sm space-y-1 text-green-900 print:text-black">
                                {report.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 break-inside-avoid print:bg-white print:border-black">
                            <h4 className="font-bold text-rose-800 mb-2 flex items-center gap-2 print:text-black"><i className="fa-solid fa-triangle-exclamation"></i> Gelişim Alanları</h4>
                            <ul className="list-disc list-inside text-sm space-y-1 text-rose-900 print:text-black">
                                {report.analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>

                    {report.analysis.errorAnalysis && report.analysis.errorAnalysis.length > 0 && (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-sm leading-relaxed break-inside-avoid print:border-black print:bg-white print:text-black">
                            <h4 className="font-bold mb-2 flex items-center gap-2"><i className="fa-solid fa-magnifying-glass-chart"></i> Hata Analizi (Error Analysis)</h4>
                            <ul className="list-decimal list-inside space-y-1">
                                {report.analysis.errorAnalysis.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}
                    
                     <div className="bg-zinc-800 text-white p-6 rounded-xl shadow-lg break-inside-avoid print:bg-white print:text-black print:border print:border-black print:shadow-none">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="fa-solid fa-road"></i> Önerilen Eğitim Rotası</h4>
                        <div className="space-y-4">
                            {report.roadmap.map((item, idx) => (
                                <div key={idx} className="bg-zinc-700/50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-zinc-600 print:bg-white print:border-black print:text-black">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white print:bg-black print:text-white">{idx + 1}</div>
                                        <div>
                                            <h5 className="font-bold text-indigo-300 print:text-black">{ACTIVITIES.find(a => a.id === item.activityId)?.title || item.activityId}</h5>
                                            <p className="text-xs text-zinc-300 print:text-black">{item.reason}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold bg-zinc-900 px-3 py-1 rounded-full text-zinc-400 border border-zinc-600 whitespace-nowrap print:bg-white print:text-black print:border-black">{item.frequency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={handleShareReport} />
        </div>
    );
};
