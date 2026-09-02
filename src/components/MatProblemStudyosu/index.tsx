/**
 * MatProblemStudyosu — Ana Stüdyo Shell
 * Gelişmiş Eylem Butonları: Öğrenciye Ata, Kaydet, Paylaş, Kitapçığa Ekle
 */

import React, { useState, useEffect } from 'react';
import { useMatProblemStore } from '../../store/useMatProblemStore';
import { generateMatProblemSeti } from '../../services/matProblemService';
import { MatProblemOnizleme } from './MatProblemOnizleme';
import { MatProblemSoruAyarlari } from './MatProblemSoruAyarlari';
import { MatProblemKazanimPicker } from './MatProblemKazanimPicker';
import { MatProblemCevapAnahtari } from './MatProblemCevapAnahtari';
import { BrandedLoadingAnimation } from '../shared/BrandedLoadingAnimation';
import { useFascicleStore } from '../../store/useFascicleStore';
import { useStudentStore } from '../../store/useStudentStore';
import { worksheetService } from '../../services/worksheetService';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { printService } from '../../utils/printService';
import { db } from '../../services/firebaseClient';
import { collection, addDoc } from 'firebase/firestore';
import type { MatProblemSeti, ProblemDizgiAyarlari } from '../../types/matProblem';
import type { User, Student } from '../../types';

type TabType = 'ayarlar' | 'onizleme' | 'cevap' | 'gecmis';

const MATH_LOADING_MESSAGES = [
    'MEB 2024-2025 Müfredatı & Sınıf Kazanımları Analiz Ediliyor...',
    'LGS & Beceri Temelli Açık Uçlu Senaryo Kurgulanıyor...',
    'Vektörel SVG Şemalar & Grafik Verileri Çiziliyor...',
    'Çözüm Adımları & Cevap Anahtarı Hesaplanıyor...',
    'Lexend Tipografisi & A4 Dizgisi Uygulanıyor...',
];

const FmtBtn: React.FC<{ active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }> = ({ active, onClick, children, title }) => (
    <button
        onClick={onClick}
        title={title}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${active
            ? 'bg-cyan-600 border-cyan-500 text-white shadow-sm'
            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-paper)] hover:text-[var(--text-primary)]'
            }`}
    >
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
    const { students, fetchStudents } = useStudentStore();

    const [activeTab, setActiveTab] = useState<TabType>('ayarlar');
    const [showCevapAnahtari, setShowCevapAnahtari] = useState(false);

    // Modal State'leri
    const [showShareModal, setShowShareModal] = useState(false);
    const [showStudentSelector, setShowStudentSelector] = useState(false);
    const [savedWorksheetId, setSavedWorksheetId] = useState<string | null>(null);

    // Öğrenci Atama State'leri
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

    // Paylaşım State'leri
    const [contacts, setContacts] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [shareTab, setShareTab] = useState<'direct' | 'link' | 'qr'>('direct');
    const [isSharing, setIsSharing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3500); };
    const showError = (msg: string) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(''), 4000); };

    // Öğrenci ve Kişileri Yükle
    useEffect(() => {
        if (user) {
            fetchStudents(user.id, true);
            authService.getContacts(user.id).then(setContacts).catch(() => setContacts([]));
        }
    }, [user, fetchStudents]);

    // ─── Problem Oluştur ───────────────────────────────────────────
    const handleGenerate = async () => {
        if (!ayarlar.sinif) { showError('Lütfen sınıf seviyesini seçin.'); return; }
        setIsGenerating(true);
        setActiveTab('onizleme');
        setErrorMsg('');
        try {
            const result = await generateMatProblemSeti(ayarlar);
            result.dizgiAyarlari = dizgiAyarlari;
            setAktifProblemSeti(result);
            addProblemGecmisi(result);
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
        if (!aktifProblemSeti) { showError('Önce bir problem seti oluşturun.'); return; }
        try {
            const fascicleStore = useFascicleStore.getState() as any;
            const newItem = {
                id: crypto.randomUUID(),
                type: 'mat-problem',
                title: aktifProblemSeti.baslik,
                content: aktifProblemSeti,
                pageCount: Math.ceil(aktifProblemSeti.problemler.length / 3),
            };

            if (typeof fascicleStore.addItem === 'function') {
                fascicleStore.addItem(newItem);
            } else if (typeof fascicleStore.addContent === 'function') {
                fascicleStore.addContent(newItem);
            }
            showSuccess(`"${aktifProblemSeti.baslik}" tüm problemleri ve çözümleriyle Kitapçık Modülüne eklendi!`);
        } catch {
            showError('Kitapçığa eklenirken bir sorun oluştu.');
        }
    };

    // ─── Kaydet ────────────────────────────────────────────────────
    const handleSave = async (): Promise<string | null> => {
        if (!aktifProblemSeti) { showError('Önce bir problem seti oluşturun.'); return null; }
        try {
            const userId = user?.id || 'anonymous';
            const atananIsimler = (aktifProblemSeti as any).atananOgrenciler || [];

            const saved = await worksheetService.saveWorksheet(
                userId,
                aktifProblemSeti.baslik,
                'mat-problem' as any,
                [aktifProblemSeti as any],
                '📐',
                { id: 'math-logic', title: 'Matematik & Mantık' },
                undefined,
                atananIsimler.length > 0 ? { name: atananIsimler.join(', '), grade: `${aktifProblemSeti.sinif}. Sınıf` } as any : undefined,
                undefined,
                atananIsimler.join(', ')
            );

            setSavedWorksheetId(saved.id);
            showSuccess(`"${aktifProblemSeti.baslik}" başarıyla Dijital Arşive kaydedildi!`);
            return saved.id;
        } catch (e: any) {
            showError(`Kayıt başarısız: ${e.message || 'Hata'}`);
            return null;
        }
    };

    // ─── Öğrenciye Ata ─────────────────────────────────────────────
    const handleConfirmAssignment = async () => {
        if (!aktifProblemSeti) return;
        if (selectedStudentIds.length === 0) { showError('Lütfen en az bir öğrenci seçin.'); return; }

        setIsAssigning(true);
        try {
            const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));
            const studentNames = selectedStudents.map(s => s.name);

            // 1. Veritabanına Atama Kaydı Ekle (assigned_materials)
            for (const student of selectedStudents) {
                await addDoc(collection(db, 'assigned_materials'), {
                    studentId: student.id,
                    studentName: student.name,
                    teacherId: user?.id || 'anonymous',
                    materialTitle: aktifProblemSeti.baslik,
                    activityType: 'mat-problem',
                    content: aktifProblemSeti,
                    assignedAt: new Date().toISOString(),
                    status: 'pending',
                });
            }

            // 2. Aktif Problem Seti Meta Verisini Güncelle
            const updated = {
                ...aktifProblemSeti,
                atananOgrenciler: studentNames,
            };
            setAktifProblemSeti(updated as any);

            showSuccess(`Problem seti "${studentNames.join(', ')}" isimli öğrencilere başarıyla atandı ve ekranlarına gönderildi!`);
            setShowStudentSelector(false);
            setSelectedStudentIds([]);
        } catch (err: any) {
            showError(`Atama sırasında hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
        } finally {
            setIsAssigning(false);
        }
    };

    // ─── Paylaş (Direct / User List / Link) ────────────────────────
    const handleConfirmShareUsers = async () => {
        if (!aktifProblemSeti) return;
        if (selectedUserIds.length === 0) { showError('Lütfen paylaşmak istediğiniz en az bir kullanıcı seçin.'); return; }

        setIsSharing(true);
        try {
            let wsId = savedWorksheetId;
            if (!wsId) {
                wsId = await handleSave();
            }

            if (wsId && user) {
                await worksheetService.shareWorksheet(wsId, user.id, user.name, selectedUserIds);
                showSuccess('Problem seti seçtiğiniz kullanıcılarla paylaşıldı ve Paylaşılanlar ekranlarına senkronize edildi!');
                setShowShareModal(false);
                setSelectedUserIds([]);
            } else {
                showError('Paylaşım öncesi kayıt yapılamadı.');
            }
        } catch (err: any) {
            showError(`Paylaşım başarısız: ${err.message || 'Hata'}`);
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopyShareLink = () => {
        const shareUrl = savedWorksheetId
            ? `${window.location.origin}?share=${savedWorksheetId}`
            : window.location.origin;
        navigator.clipboard.writeText(shareUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
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

    const filteredStudents = students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()));
    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(userSearch.toLowerCase()));

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 overflow-hidden">
            {/* ═══ ÜST BAR ═══ */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 py-2 bg-[var(--bg-paper)] border-b border-[var(--border-color)] print:hidden gap-2 md:gap-0">
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📐</span>
                        <h1 className="text-sm font-bold text-cyan-500">Matematik Problem Stüdyosu</h1>
                    </div>
                    {aktifProblemSeti && (
                        <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto md:ml-2 whitespace-nowrap">
                            {aktifProblemSeti.problemler.length} Problem
                        </span>
                    )}
                </div>

                {/* Araç Çubuğu */}
                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    <FmtBtn active={activeTab === 'onizleme'} onClick={() => setActiveTab('onizleme')} title="Önizleme">👁️ Önizleme</FmtBtn>
                    <FmtBtn onClick={() => aktifProblemSeti && setShowCevapAnahtari(true)} title="Cevap Anahtarı">✓ Cevap Anahtarı</FmtBtn>
                    <FmtBtn active={activeTab === 'gecmis'} onClick={() => setActiveTab('gecmis')} title="Geçmiş">📋 Geçmiş ({problemGecmisi.length})</FmtBtn>
                    <div className="w-px h-5 bg-[var(--border-color)] mx-1 flex-shrink-0" />
                    <FmtBtn onClick={handleSave} title="Kaydet">💾 Kaydet</FmtBtn>
                    <FmtBtn onClick={() => aktifProblemSeti && setShowShareModal(true)} title="Paylaş">🔗 Paylaş</FmtBtn>
                    <FmtBtn onClick={() => aktifProblemSeti && setShowStudentSelector(true)} title="Öğrenciye Ata">👤 Öğrenciye Ata</FmtBtn>
                    <FmtBtn onClick={handleAddToFascicle} title="Kitapçığa Ekle">📚 Kitapçığa Ekle</FmtBtn>
                    <FmtBtn onClick={handlePrint} title="PDF Yazdır">🖨️ PDF Yazdır</FmtBtn>
                </div>
            </div>

            {/* ═══ BİLDİRİMLER ═══ */}
            {successMsg && (
                <div className="mx-4 mt-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30 animate-in fade-in">
                    ✓ {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="mx-4 mt-2 px-3 py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/30 animate-in fade-in">
                    ⚠ {errorMsg}
                </div>
            )}

            {/* ═══ ANA İÇERİK ═══ */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* SOL PANEL — Ayarlar */}
                <div className={`w-full md:w-[380px] flex-shrink-0 flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/30 overflow-y-auto print:hidden ${activeTab === 'onizleme' ? 'hidden md:flex' : 'flex'}`}>
                    {/* Sekmeler */}
                    <div className="flex justify-around md:justify-start border-b border-[var(--border-color)] px-2 pt-2 bg-[var(--bg-paper)]/50">
                        {[
                            { id: 'ayarlar' as TabType, label: '⚙️ Ayarlar', },
                            { id: 'onizleme' as TabType, label: '👁️ Önizleme', },
                            { id: 'gecmis' as TabType, label: '📋 Geçmiş', },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-4 md:px-3 py-2.5 text-xs font-bold transition-all border-b-2 ${activeTab === t.id
                                    ? 'border-cyan-500 text-cyan-500 font-extrabold'
                                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab İçerikleri — Sol Panel */}
                    <div className="flex-1 overflow-y-auto p-3">
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
                                    className={`w-full mt-4 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${isGenerating
                                        ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-cyan-600/30 active:scale-[0.98]'
                                        }`}
                                >
                                    {isGenerating ? '⏳ Problemler Üretiliyor...' : '🚀 Problemleri Oluştur'}
                                </button>
                            </>
                        )}

                        {activeTab === 'gecmis' && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xs font-bold text-[var(--text-secondary)]">Üretim Geçmişi</h3>
                                    {problemGecmisi.length > 0 && (
                                        <button onClick={clearProblemGecmisi} className="text-[10px] font-bold text-red-400 hover:underline">
                                            Tümünü Temizle
                                        </button>
                                    )}
                                </div>
                                {problemGecmisi.length === 0 ? (
                                    <p className="text-[var(--text-muted)] text-xs text-center py-8">Henüz üretim geçmişi yok.</p>
                                ) : (
                                    problemGecmisi.map((ps) => (
                                        <div
                                            key={ps.id}
                                            className="bg-[var(--bg-paper)] rounded-xl p-2.5 border border-[var(--border-color)] hover:border-cyan-500/50 transition-all cursor-pointer shadow-sm"
                                            onClick={() => handleLoadFromHistory(ps)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{ps.baslik}</h4>
                                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                                                        {ps.problemler.length} problem • {new Date(ps.olusturmaTarihi).toLocaleDateString('tr-TR')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeProblemGecmisi(ps.id); }}
                                                    className="text-[var(--text-muted)] hover:text-red-400 text-xs p-1"
                                                >
                                                    ✕
                                                </button>
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
                    <div className="flex items-center gap-2 md:gap-3 px-3 py-2 bg-[var(--bg-paper)] border-b border-[var(--border-color)] flex-shrink-0 print:hidden w-full overflow-x-auto scrollbar-hide">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] mr-1 uppercase">Tasarım</span>
                            {(['Lexend', 'Inter', 'Times New Roman'] as const).map((f) => (
                                <FmtBtn key={f} active={dizgiAyarlari.fontAilesi === f} onClick={() => updateDizgi('fontAilesi', f)}>
                                    {f === 'Times New Roman' ? 'Times' : f}
                                </FmtBtn>
                            ))}
                        </div>
                        <div className="w-px h-4 bg-[var(--border-color)]" />
                        {(['9pt', '10pt', '11pt', '12pt'] as const).map((s) => (
                            <FmtBtn key={s} active={dizgiAyarlari.fontBoyutu === s} onClick={() => updateDizgi('fontBoyutu', s)}>{s}</FmtBtn>
                        ))}
                        <div className="w-px h-4 bg-[var(--border-color)]" />
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Yerleşim</span>
                        {([{ k: 'dar' as const, l: 'Dar' }, { k: 'orta' as const, l: 'Orta' }, { k: 'genis' as const, l: 'Geniş' }]).map((m) => (
                            <FmtBtn key={m.k} active={dizgiAyarlari.kenarBoslugu === m.k} onClick={() => updateDizgi('kenarBoslugu', m.k)}>{m.l}</FmtBtn>
                        ))}
                        <div className="w-px h-4 bg-[var(--border-color)]" />
                        <FmtBtn active={dizgiAyarlari.sutunDuzeni === 'tek'} onClick={() => updateDizgi('sutunDuzeni', 'tek')}>📄 Tek</FmtBtn>
                        <FmtBtn active={dizgiAyarlari.sutunDuzeni === 'cift'} onClick={() => updateDizgi('sutunDuzeni', 'cift')}>📖 Çift</FmtBtn>
                        <div className="w-px h-4 bg-[var(--border-color)]" />
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Metin</span>
                        <FmtBtn active={dizgiAyarlari.metinHizalama === 'left'} onClick={() => updateDizgi('metinHizalama', 'left')}>⫷ Sola</FmtBtn>
                        <FmtBtn active={dizgiAyarlari.metinHizalama === 'justify'} onClick={() => updateDizgi('metinHizalama', 'justify')}>⫹ Yasla</FmtBtn>
                        <div className="w-px h-4 bg-[var(--border-color)]" />
                        {([{ k: 'siki' as const, l: 'Sıkı' }, { k: 'normal' as const, l: 'Normal' }, { k: 'ayrik' as const, l: 'Ayrık' }]).map((s) => (
                            <FmtBtn key={s.k} active={dizgiAyarlari.satirAraligi === s.k} onClick={() => updateDizgi('satirAraligi', s.k)}>{s.l}</FmtBtn>
                        ))}
                    </div>

                    {/* Önizleme Alanı */}
                    <div className="flex-1 overflow-auto bg-[var(--bg-primary)]/50 flex justify-center md:justify-center py-6 print:py-0 print:m-0 print:bg-white print:block print:overflow-visible touch-pan-x touch-pan-y">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center p-8 min-h-[450px] w-full animate-in fade-in">
                                <BrandedLoadingAnimation
                                    size="large"
                                    title="Matematik Problemleri Üretiliyor"
                                    messages={MATH_LOADING_MESSAGES}
                                />
                            </div>
                        ) : aktifProblemSeti ? (
                            <div id="mat-problem-print-target">
                                <div id="mat-problem-print-inner">
                                    <MatProblemOnizleme
                                        problemSeti={aktifProblemSeti}
                                        dizgiAyarlari={dizgiAyarlari}
                                        ayarlar={ayarlar}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-[var(--text-muted)] py-20">
                                <span className="text-5xl mb-4 opacity-80">📐</span>
                                <p className="text-sm font-bold text-[var(--text-primary)]">Matematik Problem Stüdyosu</p>
                                <p className="text-xs mt-1 text-[var(--text-secondary)]">Sol panelden sınıf ve MEB kazanım ayarlarını yapıp "Problemleri Oluştur"a tıklayın.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ MODALLAR ═══ */}
            {/* Cevap Anahtarı Modalı */}
            {showCevapAnahtari && aktifProblemSeti && (
                <MatProblemCevapAnahtari
                    problemSeti={aktifProblemSeti}
                    onClose={() => setShowCevapAnahtari(false)}
                />
            )}

            {/* Öğrenciye Ata Modalı (Gelişmiş Çoklu Seçim + Gerçek Veri) */}
            {showStudentSelector && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowStudentSelector(false)}>
                    <div className="bg-[var(--bg-paper)] rounded-2xl p-5 w-full max-w-md border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color)]">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    👤 Öğrencilere Problem Seti Ata
                                </h3>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Seçtiğiniz öğrencilerin ana ekranına atanır</p>
                            </div>
                            <button onClick={() => setShowStudentSelector(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold text-base">✕</button>
                        </div>

                        {/* Arama Barı */}
                        <div className="my-3">
                            <input
                                type="text"
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                placeholder="Öğrenci adı ara..."
                                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-2 border border-[var(--border-color)] outline-none focus:border-cyan-500"
                            />
                        </div>

                        {/* Öğrenci Listesi */}
                        <div className="flex-1 overflow-y-auto space-y-1.5 my-1 pr-1 custom-scrollbar min-h-[160px]">
                            {filteredStudents.length === 0 ? (
                                <div className="text-center py-6 text-[var(--text-muted)] space-y-2">
                                    <p className="text-xs">Sistemde henüz kayıtlı öğrenci bulunamadı.</p>
                                    <button
                                        onClick={() => {
                                            const demoId = 'demo-student-1';
                                            setSelectedStudentIds(prev => prev.includes(demoId) ? prev.filter(i => i !== demoId) : [...prev, demoId]);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${selectedStudentIds.includes('demo-student-1') ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)]'}`}
                                    >
                                        + Demo Öğrenci Seç
                                    </button>
                                </div>
                            ) : (
                                filteredStudents.map((student: Student) => {
                                    const isSelected = selectedStudentIds.includes(student.id);
                                    return (
                                        <label
                                            key={student.id}
                                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${isSelected
                                                ? 'bg-cyan-500/20 border-cyan-500/60 text-[var(--text-primary)]'
                                                : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        setSelectedStudentIds(prev =>
                                                            prev.includes(student.id) ? prev.filter(i => i !== student.id) : [...prev, student.id]
                                                        );
                                                    }}
                                                    className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                                                />
                                                <div>
                                                    <p className="text-xs font-bold text-[var(--text-primary)]">{student.name}</p>
                                                    <p className="text-[10px] text-[var(--text-muted)]">{student.grade ? `${student.grade}. Sınıf` : 'Öğrenci'}</p>
                                                </div>
                                            </div>
                                            {isSelected && <span className="text-xs text-cyan-400 font-bold">✓ Seçildi</span>}
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        {/* Alt Butonlar */}
                        <div className="pt-3 border-t border-[var(--border-color)] flex gap-2">
                            <button
                                disabled={isAssigning || selectedStudentIds.length === 0}
                                onClick={handleConfirmAssignment}
                                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                            >
                                {isAssigning ? 'Atanıyor...' : `${selectedStudentIds.length} Öğrenciye Ata`}
                            </button>
                            <button
                                onClick={() => setShowStudentSelector(false)}
                                className="py-2.5 px-4 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-bold border border-[var(--border-color)] hover:text-[var(--text-primary)]"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Paylaş Modalı (Kullanıcı Listesi + Link + QR) */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
                    <div className="bg-[var(--bg-paper)] rounded-2xl p-5 w-full max-w-md border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center pb-3 border-b border-[var(--border-color)]">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    🔗 Problemleri Kullanıcılarla Paylaş
                                </h3>
                                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{aktifProblemSeti?.baslik}</p>
                            </div>
                            <button onClick={() => setShowShareModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold text-base">✕</button>
                        </div>

                        {/* Sekmeler */}
                        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 my-2 rounded-lg p-0.5">
                            <button
                                onClick={() => setShareTab('direct')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${shareTab === 'direct' ? 'bg-cyan-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                Kişiler
                            </button>
                            <button
                                onClick={() => setShareTab('link')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${shareTab === 'link' ? 'bg-cyan-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                Bağlantı
                            </button>
                            <button
                                onClick={() => setShareTab('qr')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${shareTab === 'qr' ? 'bg-cyan-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            >
                                QR Kod
                            </button>
                        </div>

                        {/* İçerik */}
                        {shareTab === 'direct' && (
                            <div className="flex flex-col flex-1 min-h-[220px]">
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Kullanıcı ara..."
                                    className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs rounded-xl px-3 py-2 border border-[var(--border-color)] outline-none mb-2"
                                />

                                <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[200px] pr-1 custom-scrollbar">
                                    {filteredContacts.length === 0 ? (
                                        <p className="text-center text-[var(--text-muted)] text-xs py-8">Kişi bulunamadı.</p>
                                    ) : (
                                        filteredContacts.map((c) => {
                                            const isSelected = selectedUserIds.includes(c.id);
                                            return (
                                                <div
                                                    key={c.id}
                                                    onClick={() => setSelectedUserIds(prev => isSelected ? prev.filter(i => i !== c.id) : [...prev, c.id])}
                                                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${isSelected
                                                        ? 'bg-cyan-500/20 border-cyan-500/60 text-[var(--text-primary)]'
                                                        : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-500/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                                                            {c.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-[var(--text-primary)]">{c.name}</p>
                                                            <p className="text-[10px] text-[var(--text-muted)]">{c.email}</p>
                                                        </div>
                                                    </div>
                                                    {isSelected && <span className="text-xs text-cyan-400 font-bold">✓</span>}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <button
                                    disabled={isSharing || selectedUserIds.length === 0}
                                    onClick={handleConfirmShareUsers}
                                    className="w-full mt-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    {isSharing ? 'Paylaşılıyor...' : `${selectedUserIds.length} Kişiyle Paylaş`}
                                </button>
                            </div>
                        )}

                        {shareTab === 'link' && (
                            <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                                <span className="text-3xl text-cyan-400">🔗</span>
                                <p className="text-xs text-[var(--text-secondary)] max-w-xs">
                                    Bu bağlantıya sahip öğretmen ve veliler doğrudan bu problem setini açabilir.
                                </p>
                                <div className="flex gap-2 w-full">
                                    <input
                                        type="text"
                                        readOnly
                                        value={savedWorksheetId ? `${window.location.origin}?share=${savedWorksheetId}` : `${window.location.origin}?share=demo`}
                                        className="flex-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-xl px-2.5 py-2 border border-[var(--border-color)] font-mono outline-none"
                                    />
                                    <button
                                        onClick={handleCopyShareLink}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold text-white transition-all ${copySuccess ? 'bg-emerald-600' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                                    >
                                        {copySuccess ? '✓ Kopyalandı' : 'Kopyala'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {shareTab === 'qr' && (
                            <div className="flex flex-col items-center justify-center py-4 space-y-3 text-center">
                                <div className="p-3 bg-white rounded-2xl shadow-lg border border-zinc-200">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(savedWorksheetId ? `${window.location.origin}?share=${savedWorksheetId}` : window.location.origin)}`}
                                        alt="QR"
                                        className="w-36 h-36"
                                    />
                                </div>
                                <p className="text-xs text-[var(--text-secondary)]">Kameradan okutarak doğrudan açabilirsiniz.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatProblemStudyosu;
