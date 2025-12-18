
import React, { useState } from 'react';
import { SavedAssessment, AssessmentReport, ActivityType, ClinicalObservation } from '../types';
import { RadarChart } from './RadarChart';
import { ACTIVITIES } from '../constants';
import { ShareModal } from './ShareModal';
import { assessmentService } from '../services/assessmentService';
import { printService } from '../utils/printService';

interface AssessmentReportViewerProps {
    assessment: SavedAssessment | null;
    onClose: () => void;
    user?: any;
    onManualSave?: () => Promise<void>;
    isSaving?: boolean;
    isSaved?: boolean;
    onAddToWorkbook?: (assessment: SavedAssessment) => void;
    onAutoGenerateWorkbook?: (report: AssessmentReport) => void;
    onSelectActivity?: (id: ActivityType) => void;
}

const ObservationCard: React.FC<{ observations: ClinicalObservation }> = ({ observations }) => {
    if (!observations) return null;
    
    return (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl break-inside-avoid shadow-sm print:shadow-none mb-6">
            <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2 border-b border-amber-200 pb-2">
                <i className="fa-solid fa-clipboard-user"></i> Klinik Gözlem ve Davranış Analizi
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-amber-100">
                    <span className="text-amber-700 font-medium">Kaygı Düzeyi</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${observations.anxietyLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {observations.anxietyLevel === 'low' ? 'Düşük' : observations.anxietyLevel === 'medium' ? 'Orta' : 'Yüksek'}
                    </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-amber-100">
                    <span className="text-amber-700 font-medium">Dikkat Süresi</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-bold uppercase">
                        {observations.attentionSpan === 'focused' ? 'Odaklanmış' : observations.attentionSpan === 'distracted' ? 'Dağınık' : 'Hiperaktif'}
                    </span>
                </div>
            </div>

            {observations.notes && (
                <div className="bg-white/60 p-4 rounded-lg border border-amber-100 text-amber-900 text-sm leading-relaxed italic">
                    <span className="font-bold text-xs uppercase text-amber-500 block mb-1">Gözlemci Notları:</span>
                    "{observations.notes}"
                </div>
            )}
            
            <div className="mt-2 text-[10px] text-amber-400 text-right italic">
                * Bu bölüm sadece uzman erişimine açıktır.
            </div>
        </div>
    );
};

export const AssessmentReportViewer: React.FC<AssessmentReportViewerProps> = ({ 
    assessment, 
    onClose, 
    user,
    onManualSave,
    isSaving,
    isSaved,
    onAddToWorkbook,
    onAutoGenerateWorkbook,
    onSelectActivity
}) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    if (!assessment) return null;

    const report = assessment.report;
    const observations = report.observations as ClinicalObservation;

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

    const handleAction = async (action: 'print' | 'download') => {
        setIsPrinting(true);
        setTimeout(async () => {
            try {
                // Target the specific report content via ID
                await printService.generatePdf('#report-content-area', `${assessment.studentName}-Rapor`, { action });
            } catch (error) {
                console.error("Rapor yazdırma hatası:", error);
                alert("Rapor yazdırılırken bir hata oluştu.");
            } finally {
                setIsPrinting(false);
            }
        }, 100);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
                
                <header className="p-4 bg-zinc-100 border-b border-zinc-200 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-zinc-900">{assessment.studentName} Raporu</h3>
                        <p className="text-xs text-zinc-500">{new Date(assessment.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center text-black"><i className="fa-solid fa-times"></i></button>
                </header>
                
                {/* TOOLBAR */}
                <div className="flex justify-end items-center gap-3 p-3 bg-zinc-50 border-b border-zinc-200 flex-wrap">
                    <button 
                        onClick={() => handleAction('download')}
                        disabled={isPrinting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 disabled:opacity-50"
                    >
                        {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                        PDF İndir
                    </button>
                    <button 
                        onClick={() => handleAction('print')}
                        disabled={isPrinting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-200 text-zinc-700 rounded-lg text-sm font-bold hover:bg-zinc-300 disabled:opacity-50"
                    >
                        <i className="fa-solid fa-print"></i> Yazdır
                    </button>

                    <div className="h-6 w-px bg-zinc-300 mx-2"></div>

                    {onAutoGenerateWorkbook && (
                        <button 
                            onClick={() => onAutoGenerateWorkbook(report)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all shadow-md"
                        >
                            <i className="fa-solid fa-wand-magic-sparkles"></i> Akıllı Rota
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
                        <button onClick={onManualSave} disabled={isSaving || isSaved} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isSaved ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-100 hover:text-indigo-600'}`}>
                            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : isSaved ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-save"></i>}
                            <span className="hidden sm:inline">{isSaved ? 'Arşive Kaydedildi' : 'Raporu Kaydet'}</span>
                        </button>
                    )}
                </div>

                {/* REPORT CONTENT */}
                <div id="report-content-area" className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-black bg-white">
                    <div className="worksheet-item mb-8 border-b-2 border-zinc-800 pb-4">
                        <h1 className="text-3xl font-black text-black">Tanısal Değerlendirme Raporu</h1>
                        <div className="flex justify-between mt-4 text-black"><p><strong>Öğrenci:</strong> {assessment.studentName}</p><p><strong>Tarih:</strong> {new Date(assessment.createdAt).toLocaleDateString('tr-TR')}</p></div>
                    </div>
                    
                    {/* Clinical Observations Section (Top Priority for Specialists) */}
                    <ObservationCard observations={observations} />

                    <div className="bg-indigo-50 p-6 rounded-xl border-l-8 border-indigo-500 text-sm leading-relaxed text-zinc-800 text-justify">
                        <h4 className="font-bold mb-2 uppercase text-indigo-800 tracking-wider">Uzman Görüşü & Özet</h4>
                        {report.overallSummary}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
                        <div className="p-4 border border-zinc-200 rounded-xl flex flex-col items-center justify-center min-h-[300px] bg-white break-inside-avoid shadow-sm">
                            <h4 className="font-bold text-zinc-500 text-xs uppercase mb-4">Beceri ve Zeka Alanları Analizi</h4>
                            {report.chartData && <RadarChart data={report.chartData} />}
                        </div>
                        <div className="space-y-3 break-inside-avoid">
                            {Object.entries(report.scores || {}).map(([key, value]) => {
                                const score = value as number;
                                const labelMap: Record<string, string> = {
                                    'reading': 'Okuma Becerileri', 'math': 'Matematik & Mantık', 'attention': 'Dikkat & Algı',
                                    'linguistic': 'Sözel-Dilsel', 'logical': 'Mantıksal', 'spatial': 'Görsel-Uzamsal',
                                    'musical': 'Müziksel', 'kinesthetic': 'Bedensel', 'naturalistic': 'Doğacı',
                                    'interpersonal': 'Sosyal', 'intrapersonal': 'İçsel'
                                };
                                const label = labelMap[key] || key;
                                const riskLevel = score > 80 ? 'Yüksek Başarı' : score > 50 ? 'Ortalama' : 'Desteklenmeli';
                                const colorClass = score > 80 ? 'bg-green-500' : score > 50 ? 'bg-yellow-500' : 'bg-red-500';
                                
                                return (
                                    <div key={key} className="p-3 rounded-lg border border-zinc-200 flex flex-col bg-white">
                                        <div className="flex justify-between mb-1">
                                            <span className="capitalize font-bold text-sm text-zinc-700">
                                                {label}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded text-white font-bold ${colorClass}`}>
                                                {riskLevel} (%{score})
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${colorClass}`} 
                                                style={{ width: `${score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
                        <div className="p-6 bg-green-50 rounded-xl border border-green-200 break-inside-avoid">
                            <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 border-b border-green-200 pb-2"><i className="fa-solid fa-thumbs-up"></i> Güçlü Yönler</h4>
                            <ul className="list-disc list-inside text-sm text-green-900 space-y-2">
                                {(report.analysis.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div className="p-6 bg-rose-50 rounded-xl border border-rose-200 break-inside-avoid">
                            <h4 className="font-bold text-rose-800 mb-4 flex items-center gap-2 border-b border-rose-200 pb-2"><i className="fa-solid fa-triangle-exclamation"></i> Gelişim Alanları</h4>
                            <ul className="list-disc list-inside text-sm text-rose-900 space-y-2">
                                {(report.analysis.weaknesses || []).map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>

                    {report.analysis.errorAnalysis && report.analysis.errorAnalysis.length > 0 && (
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 text-amber-900 text-sm leading-relaxed break-inside-avoid">
                            <h4 className="font-bold mb-4 flex items-center gap-2 border-b border-amber-200 pb-2"><i className="fa-solid fa-magnifying-glass-chart"></i> Hata Analizi (Error Pattern)</h4>
                            <ul className="list-decimal list-inside space-y-2">
                                {report.analysis.errorAnalysis.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}
                    
                     <div className="bg-zinc-900 text-white p-8 rounded-2xl shadow-lg break-inside-avoid">
                        <h4 className="font-bold text-lg mb-6 flex items-center gap-2 border-b border-zinc-700 pb-4"><i className="fa-solid fa-road"></i> Kişiselleştirilmiş Eğitim Rotası</h4>
                        <div className="space-y-4">
                            {(report.roadmap || []).map((item, idx) => {
                                const activityDef = ACTIVITIES.find(a => a.id === item.activityId);
                                const title = activityDef?.title || item.activityId;
                                
                                return (
                                    <div key={idx} className="bg-zinc-800 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-zinc-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg">{idx + 1}</div>
                                            <div>
                                                <h5 className="font-bold text-indigo-300 text-lg">{title}</h5>
                                                <p className="text-sm text-zinc-400 mt-1">{item.reason}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold bg-zinc-900 px-4 py-2 rounded-full text-zinc-400 border border-zinc-700 whitespace-nowrap">{item.frequency}</span>
                                            {onSelectActivity && (
                                                <button 
                                                    onClick={() => { onSelectActivity(item.activityId as ActivityType); onClose(); }}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md flex items-center gap-2"
                                                >
                                                    <i className="fa-solid fa-play"></i> Hemen Üret
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={handleShareReport} />
        </div>
    );
};
