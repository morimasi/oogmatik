
import React from 'react';
import { CollectionItem, WorkbookSettings, SavedAssessment, ActivityType } from '../types';
import Worksheet from './Worksheet';
import DyslexiaLogo from './DyslexiaLogo';
import { RadarChart } from './RadarChart';
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

    // --- COVERS ---

    const renderCover = () => {
        const logoComponent = settings.logoUrl ? (
            <img src={settings.logoUrl} className="h-24 w-auto object-contain" />
        ) : (
            <DyslexiaLogo className="h-20 w-auto text-current" />
        );

        // --- MODERN THEME (Clean, Left-Aligned) ---
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

        // --- ACADEMIC THEME (Serif, Classic) ---
        if (settings.theme === 'academic') {
            return (
                <div className="worksheet-page relative flex flex-col p-16 shadow-2xl mb-8 bg-white" 
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

        // --- SPACE THEME (Dark, Stars, Future) ---
        if (settings.theme === 'space') {
            return (
                <div className="worksheet-page relative flex flex-col p-0 shadow-2xl mb-8 bg-[#0B0D17] text-white overflow-hidden" 
                     style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                    
                    {/* Stars Background */}
                    <div className="absolute inset-0 opacity-50" style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
                    <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px', backgroundPosition: '15px 15px'}}></div>
                    
                    {/* Planet Decoration */}
                    <div className="absolute top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500 to-purple-900 opacity-80 blur-xl"></div>
                    <div className="absolute bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 opacity-20 blur-2xl"></div>

                    <div className="relative z-10 p-16 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                                {settings.logoUrl ? <img src={settings.logoUrl} className="h-16 w-auto brightness-0 invert" /> : <DyslexiaLogo className="h-12 w-auto text-white" />}
                            </div>
                            <div className="text-right text-cyan-200">
                                <i className="fa-solid fa-rocket text-3xl mb-2 block"></i>
                                <span className="font-mono">{settings.year}</span>
                            </div>
                        </div>

                        <div className="text-center space-y-6 bg-black/30 p-8 rounded-3xl backdrop-blur-md border border-white/10">
                            <span className="text-cyan-400 uppercase tracking-[0.3em] text-sm font-bold">Öğrenme Yolculuğu</span>
                            <h1 className="text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200" style={{filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))'}}>
                                {settings.title}
                            </h1>
                            <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full"></div>
                            <h2 className="text-3xl font-bold text-white">{settings.studentName}</h2>
                        </div>

                        <div className="text-center opacity-60 text-sm font-mono">
                            {settings.schoolName || 'Bursa Disleksi AI'} • Bilgi Evrenine Yolculuk
                        </div>
                    </div>
                </div>
            );
        }

        // --- NATURE THEME (Organic, Peaceful) ---
        if (settings.theme === 'nature') {
            return (
                <div className="worksheet-page relative flex flex-col p-0 shadow-2xl mb-8 bg-[#F0FDF4] overflow-hidden" 
                     style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                    
                    {/* SVG Hills */}
                    <div className="absolute bottom-0 left-0 w-full">
                        <svg viewBox="0 0 1440 320" className="w-full h-auto block opacity-80" preserveAspectRatio="none">
                            <path fill="#22c55e" fillOpacity="0.4" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                            <path fill="#15803d" fillOpacity="0.6" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,170.7C672,149,768,139,864,154.7C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>
                    </div>

                    <div className="relative z-10 p-16 flex flex-col h-full items-center text-center">
                        <div className="mb-12">
                            {logoComponent}
                        </div>
                        
                        <div className="border-4 border-green-800/20 p-8 rounded-full aspect-square flex flex-col justify-center items-center w-[400px] bg-white/50 backdrop-blur-sm shadow-xl">
                            <span className="text-green-600 font-serif italic text-xl mb-2">Benim Kitabım</span>
                            <h1 className="text-5xl font-black text-green-900 mb-4">{settings.title}</h1>
                            <div className="w-16 h-1 bg-green-600 rounded-full mb-4"></div>
                            <h2 className="text-2xl font-bold text-green-800">{settings.studentName}</h2>
                        </div>

                        <div className="mt-auto mb-16 p-4 bg-white/80 rounded-xl shadow-sm border border-green-100">
                            <p className="text-green-800 font-bold">{settings.schoolName}</p>
                            <p className="text-green-600 text-sm">{settings.year}</p>
                        </div>
                    </div>
                </div>
            );
        }

        // --- GEOMETRIC THEME (Publisher Style) ---
        if (settings.theme === 'geometric') {
            return (
                <div className="worksheet-page relative flex flex-col p-0 shadow-2xl mb-8 bg-white overflow-hidden" 
                     style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
                    
                    {/* Geometric Shapes */}
                    <div className="absolute top-0 right-0 w-[60%] h-full bg-zinc-100 transform -skew-x-12 translate-x-20 origin-top"></div>
                    <div className="absolute top-0 right-0 w-[20%] h-full bg-zinc-900 transform -skew-x-12 translate-x-32 origin-top"></div>
                    
                    <div className="absolute bottom-10 right-10 z-20">
                        <div className="text-8xl font-black text-white/10 uppercase tracking-tighter rotate-90 origin-bottom-right">{settings.year}</div>
                    </div>

                    <div className="relative z-10 p-16 flex flex-col h-full justify-center items-start">
                        <div className="mb-12 scale-110">{logoComponent}</div>
                        
                        <div className="bg-white p-8 shadow-2xl border-l-8 border-zinc-900 max-w-lg">
                            <span className="text-zinc-400 font-bold tracking-widest text-xs uppercase block mb-2">Eğitim Materyali</span>
                            <h1 className="text-6xl font-black text-zinc-900 leading-none mb-4">{settings.title}</h1>
                            <p className="text-xl text-zinc-500 font-medium">{settings.studentName}</p>
                        </div>

                        <div className="mt-auto">
                            <p className="font-bold text-zinc-900 text-lg">{settings.schoolName}</p>
                            <p className="text-zinc-500 text-sm">{settings.teacherNote}</p>
                        </div>
                    </div>
                </div>
            );
        }

        // --- ARTISTIC THEME (Fallback / Abstract) ---
        if (settings.theme === 'artistic') {
            return (
                <div className="worksheet-page relative flex flex-col p-0 shadow-2xl mb-8 bg-zinc-900 text-white" 
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

    const renderBackCover = () => {
        if (!settings.showBackCover) return null;

        const isDark = settings.theme === 'space' || settings.theme === 'artistic';
        const bgColor = isDark ? '#18181b' : '#ffffff';
        const textColor = isDark ? '#ffffff' : '#000000';

        return (
            <div className="worksheet-page relative flex flex-col items-center justify-center p-16 shadow-2xl mb-8 bg-white" 
                 style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', backgroundColor: bgColor, color: textColor }}>
                
                {/* Decorative Center */}
                <div className="text-center space-y-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 ${isDark ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-800'}`}>
                        <i className="fa-solid fa-trophy"></i>
                    </div>
                    <h2 className="text-3xl font-bold">Harika İş Çıkardın!</h2>
                    <p className="text-lg opacity-70 max-w-md mx-auto">
                        Bu kitapçığı tamamlayarak büyük bir başarıya imza attın. Öğrenme yolculuğunda başarılar dileriz.
                    </p>
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-16 w-full text-center">
                    <div className="w-16 h-1 mx-auto mb-6" style={{ backgroundColor: accent }}></div>
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} className="h-12 w-auto mx-auto mb-4 object-contain opacity-50 grayscale" />
                    ) : (
                        <div className="text-2xl font-black opacity-30 mb-2">BURSA DİSLEKSİ AI</div>
                    )}
                    <p className="text-xs font-mono opacity-50">www.bursadisleksi.com</p>
                    <p className="text-xs font-mono opacity-50 mt-1">{settings.schoolName}</p>
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
                            <span className="font-bold text-zinc-400 w-8 text-right mr-4">{index + 1}.</span>
                            <span className="text-lg font-bold truncate shrink-0 max-w-[70%]">{item.title}</span>
                            
                            {/* Dot Leader */}
                            <div className="flex-1 mx-2 border-b-2 border-dotted border-zinc-300 relative -top-1 opacity-50"></div>
                            
                            <span className="font-bold text-lg w-8 text-right" style={{ color: accent }}>{index + (settings.showTOC ? 3 : 2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- ASSESSMENT REPORT PAGE RENDERER (Professional Layout) ---
    const AssessmentReportPage = ({ assessment }: { assessment: SavedAssessment }) => {
        const { report, studentName, createdAt, grade } = assessment;
        return (
            <div className="p-12 h-full flex flex-col">
                <div className="border-b-4 border-black pb-4 mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-black uppercase tracking-tight">Tanılama ve Değerlendirme Raporu</h2>
                        <p className="text-zinc-500 font-bold">{studentName} • {grade}</p>
                    </div>
                    <div className="text-right text-sm font-mono text-zinc-400">
                        {new Date(createdAt).toLocaleDateString('tr-TR')}
                    </div>
                </div>

                <div className="flex-1 space-y-8">
                    {/* General Summary */}
                    <div className="bg-zinc-50 p-6 rounded-xl border-l-8 border-indigo-500 text-sm leading-relaxed text-zinc-800 text-justify">
                        <h4 className="font-bold mb-2 uppercase text-indigo-800 tracking-wider">Uzman Görüşü & Özet</h4>
                        {report.overallSummary}
                    </div>

                    <div className="grid grid-cols-2 gap-8 items-start">
                        {/* Radar Chart Section */}
                        <div className="border-2 border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px]">
                            <h4 className="font-bold text-zinc-500 text-xs uppercase mb-2">Becerisel Risk Profili</h4>
                            <div className="transform scale-90 origin-top">
                                {report.chartData && <RadarChart data={report.chartData} />}
                            </div>
                        </div>
                        
                        {/* Strengths & Weaknesses */}
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                <h4 className="font-bold text-green-800 uppercase text-xs mb-2 border-b border-green-200 pb-1">Güçlü Yönler</h4>
                                <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                                    {report.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                                <h4 className="font-bold text-rose-800 uppercase text-xs mb-2 border-b border-rose-200 pb-1">Gelişim Alanları</h4>
                                <ul className="list-disc list-inside text-sm text-rose-900 space-y-1">
                                    {report.analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Error Analysis if available */}
                    {report.analysis.errorAnalysis && report.analysis.errorAnalysis.length > 0 && (
                        <div className="border-t-2 border-dashed border-zinc-300 pt-4">
                            <h4 className="font-bold text-zinc-800 uppercase text-sm mb-2">Hata Analizi</h4>
                            <ul className="list-decimal list-inside text-xs text-zinc-600 space-y-1">
                                {report.analysis.errorAnalysis.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Roadmap */}
                    <div className="mt-auto pt-6 border-t-4 border-black">
                        <h4 className="font-bold text-zinc-800 uppercase text-sm mb-4">Önerilen Eğitim Rotası</h4>
                        <div className="grid grid-cols-3 gap-4">
                            {report.roadmap.map((item, idx) => (
                                <div key={idx} className="bg-white border-2 border-zinc-800 p-3 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Adım {idx + 1}</div>
                                    <h5 className="font-bold text-black text-sm mb-1">{ACTIVITIES.find(a => a.id === item.activityId)?.title || item.activityId}</h5>
                                    <p className="text-xs text-zinc-600 leading-snug">{item.reason}</p>
                                    <div className="mt-2 text-[10px] bg-zinc-100 px-2 py-1 rounded inline-block font-mono">{item.frequency}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Calculate start page based on cover + optional TOC
    const contentStartPage = settings.showTOC ? 3 : 2;

    return (
        <div className="workbook-container w-full flex flex-col items-center gap-8 bg-zinc-100 dark:bg-zinc-900 py-8">
            <style>{`
            `}</style>

            {/* 1. Cover Page */}
            {renderCover()}

            {/* 2. Table of Contents */}
            {renderTableOfContents()}

            {/* 3. Content Pages */}
            {items.map((item, index) => {
                // MERGE ITEM STYLES: Default Settings < Workbook Settings < Item Override
                // We use Workbook Settings as the base, but ensure pedagogicalNote is forced true for workbook content context usually
                // BUT user might want to hide it via override.
                const mergedSettings = {
                    ...settings, // Basic workbook vibe
                    ...item.settings, // Original item settings (often has specific layout needs)
                    showPedagogicalNote: true, // Default workbook behavior
                    ...item.overrideStyle // Highest priority override
                };

                return (
                    <div key={item.id} className="relative mb-8 w-full flex justify-center">
                        <div className="relative bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm' }}>
                            <Watermark />
                            
                            {/* Worksheet / Report Wrapper */}
                            <div className="relative z-10 h-full">
                                {item.activityType === ActivityType.ASSESSMENT_REPORT ? (
                                    <AssessmentReportPage assessment={item.data as SavedAssessment} />
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

            {/* 4. Back Cover */}
            {renderBackCover()}
        </div>
    );
};

export default Workbook;
