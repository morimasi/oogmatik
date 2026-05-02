
import React, { useState, useMemo } from 'react';
import { ScreeningProfile, ScreeningResult } from '../../types/screening';
import { SCREENING_QUESTIONS, CATEGORY_LABELS } from '../../data/screeningQuestions';
import { scoringEngine } from '../../utils/scoringEngine';

interface Props {
    profile: ScreeningProfile;
    onComplete: (result: ScreeningResult) => void;
    onCancel: () => void;
}

export const QuestionnaireForm: React.FC<Props> = ({ profile, onComplete, onCancel }) => {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentStep, setCurrentStep] = useState(0);

    // Filter relevant questions based on respondent role
    const questions = useMemo(() => {
        return SCREENING_QUESTIONS.filter(q => q.formType === 'both' || q.formType === profile.respondent);
    }, [profile.respondent]);

    // Group questions by category for steps
    const categories = useMemo(() => {
        const cats = Array.from(new Set(questions.map(q => q.category)));
        return cats;
    }, [questions]);

    const currentCategory = categories[currentStep];
    const categoryQuestions = questions.filter(q => q.category === currentCategory);

    const handleAnswer = (qId: string, value: number) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleNext = () => {
        if (currentStep < categories.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Finish
            const result = scoringEngine.calculate(answers, profile.respondent, profile.studentName);
            onComplete(result);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const progress = Math.round(((currentStep) / categories.length) * 100);
    const isCategoryComplete = categoryQuestions.every(q => answers[q.id] !== undefined);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    <span>{CATEGORY_LABELS[currentCategory]}</span>
                    <span>%{progress} Tamamlandı</span>
                </div>
                <div className="w-full h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div className="h-full bg-[var(--accent-color)] transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Questions Card */}
            <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-sm mb-8 animate-in fade-in slide-in-from-right-4 duration-300" key={currentCategory}>
                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-6 border-b border-[var(--border-color)] pb-4">
                    {CATEGORY_LABELS[currentCategory]}
                </h3>
                
                <div className="space-y-8">
                    {categoryQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                            <p className="text-lg font-medium text-[var(--text-primary)] mb-4">
                                <span className="font-bold text-[var(--accent-color)] mr-2">{idx + 1}.</span>
                                {q.text}
                            </p>
                            
                            <div className="grid grid-cols-5 gap-2">
                                {[
                                    { val: 0, label: 'Hiç' },
                                    { val: 1, label: 'Nadiren' },
                                    { val: 2, label: 'Bazen' },
                                    { val: 3, label: 'Sık Sık' },
                                    { val: 4, label: 'Her Zaman' }
                                ].map((opt) => (
                                    <button
                                        key={opt.val}
                                        onClick={() => handleAnswer(q.id, opt.val)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                                            answers[q.id] === opt.val
                                                ? 'border-[var(--accent-color)] bg-[var(--accent-muted)] text-[var(--accent-color)] shadow-md transform scale-105'
                                                : 'border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]'
                                        }`}
                                    >
                                        <span className={`text-xl font-black mb-1 ${answers[q.id] === opt.val ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]/30'}`}>{opt.val}</span>
                                        <span className="text-[10px] uppercase font-bold tracking-tight">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                <button 
                    onClick={handlePrev} 
                    disabled={currentStep === 0}
                    className="px-6 py-3 text-[var(--text-muted)] font-bold hover:text-[var(--text-primary)] disabled:opacity-30"
                >
                    <i className="fa-solid fa-arrow-left mr-2"></i> Geri
                </button>
                <div className="flex gap-4 items-center">
                    {!isCategoryComplete && <span className="text-xs text-rose-500 font-bold animate-pulse">Lütfen tüm soruları cevaplayınız.</span>}
                    <button 
                        onClick={handleNext} 
                        disabled={!isCategoryComplete}
                        className="px-8 py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {currentStep === categories.length - 1 ? 'ANALİZİ TAMAMLA' : 'SONRAKİ ADIM'} <i className="fa-solid fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};
