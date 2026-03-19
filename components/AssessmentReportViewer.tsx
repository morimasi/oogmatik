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
    onGeneratePlan?: (name: string, age: number, weaknesses: string[], context?: string) => void;
}

// Risk seviyesi badge
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

// Klinik gözlem kartı
const ObservationCard: React.FC<{ observations: ClinicalObservation }> = ({ observations }) => {
    if (!observations) return null;

    const indicators = [
        { label: 'Kaygı Düzeyi', value: observations.anxietyLevel === 'low' ? 'Düşük' : observations.anxietyLevel === 'medium' ? 'Orta' : 'Yüksek', warn: observations.anxietyLevel === 'high' },
        { label: 'Dikkat Süresi', value: observations.attentionSpan === 'focused' ? 'Odaklanmış' : observations.attentionSpan === 'distracted' ? 'Dağınık' : 'Dürtüsel', warn: observations.attentionSpan !== 'focused' },
        { label: 'Motor Beceriler', value: observations.motorSkills === 'typical' ? 'Tipik' : observations.motorSkills === 'delayed' ? 'Gecikmeli' : 'Hassas', warn: observations.motorSkills === 'delayed' },
        ...(observations.cooperationLevel ? [{ label: 'İşbirliği', value: observations.cooperationLevel === 'cooperative' ? 'İyi' : observations.cooperationLevel === 'reluctant' ? 'İsteksiz' : 'Dirençli', warn: observations.cooperationLevel === 'resistant' }] : []),
        ...(observations.fatigueIndex ? [{ label: 'Yorulma İndeksi', value: observations.fatigueIndex === 'normal' ? 'Normal' : observations.fatigueIndex === 'mild' ? 'Hafif' : 'Belirgin', warn: observations.fatigueIndex === 'severe' }] : []),
        ...(observations.frustrationTolerance ? [{ label: 'Hayal Kırıklığı Toleransı', value: observations.frustrationTolerance === 'high' ? 'Yüksek' : observations.frustrationTolerance === 'medium' ? 'Orta' : 'Düşük', warn: observations.frustrationTolerance === 'low' }] : []),
        ...(observations.verbalization ? [{ label: 'Sözel İfade', value: observations.verbalization === 'adequate' ? 'Yeterli' : observations.verbalization === 'limited' ? 'Kısıtlı' : 'Aşırı', warn: observations.verbalization !== 'adequate' }] : []),
        ...(observations.eyeContact ? [{ label: 'Göz Teması', value: observations.eyeContact === 'normal' ? 'Normal' : observations.eyeContact === 'reduced' ? 'Az' : 'Kaçınan', warn: observations.eyeContact === 'avoidant' }] : []),
    ];

    return (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl break-inside-avoid shadow-sm print:shadow-none mb-6">
            <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2 border-b border-amber-200 pb-2">
                <i className="fa-solid fa-clipboard-user"></i> Klinik Gözlem & Davranış Analizi
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
                {indicators.map((ind, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-white/60 rounded-lg border border-amber-100">
                        <span className="text-amber-700 font-medium text-xs">{ind.label}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ind.warn ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {ind.value}
                        </span>
                    </div>
                ))}
            </div>
            {observations.notes && (
                <div className="bg-white/60 p-4 rounded-lg border border-amber-100 text-amber-900 text-sm leading-relaxed italic">
                    <span className="font-bold text-xs uppercase text-amber-500 block mb-1">Gözlemci Notları:</span>
                    "{observations.notes}"
                </div>
            )}
            <div className="mt-2 text-[10px] text-amber-400 text-right italic">
                * Bu bölüm yalnızca uzman erişimine açıktır.
            </div>
        </div>
    );
};

// Risk Analiz Satırı
const RiskRow: React.FC<{ label: string; level: 'low' | 'moderate' | 'high'; icon: string }> = ({ label, level, icon }) => (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
        <span className="text-sm font-bold text-zinc-700 flex items-center gap-2">
            <i className={`fa-solid ${icon} text-zinc-400 w-4`}></i> {label}
        </span>
        <RiskBadge level={level} />
    </div>
);

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
    // Null guard'lar
    const observations = (report?.observations ?? null) as ClinicalObservation | null;
    const chartData = report?.chartData ?? [];
    const scores = report?.scores ?? {};
    const analysis = report?.analysis ?? { strengths: [], weaknesses: [], errorAnalysis: [] };
    const roadmap = report?.roadmap ?? [];
    const professionalData = report?.professionalData;

    const handleShareReport = async (receiverIds: string[]) => {
        if (!assessment || !user) return;
        try {
            await Promise.all(receiverIds.map((receiverId) => assessmentService.shareAssessment(assessment, user.id, user.name, receiverId)));
            alert('Rapor başarıyla paylaşıldı.');
            setIsShareModalOpen(false);
        } catch (e) {
            console.error(e);
            alert('Paylaşım sırasında hata oluştu.');
        }
    };

    const handleAction = async (action: 'print' | 'download') => {
        setIsPrinting(true);
        try {
            // Allow React to render the loading state before blocking the thread
            await new Promise(resolve => setTimeout(resolve, 50));
            await printService.generatePdf('#report-content-area', `${assessment.studentName}-Rapor`, { action });
        } catch (error) {
            console.error("Rapor yazdırma hatası:", error);
            alert("Rapor yazdırılırken bir hata oluştu.");
        } finally {
            setIsPrinting(false);
        }
    };

    const labelMap: Record<string, string> = {
        reading: 'Okuma', math: 'Matematik', attention: 'Dikkat',
        linguistic: 'Sözel-Dilsel', logical: 'Mantıksal', spatial: 'Görsel-Uzamsal',
        phonological: 'Fonolojik', processing: 'İşlem Hızı',
        musical: 'Müziksel', kinesthetic: 'Bedensel'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <header className="p-4 bg-zinc-100 border-b border-zinc-200 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <i className="fa-solid fa-file-medical text-indigo-600"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-zinc-900">{assessment.studentName} — Değerlendirme Raporu</h3>
                            <p className="text-xs text-zinc-500">
                                {new Date(assessment.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                {professionalData?.duration ? ` · ${Math.round(professionalData.duration / 60)} dk` : ''}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </header>

                {/* Toolbar */}
                <div className="flex justify-end items-center gap-2 p-3 bg-zinc-50 border-b border-zinc-200 flex-wrap flex-shrink-0">
                    <button onClick={() => handleAction('download')} disabled={isPrinting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 disabled:opacity-50 transition-colors">
                        {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                        PDF İndir
                    </button>
                    <button onClick={() => handleAction('print')} disabled={isPrinting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-300 disabled:opacity-50 transition-colors">
                        <i className="fa-solid fa-print"></i> Yazdır
                    </button>
                    <button onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors">
                        <i className="fa-solid fa-share-nodes"></i> Paylaş
                    </button>
                    <div className="h-6 w-px bg-zinc-300 mx-1"></div>
                    {onAutoGenerateWorkbook && (
                        <button onClick={() => onAutoGenerateWorkbook(report)}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all shadow-md">
                            <i className="fa-solid fa-wand-magic-sparkles"></i> Akıllı Rota
                        </button>
                    )}
                    {onAddToWorkbook && (
                        <button onClick={() => onAddToWorkbook(assessment)}
                            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all">
                            <i className="fa-solid fa-plus-circle"></i> Rapora Ekle
                        </button>
                    )}
                    {onManualSave && (
                        <button onClick={onManualSave} disabled={isSaving || isSaved}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSaved ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' : 'bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-100'}`}>
                            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : isSaved ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-save"></i>}
                            <span className="hidden sm:inline">{isSaved ? 'Kaydedildi' : 'Kaydet'}</span>
                        </button>
                    )}
                </div>

                {/* Rapor İçeriği */}
                <div id="report-content-area" className="flex-1 overflow-y-auto p-8 space-y-6 text-black bg-white">

                    {/* Kapak Başlığı */}
                    <div className="border-b-2 border-zinc-800 pb-5 mb-2">
                        <h1 className="text-3xl font-black text-black">Tanısal Değerlendirme Raporu</h1>
                        <div className="flex flex-wrap gap-6 mt-3 text-sm text-zinc-700">
                            <span><strong>Öğrenci:</strong> {assessment.studentName}</span>
                            <span><strong>Yaş:</strong> {assessment.age}</span>
                            <span><strong>Cinsiyet:</strong> {assessment.gender}</span>
                            <span><strong>Sınıf:</strong> {assessment.grade}</span>
                            <span><strong>Tarih:</strong> {new Date(assessment.createdAt).toLocaleDateString('tr-TR')}</span>
                            {professionalData?.duration ? <span><strong>Süre:</strong> {Math.round(professionalData.duration / 60)} dakika</span> : null}
                        </div>
                    </div>

                    {/* Risk Analizi — eğer varsa */}
                    {professionalData?.overallRiskAnalysis && (
                        <div className="bg-white border-2 border-zinc-200 rounded-xl p-5 shadow-sm break-inside-avoid">
                            <h4 className="font-bold text-zinc-700 mb-3 flex items-center gap-2 border-b border-zinc-100 pb-2">
                                <i className="fa-solid fa-shield-halved text-indigo-500"></i> Risk Analizi Özeti
                            </h4>
                            <RiskRow label="Disleksi Göstergesi" level={professionalData.overallRiskAnalysis.dyslexiaRisk} icon="fa-book-open" />
                            <RiskRow label="Diskalkuli Göstergesi" level={professionalData.overallRiskAnalysis.dyscalculiaRisk} icon="fa-calculator" />
                            <RiskRow label="Dikkat Güçlüğü Göstergesi" level={professionalData.overallRiskAnalysis.attentionDeficitRisk} icon="fa-eye" />
                        </div>
                    )}

                    {/* Klinik Gözlem */}
                    {observations && <ObservationCard observations={observations} />}

                    {/* Uzman Görüşü */}
                    <div className="bg-indigo-50 p-6 rounded-xl border-l-8 border-indigo-500 text-sm leading-relaxed text-zinc-800 text-justify break-inside-avoid">
                        <h4 className="font-bold mb-2 uppercase text-indigo-800 tracking-wider flex items-center gap-2">
                            <i className="fa-solid fa-user-doctor"></i> Uzman Görüşü & Özet
                        </h4>
                        {report?.overallSummary ?? 'Özet mevcut değil.'}
                    </div>

                    {/* Radar Chart + Score Bars */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
                        <div className="p-4 border border-zinc-200 rounded-xl flex flex-col items-center justify-center min-h-[280px] bg-white break-inside-avoid shadow-sm">
                            <h4 className="font-bold text-zinc-500 text-xs uppercase mb-4">Bilişsel Alan Profili</h4>
                            {chartData.length > 0 && <RadarChart data={chartData} />}
                        </div>
                        <div className="space-y-3 break-inside-avoid">
                            {Object.entries(scores).map(([key, value]) => {
                                const score = value as number;
                                const label = labelMap[key] || key;
                                const riskLevel = score > 80 ? 'Yüksek Başarı' : score > 55 ? 'Ortalama' : 'Desteklenmeli';
                                const colorClass = score > 80 ? 'bg-green-500' : score > 55 ? 'bg-yellow-500' : 'bg-red-500';
                                return (
                                    <div key={key} className="p-3 rounded-lg border border-zinc-200 flex flex-col bg-white shadow-sm">
                                        <div className="flex justify-between mb-1.5">
                                            <span className="capitalize font-bold text-sm text-zinc-700">{label}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded text-white font-bold ${colorClass}`}>
                                                {riskLevel} %{score}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${score}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Güçlü & Zayıf Yönler */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
                        <div className="p-6 bg-green-50 rounded-xl border border-green-200 break-inside-avoid">
                            <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 border-b border-green-200 pb-2">
                                <i className="fa-solid fa-thumbs-up"></i> Güçlü Yönler
                            </h4>
                            {(analysis.strengths ?? []).length > 0 ? (
                                <ul className="list-disc list-inside text-sm text-green-900 space-y-2">
                                    {analysis.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                </ul>
                            ) : <p className="text-sm text-green-700 italic">Tüm testler tamamlandığında güçlü yönler burada görünecektir.</p>}
                        </div>
                        <div className="p-6 bg-rose-50 rounded-xl border border-rose-200 break-inside-avoid">
                            <h4 className="font-bold text-rose-800 mb-4 flex items-center gap-2 border-b border-rose-200 pb-2">
                                <i className="fa-solid fa-triangle-exclamation"></i> Gelişim Alanları
                            </h4>
                            {(analysis.weaknesses ?? []).length > 0 ? (
                                <ul className="list-disc list-inside text-sm text-rose-900 space-y-2">
                                    {analysis.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                </ul>
                            ) : <p className="text-sm text-rose-700 italic">Desteklenmesi gereken alan tespit edilmedi.</p>}
                        </div>
                    </div>

                    {/* Hata Analizi */}
                    {(analysis.errorAnalysis ?? []).length > 0 && (
                        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 text-amber-900 text-sm leading-relaxed break-inside-avoid">
                            <h4 className="font-bold mb-4 flex items-center gap-2 border-b border-amber-200 pb-2">
                                <i className="fa-solid fa-magnifying-glass-chart"></i> Hata Paterni Analizi
                            </h4>
                            <ul className="list-decimal list-inside space-y-2">
                                {analysis.errorAnalysis.map((err: string, i: number) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Alt testler sonuçları tablosu */}
                    {professionalData?.subTests && professionalData.subTests.length > 0 && (
                        <div className="break-inside-avoid">
                            <h4 className="font-bold text-zinc-700 mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-table-list text-zinc-400"></i> Alt Test Sonuçları
                            </h4>
                            <div className="overflow-x-auto rounded-xl border border-zinc-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-zinc-100">
                                        <tr>
                                            <th className="text-left px-4 py-2.5 font-bold text-zinc-600">Test</th>
                                            <th className="text-center px-3 py-2.5 font-bold text-zinc-600">Puan</th>
                                            <th className="text-center px-3 py-2.5 font-bold text-zinc-600">Doğruluk</th>
                                            <th className="text-center px-3 py-2.5 font-bold text-zinc-600">Ort. RT (ms)</th>
                                            <th className="text-center px-3 py-2.5 font-bold text-zinc-600">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {professionalData.subTests.map((t, i) => (
                                            <tr key={i} className="hover:bg-zinc-50">
                                                <td className="px-4 py-2.5 font-medium text-zinc-700">{t.name}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className={`font-black text-sm ${t.score > 75 ? 'text-green-600' : t.score > 55 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        %{t.score}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center text-zinc-600">%{t.accuracy}</td>
                                                <td className="px-3 py-2.5 text-center text-zinc-600">{t.avgReactionTime}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'skipped' ? 'bg-zinc-100 text-zinc-500' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {t.status === 'completed' ? 'Tamamlandı' : t.status === 'skipped' ? 'Atlandı' : 'Kısmi'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Eğitim Rotası */}
                    {roadmap.length > 0 && (
                        <div className="bg-zinc-900 text-white p-8 rounded-2xl shadow-lg break-inside-avoid">
                            <h4 className="font-bold text-lg mb-6 flex items-center gap-2 border-b border-zinc-700 pb-4">
                                <i className="fa-solid fa-road"></i> Kişiselleştirilmiş Eğitim Rotası
                            </h4>
                            <div className="space-y-4">
                                {roadmap.map((item: any, idx: number) => {
                                    const activityDef = ACTIVITIES.find((a: any) => a.id === item.activityId);
                                    const title = activityDef?.title || item.activityId;
                                    return (
                                        <div key={idx} className="bg-zinc-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-zinc-700 hover:border-zinc-500 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0">{idx + 1}</div>
                                                <div>
                                                    <h5 className="font-bold text-indigo-300">{title}</h5>
                                                    <p className="text-xs text-zinc-400 mt-0.5">{item.reason}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className="text-xs font-bold bg-zinc-900 px-3 py-1.5 rounded-full text-zinc-400 border border-zinc-700 whitespace-nowrap">
                                                    {item.frequency}
                                                </span>
                                                {onSelectActivity && (
                                                    <button
                                                        onClick={() => { onSelectActivity(item.activityId as ActivityType); onClose(); }}
                                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                                                    >
                                                        <i className="fa-solid fa-play"></i> Üret
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={handleShareReport} />
        </div>
    );
};
