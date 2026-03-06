import React, { useState, useRef } from 'react';
import { ReadingStudioProvider, useReadingStudio } from '../../context/ReadingStudioContext';
import { printService } from '../../utils/printService';
import { generateInteractiveStory } from '../../services/generators/readingStudio';
import { ReadingStudioContentRenderer } from './ReadingStudioContentRenderer';
import { StudentSelector } from './Editor/StudentSelector';
import { AIProductionPanel } from './Editor/AIProductionPanel';
import { ComponentLibrary } from './Editor/ComponentLibrary';
import { LayoutItem } from '../../types'; // Added LayoutItem import

// --- CONFIGURATION CONSTANTS ---
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

interface ReadingStudioInnerProps {
    onBack: () => void;
    onAddToWorkbook: () => void;
}

const ReadingStudioInner = ({ onBack, onAddToWorkbook }: ReadingStudioInnerProps) => {
    const {
        config, setStoryData, layout, setLayout,
        isLoading, setIsLoading, designMode, setDesignMode,
        storyData, setSelectedId
    } = useReadingStudio();

    const [sidebarTab, setSidebarTab] = useState('production' as 'production' | 'library' | 'styling');
    const [canvasScale, setCanvasScale] = useState(0.85);

    // Initial layout setup
    React.useEffect(() => {
        if (layout.length === 0) {
            setLayout([
                {
                    id: 'header', label: 'Başlık Künyesi', instanceId: 'init_header', isVisible: true,
                    specificData: { title: "YENİ HİKAYE", subtitle: "Okuma ve Anlama Çalışması" },
                    style: { x: 20, y: 20, w: 754, h: 120, zIndex: 1, rotation: 0, padding: 10, backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderRadius: 0, opacity: 1, boxShadow: 'none', textAlign: 'left', color: '#000000', fontSize: 14, fontFamily: 'OpenDyslexic', lineHeight: 1.5 }
                },
                {
                    id: 'story_block', label: 'Hikaye Metni', instanceId: 'init_story', isVisible: true,
                    specificData: { text: "Buraya AI ile üretilen hikaye gelecek..." },
                    style: { x: 20, y: 160, w: 754, h: 420, zIndex: 1, rotation: 0, padding: 10, backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0, borderStyle: 'solid', borderRadius: 0, opacity: 1, boxShadow: 'none', textAlign: 'left', color: '#000000', fontSize: 14, fontFamily: 'OpenDyslexic', lineHeight: 1.5 }
                }
            ]);
        }
    }, []);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await generateInteractiveStory(config);
            setStoryData(result);

            // Create initial layout based on result
            let newLayout: LayoutItem[] = [
                {
                    id: 'header', label: 'Başlık Künyesi', instanceId: `header_${Date.now()}`, isVisible: true,
                    specificData: { title: result.title, subtitle: `${config.genre} - ${config.gradeLevel}` },
                    style: { x: 20, y: 20, w: 754, h: 120, zIndex: 1, rotation: 0, padding: 20, backgroundColor: 'transparent', borderColor: '#e2e8f0', borderWidth: 0, borderStyle: 'solid', borderRadius: 8, opacity: 1, boxShadow: 'none', textAlign: 'left', color: '#000000', fontSize: 14, fontFamily: 'OpenDyslexic', lineHeight: 1.5 }
                },
                {
                    id: 'story_block', label: 'Hikaye Metni', instanceId: `story_${Date.now()}`, isVisible: true,
                    specificData: { text: result.story },
                    style: { x: 20, y: 160, w: 754, h: 450, zIndex: 1, rotation: 0, padding: 20, backgroundColor: 'transparent', borderColor: '#e2e8f0', borderWidth: 0, borderStyle: 'solid', borderRadius: 8, opacity: 1, boxShadow: 'none', textAlign: 'left', color: '#000000', fontSize: 16, fontFamily: 'OpenDyslexic', lineHeight: 1.8 }
                }
            ];

            let lastY = 630;

            if (result.vocabulary && result.vocabulary.length > 0) {
                newLayout.push({
                    id: 'vocabulary', label: 'Kelime Dağarcığı', instanceId: `voc_${Date.now()}`, isVisible: true,
                    specificData: { words: result.vocabulary },
                    style: { x: 20, y: lastY, w: 754, h: 150, zIndex: 1, rotation: 0, padding: 15, backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1, borderStyle: 'solid', borderRadius: 12, opacity: 1, boxShadow: 'none', textAlign: 'left', color: '#000000', fontSize: 14, fontFamily: 'OpenDyslexic', lineHeight: 1.5 }
                });
                lastY += 170;
            }

            if (result.fiveW1H && result.fiveW1H.length > 0) {
                newLayout.push({
                    id: '5n1k', label: '5N1K Çalışması', instanceId: `q5n1k_${Date.now()}`, isVisible: true,
                    specificData: { questions: result.fiveW1H },
                    style: { x: 20, y: lastY, w: 754, h: 400, zIndex: 1, rotation: 0, padding: 20, backgroundColor: 'transparent', borderColor: '#e2e8f0', borderWidth: 0, borderStyle: 'solid', borderRadius: 8, opacity: 1, boxShadow: 'none', textAlign: 'left', color: '#000000', fontSize: 14, fontFamily: 'OpenDyslexic', lineHeight: 1.5 }
                });
                lastY += 420;
            }

            if (result.logicQuestions && result.logicQuestions.length > 0) {
                newLayout.push({
                    id: 'logic_problem', label: 'Mantık Bulmacası', instanceId: `logic_${Date.now()}`, isVisible: true,
                    specificData: { puzzle: result.logicQuestions[0] },
                    style: { x: 20, y: lastY, w: 754, h: 200, zIndex: 1, rotation: 0, padding: 20, backgroundColor: '#fef3c7', borderColor: '#f59e0b', borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, opacity: 1, boxShadow: 'none', textAlign: 'left', color: '#000000', fontSize: 14, fontFamily: 'OpenDyslexic', lineHeight: 1.5 }
                });
                lastY += 220;
            }

            if (result.inferenceQuestions && result.inferenceQuestions.length > 0) {
                newLayout.push({
                    id: 'questions', label: 'Çıkarım Soruları', instanceId: `inf_${Date.now()}`, isVisible: true,
                    specificData: { questions: result.inferenceQuestions.map((q: any) => ({ question: q.question, type: 'open' })) },
                    style: { x: 20, y: lastY, w: 754, h: 250, zIndex: 1, rotation: 0, padding: 20, backgroundColor: 'transparent', borderColor: '#e2e8f0', borderWidth: 0, borderStyle: 'solid', borderRadius: 8, opacity: 1, boxShadow: 'none', textAlign: 'left', color: '#000000', fontSize: 14, fontFamily: 'OpenDyslexic', lineHeight: 1.5 }
                });
                lastY += 270;
            }

            setLayout(newLayout);
            setSelectedId(null);
            setDesignMode(false);
        } catch (e) {
            alert("Hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = async (action: 'print' | 'download') => {
        try { await printService.generatePdf('#canvas-root', 'Hikaye', { action }); } catch (e) { }
    };

    return (
        <div className="h-full flex flex-col bg-[#09090b] overflow-hidden text-zinc-100 absolute inset-0 z-50">
            {/* Header */}
            <header className="h-16 bg-[#121214] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-colors border border-transparent hover:border-zinc-700">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-black text-white flex items-center gap-2 tracking-tight uppercase italic">
                            Oogmatik <span className="text-indigo-500 not-italic">Reading Studio Pro</span>
                        </h2>
                        {storyData && <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{storyData.title}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        {isLoading ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Üretiliyor...</> : "AI İle Baştan Yarat"}
                    </button>
                    <div className="w-px h-6 bg-zinc-800 mx-2"></div>
                    <button onClick={() => handlePrint('print')} className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700/50"><i className="fa-solid fa-print"></i></button>
                    <button className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700/50"><i className="fa-solid fa-floppy-disk"></i></button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-80 bg-[#121214] border-r border-zinc-800 flex flex-col overflow-hidden shadow-2xl z-40">
                    <div className="p-4 border-b border-zinc-800 bg-black/20">
                        <StudentSelector />
                    </div>

                    <div className="flex border-b border-zinc-800 shrink-0 bg-zinc-900/30">
                        <button onClick={() => setSidebarTab('production')} className={`flex-1 pt-4 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${sidebarTab === 'production' ? 'text-indigo-500 border-indigo-500 bg-indigo-500/5' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>Üretim</button>
                        <button onClick={() => setSidebarTab('library')} className={`flex-1 pt-4 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${sidebarTab === 'library' ? 'text-emerald-500 border-emerald-500 bg-emerald-500/5' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>Bileşenler</button>
                        <button onClick={() => setSidebarTab('styling')} className={`flex-1 pt-4 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${sidebarTab === 'styling' ? 'text-amber-500 border-amber-500 bg-amber-500/5' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>Stil</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                        {sidebarTab === 'production' && <AIProductionPanel />}
                        {sidebarTab === 'library' && <ComponentLibrary />}
                        {sidebarTab === 'styling' && (
                            <div className="text-center py-12 text-zinc-600 italic text-xs">
                                Stil ayarları yakında eklenecek...
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Canvas Area */}
                <main className="flex-1 bg-[#09090b] overflow-auto p-12 custom-scrollbar flex flex-col items-center relative">
                    <div className="flex gap-4 mb-8 bg-[#121214]/80 backdrop-blur-xl p-2 rounded-2xl border border-zinc-800 shadow-2xl sticky top-0 z-30">
                        <button onClick={() => setDesignMode(!designMode)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${designMode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-zinc-500 hover:bg-zinc-800'}`}>
                            <i className={`fa-solid ${designMode ? 'fa-pen-ruler' : 'fa-eye'} mr-2`}></i>
                            {designMode ? 'Tasarım Modu' : 'İzleme Modu'}
                        </button>
                        <div className="w-px h-8 bg-zinc-800 mx-2"></div>
                        <div className="flex items-center gap-4 px-4">
                            <button onClick={() => setCanvasScale(Math.max(0.5, canvasScale - 0.1))} className="text-zinc-500 hover:text-white transition-colors"><i className="fa-solid fa-minus text-xs"></i></button>
                            <span className="text-[10px] font-black text-zinc-500 min-w-[40px] text-center">% {Math.round(canvasScale * 100)}</span>
                            <button onClick={() => setCanvasScale(Math.min(1.5, canvasScale + 0.1))} className="text-zinc-500 hover:text-white transition-colors"><i className="fa-solid fa-plus text-xs"></i></button>
                        </div>
                    </div>

                    <div
                        id="canvas-root"
                        className="bg-white text-black shadow-[0_0_100px_rgba(0,0,0,0.5)] origin-top transition-all relative"
                        style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX, padding: '20mm', transform: `scale(${canvasScale})` }}
                    >
                        <ReadingStudioContentRenderer layout={layout} storyData={storyData} />

                        {!storyData && layout.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 pointer-events-none opacity-20 bg-zinc-50/50">
                                <i className="fa-solid fa-wand-magic-sparkles text-9xl mb-8"></i>
                                <p className="text-2xl font-black uppercase tracking-[0.3em]">Boş Tuval</p>
                                <p className="text-xs mt-3 font-bold uppercase tracking-widest">Hikayenizi oluşturmak için sol paneli kullanın.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export const ReadingStudio = ({ onBack, onAddToWorkbook }: ReadingStudioInnerProps) => {
    return (
        <ReadingStudioProvider>
            <ReadingStudioInner onBack={onBack} onAddToWorkbook={onAddToWorkbook} />
        </ReadingStudioProvider>
    );
};
