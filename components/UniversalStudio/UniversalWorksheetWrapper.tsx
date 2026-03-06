import React, { useEffect, useState } from 'react';
import { UniversalStudioProvider, useUniversalStudio } from '../../context/UniversalStudioContext';
import { convertToLayoutItems } from './UniversalAdapter';
import { UniversalCanvas } from './UniversalCanvas';
import { UniversalPropertiesPanel } from './UniversalPropertiesPanel';
import { SingleWorksheetData, ActivityType } from '../../types';

interface UniversalWorksheetWrapperProps {
    worksheetData: SingleWorksheetData[];
    activityType: ActivityType | null;
    scale: number;
}

const UniversalWorksheetInner = ({ worksheetData, activityType, scale }: UniversalWorksheetWrapperProps) => {
    const { setLayout, designMode, setDesignMode } = useUniversalStudio();
    const [isAdapterRunning, setIsAdapterRunning] = useState(true);

    useEffect(() => {
        if (worksheetData && worksheetData.length > 0) {
            setIsAdapterRunning(true);
            const items = convertToLayoutItems(activityType, worksheetData);
            setLayout(items);
            setIsAdapterRunning(false);
        }
    }, [worksheetData, activityType, setLayout]);

    return (
        <div className="flex w-full h-full">
            <div className="flex-1 overflow-auto flex justify-center relative">
                {/* Design Mode Toggle Button - Absolute Top Right */}
                <div className="absolute top-4 right-4 z-50">
                    <button 
                        onClick={() => setDesignMode(!designMode)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${designMode ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-white text-zinc-500 hover:bg-zinc-100 border border-zinc-200'}`}
                    >
                        <i className={`fa-solid ${designMode ? 'fa-pen-ruler' : 'fa-eye'} mr-2`}></i>
                        {designMode ? 'Tasarım Modu: AÇIK' : 'Tasarım Modu: KAPALI'}
                    </button>
                </div>

                {!isAdapterRunning && (
                    <div 
                        className="transition-transform duration-100 ease-out will-change-transform mt-10 mb-20"
                        style={{ 
                            transform: `scale(${scale})`,
                            transformOrigin: 'top center',
                        }}
                    >
                        <UniversalCanvas />
                    </div>
                )}
            </div>

            {/* Right Panel - Only visible in Design Mode */}
            {designMode && (
                <div className="shrink-0 w-80 bg-white border-l border-zinc-200 z-40 h-full">
                    <UniversalPropertiesPanel />
                </div>
            )}
        </div>
    );
};

export const UniversalWorksheetWrapper = (props: UniversalWorksheetWrapperProps) => {
    return (
        <UniversalStudioProvider>
            <UniversalWorksheetInner {...props} />
        </UniversalStudioProvider>
    );
};