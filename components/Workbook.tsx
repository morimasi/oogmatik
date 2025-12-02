
import React from 'react';
import { CollectionItem, WorkbookSettings } from '../types';
import Worksheet from './Worksheet';
import DyslexiaLogo from './DyslexiaLogo';

interface WorkbookProps {
    items: CollectionItem[];
    settings: WorkbookSettings;
}

const Workbook: React.FC<WorkbookProps> = ({ items, settings }) => {
    
    const accent = settings.accentColor || '#4f46e5';
    
    // --- COMPONENTS ---

    const Watermark = () => {
        if (!settings.showWatermark) return null;
        return (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden print:z-0">
                <div className="transform -rotate-45 opacity-[0.03] w-[70%] grayscale">
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} className="w-full h-auto" />
                    ) : (
                        <DyslexiaLogo className="w-full h-auto text-black" />
                    )}
                </div>
            </div>
        );
    };

    const PageFooter = ({ pageNum }: { pageNum: number }) => {
        if (!settings.showPageNumbers) return null;
        return (
            <div className="absolute bottom-6 left-0 w-full px-12 flex justify-between items-end text-[10px] text-zinc-400 font-mono print:text-black print:opacity-50">
                <span>{settings.schoolName || 'Bursa Disleksi AI'}</span>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm bg-zinc-100 px-2 py-1 rounded">{pageNum}</span>
                </div>
            </div>
        );
    };

    // --- COVERS ---

    const renderCover = () => {
        const logoComponent = settings.logoUrl ? (
            <img src={settings.logoUrl} className="h-24 w-auto object-contain" />
        ) : (
            <DyslexiaLogo className="h-20 w-auto text-current" />
        );

        // --- MODERN THEME ---
        if (settings.theme === 'modern') {
            return (
                <div className="worksheet-page relative flex flex-col p-0 shadow-2xl print:shadow-none mb-8 break-after-page bg-white overflow-hidden" 
                     style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', borderLeft: `20mm solid ${accent}` }}>
                    
                    <div className="p-16 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            {logoComponent}
                            <div className="text-right">
                                <h3 className="font-bold text-lg text-zinc-400 uppercase tracking-widest">{settings.year}</h3>
                                <p className="text-xs text-zinc-400 uppercase">Eğitim Dönemi</p>
                            </div>
                        </div>

                        <div className={`flex flex-col ${settings.coverStyle === 'centered' ? 'items-center text-center' : 'items-start text-left'}`}>
                            <span className="inline-block px-4 py-1 mb-6 text-sm font-bold tracking-widest text-white uppercase rounded-full" style={{ backgroundColor: accent }}>
                                Çalışma Kitapçığı
                            </span>
                            <h1 className="text-6xl font-black text-zinc-900 mb-6 uppercase tracking-tight leading-[1.1]">
                                {settings.title}
                            </h1>
                            {settings.studentName && (
                                <div className="border-l-4 pl-6 py-2" style={{ borderColor: accent }}>
                                    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Öğrenci</p>
                                    <h2 className="text-3xl font-bold text-zinc-800">{settings.studentName}</h2>
                                </div>
                            )}
                        </div>

                        <div className="border-t-2 border-zinc-100 pt-8">
                            {settings.schoolName && <p className="font-bold text-lg text-zinc-800">{settings.schoolName}</p>}
                            {settings.teacherNote && <p className="text-sm italic text-zinc-500 mt-2">"{settings.teacherNote}"</p>}
                        </div>
                    </div>
                </div>
            );
        }

        // --- ACADEMIC THEME ---
        if (settings.theme === 'academic') {
            return (
                <div className="worksheet-page relative flex flex-col p-16 shadow-2xl print:shadow-none mb-8 break-after-page bg-white" 
                     style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', border: `2px solid ${accent}` }}>
                    
                    <div className="border-b-4 pb-8 mb-12 text-center" style={{ borderColor: accent }}>
                        {logoComponent}
                        <h3 className="font-serif text-xl mt-4 text-zinc-600">{settings.schoolName}</h3>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <h1 className="text-5xl font-serif font-bold text-zinc-900 mb-4">{settings.title}</h1>
                        <div className="w-24 h-1 mb-8" style={{ backgroundColor: accent }}></div>
                        <h2 className="text-2xl font-serif italic text-zinc-600">{settings.studentName}</h2>
                        <p className="mt-2 text-zinc-500">{settings.year}</p>
                    </div>

                    <div className="text-center text-sm text-zinc-500 font-serif">
                        {settings.teacherNote}
                    </div>
                </div>
            );
        }

        // --- ARTISTIC THEME ---
        if (settings.theme === 'artistic') {
            return (
                <div className="worksheet-page relative flex flex-col p-0 shadow-2xl print:shadow-none mb-8 break-after-page bg-zinc-900 text-white" 
                     style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                    
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-bl-full opacity-50" style={{ backgroundColor: accent }}></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-tr-full opacity-30" style={{ backgroundColor: accent }}></div>

                    <div className="relative z-10 p-16 flex flex-col h-full justify-center">
                        <div className="mb-auto">{logoComponent}</div>
                        
                        <h1 className="text-7xl font-black mb-8 leading-none mix-blend-overlay">{settings.title}</h1>
                        
                        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 inline-block">
                            <p className="text-sm font-bold uppercase tracking-widest mb-2 opacity-70">Hazırlanan</p>
                            <h2 className="text-4xl font-bold">{settings.studentName}</h2>
                            <p className="mt-2 opacity-80">{settings.schoolName} • {settings.year}</p>
                        </div>

                        <div className="mt-auto"></div>
                    </div>
                </div>
            );
        }

        // --- MINIMAL THEME (Default Fallback) ---
        return (
            <div className="worksheet-page relative flex flex-col justify-center items-center p-16 shadow-2xl print:shadow-none mb-8 break-after-page bg-white" 
                 style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                
                <div className="mb-20 scale-125">{logoComponent}</div>

                <div className="text-center space-y-6">
                    <h1 className="text-5xl font-light text-zinc-900 tracking-tight">{settings.title}</h1>
                    <div className="w-12 h-12 rounded-full mx-auto" style={{ backgroundColor: accent }}></div>
                    <h2 className="text-2xl font-bold text-zinc-800">{settings.studentName}</h2>
                </div>

                <div className="absolute bottom-16 text-center w-full text-zinc-400 uppercase tracking-widest text-xs">
                    {settings.schoolName} | {settings.year}
                </div>
            </div>
        );
    };

    const renderTableOfContents = () => {
        if (!settings.showTOC || items.length === 0) return null;
        
        return (
            <div className="worksheet-page relative p-16 shadow-2xl print:shadow-none mb-8 break-after-page bg-white"
                 style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                
                <div className="text-center mb-12 pb-6 border-b-4" style={{ borderColor: accent }}>
                    <h2 className="text-3xl font-black text-zinc-800 uppercase tracking-widest">İçindekiler</h2>
                </div>

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex items-end justify-between group">
                            <div className="flex items-end gap-3 flex-1 overflow-hidden">
                                <span className="font-bold text-zinc-400 w-6 text-right">{index + 1}.</span>
                                <span className="text-lg font-bold text-zinc-800 truncate">{item.title}</span>
                                <div className="flex-1 border-b-2 border-dotted border-zinc-300 mx-2 relative -top-1 opacity-50"></div>
                            </div>
                            <span className="font-bold text-lg" style={{ color: accent }}>{index + (settings.showTOC ? 3 : 2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Calculate start page based on cover + optional TOC
    const contentStartPage = settings.showTOC ? 3 : 2;

    return (
        <div className="workbook-container w-full flex flex-col items-center gap-8 print:gap-0 print:block bg-zinc-100 dark:bg-zinc-900 py-8 print:py-0 print:bg-white">
            <style>{`
                @media print {
                    @page { margin: 0; size: A4; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .break-after-page { break-after: page; page-break-after: always; }
                    .workbook-container { display: block; padding: 0; background: white; }
                    /* Force background colors for cover themes */
                    .worksheet-page { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>

            {/* 1. Cover Page */}
            {renderCover()}

            {/* 2. Table of Contents */}
            {renderTableOfContents()}

            {/* 3. Content Pages */}
            {items.map((item, index) => (
                <div key={item.id} className="relative break-after-page print:break-after-page mb-8 print:mb-0 w-full flex justify-center">
                    <div className="relative bg-white shadow-2xl print:shadow-none" style={{ width: '210mm', minHeight: '297mm' }}>
                        <Watermark />
                        
                        {/* Worksheet Wrapper */}
                        <div className="relative z-10">
                            <Worksheet 
                                activityType={item.activityType} 
                                data={[item.data]} 
                                settings={{...item.settings, showPedagogicalNote: true}} 
                                studentProfile={{ name: settings.studentName, school: settings.schoolName, grade: '', date: new Date().toLocaleDateString() }}
                            />
                        </div>
                        
                        <PageFooter pageNum={index + contentStartPage} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Workbook;
