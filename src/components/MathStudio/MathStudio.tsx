// Math Studio — Main Orchestrator v3 (Neuro-Pedagogical & Adaptive Edition)
// Seamless inter-studio coordination, auto-draft saving, and full profile awareness.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentStore } from '../../store/useStudentStore';
import { Student } from '../../types';
import { ShareModal } from '../ShareModal';
import { MathPageConfig, MathMode } from '../../types/math';
import { DEFAULT_PAGE_CONFIG, DEFAULT_THEME_CONFIG, ThemeConfig } from './constants';
import { calculateItemsPerPage } from './utils';

// Hooks
import { useDrillGenerator } from './hooks/useDrillGenerator';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useExportActions } from './hooks/useExportActions';

// Components
import { MathHeader } from './components/MathHeader';
import { DrillCanvas } from './components/DrillCanvas';
import { ProblemCanvas } from './components/ProblemCanvas';
import { AnswerKeyPage } from './components/AnswerKeyPage';
import { ToastContainer, useToast } from './components/Toast';
import { BrandedLoadingAnimation } from '../shared/BrandedLoadingAnimation';

// Panels
import { StudentPanel } from './panels/StudentPanel';
import { PageSettingsPanel } from './panels/PageSettingsPanel';
import { DrillSettingsPanel } from './panels/DrillSettingsPanel';
import { ProblemSettingsPanel } from './panels/ProblemSettingsPanel';
import { AdvancedPanel } from './panels/AdvancedPanel';

interface MathStudioProps {
    onBack: () => void;
    initialData?: Record<string, unknown>;
}

export const MathStudio: React.FC<MathStudioProps> = ({ onBack, initialData }) => {
    const { user } = useAuthStore();
    const { students, activeStudent } = useStudentStore();
    const { toasts, showToast, removeToast } = useToast();

    // --- STATE ---
    const [mode, setMode] = useState<MathMode>('drill');
    const [pageConfig, setPageConfig] = useState<MathPageConfig>({ ...DEFAULT_PAGE_CONFIG });
    const [themeConfig, setThemeConfig] = useState<ThemeConfig>({ ...DEFAULT_THEME_CONFIG });
    const [selectedStudentId, setSelectedStudentId] = useState<string>('anonymous');
    const [learningProfile, setLearningProfile] = useState<string>('dyslexia');
    const [ageGroup, setAgeGroup] = useState<string>('8-10');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // --- HOOKS ---
    const drill = useDrillGenerator(pageConfig.margin);
    const problem = useProblemGenerator(activeStudent?.name || '', pageConfig.margin);

    const exportActions = useExportActions({
        userId: user?.id,
        userName: user?.name,
        mode,
        drillConfig: drill.drillConfig,
        problemConfig: problem.problemConfig,
        pageConfig,
        generatedDrills: drill.generatedDrills,
        generatedProblems: problem.generatedProblems,
        themeConfig,
        instruction: problem.instruction,
        pedagogicalNote: problem.pedagogicalNote,
    });

    // --- AUTO-DRAFT SAVE EFFECT (Debounced 30s) ---
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (!user?.id) return;
        const hasContent = mode === 'drill' ? drill.generatedDrills.length > 0 : problem.generatedProblems.length > 0;
        if (!hasContent) return;

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            exportActions.handleAutoSaveDraft(selectedStudentId);
        }, 30000);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [
        drill.generatedDrills,
        problem.generatedProblems,
        mode,
        selectedStudentId,
        user?.id,
        exportActions
    ]);

    // --- PROFILE ADAPTATION LOGIC ---
    const handleSelectProfile = useCallback((newProfile: string) => {
        setLearningProfile(newProfile);
        
        // Problem config adaptasyonu
        problem.setProblemConfig(prev => ({
            ...prev,
            learningProfile: newProfile,
            problemStyle: newProfile === 'dyscalculia' ? 'simple' : newProfile === 'adhd' ? 'simple' : prev.problemStyle,
            complexity: newProfile === 'dyscalculia' ? '1-step' : prev.complexity,
        }));

        // Drill config adaptasyonu
        drill.setDrillConfig(prev => ({
            ...prev,
            learningProfile: newProfile,
            fontSize: newProfile === 'dyslexia' ? 32 : prev.fontSize,
            gap: newProfile === 'dyscalculia' ? 16 : prev.gap,
        }));

        showToast(`Profil ayarlandı: ${newProfile.toUpperCase()}`, 'info');
    }, [problem, drill, showToast]);

    // --- AGE GROUP ADAPTATION LOGIC ---
    const handleSelectAgeGroup = useCallback((newAge: string) => {
        setAgeGroup(newAge);
        problem.setProblemConfig(prev => ({
            ...prev,
            ageGroup: newAge,
            numberRange: newAge === '5-7' ? '1-10' : newAge === '8-10' ? '1-20' : newAge === '11-13' ? '1-100' : '100-1000',
        }));
    }, [problem]);

    // --- SYNC WITH ACTIVE STUDENT ---
    useEffect(() => {
        if (activeStudent) {
            setSelectedStudentId(activeStudent.id);
            problem.setProblemConfig(prev => ({ ...prev, studentName: activeStudent.name }));
            
            // Eğer öğrencinin profili varsa otomatik eşle
            const sProfile = (activeStudent as { learningProfile?: string; profile?: string }).learningProfile
                || (activeStudent as { profile?: string }).profile;
            if (sProfile && ['dyslexia', 'dyscalculia', 'adhd', 'mixed'].includes(sProfile)) {
                setLearningProfile(sProfile);
            }
        }
    }, [activeStudent]);

    // --- INITIAL DATA LOAD (HYDRATION) ---
    useEffect(() => {
        if (initialData) {
            const rawData = initialData as Record<string, unknown>;
            const data = (rawData.content || rawData) as Record<string, any>;

            if (data.mode) setMode(data.mode);
            if (data.pageConfig) setPageConfig(data.pageConfig);
            if (data.themeConfig) setThemeConfig(data.themeConfig);
            if (data.learningProfile) setLearningProfile(data.learningProfile);
            if (data.ageGroup) setAgeGroup(data.ageGroup);

            const items = data.items || data.drills || data.problems;

            if (data.mode === 'drill' && data.config) {
                drill.setDrillConfig(data.config);
                if (items) drill.setGeneratedDrills(items);
            } else if ((data.mode === 'problem_ai' || data.mode === 'problem') && data.config) {
                problem.setProblemConfig(data.config);
                if (items) problem.setGeneratedProblems(items);
                if (data.instruction) problem.setInstruction(data.instruction);
                if (data.pedagogicalNote) problem.setPedagogicalNote(data.pedagogicalNote);
            }
        }
    }, [initialData]);

    // --- STUDENT SELECT ---
    const handleSelectStudent = (sid: string) => {
        setSelectedStudentId(sid);
        if (sid !== 'anonymous') {
            const s = students.find((x: Student) => x.id === sid);
            if (s) {
                problem.setProblemConfig(prev => ({ ...prev, studentName: s.name }));
                useStudentStore.getState().setActiveStudent(s);
                
                const sProfile = (s as { learningProfile?: string; profile?: string }).learningProfile
                    || (s as { profile?: string }).profile;
                if (sProfile && ['dyslexia', 'dyscalculia', 'adhd', 'mixed'].includes(sProfile)) {
                    setLearningProfile(sProfile);
                }
            }
        } else {
            useStudentStore.getState().setActiveStudent(null);
        }
    };

    // Selected student name
    const selectedStudentName = selectedStudentId !== 'anonymous'
        ? students.find((s: Student) => s.id === selectedStudentId)?.name
        : undefined;

    // --- ACTIONS with Toast ---
    const handleSave = async () => {
        const result = await exportActions.handleSave(selectedStudentId);
        showToast(
            result.success ? 'Çalışma başarıyla buluta kaydedildi.' : (result.error || 'Kaydetme hatası'),
            result.success ? 'success' : 'error'
        );
    };

    const handleShare = async (receiverIds: string[]) => {
        const result = await exportActions.handleShare(receiverIds[0]);
        if (result.success) {
            setIsShareModalOpen(false);
            showToast('Çalışma başarıyla paylaşıldı.', 'success');
        } else {
            showToast(result.error || 'Paylaşım hatası oluştu.', 'error');
        }
    };

    const handleCopyLink = async () => {
        const result = await exportActions.handleCopyShareLink();
        if (result.success) {
            showToast('Paylaşılabilir çalışma linki panoya kopyalandı!', 'success');
        } else {
            showToast('Bağlantı kopyalanamadı.', 'error');
        }
    };

    const handleGenerate = async () => {
        const result = await problem.handleGenerateProblems();
        if (result.success) {
            showToast('Özgün matematik problemleri hazırlandı!', 'success');
        } else {
            showToast(result.error || 'İçerik üretilemedi.', 'error');
        }
    };

    const handleRegenerate = () => {
        if (mode === 'drill') {
            drill.regenerate();
            showToast('İşlemler yenilendi.', 'info');
        } else {
            handleGenerate();
        }
    };

    // Total content pages for answer key calculation
    const totalContentPages = mode === 'drill'
        ? Math.max(1, Math.ceil(drill.generatedDrills.length / Math.max(1, calculateItemsPerPage(drill.drillConfig, pageConfig.margin))))
        : Math.max(1, problem.generatedProblems.length > 0 ? 1 : 0);

    return (
        <div
            className="h-full flex flex-col overflow-hidden font-sans absolute inset-0 z-50 select-none"
            style={{ backgroundColor: 'var(--bg-primary, #09090b)', color: 'var(--text-primary, #f4f4f5)' }}
        >
            {/* HEADER */}
            <MathHeader
                mode={mode}
                setMode={setMode}
                onBack={onBack}
                onPrint={exportActions.handlePrint}
                onSave={handleSave}
                onShare={() => setIsShareModalOpen(true)}
                onCopyLink={handleCopyLink}
                onExportAnswerKey={() => exportActions.handleExportAnswerKeyPdf('download')}
                onRegenerate={handleRegenerate}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                isPrinting={exportActions.isPrinting}
                isSaving={exportActions.isSaving}
                isAutoSaving={exportActions.isAutoSaving}
                lastAutoSaveTime={exportActions.lastAutoSaveTime}
                isSidebarOpen={isSidebarOpen}
                learningProfile={learningProfile}
                drillConfig={drill.drillConfig}
                problemConfig={problem.problemConfig}
                pageConfig={pageConfig}
                generatedDrills={drill.generatedDrills}
                generatedProblems={problem.generatedProblems}
            />

            <div className="flex-1 flex overflow-hidden relative">
                {/* LEFT SIDEBAR — Responsive overlay on mobile */}
                {isSidebarOpen && (
                    <>
                        {/* Mobile backdrop */}
                        <div
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <div
                            className="w-80 flex flex-col overflow-hidden shrink-0 z-50 lg:relative lg:z-auto absolute inset-y-0 left-0 lg:static bg-zinc-950/90 border-r border-white/10 backdrop-blur-2xl"
                        >
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <StudentPanel
                                    selectedStudentId={selectedStudentId}
                                    students={students}
                                    onSelectStudent={handleSelectStudent}
                                    learningProfile={learningProfile}
                                    onSelectProfile={handleSelectProfile}
                                    ageGroup={ageGroup}
                                    onSelectAgeGroup={handleSelectAgeGroup}
                                />
                                <PageSettingsPanel pageConfig={pageConfig} setPageConfig={setPageConfig} />
                                <AdvancedPanel themeConfig={themeConfig} setThemeConfig={setThemeConfig} />

                                {mode === 'drill' && (
                                    <DrillSettingsPanel
                                        drillConfig={drill.drillConfig}
                                        setDrillConfig={drill.setDrillConfig}
                                        toggleDrillOp={drill.toggleDrillOp}
                                    />
                                )}

                                {mode === 'problem_ai' && (
                                    <ProblemSettingsPanel
                                        problemConfig={problem.problemConfig}
                                        setProblemConfig={problem.setProblemConfig}
                                        toggleProblemOp={problem.toggleProblemOp}
                                        toggleProblemType={problem.toggleProblemType}
                                        isGenerating={problem.isGenerating}
                                        onGenerate={handleGenerate}
                                    />
                                )}
                            </div>

                            {/* Sticky Bottom Generate Button */}
                            <div className="p-4 bg-zinc-950/90 border-t border-white/10 shrink-0 z-10 w-full relative mt-auto shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
                                {mode === 'problem_ai' ? (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={problem.isGenerating}
                                        className="w-full py-3.5 bg-gradient-to-r from-accent to-emerald-600 text-white font-black rounded-2xl text-xs shadow-lg shadow-accent/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 uppercase tracking-wider"
                                    >
                                        {problem.isGenerating ? (
                                            <>
                                                <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
                                                <span>AI ÜRETİYOR...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                                                <span>PROBLEMLERİ OLUŞTUR</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleRegenerate}
                                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                                    >
                                        <i className="fa-solid fa-bolt text-sm"></i>
                                        <span>İŞLEMLERİ OLUŞTUR</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* MAIN CANVAS CONTAINER */}
                <div
                    className="flex-1 relative overflow-auto flex flex-col items-center p-8 custom-scrollbar gap-8"
                    id="math-canvas-container"
                    style={{ backgroundColor: 'var(--bg-inset, #121215)' }}
                >
                    {mode === 'drill' && (
                        <DrillCanvas
                            drillConfig={drill.drillConfig}
                            pageConfig={pageConfig}
                            themeConfig={themeConfig}
                            generatedDrills={drill.generatedDrills}
                            studentName={selectedStudentName}
                        />
                    )}

                    {mode === 'problem_ai' && (
                        problem.isGenerating && (!problem.generatedProblems || problem.generatedProblems.length === 0) ? (
                            <div className="flex items-center justify-center w-full h-full min-h-[400px]">
                                <BrandedLoadingAnimation
                                    size="medium"
                                    title="Soru Üretiliyor"
                                    messages={[
                                        "MEB ve ZPD hedefleri taranıyor...",
                                        "Problemler nöro-pedagojik kurallarla oluşturuluyor...",
                                        "Soru metnine uygun görsel şemalar çiziliyor...",
                                        "Çözüm basamakları hesaplanıyor..."
                                    ]}
                                />
                            </div>
                        ) : (
                            <ProblemCanvas
                                problemConfig={problem.problemConfig}
                                pageConfig={pageConfig}
                                themeConfig={themeConfig}
                                generatedProblems={problem.generatedProblems}
                                instruction={problem.instruction}
                                pedagogicalNote={problem.pedagogicalNote}
                                studentName={selectedStudentName}
                            />
                        )
                    )}

                    {/* Answer Key Page (if enabled in drill mode) */}
                    {drill.drillConfig.showAnswer && mode === 'drill' && drill.generatedDrills.length > 0 && (
                        <AnswerKeyPage
                            pageConfig={pageConfig}
                            themeConfig={themeConfig}
                            drillAnswers={drill.generatedDrills}
                            totalContentPages={totalContentPages}
                        />
                    )}

                    {/* Solution Key Page (if enabled in problem mode) */}
                    {problem.problemConfig.includeSolutionBox && mode === 'problem_ai' && problem.generatedProblems.length > 0 && (
                        <AnswerKeyPage
                            pageConfig={pageConfig}
                            themeConfig={themeConfig}
                            problemAnswers={problem.generatedProblems}
                            totalContentPages={totalContentPages}
                        />
                    )}
                </div>
            </div>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onShare={handleShare}
                worksheetTitle={pageConfig.title}
            />

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
};
