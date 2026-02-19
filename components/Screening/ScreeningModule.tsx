
import React, { useState } from 'react';
import { ScreeningProfile, ScreeningResult } from '../../types/screening';
import { ScreeningIntro } from './ScreeningIntro';
import { QuestionnaireForm } from './QuestionnaireForm';
import { ResultDashboard } from './ResultDashboard';

interface ScreeningModuleProps {
    onBack: () => void;
    onSelectActivity?: (id: any) => void;
}

export const ScreeningModule: React.FC<ScreeningModuleProps> = ({ onBack, onSelectActivity }) => {
    const [view, setView] = useState<'intro' | 'form' | 'result'>('intro');
    const [profile, setProfile] = useState<ScreeningProfile | null>(null);
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
        <div className="h-full bg-zinc-50 dark:bg-black overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors text-zinc-500">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 className="font-black text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-clipboard-question text-indigo-500"></i>
                            Çocuğum Disleksi mi?
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Bilişsel Tarama Envanteri</p>
                    </div>
                </div>
                {view !== 'intro' && (
                    <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            {view === 'form' ? 'DEĞERLENDİRME' : 'SONUÇ'}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20">
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
                    />
                )}
            </div>
        </div>
    );
};
