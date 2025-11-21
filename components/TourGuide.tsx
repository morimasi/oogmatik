
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export interface TourStep {
    targetId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourGuideProps {
    steps: TourStep[];
    isOpen: boolean;
    onClose: () => void;
}

export const TourGuide: React.FC<TourGuideProps> = ({ steps, isOpen, onClose }) => {
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
            setIsReady(false);
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Calculate position of the target element OR Skip if missing
    useLayoutEffect(() => {
        if (!isOpen || !isReady) return;

        let skipTimeout: ReturnType<typeof setTimeout>;

        const updateRect = () => {
            const step = steps[currentStepIndex];
            if (!step) return;

            const element = document.getElementById(step.targetId);
            
            if (element) {
                // Scroll element into view if needed
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                
                // Wait slightly for scroll to finish then measure
                setTimeout(() => {
                    const rect = element.getBoundingClientRect();
                    // Check if element is actually visible in viewport dimensions (not 0x0)
                    if (rect.width === 0 && rect.height === 0) {
                         // Element exists but invisible, skip
                         handleNextAuto();
                    } else {
                        setTargetRect(rect);
                    }
                }, 350);
            } else {
                // Element not found (e.g. user not logged in, or toolbar not generated yet)
                // Automatically skip to next step
                console.warn(`Tour target #${step.targetId} not found, skipping step.`);
                handleNextAuto();
            }
        };

        const handleNextAuto = () => {
            if (currentStepIndex < steps.length - 1) {
                skipTimeout = setTimeout(() => setCurrentStepIndex(prev => prev + 1), 100);
            } else {
                onClose();
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        return () => {
            window.removeEventListener('resize', updateRect);
            clearTimeout(skipTimeout);
        };
    }, [isOpen, currentStepIndex, steps, isReady]);

    if (!isOpen || !targetRect) return null;

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLastStep) {
            onClose();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    // Determine tooltip position style
    const getTooltipStyle = () => {
        const gap = 20;
        let top = 0;
        let left = 0;
        const tooltipWidth = 320; // Approx max width
        
        const pos = currentStep.position || 'bottom';

        if (pos === 'bottom') {
            top = targetRect.bottom + gap;
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        } else if (pos === 'top') {
            top = targetRect.top - gap - 200; // Approx height adjustment
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        } else if (pos === 'right') {
            top = targetRect.top;
            left = targetRect.right + gap;
        } else if (pos === 'left') {
            top = targetRect.top;
            left = targetRect.left - tooltipWidth - gap;
        }

        // Keep within viewport with padding
        left = Math.max(20, Math.min(window.innerWidth - tooltipWidth - 20, left));
        top = Math.max(20, Math.min(window.innerHeight - 250, top));

        return { top, left };
    };

    const tooltipStyle = getTooltipStyle();
    const padding = 8; // Padding around the element
    
    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-hidden font-sans" onClick={onClose}>
            {/* Blurred Background via Backdrop Filter + SVG Mask */}
            <div className="absolute inset-0 pointer-events-none transition-all duration-500 ease-in-out">
                <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                        <mask id="tour-mask">
                            {/* White fills the mask (visible), Black hides it (transparent hole) */}
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            <rect 
                                x={targetRect.left - padding} 
                                y={targetRect.top - padding} 
                                width={targetRect.width + (padding*2)} 
                                height={targetRect.height + (padding*2)} 
                                fill="black" 
                                rx="12" 
                            />
                        </mask>
                    </defs>
                    
                    <rect 
                        x="0" y="0" width="100%" height="100%" 
                        fill="rgba(0,0,0,0.75)" 
                        mask="url(#tour-mask)" 
                        style={{ backdropFilter: 'blur(8px)' }} 
                    />
                    
                    {/* Spotlight animated border */}
                    <rect 
                        x={targetRect.left - padding} 
                        y={targetRect.top - padding} 
                        width={targetRect.width + (padding*2)} 
                        height={targetRect.height + (padding*2)} 
                        fill="none" 
                        stroke="#6366F1" 
                        strokeWidth="4" 
                        rx="12"
                        className="animate-pulse shadow-[0_0_30px_rgba(99,102,241,0.6)]"
                    />
                </svg>
            </div>

            {/* Tooltip Card */}
            <div 
                className="absolute bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 w-full max-w-xs md:max-w-sm border border-zinc-200 dark:border-zinc-700 flex flex-col gap-4 transition-all duration-500 ease-out z-[10000]"
                style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">{currentStep.title}</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                        <i className="fa-solid fa-times text-lg"></i>
                    </button>
                </div>
                
                <p className="text-zinc-600 dark:text-zinc-300 text-md leading-relaxed">
                    {currentStep.content}
                </p>

                <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                    <div className="text-xs font-bold text-zinc-400 font-mono tracking-widest">
                        ADIM {currentStepIndex + 1} / {steps.length}
                    </div>
                    <div className="flex gap-3">
                        {currentStepIndex > 0 && (
                            <button 
                                onClick={handlePrev}
                                className="px-4 py-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                Geri
                            </button>
                        )}
                        <button 
                            onClick={handleNext}
                            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all transform active:scale-95 flex items-center gap-2"
                        >
                            {isLastStep ? 'Bitir' : 'İleri'} 
                            {!isLastStep && <i className="fa-solid fa-arrow-right text-xs"></i>}
                            {isLastStep && <i className="fa-solid fa-check text-xs"></i>}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
