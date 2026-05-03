
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <div className="w-full px-4">
            {/* Progress Bar */}
            <div className="mb-10">
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Mevcut Alan</p>
                        <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{CATEGORY_LABELS[currentCategory]}</h4>
                    </div>
                    <div className="text-right">
                        <span className="text-xl font-black text-[var(--accent-color)] italic">%{progress}</span>
                    </div>
                </div>
                <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-[var(--accent-color)] to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]" 
                    />
                </div>
            </div>

            {/* Questions Card */}
            <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[3rem] p-10 shadow-2xl mb-10 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden" key={currentCategory}>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <i className="fa-solid fa-clipboard-check text-9xl text-[var(--text-primary)]"></i>
                </div>

                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-10 border-b border-[var(--border-color)] pb-6 flex items-center gap-4 italic uppercase tracking-tighter">
                    <span className="w-12 h-12 rounded-2xl bg-[var(--accent-muted)] text-[var(--accent-color)] flex items-center justify-center border border-[var(--accent-color)]/20 not-italic">
                        {currentStep + 1}
                    </span>
                    {CATEGORY_LABELS[currentCategory]}
                </h3>
                
                <div className="space-y-12 relative z-10">
                    {categoryQuestions.map((q, idx) => (
                        <div key={q.id} className="p-6 rounded-[2rem] hover:bg-[var(--surface-glass)] transition-all group border border-transparent hover:border-[var(--border-color)]">
                            <p className="text-xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
                                <span className="text-[var(--accent-color)] mr-3 opacity-40 font-black italic">{idx + 1}.</span>
                                {q.text}
                            </p>
                            
                            <div className="grid grid-cols-5 gap-3">
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
                                        className={`group/opt flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                                            answers[q.id] === opt.val
                                                ? 'border-[var(--accent-color)] bg-[var(--accent-color)] text-white shadow-xl shadow-[var(--accent-muted)] transform scale-105'
                                                : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg-paper)]'
                                        }`}
                                    >
                                        <span className={`text-2xl font-black mb-1 transition-colors ${answers[q.id] === opt.val ? 'text-white' : 'text-[var(--text-muted)]/30 group-hover-opt:text-[var(--text-secondary)]'}`}>{opt.val}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${answers[q.id] === opt.val ? 'text-white/80' : ''}`}>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center px-4">
                <button 
                    onClick={handlePrev} 
                    disabled={currentStep === 0}
                    className="flex items-center gap-3 px-8 py-4 text-[var(--text-muted)] font-black uppercase tracking-widest hover:text-[var(--text-primary)] disabled:opacity-20 transition-all hover:-translate-x-2"
                >
                    <i className="fa-solid fa-chevron-left"></i> Geri
                </button>
                <div className="flex gap-6 items-center">
                    <AnimatePresence>
                        {!isCategoryComplete && (
                            <motion.span 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse"
                            >
                                Lütfen tüm soruları işaretleyiniz
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <button 
                        onClick={handleNext} 
                        disabled={!isCategoryComplete}
                        className="px-10 py-5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-black rounded-[2rem] shadow-2xl shadow-[var(--accent-muted)] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-xs flex items-center gap-3 group"
                    >
                        {currentStep === categories.length - 1 ? 'Analizi Tamamla' : 'Sonraki Adım'} 
                        <i className="fa-solid fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};
