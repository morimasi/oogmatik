
import React from 'react';
import { CollectionItem, WorkbookSettings } from '../types';
import Worksheet from './Worksheet';
import DyslexiaLogo from './DyslexiaLogo';

interface WorkbookProps {
    items: CollectionItem[];
    settings: WorkbookSettings;
}

const Workbook: React.FC<WorkbookProps> = ({ items, settings }) => {
    
    // --- COMPONENTS ---

    const Watermark = () => (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden print:z-0">
            <div className="transform -rotate-45 opacity-[0.04] w-[80%]">
                <DyslexiaLogo className="w-full h-auto text-black" />
            </div>
        </div>
    );

    const PageFooter = ({ pageNum }: { pageNum: number }) => (
        <div className="absolute bottom-6 left-0 w-full px-12 flex justify-between items-end text-[10px] text-zinc-400 font-mono print:text-black print:opacity-50">
            <span>Bursa Disleksi AI</span>
            <span className="font-bold text-sm">{pageNum}</span>
        </div>
    );

    // --- PAGES ---

    const renderCover = () => {
        const themeClasses = {
            modern: 'bg-white border-l-[20mm] border-indigo-600',
            classic: 'bg-white border-4 border-double border-zinc-800',
            fun: 'bg-yellow-50 border-4 border-dashed border-orange-400',
            minimal: 'bg-white'
        };

        return (
            <div className={`worksheet-page relative flex flex-col justify-between p-16 shadow-2xl print:shadow-none mb-8 break-after-page ${themeClasses[settings.theme] || 'bg-white'}`} 
                 style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', position: 'relative' }}>
                
                <div className="absolute top-16 left-0 w-full flex justify-center opacity-90">
                    <DyslexiaLogo className="w-64" />
                </div>

                <div className="flex-1 flex flex-col justify-center text-center mt-20">
                    <div className="mb-4">
                        <span className="inline-block px-4 py-1 mb-4 text-xs font-bold tracking-widest text-white bg-black uppercase rounded-full">
                            {settings.year} Eğitim Dönemi
                        </span>
                    </div>
                    <h1 className="text-6xl font-black text-zinc-900 mb-6 uppercase tracking-tight leading-tight">
                        {settings.title}
                    </h1>
                    <div className="w-24 h-2 bg-indigo-600 mx-auto mb-8 rounded-full"></div>
                    
                    {settings.studentName && (
                        <div className="border-2 border-zinc-900 p-6 rounded-xl inline-block mx-auto min-w-[300px]">
                            <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Öğrenci</p>
                            <h2 className="text-3xl font-bold text-zinc-800 font-dyslexic">{settings.studentName}</h2>
                        </div>
                    )}
                </div>

                <div className="text-center mb-10 space-y-2">
                    {settings.schoolName && (
                        <div className="flex items-center justify-center gap-2 text-zinc-600 font-semibold">
                            <i className="fa-solid fa-school"></i>
                            <p className="text-xl">{settings.schoolName}</p>
                        </div>
                    )}
                    {settings.teacherNote && (
                        <p className="text-sm italic text-zinc-500 mt-4 max-w-md mx-auto border-t pt-4 border-zinc-200">
                            "{settings.teacherNote}"
                        </p>
                    )}
                </div>
                
                <div className="absolute bottom-4 right-6 text-[10px] text-zinc-300">
                    Oluşturulma: {new Date().toLocaleDateString('tr-TR')}
                </div>
            </div>
        );
    };

    const renderTableOfContents = () => {
        if (items.length === 0) return null;
        
        return (
            <div className="worksheet-page relative p-16 shadow-2xl print:shadow-none mb-8 break-after-page bg-white"
                 style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                
                <Watermark />

                <div className="text-center mb-12 border-b-2 border-zinc-100 pb-6">
                    <h2 className="text-3xl font-black text-zinc-800 uppercase tracking-widest">İçindekiler</h2>
                </div>

                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex items-baseline justify-between group">
                            <div className="flex items-baseline gap-3 flex-1 overflow-hidden">
                                <span className="font-bold text-zinc-400 w-6">{index + 1}.</span>
                                <span className="text-lg font-medium text-zinc-800 truncate">{item.title}</span>
                                <div className="flex-1 border-b-2 border-dotted border-zinc-300 mx-2 relative -top-1 opacity-50"></div>
                            </div>
                            <span className="font-bold text-lg text-zinc-900">{index + 3}</span> {/* Cover + TOC + 1 */}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderBackCover = () => (
        <div className="worksheet-page relative flex flex-col justify-center items-center p-16 shadow-2xl print:shadow-none mb-8 break-after-page bg-zinc-900 text-white"
             style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
            
            <div className="text-center space-y-6">
                <DyslexiaLogo className="w-64 text-white fill-white" />
                <div className="w-16 h-1 bg-indigo-500 mx-auto rounded-full"></div>
                <p className="text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Özel öğrenme güçlüğü yaşayan bireyler için yapay zeka destekli kişiselleştirilmiş eğitim materyalleri.
                </p>
            </div>

            <div className="absolute bottom-16 text-center w-full">
                <p className="text-sm text-zinc-500">© {new Date().getFullYear()} Bursa Disleksi AI</p>
                <p className="text-xs text-zinc-600 mt-2">Tüm hakları saklıdır.</p>
            </div>
        </div>
    );

    return (
        <div className="workbook-container w-full flex flex-col items-center gap-8 print:gap-0 print:block bg-zinc-100 dark:bg-zinc-900 py-8 print:py-0 print:bg-white">
            <style>{`
                @media print {
                    @page { margin: 0; size: A4; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                    .break-after-page { break-after: page; page-break-after: always; }
                    .workbook-container { display: block; padding: 0; background: white; }
                    .print-hidden { display: none; }
                    /* Ensure watermark prints correctly */
                    .opacity-\\[0\\.04\\] { opacity: 0.1 !important; } 
                }
                /* Font fix for DyslexiaLogo in print */
                .logo-text { fill: currentColor; }
            `}</style>

            {/* 1. Cover Page */}
            {renderCover()}

            {/* 2. Table of Contents */}
            {renderTableOfContents()}

            {/* 3. Content Pages */}
            {items.map((item, index) => (
                <div key={item.id} className="relative break-after-page print:break-after-page mb-8 print:mb-0 w-full flex justify-center">
                    {/* Wrapper to hold watermark relative to page */}
                    <div className="relative" style={{ width: '210mm', minHeight: '297mm' }}>
                        <Watermark />
                        
                        <Worksheet 
                            activityType={item.activityType} 
                            data={[item.data]} 
                            settings={{...item.settings, showPedagogicalNote: true}} 
                        />
                        
                        <PageFooter pageNum={index + 3} />
                    </div>
                </div>
            ))}

            {/* 4. Back Cover */}
            {renderBackCover()}
        </div>
    );
};

export default Workbook;
