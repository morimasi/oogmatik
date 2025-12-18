
import React from 'react';
import { CollectionItem, WorkbookSettings } from '../types';
import Worksheet from './Worksheet';
import DyslexiaLogo from './DyslexiaLogo';
import { ACTIVITIES } from '../constants';

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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                <div 
                    className="transform -rotate-45 w-[70%] grayscale" 
                    style={{ opacity: settings.watermarkOpacity || 0.05 }}
                >
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
            <div className="absolute bottom-6 left-0 w-full px-12 flex justify-between items-end text-[10px] text-zinc-400 font-mono">
                <span>{settings.schoolName || 'Bursa Disleksi AI'}</span>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm bg-zinc-100 px-2 py-1 rounded">{pageNum}</span>
                </div>
            </div>
        );
    };

    // --- RENDERERS ---

    const renderCover = () => {
        const logoComponent = settings.logoUrl ? (
            <img src={settings.logoUrl} className="h-24 w-auto object-contain" />
        ) : (
            <DyslexiaLogo className="h-20 w-auto text-current" />
        );

        if (settings.theme === 'modern') {
            return (
                <div className="worksheet-page relative flex flex-col p-0 shadow-2xl mb-8 bg-white overflow-hidden" 
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
        
        // Fallback/Minimal Theme
        return (
            <div className="worksheet-page relative flex flex-col justify-center items-center p-16 shadow-2xl mb-8 bg-white" 
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
            <div className="worksheet-page relative p-16 shadow-2xl mb-8 bg-white"
                 style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                <div className="text-center mb-12 pb-6 border-b-4" style={{ borderColor: accent }}>
                    <h2 className="text-3xl font-black text-zinc-800 uppercase tracking-widest">İçindekiler</h2>
                </div>
                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex items-end justify-between group text-zinc-800">
                            <span className="font-bold text-zinc-400 w-8 text-right mr-4">{item.itemType === 'divider' ? '' : `${index + 1}.`}</span>
                            <span className={`text-lg font-bold truncate shrink-0 max-w-[70%] ${item.itemType === 'divider' ? 'uppercase tracking-widest' : ''}`} style={item.itemType === 'divider' ? { color: accent } : {}}>
                                {item.itemType === 'divider' ? item.dividerConfig?.title : item.title}
                            </span>
                            <div className="flex-1 mx-2 border-b-2 border-dotted border-zinc-300 relative -top-1 opacity-50"></div>
                            <span className="font-bold text-lg w-8 text-right" style={{ color: accent }}>{index + (settings.showTOC ? 3 : 2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDividerPage = (item: CollectionItem, index: number) => {
        return (
            <div className="worksheet-page relative flex flex-col justify-center items-center p-16 shadow-2xl mb-8 bg-zinc-900 text-white" 
                 style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${accent} 2px, transparent 2px)`, backgroundSize: '30px 30px' }}></div>
                
                <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl mb-8 border-4 border-white/20" style={{ backgroundColor: accent }}>
                    <i className={item.dividerConfig?.icon || 'fa-solid fa-bookmark'}></i>
                </div>
                
                <h2 className="text-5xl font-black uppercase tracking-tight mb-4 text-center">{item.dividerConfig?.title}</h2>
                <div className="w-24 h-1 bg-white/30 rounded-full mb-6"></div>
                <p className="text-xl font-light opacity-80 text-center max-w-lg">{item.dividerConfig?.subtitle}</p>
                
                <PageFooter pageNum={index + (settings.showTOC ? 3 : 2)} />
            </div>
        );
    };

    const renderBackCover = () => {
        if (!settings.showBackCover) return null;
        return (
            <div className="worksheet-page relative flex flex-col items-center justify-center p-16 shadow-2xl mb-8 bg-white" 
                 style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                <div className="text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-zinc-100 text-zinc-800 flex items-center justify-center text-4xl mb-4">
                        <i className="fa-solid fa-trophy"></i>
                    </div>
                    <h2 className="text-3xl font-bold">Harika İş Çıkardın!</h2>
                    <p className="text-lg opacity-70 max-w-md mx-auto">
                        Bu kitapçığı tamamlayarak büyük bir başarıya imza attın.
                    </p>
                </div>
            </div>
        );
    };

    // Calculate start page based on cover + optional TOC
    const contentStartPage = settings.showTOC ? 3 : 2;

    return (
        <div className="workbook-container w-full flex flex-col items-center gap-8 bg-zinc-100 dark:bg-zinc-900 py-8">
            {renderCover()}
            {renderTableOfContents()}

            {items.map((item, index) => {
                if (item.itemType === 'divider') {
                    return <div key={item.id}>{renderDividerPage(item, index)}</div>;
                }

                const mergedSettings = {
                    ...settings, 
                    ...item.settings, 
                    showPedagogicalNote: true, 
                    ...item.overrideStyle 
                };

                return (
                    <div key={item.id} className="relative mb-8 w-full flex justify-center">
                        <div className="relative bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm' }}>
                            <Watermark />
                            <div className="relative z-10 h-full">
                                {item.activityType === 'ASSESSMENT_REPORT' ? (
                                    <div className="p-12 text-center">Rapor İçeriği...</div> 
                                ) : (
                                    <Worksheet 
                                        activityType={item.activityType} 
                                        data={[item.data]} 
                                        settings={mergedSettings} 
                                        studentProfile={{ name: settings.studentName, school: settings.schoolName, grade: '', date: new Date().toLocaleDateString() }}
                                    />
                                )}
                            </div>
                            <PageFooter pageNum={index + contentStartPage} />
                        </div>
                    </div>
                );
            })}

            {renderBackCover()}
        </div>
    );
};

export default Workbook;
