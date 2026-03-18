
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export interface TourStep {
    targetId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourGuideProps {
    steps?: TourStep[];
    isOpen: boolean;
    onClose: () => void;
}

export const TourGuide: React.FC<TourGuideProps> = ({ steps = [], isOpen, onClose }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setCurrentStepIndex(0);
            setIsReady(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => {
                setIsReady(false);
                setTargetRect(null);
            }, 300); // Wait for transition
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Calculate position of the target element OR Skip if missing
    useLayoutEffect(() => {
        if (!isOpen || !isReady) return;
        
        // Safety check: ensure steps exist and index is valid
        if (!steps || steps.length === 0 || currentStepIndex >= steps.length || currentStepIndex < 0) {
            // If we went out of bounds, close the tour safely
            if (currentStepIndex >= (steps?.length || 0) && (steps?.length || 0) > 0) {
                 onClose();
            }
            return;
        }

        let skipTimeout: ReturnType<typeof setTimeout>;
        let scrollTimeout: ReturnType<typeof setTimeout>;

        const handleNextAuto = () => {
            setTargetRect(null);
            if (currentStepIndex < steps.length - 1) {
                skipTimeout = setTimeout(() => setCurrentStepIndex(prev => prev + 1), 0);
            } else {
                onClose();
            }
        };
        
        const updateRect = () => {
            const step = steps[currentStepIndex];
            if (!step || !step.targetId) {
                handleNextAuto();
                return;
            }

            const element = document.getElementById(step.targetId);
            
            if (element && element.offsetParent !== null) {
                try {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                } catch (e) { /* ignore */ }
                
                scrollTimeout = setTimeout(() => {
                    // Check element existence again inside timeout to be safe
                    const el = document.getElementById(step.targetId);
                    if (!el) {
                        handleNextAuto();
                        return;
                    }
                    const rect = el.getBoundingClientRect();
                    // Check if element is visible (non-zero size)
                    if (rect.width === 0 && rect.height === 0) {
                         handleNextAuto();
                    } else {
                        setTargetRect(rect);
                    }
                }, 350);
            } else {
                // Element not found, skip to next step
                handleNextAuto();
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        
        return () => {
            window.removeEventListener('resize', updateRect);
            clearTimeout(skipTimeout);
            clearTimeout(scrollTimeout);
        };
    }, [isOpen, currentStepIndex, steps, isReady, onClose]);

    // Robust check for rendering
    if (!isOpen || !isReady || !steps || steps.length === 0) return null;
    
    const currentStep = steps[currentStepIndex];
    // If currentStep is undefined (e.g. during state transition), do not render
    if (!currentStep || !targetRect) return null;

    const isLastStep = currentStepIndex === steps.length - 1;

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLastStep) {
            onClose();
        } else {
            setTargetRect(null);
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentStepIndex > 0) {
            setTargetRect(null);
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const getTooltipStyle = () => {
        if (!targetRect || !currentStep) return { top: 0, left: 0 }; // Guard

        const gap = 20;
        let top = 0;
        let left = 0;
        const tooltipWidth = 320; 
        const tooltipHeight = 200; 
        
        const pos = currentStep.position || 'bottom';

        if (pos === 'bottom') {
            top = targetRect.bottom + gap;
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        } else if (pos === 'top') {
            top = targetRect.top - gap - tooltipHeight; 
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        } else if (pos === 'right') {
            top = targetRect.top;
            left = targetRect.right + gap;
        } else if (pos === 'left') {
            left = targetRect.left - tooltipWidth - gap;
            top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        }

        const padding = 20;
        // Bounds checking
        if (left < padding) left = padding;
        if (typeof window !== 'undefined') {
            if (left + tooltipWidth > window.innerWidth - padding) left = window.innerWidth - tooltipWidth - padding;
            if (top < padding) top = padding;
            if (top + tooltipHeight > window.innerHeight - padding) top = window.innerHeight - tooltipHeight - padding;
        }

        return { top, left };
    };

    const tooltipStyle = getTooltipStyle();
    const padding = 8;
    
    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-hidden font-sans tour-overlay" onClick={onClose}>
            <div className="absolute inset-0 pointer-events-none transition-all duration-300 ease-in-out">
                <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                        <mask id="tour-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            <rect 
                                x={targetRect.left - padding} 
                                y={targetRect.top - padding} 
                                width={Math.max(0, targetRect.width + (padding*2))} 
                                height={Math.max(0, targetRect.height + (padding*2))} 
                                fill="black" 
                                rx="8" 
                            />
                        </mask>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#tour-mask)" />
                    <rect 
                        x={targetRect.left - padding} 
                        y={targetRect.top - padding} 
                        width={Math.max(0, targetRect.width + (padding*2))} 
                        height={Math.max(0, targetRect.height + (padding*2))} 
                        fill="none" 
                        stroke="#6366F1" 
                        strokeWidth="3" 
                        rx="8"
                        className="tour-highlight transition-all duration-300 ease-out"
                    />
                </svg>
            </div>

            <div 
                className="absolute bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 w-full max-w-xs border border-zinc-200 dark:border-zinc-700 flex flex-col gap-3 transition-all duration-300 ease-out z-[10000]"
                style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{currentStep.title}</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                
                <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                    {currentStep.content}
                </p>

                <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                    <div className="text-[10px] font-bold text-zinc-400 font-mono tracking-widest">
                        {currentStepIndex + 1} / {steps.length}
                    </div>
                    <div className="flex gap-2">
                        {currentStepIndex > 0 && (
                            <button 
                                onClick={handlePrev}
                                className="px-3 py-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                Geri
                            </button>
                        )}
                        <button 
                            onClick={handleNext}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all transform active:scale-95 flex items-center gap-2"
                        >
                            {isLastStep ? 'Tamamla' : 'İleri'} 
                            {!isLastStep && <i className="fa-solid fa-chevron-right text-[10px]"></i>}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
