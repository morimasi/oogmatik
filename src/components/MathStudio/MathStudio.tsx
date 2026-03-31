// Math Studio — Main Orchestrator
// This is a thin shell that wires together hooks, panels, and canvas components.

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentStore } from '../../store/useStudentStore';
import { ShareModal } from '../ShareModal';
import { MathPageConfig, MathMode } from '../../types/math';
import { DEFAULT_PAGE_CONFIG, DEFAULT_THEME_CONFIG, ThemeConfig } from './constants';

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

// Panels
import { StudentPanel } from './panels/StudentPanel';
import { PageSettingsPanel } from './panels/PageSettingsPanel';
import { DrillSettingsPanel } from './panels/DrillSettingsPanel';
import { ProblemSettingsPanel } from './panels/ProblemSettingsPanel';
import { AdvancedPanel } from './panels/AdvancedPanel';

// Pagination
import { useDrillPagination } from './hooks/usePagination';

interface MathStudioProps {
    onBack: () => void;
    onAddToWorkbook?: (data: any) => void;
}

export const MathStudio: React.FC<MathStudioProps> = ({ onBack, onAddToWorkbook }) => {
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
    const problem = useProblemGenerator(activeStudent?.name || '');

    const exportActions = useExportActions({
        userId: user?.id,
        userName: user?.name,
        mode,
        drillConfig: drill.drillConfig,
        problemConfig: problem.problemConfig,
        pageConfig,
        generatedDrills: drill.generatedDrills,
        generatedProblems: problem.generatedProblems,
        onAddToWorkbook,
    });

    // --- Pagination for answer key page count ---
    const drillPagination = useDrillPagination(drill.generatedDrills, drill.drillConfig, pageConfig.margin);

    // --- SYNC ---
    useEffect(() => {
        if (activeStudent) {
            setSelectedStudentId(activeStudent.id);
            problem.setProblemConfig(prev => ({ ...prev, studentName: activeStudent.name }));
        }
    }, [activeStudent]);

    // --- STUDENT SELECT ---
    const handleSelectStudent = (sid: string) => {
        setSelectedStudentId(sid);
        if (sid !== 'anonymous') {
            const s = students.find(x => x.id === sid);
            if (s) {
                problem.setProblemConfig(prev => ({ ...prev, studentName: s.name }));
            }
        }
    };

    // --- Selected student name ---
    const selectedStudentName = selectedStudentId !== 'anonymous'
        ? students.find(s => s.id === selectedStudentId)?.name
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
    const totalContentPages = mode === 'drill' ? drillPagination.totalPages : Math.max(1, problem.generatedProblems.length > 0 ? 1 : 0);

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
                onAddToWorkbook={onAddToWorkbook ? exportActions.handleAddToWorkbook : undefined}
                onRegenerate={handleRegenerate}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                isPrinting={exportActions.isPrinting}
                isSaving={exportActions.isSaving}
                isSidebarOpen={isSidebarOpen}
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
                            className="w-80 flex flex-col overflow-y-auto custom-scrollbar shrink-0 z-50 lg:relative lg:z-auto absolute inset-y-0 left-0 lg:static"
                            style={{
                                backgroundColor: 'var(--bg-paper)',
                                borderRight: '1px solid var(--border-color)',
                                backdropFilter: `blur(var(--surface-glass-blur))`,
                            }}
                        >
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
                        <ProblemCanvas
                            problemConfig={problem.problemConfig}
                            pageConfig={pageConfig}
                            themeConfig={themeConfig}
                            generatedProblems={problem.generatedProblems}
                            instruction={problem.instruction}
                            studentName={selectedStudentName}
                        />
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
