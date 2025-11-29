
import React from 'react';
import { CollectionItem, WorkbookSettings } from '../types';
import Worksheet from './Worksheet';

interface WorkbookProps {
    items: CollectionItem[];
    settings: WorkbookSettings;
}

const Workbook: React.FC<WorkbookProps> = ({ items, settings }) => {
    
    // Cover Page Render Logic based on theme
    const renderCover = () => {
        const themeClasses = {
            modern: 'bg-white border-l-[20mm] border-indigo-600',
            classic: 'bg-white border-4 border-double border-zinc-800',
            fun: 'bg-yellow-50 border-4 border-dashed border-orange-400',
            minimal: 'bg-white'
        };

        return (
            <div className={`worksheet-page relative flex flex-col justify-between p-16 shadow-2xl print:shadow-none mb-8 break-after-page ${themeClasses[settings.theme] || 'bg-white'}`} 
                 style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                
                <div className="text-center mt-20">
                    <h1 className="text-5xl font-black text-zinc-900 mb-6 uppercase tracking-widest">{settings.title}</h1>
                    <div className="w-32 h-2 bg-zinc-900 mx-auto mb-6"></div>
                    <h2 className="text-2xl font-bold text-zinc-600">{settings.studentName}</h2>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    {/* Placeholder or Logo */}
                    <div className="w-48 h-48 bg-zinc-100 rounded-full flex items-center justify-center border-4 border-zinc-200">
                        <i className={`fa-solid ${settings.theme === 'fun' ? 'fa-star text-yellow-400' : 'fa-book-open text-zinc-300'} text-6xl`}></i>
                    </div>
                </div>

                <div className="text-center mb-10">
                    {settings.schoolName && <p className="text-xl font-bold text-zinc-800 mb-2">{settings.schoolName}</p>}
                    <p className="text-lg text-zinc-500">{settings.year}</p>
                </div>

                {settings.teacherNote && (
                    <div className="absolute bottom-4 left-0 w-full text-center px-16">
                        <p className="text-sm italic text-zinc-400">{settings.teacherNote}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col items-center gap-8 print:gap-0 print:block">
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; }
                    .break-after-page { break-after: page; page-break-after: always; }
                    .workbook-container { display: block; }
                    .print-hidden { display: none; }
                }
            `}</style>

            {/* Cover Page */}
            {renderCover()}

            {/* Content Pages */}
            {items.map((item, index) => (
                <div key={item.id} className="relative break-after-page print:break-after-page mb-8 print:mb-0 w-full flex justify-center">
                    <Worksheet 
                        activityType={item.activityType} 
                        data={[item.data]} // Wrap single data item in array as Worksheet expects array
                        settings={{...item.settings, showPedagogicalNote: true}} // Enforce showing notes? Or allow user setting
                    />
                    
                    {/* Page Number Overlay */}
                    <div className="absolute bottom-6 right-8 text-xs text-zinc-400 font-mono print:block hidden">
                        Sayfa {index + 1}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Workbook;
