
import React, { useState } from 'react';
import { ScreeningProfile, ScreeningResult } from '../../types/screening';
import { ScreeningIntro } from './ScreeningIntro';
import { QuestionnaireForm } from './QuestionnaireForm';
import { ResultDashboard } from './ResultDashboard';

interface ScreeningModuleProps {
    onBack: () => void;
    onSelectActivity?: (id: any) => void;
    onAddToWorkbook?: (item: any) => void; 
    onGeneratePlan?: (studentName: string, age: number, weaknesses: string[], diagnosisContext?: string) => void; 
    initialProfile?: ScreeningProfile | null;
}

export const ScreeningModule: React.FC<ScreeningModuleProps> = ({ onBack, onSelectActivity, onAddToWorkbook, onGeneratePlan, initialProfile }) => {
    const [view, setView] = useState<'intro' | 'form' | 'result'>(initialProfile ? 'form' : 'intro');
    const [profile, setProfile] = useState<ScreeningProfile | null>(initialProfile || null);
    const [results, setResults] = useState<ScreeningResult | null>(null);

    const handleStart = (p: ScreeningProfile) => {
        setProfile(p);
        setView('form');
    };

    const handleComplete = (res: ScreeningResult) => {
        setResults(res);
        setView('result');
    };

    return (
        <div className="h-full bg-[var(--bg-primary)] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="bg-[var(--bg-paper)] border-b border-[var(--border-color)] p-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-colors text-[var(--text-muted)]">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 className="font-black text-lg text-[var(--text-primary)] flex items-center gap-2">
                            <i className="fa-solid fa-clipboard-question text-[var(--accent-color)]"></i>
                            Çocuğum Disleksi mi?
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)] font-medium">Bilişsel Tarama Envanteri</p>
                    </div>
                </div>
                {view !== 'intro' && (
                    <div className="bg-[var(--bg-secondary)] px-3 py-1 rounded-lg">
                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            {view === 'form' ? 'DEĞERLENDİRME' : 'SONUÇ'}
                        </span>
                    </div>
                )}
            </div>

            <div className="w-full">
                <div className="p-4 md:p-8 pb-20">
                    {view === 'intro' && <ScreeningIntro onStart={handleStart} />}
                    
                    {view === 'form' && profile && (
                        <QuestionnaireForm 
                            profile={profile} 
                            onComplete={handleComplete} 
                            onCancel={() => setView('intro')} 
                        />
                    )}

                    {view === 'result' && results && (
                        <ResultDashboard 
                            result={results} 
                            onRestart={() => setView('intro')}
                            onSelectActivity={onSelectActivity}
                            onAddToWorkbook={onAddToWorkbook}
                            onGeneratePlan={onGeneratePlan}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
