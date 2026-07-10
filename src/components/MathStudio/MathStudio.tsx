// Math Studio — Main Orchestrator
// This is a thin shell that wires together hooks, panels, and canvas components.

import React, { useState, useEffect } from 'react';
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

// Pagination

interface MathStudioProps {
    onBack: () => void;
    initialData?: any;
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
    });

    // --- SYNC ---
    useEffect(() => {
        if (activeStudent) {
            setSelectedStudentId(activeStudent.id);
            problem.setProblemConfig(prev => ({ ...prev, studentName: activeStudent.name }));
        }
    }, [activeStudent]);

    // --- INITIAL DATA LOAD (HYDRATION) ---
    useEffect(() => {
        if (initialData) {
            // Support both direct and nested structure
            const data = initialData.content || initialData;
            
            if (data.mode) setMode(data.mode);
            if (data.pageConfig) setPageConfig(data.pageConfig);
            if (data.themeConfig) setThemeConfig(data.themeConfig);
            
            const items = data.items || data.drills || data.problems;

            if (data.mode === 'drill' && data.config) {
                drill.setDrillConfig(data.config);
                if (items) drill.setGeneratedDrills(items);
            } else if ((data.mode === 'problem_ai' || data.mode === 'problem') && data.config) {
                problem.setProblemConfig(data.config);
                if (items) problem.setGeneratedProblems(items);
                if (data.instruction) problem.setInstruction(data.instruction);
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
                // Global store'u da güncelle ki diğer bileşenler de aynı öğrenciyi kullansın
                useStudentStore.getState().setActiveStudent(s);
            }
        } else {
            useStudentStore.getState().setActiveStudent(null);
        }
    };

    // --- Selected student name ---
    const selectedStudentName = selectedStudentId !== 'anonymous'
        ? students.find((s: Student) => s.id === selectedStudentId)?.name
        : undefined;

    // --- ACTIONS with Toast ---
    const handleSave = async () => {
        const result = await exportActions.handleSave(selectedStudentId);
        showToast(result.success ? 'Çalışma başarıyla kaydedildi.' : (result.error || 'Hata'), result.success ? 'success' : 'error');
    };

    const handleShare = async (receiverIds: string[]) => {
        const result = await exportActions.handleShare(receiverIds[0]);
        if (result.success) {
            setIsShareModalOpen(false);
            showToast('Paylaşıldı.', 'success');
        } else {
            showToast(result.error || 'Paylaşım hatası.', 'error');
        }
    };

    const handleGenerate = async () => {
        const result = await problem.handleGenerateProblems();
        if (result.success) {
            showToast('Problemler üretildi!', 'success');
        } else {
            showToast(result.error || 'Hata.', 'error');
        }
    };

    const handleRegenerate = () => {
        if (mode === 'drill') {
            drill.regenerate();
            showToast('Sorular yenilendi.', 'info');
        } else {
            handleGenerate();
        }
    };

    // --- Total content pages for answer key ---
    const totalContentPages = mode === 'drill'
        ? Math.max(1, Math.ceil(drill.generatedDrills.length / Math.max(1, calculateItemsPerPage(drill.drillConfig, pageConfig.margin))))
        : Math.max(1, problem.generatedProblems.length > 0 ? 1 : 0);

    return (
        <div
            className="h-full flex flex-col overflow-hidden font-sans absolute inset-0 z-50"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >

            {/* HEADER */}
            <MathHeader
                mode={mode}
                setMode={setMode}
                onBack={onBack}
                onPrint={exportActions.handlePrint}
                onSave={handleSave}
                onShare={() => setIsShareModalOpen(true)}
                onRegenerate={handleRegenerate}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                isPrinting={exportActions.isPrinting}
                isSaving={exportActions.isSaving}
                isSidebarOpen={isSidebarOpen}
                drillConfig={drill.drillConfig}
                problemConfig={problem.problemConfig}
                pageConfig={pageConfig}
                generatedDrills={drill.generatedDrills}
                generatedProblems={problem.generatedProblems}
            />



            <div className="flex-1 flex overflow-hidden relative">

                {/* LEFT SIDEBAR — responsive overlay on mobile */}
                {isSidebarOpen && (
                    <>
                        {/* Mobile backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                        <div
                            className="w-80 flex flex-col overflow-hidden shrink-0 z-50 lg:relative lg:z-auto absolute inset-y-0 left-0 lg:static"
                            style={{
                                backgroundColor: 'var(--bg-paper)',
                                borderRight: '1px solid var(--border-color)',
                                backdropFilter: `blur(var(--surface-glass-blur))`,
                            }}
                        >
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <StudentPanel
                                    selectedStudentId={selectedStudentId}
                                    students={students}
                                    onSelectStudent={handleSelectStudent}
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
                            <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0 z-10 w-full relative mt-auto shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
                                {mode === 'problem_ai' ? (
                                    <button
                                        onClick={handleGenerate}
                                        disabled={problem.isGenerating}
                                        className="w-full py-4 bg-accent text-white font-black rounded-xl text-sm shadow-xl shadow-accent/20 hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-wider"
                                    >
                                        {problem.isGenerating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                        {problem.isGenerating ? 'BEKLEYİN...' : 'SINAVI OLUŞTUR'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleRegenerate}
                                        className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl text-sm shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-wider"
                                    >
                                        <i className="fa-solid fa-bolt"></i>
                                        SAYFAYI OLUŞTUR
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* MAIN CANVAS */}
                <div
                    className="flex-1 relative overflow-auto flex flex-col items-center p-8 custom-scrollbar gap-8"
                    id="math-canvas-container"
                    style={{ backgroundColor: 'var(--bg-inset)' }}
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
                              messages={["Problemler oluşturuluyor...", "Cevap anahtarı hesaplanıyor...", "Görsel öğeler ekleniyor..."]}
                            />
                          </div>
                        ) : (
                        <ProblemCanvas
                            problemConfig={problem.problemConfig}
                            pageConfig={pageConfig}
                            themeConfig={themeConfig}
                            generatedProblems={problem.generatedProblems}
                            instruction={problem.instruction}
                            studentName={selectedStudentName}
                        />
                        )
                    )}

                    {/* Answer Key Page (if enabled) */}
                    {drill.drillConfig.showAnswer && mode === 'drill' && drill.generatedDrills.length > 0 && (
                        <AnswerKeyPage
                            pageConfig={pageConfig}
                            themeConfig={themeConfig}
                            drillAnswers={drill.generatedDrills}
                            totalContentPages={totalContentPages}
                        />
                    )}

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
