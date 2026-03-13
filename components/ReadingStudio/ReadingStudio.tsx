import React, { useState, useRef } from 'react';
import { useReadingStore } from '../../store/useReadingStore';
import { printService } from '../../utils/printService';
import { generateInteractiveStory } from '../../services/generators/readingStudio';
import { ReadingStudioContentRenderer } from './ReadingStudioContentRenderer';
import { StudentSelector } from './Editor/StudentSelector';
import { AIProductionPanel } from './Editor/AIProductionPanel';
import { ComponentLibrary } from './Editor/ComponentLibrary';
import { ContentPanel } from './Editor/ContentPanel';
import { ArchivePanel } from './Editor/ArchivePanel';
import { LayoutItem } from '../../types'; // Added LayoutItem import
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../../utils/layoutConstants';

import { StylePanel } from './Editor/StylePanel';

interface ReadingStudioInnerProps {
  onBack: () => void;
  onAddToWorkbook: () => void;
}

const ReadingStudioInner = ({ onBack, onAddToWorkbook }: ReadingStudioInnerProps) => {
  const {
    config,
    setStoryData,
    layout,
    setLayout,
    isLoading,
    setIsLoading,
    designMode,
    setDesignMode,
    storyData,
    setSelectedId,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useReadingStore();

  const [sidebarTab, setSidebarTab] = useState(
    'production' as 'production' | 'library' | 'styling' | 'content' | 'archive'
  );
  const [canvasScale, setCanvasScale] = useState(0.85);

  // Initial layout setup
  React.useEffect(() => {
    if (layout.length === 0) {
      setLayout([
        {
          id: 'header',
          label: 'Başlık Künyesi',
          instanceId: 'init_header',
          isVisible: true,
          pageIndex: 0,
          specificData: { title: 'YENİ HİKAYE', subtitle: 'Okuma ve Anlama Çalışması' },
          style: {
            x: 20,
            y: 20,
            w: 754,
            h: 120,
            zIndex: 1,
            rotation: 0,
            padding: 10,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            borderStyle: 'solid',
            borderRadius: 0,
            opacity: 1,
            boxShadow: 'none',
            textAlign: 'left',
            color: '#000000',
            fontSize: 14,
            fontFamily: 'OpenDyslexic',
            lineHeight: 1.5,
          },
        },
        {
          id: 'story_block',
          label: 'Hikaye Metni',
          instanceId: 'init_story',
          isVisible: true,
          pageIndex: 0,
          specificData: { text: 'Buraya AI ile üretilen hikaye gelecek...' },
          style: {
            x: 20,
            y: 160,
            w: 754,
            h: 420,
            zIndex: 1,
            rotation: 0,
            padding: 10,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
            borderStyle: 'solid',
            borderRadius: 0,
            opacity: 1,
            boxShadow: 'none',
            textAlign: 'left',
            color: '#000000',
            fontSize: 14,
            fontFamily: 'OpenDyslexic',
            lineHeight: 1.5,
          },
        },
      ]);
    }
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateInteractiveStory(config);
      setStoryData(result);

      let newLayout: LayoutItem[] = [];
      let lastY = 20;
      let currentPage = 0;

      const addItem = (itemData: any, expectedHeight: number) => {
        if (lastY + expectedHeight > A4_HEIGHT_PX - 40) {
          currentPage++;
          lastY = 20;
        }
        itemData.pageIndex = currentPage;
        itemData.style.y = lastY;
        newLayout.push(itemData);
        lastY += expectedHeight + 20;
      };

      // Header
      addItem(
        {
          id: 'header',
          label: 'Başlık Künyesi',
          instanceId: `header_${Date.now()}`,
          isVisible: true,
          specificData: { title: result.title, subtitle: `${config.genre} - ${config.gradeLevel}` },
          style: {
            x: 20,
            y: 0,
            w: 754,
            h: 120,
            zIndex: 1,
            rotation: 0,
            padding: 20,
            backgroundColor: 'transparent',
            borderColor: '#e2e8f0',
            borderWidth: 0,
            borderStyle: 'solid',
            borderRadius: 8,
            opacity: 1,
            boxShadow: 'none',
            textAlign: 'left',
            color: '#000000',
            fontSize: 14,
            fontFamily: 'OpenDyslexic',
            lineHeight: 1.5,
          },
        },
        120
      );

      // Story Block
      addItem(
        {
          id: 'story_block',
          label: 'Hikaye Metni',
          instanceId: `story_${Date.now()}`,
          isVisible: true,
          specificData: { text: result.story },
          style: {
            x: 20,
            y: 0,
            w: 754,
            h: 450,
            zIndex: 1,
            rotation: 0,
            padding: 20,
            backgroundColor: 'transparent',
            borderColor: '#e2e8f0',
            borderWidth: 0,
            borderStyle: 'solid',
            borderRadius: 8,
            opacity: 1,
            boxShadow: 'none',
            textAlign: 'left',
            color: '#000000',
            fontSize: 16,
            fontFamily: 'OpenDyslexic',
            lineHeight: 1.8,
          },
        },
        450
      );

      if (result.vocabulary && result.vocabulary.length > 0) {
        addItem(
          {
            id: 'vocabulary',
            label: 'Kelime Dağarcığı',
            instanceId: `voc_${Date.now()}`,
            isVisible: true,
            specificData: { words: result.vocabulary },
            style: {
              x: 20,
              y: 0,
              w: 754,
              h: 150,
              zIndex: 1,
              rotation: 0,
              padding: 15,
              backgroundColor: '#f8fafc',
              borderColor: '#e2e8f0',
              borderWidth: 1,
              borderStyle: 'solid',
              borderRadius: 12,
              opacity: 1,
              boxShadow: 'none',
              textAlign: 'left',
              color: '#000000',
              fontSize: 14,
              fontFamily: 'OpenDyslexic',
              lineHeight: 1.5,
            },
          },
          150
        );
      }

      if (result.fiveW1H && result.fiveW1H.length > 0) {
        addItem(
          {
            id: '5n1k',
            label: '5N1K Çalışması',
            instanceId: `q5n1k_${Date.now()}`,
            isVisible: true,
            specificData: { questions: result.fiveW1H },
            style: {
              x: 20,
              y: 0,
              w: 754,
              h: 400,
              zIndex: 1,
              rotation: 0,
              padding: 20,
              backgroundColor: 'transparent',
              borderColor: '#e2e8f0',
              borderWidth: 0,
              borderStyle: 'solid',
              borderRadius: 8,
              opacity: 1,
              boxShadow: 'none',
              textAlign: 'left',
              color: '#000000',
              fontSize: 14,
              fontFamily: 'OpenDyslexic',
              lineHeight: 1.5,
            },
          },
          400
        );
      }

      if (result.logicQuestions && result.logicQuestions.length > 0) {
        addItem(
          {
            id: 'logic_problem',
            label: 'Mantık Bulmacası',
            instanceId: `logic_${Date.now()}`,
            isVisible: true,
            specificData: { puzzle: result.logicQuestions[0] },
            style: {
              x: 20,
              y: 0,
              w: 754,
              h: 200,
              zIndex: 1,
              rotation: 0,
              padding: 20,
              backgroundColor: '#fef3c7',
              borderColor: '#f59e0b',
              borderWidth: 1,
              borderStyle: 'dashed',
              borderRadius: 16,
              opacity: 1,
              boxShadow: 'none',
              textAlign: 'left',
              color: '#000000',
              fontSize: 14,
              fontFamily: 'OpenDyslexic',
              lineHeight: 1.5,
            },
          },
          200
        );
      }

      if (result.inferenceQuestions && result.inferenceQuestions.length > 0) {
        addItem(
          {
            id: 'questions',
            label: 'Çıkarım Soruları',
            instanceId: `inf_${Date.now()}`,
            isVisible: true,
            specificData: {
              questions: result.inferenceQuestions.map((q: any) => ({
                question: q.question,
                type: 'open',
              })),
            },
            style: {
              x: 20,
              y: 0,
              w: 754,
              h: 250,
              zIndex: 1,
              rotation: 0,
              padding: 20,
              backgroundColor: 'transparent',
              borderColor: '#e2e8f0',
              borderWidth: 0,
              borderStyle: 'solid',
              borderRadius: 8,
              opacity: 1,
              boxShadow: 'none',
              textAlign: 'left',
              color: '#000000',
              fontSize: 14,
              fontFamily: 'OpenDyslexic',
              lineHeight: 1.5,
            },
          },
          250
        );
      }

      setLayout(newLayout);
      setSelectedId(null);
      setDesignMode(false);
    } catch (e) {
      alert('Hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async (action: 'print' | 'download') => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 50));
      await printService.generatePdf('#canvas-root', 'Hikaye', { action });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    try {
      const data = localStorage.getItem('reading_studio_archive');
      const archive = data ? JSON.parse(data) : [];
      const newProject = {
        id: `proj_${Date.now()}`,
        title: storyData?.title || config.topic || 'İsimsiz Çalışma',
        date: new Date().toISOString(),
        config,
        storyData,
        layout,
        layoutCount: layout.length,
      };
      archive.push(newProject);
      localStorage.setItem('reading_studio_archive', JSON.stringify(archive));
      window.dispatchEvent(new Event('reading_studio_saved'));
      alert('Çalışmanız başarıyla arşive kaydedildi.');
    } catch (e) {
      alert('Kaydetme başarısız oldu.');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#09090b] overflow-hidden text-zinc-100 absolute inset-0 z-50">
      {/* Header */}
      <header className="h-16 bg-[#121214] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl hover:bg-zinc-800 flex items-center justify-center text-zinc-400 transition-colors border border-transparent hover:border-zinc-700"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-white flex items-center gap-2 tracking-tight uppercase italic">
              Oogmatik <span className="text-indigo-500 not-italic">Reading Studio Pro</span>
            </h2>
            {storyData && (
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                {storyData.title}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-800 rounded-xl p-0.5 border border-zinc-700/50">
            <button
              disabled={!canUndo}
              onClick={undo}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-20 transition-all font-bold"
            >
              <i className="fa-solid fa-rotate-left"></i>
            </button>
            <button
              disabled={!canRedo}
              onClick={redo}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-20 transition-all font-bold"
            >
              <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>
          <div className="w-px h-6 bg-zinc-800 mx-1"></div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Üretiliyor...
              </>
            ) : (
              'AI İle Baştan Yarat'
            )}
          </button>
          <div className="w-px h-6 bg-zinc-800 mx-2"></div>
          <button
            onClick={() => handlePrint('print')}
            className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700/50"
          >
            <i className="fa-solid fa-print"></i>
          </button>
          <button
            onClick={handleSave}
            className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700/50"
          >
            <i className="fa-solid fa-floppy-disk"></i>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-[#121214] border-r border-zinc-800 flex flex-col overflow-hidden shadow-2xl z-40">
          <div className="p-4 border-b border-zinc-800 bg-black/20">
            <StudentSelector />
          </div>

          <div className="flex border-b border-zinc-800 shrink-0 bg-zinc-900/30 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setSidebarTab('production')}
              className={`flex-1 min-w-[70px] pt-4 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${sidebarTab === 'production' ? 'text-indigo-500 border-indigo-500 bg-indigo-500/5' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              Üretim
            </button>
            <button
              onClick={() => setSidebarTab('library')}
              className={`flex-1 min-w-[80px] pt-4 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${sidebarTab === 'library' ? 'text-emerald-500 border-emerald-500 bg-emerald-500/5' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              Bileşenler
            </button>
            <button
              onClick={() => setSidebarTab('content')}
              className={`flex-1 min-w-[70px] pt-4 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${sidebarTab === 'content' ? 'text-sky-500 border-sky-500 bg-sky-500/5' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              İçerik
            </button>
            <button
              onClick={() => setSidebarTab('styling')}
              className={`flex-1 min-w-[60px] pt-4 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${sidebarTab === 'styling' ? 'text-amber-500 border-amber-500 bg-amber-500/5' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              Stil
            </button>
            <button
              onClick={() => setSidebarTab('archive')}
              className={`flex-1 min-w-[60px] pt-4 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${sidebarTab === 'archive' ? 'text-purple-500 border-purple-500 bg-purple-500/5' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              Arşiv
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
            {sidebarTab === 'production' && <AIProductionPanel />}
            {sidebarTab === 'library' && <ComponentLibrary />}
            {sidebarTab === 'content' && <ContentPanel />}
            {sidebarTab === 'styling' && <StylePanel />}
            {sidebarTab === 'archive' && <ArchivePanel />}
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 bg-[#09090b] overflow-auto p-12 custom-scrollbar flex flex-col items-center relative">
          <div className="flex gap-4 mb-8 bg-[#121214]/80 backdrop-blur-xl p-2 rounded-2xl border border-zinc-800 shadow-2xl sticky top-0 z-30">
            <div className="flex items-center gap-4 px-4">
              <button
                onClick={() => setCanvasScale(Math.max(0.5, canvasScale - 0.1))}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-minus text-xs"></i>
              </button>
              <span className="text-[10px] font-black text-zinc-500 min-w-[40px] text-center">
                % {Math.round(canvasScale * 100)}
              </span>
              <button
                onClick={() => setCanvasScale(Math.min(1.5, canvasScale + 0.1))}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-plus text-xs"></i>
              </button>
            </div>
          </div>

          <div
            id="canvas-root"
            className="origin-top transition-all relative"
            style={{ transform: `scale(${canvasScale})` }}
          >
            <ReadingStudioContentRenderer layout={layout} storyData={storyData} />

            {!storyData && layout.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 pointer-events-none opacity-20 bg-zinc-50/50">
                <i className="fa-solid fa-wand-magic-sparkles text-9xl mb-8"></i>
                <p className="text-2xl font-black uppercase tracking-[0.3em]">Boş Tuval</p>
                <p className="text-xs mt-3 font-bold uppercase tracking-widest">
                  Hikayenizi oluşturmak için sol paneli kullanın.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export const ReadingStudio = ({ onBack, onAddToWorkbook }: ReadingStudioInnerProps) => {
  return <ReadingStudioInner onBack={onBack} onAddToWorkbook={onAddToWorkbook} />;
};
