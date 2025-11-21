
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
        } else {
            setIsReady(false);
        }
    }, [isOpen]);

    // Calculate position of the target element
    useLayoutEffect(() => {
        if (!isOpen || !isReady) return;

        const updateRect = () => {
            const step = steps[currentStepIndex];
            const element = document.getElementById(step.targetId);
            if (element) {
                // Scroll element into view if needed
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                
                // Wait slightly for scroll to finish then measure
                setTimeout(() => {
                    const rect = element.getBoundingClientRect();
                    setTargetRect(rect);
                }, 300);
            } else {
                // Element not found, maybe skip or close?
                console.warn(`Tour target #${step.targetId} not found`);
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        return () => window.removeEventListener('resize', updateRect);
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
        const gap = 15;
        let top = 0;
        let left = 0;
        const tooltipWidth = 320; // Approx max width
        
        // Default logic based on preferred position or screen space
        // Simple implementation: Center horizontally if top/bottom, center vertically if left/right
        
        const pos = currentStep.position || 'bottom';

        if (pos === 'bottom') {
            top = targetRect.bottom + gap;
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        } else if (pos === 'top') {
            top = targetRect.top - gap - 200; // Approx height
            left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        } else if (pos === 'right') {
            top = targetRect.top;
            left = targetRect.right + gap;
        } else if (pos === 'left') {
            top = targetRect.top;
            left = targetRect.left - tooltipWidth - gap;
        }

        // Keep within viewport
        left = Math.max(10, Math.min(window.innerWidth - tooltipWidth - 10, left));
        top = Math.max(10, Math.min(window.innerHeight - 200, top));

        return { top, left };
    };

    const tooltipStyle = getTooltipStyle();

    // SVG Path for the "cutout" spotlight effect
    // We draw a giant rectangle covering the screen, then a smaller counter-clockwise rectangle for the hole
    const padding = 5;
    const cutoutPath = `
        M 0 0
        H ${window.innerWidth}
        V ${window.innerHeight}
        H 0
        Z
        M ${targetRect.left - padding} ${targetRect.top - padding}
        V ${targetRect.bottom + padding}
        H ${targetRect.right + padding}
        V ${targetRect.top - padding}
        Z
    `;

    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-hidden" onClick={onClose}>
            {/* Blurred Background via Backdrop Filter + SVG Mask */}
            <div className="absolute inset-0 pointer-events-none">
                <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                        <mask id="tour-mask">
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
                    
                    {/* Dark overlay with blur */}
                    <rect 
                        x="0" y="0" width="100%" height="100%" 
                        fill="rgba(0,0,0,0.6)" 
                        mask="url(#tour-mask)" 
                        style={{ backdropFilter: 'blur(4px)' }} 
                    />
                    
                    {/* Spotlight border */}
                    <rect 
                        x={targetRect.left - padding} 
                        y={targetRect.top - padding} 
                        width={targetRect.width + (padding*2)} 
                        height={targetRect.height + (padding*2)} 
                        fill="none" 
                        stroke="#6366F1" 
                        strokeWidth="3" 
                        rx="8"
                        className="animate-pulse"
                    />
                </svg>
            </div>

            {/* Tooltip Card */}
            <div 
                className="absolute bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-5 w-full max-w-xs md:max-w-sm border border-zinc-200 dark:border-zinc-700 flex flex-col gap-3 transition-all duration-300"
                style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside tooltip
            >
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-700 pb-2">
                    <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{currentStep.title}</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                
                <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">
                    {currentStep.content}
                </p>

                <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-zinc-400 font-mono">
                        {currentStepIndex + 1} / {steps.length}
                    </div>
                    <div className="flex gap-2">
                        {currentStepIndex > 0 && (
                            <button 
                                onClick={handlePrev}
                                className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                            >
                                Geri
                            </button>
                        )}
                        <button 
                            onClick={handleNext}
                            className="px-4 py-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors flex items-center gap-2"
                        >
                            {isLastStep ? 'Bitir' : 'İleri'} <i className="fa-solid fa-arrow-right text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
