
import React from 'react';
import { CollectionItem, WorkbookSettings } from '../types';
import Worksheet from './Worksheet';
import DyslexiaLogo from './DyslexiaLogo';
import { Toolbar } from './Toolbar';
import '../styles/workbookPremium.css';

interface WorkbookProps {
    items: CollectionItem[];
    settings: WorkbookSettings;
}

const Workbook: React.FC<WorkbookProps> = ({ items, settings }) => {
    const accent = settings.accentColor || '#4f46e5';
    const font = settings.fontFamily || 'OpenDyslexic';

    // --- UI HELPERS ---
    const getPageStyle = (extra = {}) => ({
        width: '210mm',
        minHeight: '296.5mm', // Subtle adjustment for PDF precision
        margin: '0 auto',
        backgroundColor: 'white',
        color: 'black',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        boxShadow: '0 0 40px rgba(0,0,0,0.1)',
        fontFamily: font,
        ...extra
    });

    // --- SUB-COMPONENTS ---
    const Watermark = () => {
        if (!settings.showWatermark) return null;
        return (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                <div
                    className="transform -rotate-45 w-[70%] grayscale opacity-[0.03]"
                    style={{ opacity: settings.watermarkOpacity }}
                >
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} className="w-full h-auto" alt="watermark" />
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
            <div className="absolute bottom-6 left-0 w-full px-12 flex justify-between items-end text-[10px] text-zinc-400 font-mono z-20">
                <div className="flex flex-col">
                    <span className="font-bold opacity-50">{settings.schoolName || 'Bursa Disleksi AI'}</span>
                    <span className="opacity-30 uppercase tracking-tighter">Premium Workbook Edition</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-zinc-200"></div>
                    <span className="font-black text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        {pageNum}
                    </span>
                </div>
            </div>
        );
    };

    // --- COVER RENDERERS ---
    const renderCover = () => {
        const logo = settings.logoUrl ? (
            <img src={settings.logoUrl} className="h-20 w-auto object-contain" alt="Logo" />
        ) : (
            <DyslexiaLogo className="h-16 w-auto text-current" />
        );

        // Theme Specific Aesthetic Blocks
        const DecorativeShape = ({ className = "", style = {} }) => (
            <div className={`absolute pointer-events-none ${className}`} style={{ background: accent, ...style }} />
        );

        const renderCoverContent = () => {
            switch (settings.theme) {
                case 'cyber':
                    return (
                        <div className="w-full h-full bg-[#0a0a0f] text-white flex flex-col relative cyber-grid">
                            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 50%, ${accent} 0%, transparent 70%)` }}></div>
                            <div className="p-20 z-10 flex flex-col h-full justify-between">
                                <div className="flex justify-between items-start border-b border-white/10 pb-10">
                                    {logo}
                                    <div className="text-right">
                                        <p className="text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase">System Active</p>
                                        <h3 className="text-2xl font-black">{settings.year}</h3>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-1 w-20" style={{ background: accent }}></div>
                                    <h1 className="text-7xl font-black tracking-tighter leading-none italic uppercase">
                                        {settings.title}
                                    </h1>
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-1 bg-white text-black text-[10px] font-black tracking-widest uppercase">Student Protocol</div>
                                        <span className="text-3xl font-bold tracking-tight text-cyan-300">{settings.studentName}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-10 opacity-60 text-[10px] font-mono tracking-widest uppercase">
                                    <div>// Bursa Disleksi Neuro-Cognitive Development Kit</div>
                                    <div className="text-right">// AI Powered Learning Environment</div>
                                </div>
                            </div>
                        </div>
                    );

                case 'luxury':
                    return (
                        <div className="w-full h-full bg-zinc-950 text-white flex flex-col relative overflow-hidden">
                            <DecorativeShape className="top-[-50px] right-[-50px] w-[300px] h-[300px] rounded-full opacity-10 blur-3xl" />
                            <DecorativeShape className="bottom-[-50px] left-[-150px] w-[400px] h-[400px] rounded-full opacity-10 blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]" />
                            <div className="absolute inset-0 border-[20px] border-zinc-900 mx-10 my-10"></div>
                            <div className="p-24 h-full flex flex-col justify-center items-center text-center relative z-10">
                                <div className="mb-20 scale-150 grayscale invert brightness-200">{logo}</div>
                                <div className="max-w-2xl px-10">
                                    <div className="w-12 h-px bg-zinc-700 mx-auto mb-10"></div>
                                    <h1 className="text-6xl font-light tracking-[0.2em] uppercase mb-8 leading-tight">
                                        {settings.title}
                                    </h1>
                                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-500 to-transparent mx-auto mb-10"></div>
                                    <p className="text-xs tracking-[0.5em] text-zinc-500 uppercase mb-4">Özel Eğitim Serisi</p>
                                    <h2 className="text-4xl font-bold italic tracking-wide text-zinc-200">{settings.studentName}</h2>
                                </div>
                                <div className="absolute bottom-24 text-[10px] tracking-[0.3em] text-zinc-600 uppercase">
                                    {settings.schoolName} | {settings.year}
                                </div>
                            </div>
                        </div>
                    );

                case 'playful':
                    return (
                        <div className="w-full h-full bg-white flex flex-col relative overflow-hidden">
                            <DecorativeShape className="top-10 left-10 w-20 h-20 rounded-2xl rotate-12 opacity-20" />
                            <DecorativeShape className="top-40 right-[-20px] w-32 h-32 rounded-full opacity-10" />
                            <DecorativeShape className="bottom-20 left-40 w-16 h-16 rounded-full opacity-15" />
                            <div className="p-16 h-full flex flex-col justify-between relative z-10">
                                <div className="flex justify-between items-center">
                                    {logo}
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl" style={{ border: `4px solid ${accent}`, color: accent }}>
                                        <i className="fa-solid fa-star"></i>
                                    </div>
                                </div>
                                <div className="bg-zinc-50 rounded-[40px] p-12 border-b-[8px] border-zinc-100">
                                    <h1 className="text-7xl font-black mb-4 tracking-tight leading-none" style={{ color: accent }}>
                                        {settings.title}
                                    </h1>
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-12 rounded-full" style={{ background: accent }}></div>
                                        <h2 className="text-4xl font-bold text-zinc-800">{settings.studentName}</h2>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between font-black text-xs uppercase tracking-widest text-zinc-400">
                                    <span>Adım Adım Başarıya 🚀</span>
                                    <span>{settings.year}</span>
                                </div>
                            </div>
                        </div>
                    );

                case 'space':
                    return (
                        <div className="w-full h-full bg-zinc-900 text-white flex flex-col relative overflow-hidden">
                            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                            <div className="p-20 h-full flex flex-col justify-between relative z-10">
                                <div className="flex justify-center">{logo}</div>
                                <div className="text-center">
                                    <h1 className="text-8xl font-black tracking-widest uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
                                        {settings.title}
                                    </h1>
                                    <p className="text-lg tracking-[0.8em] font-light opacity-60 uppercase mb-10">Keşif Yolculuğu</p>
                                    <div className="inline-flex items-center gap-6 px-10 py-4 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                                        <span className="text-2xl font-bold tracking-tight">{settings.studentName}</span>
                                    </div>
                                </div>
                                <div className="text-center text-[10px] tracking-widest font-mono opacity-40">
                                    GALACTIC EDUCATION PROTOCOL // LEVEL {settings.year}
                                </div>
                            </div>
                        </div>
                    );

                case 'nature':
                    return (
                        <div className="w-full h-full bg-[#fdfbf7] flex flex-col relative overflow-hidden">
                            <div className="absolute right-[-100px] top-[-100px] w-96 h-96 rounded-full bg-green-100/50 blur-3xl"></div>
                            <div className="absolute left-[-100px] bottom-[-100px] w-96 h-96 rounded-full bg-amber-100/50 blur-3xl"></div>
                            <div className="p-20 h-full flex flex-col justify-between relative z-10 border-[1px] border-zinc-100 m-8">
                                <div className="flex justify-between items-center opacity-80">{logo} <span className="text-zinc-300 font-mono">{settings.year}</span></div>
                                <div className="max-w-xl">
                                    <h1 className="text-6xl font-serif text-emerald-900 mb-6 italic leading-snug">
                                        {settings.title}
                                    </h1>
                                    <div className="flex items-center gap-4 text-emerald-700/60 font-medium tracking-wide uppercase text-xs mb-4">
                                        <i className="fa-solid fa-seedling"></i>
                                        <span>Bireysel Gelişim Bahçesi</span>
                                    </div>
                                    <div className="h-1 w-full bg-zinc-100 rounded-full mb-6">
                                        <div className="h-full w-1/3 rounded-full" style={{ background: accent }}></div>
                                    </div>
                                    <h2 className="text-4xl font-bold text-zinc-800">{settings.studentName}</h2>
                                </div>
                                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-loose">
                                    Sürdürülebilir Eğitim & Zihin Modeli // {settings.schoolName}
                                </div>
                            </div>
                        </div>
                    );

                case 'artistic':
                    return (
                        <div className="w-full h-full bg-[#fcfcfc] flex flex-col relative overflow-hidden">
                            <div className="art-brush-stroke top-0 left-0 rotate-12" style={{ backgroundColor: accent }}></div>
                            <div className="art-brush-stroke bottom-20 right-[-50px] -rotate-12" style={{ backgroundColor: accent, opacity: 0.1 }}></div>
                            <div className="p-20 h-full flex flex-col justify-between relative z-10">
                                <div className="flex justify-between items-center">
                                    <div className="p-4 border-2 border-zinc-900 rotate-3">{logo}</div>
                                    <span className="font-serif italic text-zinc-400">{settings.year}</span>
                                </div>
                                <div className="space-y-6">
                                    <h1 className="text-8xl font-serif italic text-zinc-900 leading-[0.8] tracking-tighter">
                                        {settings.title}
                                    </h1>
                                    <div className="h-0.5 w-40 bg-zinc-900"></div>
                                    <h2 className="text-4xl font-light text-zinc-600 tracking-widest uppercase">{settings.studentName}</h2>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-300">
                                        Art & Pedagogy Collective // {settings.schoolName}
                                    </div>
                                    <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center rounded-full text-zinc-300">
                                        <i className="fa-solid fa-palette"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );

                case 'geometric':
                    return (
                        <div className="w-full h-full bg-white flex flex-col relative overflow-hidden">
                            <div className="geo-pattern absolute inset-0"></div>
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-50 z-0"></div>
                            <div className="p-24 h-full flex flex-col justify-between relative z-10">
                                <div className="flex flex-col gap-2">
                                    <div className="w-16 h-4" style={{ backgroundColor: accent }}></div>
                                    {logo}
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-10 top-0 w-2 h-full" style={{ backgroundColor: accent }}></div>
                                    <h1 className="text-6xl font-black text-zinc-900 leading-none uppercase mb-4">
                                        {settings.title}
                                    </h1>
                                    <div className="flex items-center gap-4">
                                        <span className="text-zinc-400 font-mono">CODE: {settings.year}</span>
                                        <div className="flex-1 h-px bg-zinc-100"></div>
                                    </div>
                                    <h2 className="text-5xl font-black text-zinc-900 mt-10 tracking-tighter">{settings.studentName}</h2>
                                </div>
                                <div className="flex justify-between items-end border-t-8 border-zinc-900 pt-10">
                                    <div className="space-y-1">
                                        <p className="font-black text-sm uppercase tracking-tighter">{settings.schoolName}</p>
                                        <p className="text-[10px] font-bold text-zinc-400">STRUCTURAL LEARNING ENGINE v4.0</p>
                                    </div>
                                    <div className="text-4xl font-black opacity-10" style={{ color: accent }}>{settings.year.slice(-2)}</div>
                                </div>
                            </div>
                        </div>
                    );

                default: // Modern - baştan aşağı yenilendi
                    return (
                        <div className="w-full h-full flex flex-col bg-white overflow-hidden relative" style={{ borderLeft: `25mm solid ${accent}` }}>
                            <div className="absolute right-0 top-0 w-32 h-64 opacity-5 bg-black rotate-45 transform translate-x-16 -translate-y-16"></div>
                            <div className="p-20 flex flex-col h-full justify-between relative z-10">
                                <div className="flex justify-between items-start">
                                    {logo}
                                    <div className="text-right">
                                        <h3 className="font-black text-2xl tracking-tighter" style={{ color: accent }}>{settings.year}</h3>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Akademik Dönem</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start max-w-2xl">
                                    <span className="inline-block px-5 py-1.5 mb-8 text-[10px] font-black tracking-[0.2em] text-white uppercase rounded-full shadow-lg" style={{ backgroundColor: accent }}>
                                        Premium Workbook
                                    </span>
                                    <h1 className="text-7xl font-black text-zinc-900 mb-8 uppercase tracking-tighter leading-[0.9]">
                                        {settings.title}
                                    </h1>
                                    <div className="flex flex-col border-l-8 pl-8 py-2" style={{ borderColor: accent }}>
                                        <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">Öğrenci Portfolyosu</p>
                                        <h2 className="text-4xl font-black text-zinc-800 tracking-tight">{settings.studentName}</h2>
                                    </div>
                                </div>
                                <div className="pt-10 border-t-4 border-zinc-100">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <p className="font-black text-xl text-zinc-900 tracking-tight uppercase">{settings.schoolName}</p>
                                            {settings.teacherNote && <p className="text-sm font-medium italic text-zinc-400 max-w-md">"{settings.teacherNote}"</p>}
                                        </div>
                                        <i className="fa-solid fa-award text-4xl opacity-10" style={{ color: accent }}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
            }
        };

        return (
            <div className="worksheet-page premium-glow" style={getPageStyle({
                minHeight: '296.5mm', // Adjust for exact A4 height in some PDF engines
                colorScheme: 'light',
                backgroundColor: (settings.theme === 'cyber' || settings.theme === 'luxury' || settings.theme === 'space') ? '#000' : '#fff'
            })}>
                {renderCoverContent()}
            </div>
        );
    };

    const renderTableOfContents = () => {
        if (!settings.showTOC || items.length === 0) return null;

        return (
            <div className="worksheet-page p-20 bg-white" style={getPageStyle()}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-6 mb-16">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg" style={{ backgroundColor: accent }}>
                            <i className="fa-solid fa-list-ul"></i>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter">İçindekiler</h2>
                            <div className="h-1 w-24 rounded-full mt-2" style={{ backgroundColor: accent, opacity: 0.3 }}></div>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        {items.map((item, index) => (
                            <div key={item.id} className="flex items-end justify-between group">
                                <div className="flex items-center gap-4 shrink-0 max-w-[80%]">
                                    <span className="font-black text-zinc-300 w-8 text-sm">{item.itemType === 'divider' ? '' : index + 1}</span>
                                    <div className="flex flex-col">
                                        <span className={`text-lg font-bold truncate ${item.itemType === 'divider' ? 'uppercase tracking-widest text-xl' : ''}`} style={item.itemType === 'divider' ? { color: accent } : {}}>
                                            {item.itemType === 'divider' ? item.dividerConfig?.title : item.title}
                                        </span>
                                        {item.itemType !== 'divider' && <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.activityType}</span>}
                                    </div>
                                </div>
                                <div className="flex-1 mx-4 border-b-2 border-dashed border-zinc-100 relative -top-2"></div>
                                <span className="font-black text-xl text-zinc-800" style={{ color: index % 2 === 0 ? accent : 'inherit' }}>
                                    {index + (settings.showTOC ? 3 : 2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-10 border-t border-zinc-100 flex justify-between items-center text-[10px] font-black text-zinc-400 tracking-widest uppercase">
                        <span>© {new Date().getFullYear()} {settings.schoolName}</span>
                        <span>Premium Learning Edition</span>
                    </div>
                </div>
                <PageFooter pageNum={2} />
            </div>
        );
    };

    const renderDividerPage = (item: CollectionItem, index: number) => {
        return (
            <div className="worksheet-page flex flex-col justify-center items-center p-20 relative"
                style={getPageStyle({
                    backgroundColor: '#09090b',
                    color: 'white',
                    borderLeft: `15mm solid ${accent}`
                })}>

                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: `radial-gradient(${accent} 2px, transparent 2px)`, backgroundSize: '40px 40px' }} />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-40 h-40 rounded-[40px] flex items-center justify-center text-7xl mb-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t border-white/10"
                        style={{ backgroundColor: accent, transform: 'rotate(-5deg)' }}>
                        <i className={item.dividerConfig?.icon || 'fa-solid fa-bookmark'}></i>
                    </div>

                    <p className="text-[10px] font-black tracking-[0.5em] text-white/40 uppercase mb-4">Bölüm {index + 1}</p>
                    <h2 className="text-7xl font-black uppercase tracking-tighter mb-6 leading-none">{item.dividerConfig?.title}</h2>
                    <div className="w-24 h-2 bg-white/20 rounded-full mb-10"></div>
                    <p className="text-2xl font-light opacity-60 max-w-xl leading-relaxed italic">{item.dividerConfig?.subtitle}</p>
                </div>

                <PageFooter pageNum={index + (settings.showTOC ? 3 : 2)} />
            </div>
        );
    };

    const renderBackCover = () => {
        if (!settings.showBackCover) return null;
        return (
            <div className="worksheet-page p-20 bg-zinc-50" style={getPageStyle()}>
                <div className="h-full border-8 border-white rounded-[40px] flex flex-col items-center justify-center text-center bg-white shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2" style={{ background: accent }}></div>
                    <div className="space-y-8 max-w-md relative z-10">
                        <div className="w-32 h-32 rounded-full mx-auto flex items-center justify-center text-6xl shadow-xl transition-transform hover:scale-110 duration-500" style={{ backgroundColor: accent, color: 'white' }}>
                            <i className="fa-solid fa-trophy"></i>
                        </div>
                        <div>
                            <h2 className="text-5xl font-black text-zinc-900 mb-4 tracking-tighter">TEBRİKLER!</h2>
                            <div className="h-1.5 w-12 bg-zinc-200 mx-auto rounded-full mb-6"></div>
                            <p className="text-xl font-medium text-zinc-500 leading-relaxed px-10">
                                {settings.customBackCoverNote || "Bu kitapçığı tamamlayarak zihinsel becerilerinde dev bir adım attın. Başarılarının devamını dileriz!"}
                            </p>
                        </div>
                    </div>
                    <div className="absolute bottom-20 flex flex-col items-center gap-4 opacity-30 grayscale">
                        {settings.logoUrl ? <img src={settings.logoUrl} className="h-12 w-auto" alt="Logo" /> : <DyslexiaLogo className="h-10 w-auto" />}
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{settings.schoolName}</span>
                    </div>
                    <div className="absolute bottom-10 right-10 text-[8px] font-mono text-zinc-300">
                        GEN-ID: {crypto.randomUUID().slice(0, 8).toUpperCase()}
                    </div>
                </div>
            </div>
        );
    };

    // --- MAIN RENDER LOGIC ---
    const contentStartPage = settings.showTOC ? 3 : 2;

    return (
        <div className="workbook-container w-full flex flex-col items-center gap-12 bg-zinc-100 dark:bg-zinc-900 py-12 print:p-0 print:gap-0 print:bg-white">
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
                    ...item.overrideStyle,
                    // Premium adjustments for individual pages
                    isPremium: true,
                    fontFamily: font
                };

                return (
                    <div key={item.id} className="relative w-full flex justify-center print:m-0">
                        <div className="relative bg-white shadow-2xl worksheet-page" style={getPageStyle()}>
                            <Watermark />
                            <div className="relative z-10 h-full">
                                {item.activityType === 'ASSESSMENT_REPORT' ? (
                                    <div className="p-20 text-center flex flex-col items-center justify-center h-full">
                                        <i className="fa-solid fa-chart-line text-6xl text-zinc-100 mb-8"></i>
                                        <h3 className="text-2xl font-black opacity-20 uppercase tracking-widest">Gelişim Analiz Raporu</h3>
                                    </div>
                                ) : (
                                    <Worksheet
                                        activityType={item.activityType}
                                        data={[item.data]}
                                        settings={mergedSettings}
                                        studentProfile={{
                                            name: settings.studentName,
                                            school: settings.schoolName,
                                            grade: '',
                                            date: new Date().toLocaleDateString('tr-TR')
                                        }}
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
