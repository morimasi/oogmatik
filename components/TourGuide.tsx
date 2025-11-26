
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
            setTargetRect(null); // Reset rect on close
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
        let scrollTimeout: ReturnType<typeof setTimeout>;

        const handleNextAuto = () => {
            setTargetRect(null);
            if (currentStepIndex < steps.length - 1) {
                // Move to next step immediately
                skipTimeout = setTimeout(() => setCurrentStepIndex(prev => prev + 1), 0);
            } else {
                // If it's the last step and missing, close tour
                onClose();
            }
        };
        
        const updateRect = () => {
            const step = steps[currentStepIndex];
            if (!step) return;

            const element = document.getElementById(step.targetId);
            
            // Element exists and is visible (has dimensions)
            if (element && element.offsetParent !== null) {
                // Scroll element into view if needed
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                
                // Wait slightly for scroll to finish then measure
                scrollTimeout = setTimeout(() => {
                    if (!element) return; // Double check existence
                    const rect = element.getBoundingClientRect();
                    // Check again if element is actually visible in viewport dimensions
                    if (rect.width === 0 && rect.height === 0) {
                         handleNextAuto();
                    } else {
                        setTargetRect(rect);
                    }
                }, 350);
            } else {
                // Element not found or hidden (e.g. Toolbar not generated yet)
                console.log(`Tour target #${step.targetId} not visible, skipping step.`);
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

    const currentStep = steps[currentStepIndex];

    // Safety check: If not open, no rect, or invalid step, don't render
    if (!isOpen || !targetRect || !currentStep) return null;

    const isLastStep = currentStepIndex === steps.length - 1;

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setTargetRect(null); // Clear rect to prevent stale render during transition
        if (isLastStep) {
            onClose();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setTargetRect(null); // Clear rect to prevent stale render during transition
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    // Determine tooltip position style
    const getTooltipStyle = () => {
        const gap = 20;
        let top = 0;
        let left = 0;
        const tooltipWidth = 320; 
        const tooltipHeight = 200; // Approx
        
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

        // Keep within viewport with padding
        const padding = 20;
        if (left < padding) left = padding;
        if (left + tooltipWidth > window.innerWidth - padding) left = window.innerWidth - tooltipWidth - padding;
        
        if (top < padding) top = padding;
        if (top + tooltipHeight > window.innerHeight - padding) top = window.innerHeight - tooltipHeight - padding;


        return { top, left };
    };

    const tooltipStyle = getTooltipStyle();
    const padding = 8; // Padding around the highlight area
    
    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-hidden font-sans tour-overlay" onClick={onClose}>
            {/* Blurred Background via Backdrop Filter + SVG Mask */}
            <div className="absolute inset-0 pointer-events-none transition-all duration-300 ease-in-out">
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
                                rx="8" 
                            />
                        </mask>
                    </defs>
                    
                    <rect 
                        x="0" y="0" width="100%" height="100%" 
                        fill="rgba(0,0,0,0.6)" 
                        mask="url(#tour-mask)" 
                    />
                    
                    {/* Spotlight animated border */}
                    <rect 
                        x={targetRect.left - padding} 
                        y={targetRect.top - padding} 
                        width={targetRect.width + (padding*2)} 
                        height={targetRect.height + (padding*2)} 
                        fill="none" 
                        stroke="#6366F1" 
                        strokeWidth="3" 
                        rx="8"
                        className="tour-highlight transition-all duration-300 ease-out"
                    />
                </svg>
            </div>

            {/* Tooltip Card */}
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
