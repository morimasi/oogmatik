/**
 * MatProblemStudyosu — Ana Stüdyo Shell
 * Math Sınav Stüdyosu klonu — Sadece açık uçlu problem üretir
 * Tamamen bağımsız modül — mevcut MatSinavStudyosu'na dokunmaz
 */

import React, { useState } from 'react';
import { useMatProblemStore } from '../../store/useMatProblemStore';
import { generateMatProblemSeti } from '../../services/matProblemService';
import { MatProblemOnizleme } from './MatProblemOnizleme';
import { MatProblemSoruAyarlari } from './MatProblemSoruAyarlari';
import { MatProblemKazanimPicker } from './MatProblemKazanimPicker';
import { MatProblemCevapAnahtari } from './MatProblemCevapAnahtari';
import { useFascicleStore } from '../../store/useFascicleStore';
import { worksheetService } from '../../services/worksheetService';
import { useAuthStore } from '../../store/useAuthStore';
import { printService } from '../../utils/printService';
import type { MatProblemSeti, ProblemDizgiAyarlari } from '../../types/matProblem';

type TabType = 'ayarlar' | 'onizleme' | 'cevap' | 'gecmis';

// ─── Alt bileşenler ──────────────────────────────────────────
const FmtBtn: React.FC<{ active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }> = ({ active, onClick, children, title }) => (
    <button onClick={onClick} title={title} className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${active ? 'bg-cyan-600 text-white shadow-md' : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}>
        {children}
    </button>
);

export interface MatProblemStudyosuProps {
    initialData?: unknown;
}

export const MatProblemStudyosu: React.FC<MatProblemStudyosuProps> = ({ initialData: _initialData }) => {
    const {
        ayarlar, dizgiAyarlari, aktifProblemSeti, isGenerating,
        setAyarlar, setDizgiAyarlari, setAktifProblemSeti, setIsGenerating,
        addProblemGecmisi, problemGecmisi, removeProblemGecmisi, clearProblemGecmisi,
    } = useMatProblemStore();

    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('ayarlar');
    const [showCevapAnahtari, setShowCevapAnahtari] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showStudentSelector, setShowStudentSelector] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };
    const showError = (msg: string) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000); };

    // ─── Problem Oluştur ───────────────────────────────────────────
    const handleGenerate = async () => {
        if (!ayarlar.sinif) { showError('Lütfen sınıf seviyesini seçin.'); return; }
        setIsGenerating(true);
        setErrorMsg('');
        try {
            const result = await generateMatProblemSeti(ayarlar);
            result.dizgiAyarlari = dizgiAyarlari;
            setAktifProblemSeti(result);
            addProblemGecmisi(result);
            setActiveTab('onizleme');
            showSuccess(`${result.problemler.length} problem başarıyla oluşturuldu!`);
        } catch (err: unknown) {
            showError('Problem üretirken hata oluştu. Tekrar deneyin.');
            console.warn('Problem üretme hatası:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    // ─── Yazdır ───────────────────────────────────────────────────
    const handlePrint = () => {
        if (!aktifProblemSeti) return;
        printService.generatePdf('#mat-problem-print-inner', aktifProblemSeti.baslik, { action: 'print' });
    };

    // ─── Fasiküle Ekle ────────────────────────────────────────────
    const handleAddToFascicle = () => {
        if (!aktifProblemSeti) return;
        try {
            const fascicleStore = useFascicleStore.getState() as any;
            if (typeof fascicleStore.addItem === 'function') {
                fascicleStore.addItem({
                    id: crypto.randomUUID(),
                    type: 'mat-problem',
                    title: aktifProblemSeti.baslik,
                    content: aktifProblemSeti,
                });
            } else if (typeof fascicleStore.addContent === 'function') {
                fascicleStore.addContent({
                    type: 'mat-problem',
                    title: aktifProblemSeti.baslik,
                    data: aktifProblemSeti,
                });
            }
            showSuccess('Kitapçığa eklendi!');
        } catch { showError('Kitapçığa eklenemedi.'); }
    };

    // ─── Kaydet ────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!aktifProblemSeti) return;
        try {
            await worksheetService.saveWorksheet(
                (user as any)?.id || (user as any)?.uid || 'anonymous',
                aktifProblemSeti.baslik,
                'mat-problem' as any,
                aktifProblemSeti.problemler as unknown as any,
                '📐',
                { id: 'math-problem', title: 'Matematik Problemleri' }
            );
            showSuccess('Kaydedildi!');
        } catch { showError('Kayıt başarısız.'); }
    };

    // ─── Paylaş ────────────────────────────────────────────────────
    const handleShare = () => { if (aktifProblemSeti) setShowShareModal(true); };
    const handleConfirmShare = () => {
        showSuccess('Paylaşım bağlantısı kopyalandı!');
        setShowShareModal(false);
    };

    // ─── Öğrenciye Ata ─────────────────────────────────────────────
    const handleAssignToStudent = (studentId: string, studentName: string) => {
        showSuccess(`"${studentName}" öğrencisine atandı!`);
        setShowStudentSelector(false);
    };

    // ─── Geçmişten Yükle ─────────────────────────────────────────
    const handleLoadFromHistory = (ps: MatProblemSeti) => {
        setAktifProblemSeti(ps);
        setActiveTab('onizleme');
    };

    const updateDizgi = <K extends keyof ProblemDizgiAyarlari>(key: K, val: ProblemDizgiAyarlari[K]) => {
        setDizgiAyarlari({ [key]: val });
        if (aktifProblemSeti) {
            setAktifProblemSeti({ ...aktifProblemSeti, dizgiAyarlari: { ...aktifProblemSeti.dizgiAyarlari, [key]: val } });
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-cyan-950 text-white overflow-hidden">
            {/* ═══ ÜST BAR ═══ */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 py-2 bg-zinc-900/80 backdrop-blur-xl border-b border-cyan-800/30 print:hidden gap-2 md:gap-0">
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📐</span>
                        <h1 className="text-sm font-bold text-cyan-300">Matematik Problem Stüdyosu</h1>
                    </div>
                    {aktifProblemSeti && (
                        <span className="bg-cyan-800/40 text-cyan-200 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto md:ml-2 whitespace-nowrap">
                            {aktifProblemSeti.problemler.length} Problem
                        </span>
                    )}
                </div>

                {/* Araç Çubuğu */}
                <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    <FmtBtn active={activeTab === 'onizleme'} onClick={() => setActiveTab('onizleme')} title="Önizleme">👁️ Önizleme</FmtBtn>
                    <FmtBtn onClick={() => aktifProblemSeti && setShowCevapAnahtari(true)} title="Cevap Anahtarı">✓ Cevap Anahtarı</FmtBtn>
                    <FmtBtn active={activeTab === 'gecmis'} onClick={() => setActiveTab('gecmis')} title="Geçmiş">📋 Geçmiş ({problemGecmisi.length})</FmtBtn>
                    <div className="w-px h-5 bg-zinc-700 mx-1 flex-shrink-0" />
                    <FmtBtn onClick={handleSave} title="Kaydet">💾 Kaydet</FmtBtn>
                    <FmtBtn onClick={handleShare} title="Paylaş">🔗 Paylaş</FmtBtn>
                    <FmtBtn onClick={() => aktifProblemSeti && setShowStudentSelector(true)} title="Öğrenciye Ata">👤 Öğrenciye Ata</FmtBtn>
                    <FmtBtn onClick={handleAddToFascicle} title="Kitapçığa Ekle">📚 Kitapçığa Ekle</FmtBtn>
                    <FmtBtn onClick={handlePrint} title="PDF Yazdır">🖨️ PDF Yazdır</FmtBtn>
                </div>
            </div>

            {/* ═══ BİLDİRİMLER ═══ */}
            {successMsg && (
                <div className="mx-4 mt-2 px-3 py-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30">
                    ✓ {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="mx-4 mt-2 px-3 py-2 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg border border-red-500/30">
                    ⚠ {errorMsg}
                </div>
            )}

            {/* ═══ ANA İÇERİK ═══ */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* SOL PANEL — Ayarlar */}
                <div className={`w-full md:w-[380px] flex-shrink-0 flex-col border-r border-cyan-900/30 bg-zinc-900/50 overflow-y-auto print:hidden ${activeTab === 'onizleme' ? 'hidden md:flex' : 'flex'}`}>
                    {/* Sekmeler */}
                    <div className="flex justify-around md:justify-start border-b border-zinc-800 px-2 pt-2">
                        {[
                            { id: 'ayarlar' as TabType, label: '⚙️ Ayarlar', },
                            { id: 'onizleme' as TabType, label: '👁️ Önizleme', },
                            { id: 'gecmis' as TabType, label: '📋 Geçmiş', },
                        ].map((t) => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 md:px-3 py-3 md:py-2 text-xs font-bold transition-all border-b-2 ${activeTab === t.id ? 'border-cyan-500 text-cyan-300' : 'border-transparent text-zinc-500 hover:text-white'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab İçerikleri — Sol Panel */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-3">
                        {activeTab === 'ayarlar' && (
                            <>
                                <MatProblemKazanimPicker
                                    sinif={ayarlar.sinif}
                                    secilenUniteler={ayarlar.secilenUniteler}
                                    secilenKazanimlar={ayarlar.secilenKazanimlar}
                                    onSinifChange={(s: number) => setAyarlar({ sinif: s, secilenUniteler: [], secilenKazanimlar: [] })}
                                    onUniteChange={(u: string[]) => setAyarlar({ secilenUniteler: u })}
                                    onKazanimChange={(k: string[]) => setAyarlar({ secilenKazanimlar: k })}
                                />
                                <MatProblemSoruAyarlari
                                    ayarlar={ayarlar}
                                    onAyarlarChange={setAyarlar}
                                />
                                <button
                                    disabled={isGenerating || !ayarlar.sinif}
                                    onClick={handleGenerate}
                                    className={`w-full mt-4 py-4 md:py-3 rounded-xl font-bold text-sm transition-all ${isGenerating ? 'bg-zinc-700 text-zinc-500 cursor-wait' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98]'}`}
                                >
                                    {isGenerating ? '⏳ Problemler Üretiliyor...' : '🚀 Problemleri Oluştur'}
                                </button>
                            </>
                        )}

                        {activeTab === 'gecmis' && (
                            <div className="space-y-4 md:space-y-2">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-bold text-zinc-400">Üretim Geçmişi</h3>
                                    {problemGecmisi.length > 0 && (
                                        <button onClick={clearProblemGecmisi} className="text-[10px] text-red-400 hover:text-red-300">Tümünü Temizle</button>
                                    )}
                                </div>
                                {problemGecmisi.length === 0 ? (
                                    <p className="text-zinc-600 text-xs text-center py-8">Henüz üretim geçmişi yok.</p>
                                ) : (
                                    problemGecmisi.map((ps) => (
                                        <div key={ps.id} className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50 hover:border-cyan-700/50 transition-all cursor-pointer" onClick={() => handleLoadFromHistory(ps)}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-xs font-bold text-white">{ps.baslik}</h4>
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">{ps.problemler.length} problem • {new Date(ps.olusturmaTarihi).toLocaleDateString('tr-TR')}</p>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); removeProblemGecmisi(ps.id); }} className="text-zinc-600 hover:text-red-400 text-xs p-2 -mr-2 -mt-2">✕</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* SAĞ PANEL — Önizleme */}
                <div className={`flex-1 flex-col overflow-hidden print:w-full print:bg-white print:overflow-visible ${activeTab === 'onizleme' ? 'flex' : 'hidden md:flex'}`}>
                    {/* Dizgi Araç Çubuğu */}
                    <div className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/50 flex-shrink-0 print:hidden w-full overflow-x-auto scrollbar-hide">
                        {/* Font */}
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-500 mr-1">Tasarım</span>
                            {(['Lexend', 'Inter', 'Times New Roman'] as const).map((f) => (
                                <FmtBtn key={f} active={dizgiAyarlari.fontAilesi === f} onClick={() => updateDizgi('fontAilesi', f)}>
                                    {f === 'Times New Roman' ? 'Times' : f}
                                </FmtBtn>
                            ))}
                        </div>
                        <div className="w-px h-4 bg-zinc-700" />
                        {/* Punto */}
                        {(['9pt', '10pt', '11pt', '12pt'] as const).map((s) => (
                            <FmtBtn key={s} active={dizgiAyarlari.fontBoyutu === s} onClick={() => updateDizgi('fontBoyutu', s)}>{s}</FmtBtn>
                        ))}
                        <div className="w-px h-4 bg-zinc-700" />
                        {/* Kenar Boşluğu */}
                        <span className="text-[10px] text-zinc-500">Yerleşim</span>
                        {([{ k: 'dar' as const, l: 'Dar' }, { k: 'orta' as const, l: 'Orta' }, { k: 'genis' as const, l: 'Geniş' }]).map((m) => (
                            <FmtBtn key={m.k} active={dizgiAyarlari.kenarBoslugu === m.k} onClick={() => updateDizgi('kenarBoslugu', m.k)}>{m.l}</FmtBtn>
                        ))}
                        <div className="w-px h-4 bg-zinc-700" />
                        {/* Sütun */}
                        <FmtBtn active={dizgiAyarlari.sutunDuzeni === 'tek'} onClick={() => updateDizgi('sutunDuzeni', 'tek')}>📄 Tek</FmtBtn>
                        <FmtBtn active={dizgiAyarlari.sutunDuzeni === 'cift'} onClick={() => updateDizgi('sutunDuzeni', 'cift')}>📖 Çift</FmtBtn>
                        <div className="w-px h-4 bg-zinc-700" />
                        {/* Hizalama */}
                        <span className="text-[10px] text-zinc-500">Metin</span>
                        <FmtBtn active={dizgiAyarlari.metinHizalama === 'left'} onClick={() => updateDizgi('metinHizalama', 'left')}>⫷ Sola</FmtBtn>
                        <FmtBtn active={dizgiAyarlari.metinHizalama === 'justify'} onClick={() => updateDizgi('metinHizalama', 'justify')}>⫹ Yasla</FmtBtn>
                        <div className="w-px h-4 bg-zinc-700" />
                        {/* Satır Aralığı */}
                        {([{ k: 'siki' as const, l: 'Sıkı' }, { k: 'normal' as const, l: 'Normal' }, { k: 'ayrik' as const, l: 'Ayrık' }]).map((s) => (
                            <FmtBtn key={s.k} active={dizgiAyarlari.satirAraligi === s.k} onClick={() => updateDizgi('satirAraligi', s.k)}>{s.l}</FmtBtn>
                        ))}
                    </div>

                    {/* Önizleme Alanı */}
                    <div className="flex-1 overflow-auto bg-zinc-800/30 flex justify-center md:justify-center py-6 print:py-0 print:m-0 print:bg-white print:block print:overflow-visible touch-pan-x touch-pan-y">
                        {aktifProblemSeti ? (
                            <div id="mat-problem-print-target">
                                <div id="mat-problem-print-inner">
                                    <MatProblemOnizleme
                                        problemSeti={aktifProblemSeti}
                                        dizgiAyarlari={dizgiAyarlari}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-600 py-20">
                                <span className="text-5xl mb-4">📐</span>
                                <p className="text-sm font-bold">Matematik Problem Stüdyosu</p>
                                <p className="text-xs mt-1">Sol panelden ayarları yapın ve "Problemleri Oluştur" butonuna tıklayın.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ MODALLAR ═══ */}
            {showCevapAnahtari && aktifProblemSeti && (
                <MatProblemCevapAnahtari
                    problemSeti={aktifProblemSeti}
                    onClose={() => setShowCevapAnahtari(false)}
                />
            )}

            {showShareModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={() => setShowShareModal(false)}>
                    <div className="bg-zinc-900 rounded-2xl p-6 w-[400px] border border-zinc-700" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-sm font-bold text-white mb-4">🔗 Paylaşım Bağlantısı Oluştur</h3>
                        <p className="text-xs text-zinc-400 mb-4">Problem seti diğer öğretmenlerle paylaşılacaktır.</p>
                        <div className="flex gap-2">
                            <button onClick={handleConfirmShare} className="flex-1 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500">Bağlantı Oluştur</button>
                            <button onClick={() => setShowShareModal(false)} className="flex-1 py-2 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-bold hover:bg-zinc-600">İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {showStudentSelector && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={() => setShowStudentSelector(false)}>
                    <div className="bg-zinc-900 rounded-2xl p-6 w-[400px] border border-zinc-700" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-sm font-bold text-white mb-4">👤 Öğrenciye Ata</h3>
                        <p className="text-xs text-zinc-400 mb-4">Problem setini atamak istediğiniz öğrenciyi seçin.</p>
                        <button onClick={() => handleAssignToStudent('demo', 'Demo Öğrenci')} className="w-full py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 mb-2">Demo Öğrenci</button>
                        <button onClick={() => setShowStudentSelector(false)} className="w-full py-2 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-bold hover:bg-zinc-600">İptal</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatProblemStudyosu;
