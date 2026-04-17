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
import { LayoutItem } from '../../types';
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
    setDesignMode,
    storyData,
    setSelectedId,
    undo,
    redo,
    canUndo,
    canRedo,
    recalculateLayout,
    toggleVisibility
  } = useReadingStore();

  const [sidebarTab, setSidebarTab] = useState(
    'production' as 'production' | 'library' | 'styling' | 'content' | 'archive'
  );
  const [canvasScale, setCanvasScale] = useState(0.85);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await generateInteractiveStory(config);
      setStoryData(result);

      const items: LayoutItem[] = [];

      // Helper to generate IDs
      const getInstId = (prefix: string) => `${prefix}_${Date.now()}`;

      // 1. Header (Görünür)
      items.push({
        id: 'header',
        label: 'Başlık Künyesi',
        instanceId: getInstId('header'),
        isVisible: true,
        specificData: { title: result.title, subtitle: `${config.genre} - ${config.gradeLevel}` },
        style: { h: 120, fontSize: 14, fontFamily: 'Lexend', lineHeight: 1.5, color: '#000000' } as any
      });

      // 2. Story (Görünür)
      items.push({
        id: 'story_block',
        label: 'Hikaye Metni',
        instanceId: getInstId('story'),
        isVisible: true,
        specificData: { text: result.story },
        style: { h: 450, fontSize: 16, fontFamily: 'Lexend', lineHeight: 1.8, color: '#000000' } as any
      });

      // 3. 5N1K (Görünür)
      items.push({
        id: '5n1k',
        label: '5N1K Analizi',
        instanceId: getInstId('5n1k'),
        isVisible: true,
        specificData: { questions: result.fiveW1H },
        style: { h: 320, fontSize: 14, fontFamily: 'Lexend', lineHeight: 1.5, backgroundColor: '#f8fafc', borderRadius: 12, padding: 20 } as any
      });

      // 4. Sözlükçe (Gizli)
      items.push({
        id: 'vocabulary',
        label: 'Sözlükçe',
        instanceId: getInstId('voc'),
        isVisible: false,
        specificData: { words: result.vocabulary },
        style: { h: 200, fontSize: 13, fontFamily: 'Lexend', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 15 } as any
      });

      // 5. Pedagojik Notlar (Gizli)
      items.push({
        id: 'pedagogical_goals',
        label: 'Pedagojik Hedefler',
        instanceId: getInstId('ped'),
        isVisible: false,
        specificData: { 
            note: result.pedagogicalNote,
            goals: result.pedagogicalGoals 
        },
        style: { h: 180, fontSize: 12, fontFamily: 'Lexend', backgroundColor: '#ecfdf5', borderColor: '#10b981', borderWidth: 1, borderStyle: 'solid', borderRadius: 12, padding: 15 } as any
      });

      // 6. Test Soruları (Gizli)
      items.push({
        id: 'test_questions',
        label: 'Çoktan Seçmeli Test',
        instanceId: getInstId('test'),
        isVisible: false,
        specificData: { questions: result.multipleChoice },
        style: { h: 450, fontSize: 14, fontFamily: 'Lexend', padding: 20 } as any
      });

      // 7. Mantık Sorusu (Gizli)
      items.push({
        id: 'logic_problem',
        label: 'Muhakeme Sorusu',
        instanceId: getInstId('logic'),
        isVisible: false,
        specificData: { puzzle: result.logicQuestions?.[0], inference: result.inferenceQuestions?.[0] },
        style: { h: 220, fontSize: 14, fontFamily: 'Lexend', backgroundColor: '#fff7ed', borderColor: '#f97316', borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, padding: 20 } as any
      });

      // 8. Hece Treni (Gizli)
      items.push({
        id: 'syllable_train',
        label: 'Hece Treni',
        instanceId: getInstId('train'),
        isVisible: false,
        specificData: { words: result.syllableTrain },
        style: { h: 180, padding: 15 } as any
      });

      // 9. Yaratıcı Yazma/Çizim (Gizli)
      items.push({
        id: 'creative_area',
        label: 'Yaratıcı Alan',
        instanceId: getInstId('creative'),
        isVisible: false,
        specificData: { prompt: result.creativePrompt },
        style: { h: 300, fontSize: 14, fontFamily: 'Lexend', borderColor: '#e2e8f0', borderWidth: 1, borderStyle: 'solid', borderRadius: 12, padding: 20 } as any
      });

      // 10. Not Alanı (Gizli Extra)
      items.push({
        id: 'note_area',
        label: 'Öğretmen Not Alanı',
        instanceId: getInstId('notes'),
        isVisible: false,
        specificData: { placeholder: 'Buraya değerlendirme notlarınızı ekleyebilirsiniz...' },
        style: { h: 120, fontSize: 12, fontFamily: 'Inter', backgroundColor: '#fefce8', borderRadius: 8, padding: 10 } as any
      });

      setLayout(items);
      setTimeout(() => recalculateLayout(), 50); // Mizanpajı hesapla
      setSelectedId(null);
      setDesignMode(false);
    } catch (e) {
      console.error(e);
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
    } catch (_e) {
      alert('Kaydetme başarısız oldu.');
    }
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden absolute inset-0 z-50"
      style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)' }}
    >
      {/* Header */}
      {!isFocusMode && (
        <header
          className="h-16 flex justify-between items-center px-6 shrink-0 z-50"
          style={{ backgroundColor: 'var(--bg-paper)', borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors border border-transparent hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-black flex items-center gap-2 tracking-tight uppercase italic" style={{ color: 'var(--text-primary)' }}>
                Oogmatik <span className="not-italic" style={{ color: 'var(--accent-color)' }}>Reading Studio Pro</span>
              </h2>
              {storyData && (
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {storyData.title}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl p-0.5" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}>
              <button
                disabled={!canUndo}
                onClick={undo}
                className="studio-icon-btn w-10 h-10 rounded-lg flex items-center justify-center font-bold"
              >
                <i className="fa-solid fa-rotate-left"></i>
              </button>
              <button
                disabled={!canRedo}
                onClick={redo}
                className="studio-icon-btn w-10 h-10 rounded-lg flex items-center justify-center font-bold"
              >
                <i className="fa-solid fa-rotate-right"></i>
              </button>
            </div>
            <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--border-color)' }}></div>
            <button
              onClick={() => handlePrint('print')}
              className="studio-icon-btn w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ border: '1px solid var(--border-color)' }}
            >
              <i className="fa-solid fa-print"></i>
            </button>
            <button
              onClick={handleSave}
              className="studio-icon-btn w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ border: '1px solid var(--border-color)' }}
            >
              <i className="fa-solid fa-floppy-disk"></i>
            </button>
          </div>
        </header>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {!isFocusMode && (
          <aside
            className="w-80 flex flex-col overflow-hidden shadow-2xl z-40"
            style={{ backgroundColor: 'var(--bg-paper)', borderRight: '1px solid var(--border-color)' }}
          >
            <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-glass)' }}>
              <StudentSelector />
            </div>

            <div
              className="flex shrink-0 overflow-x-auto custom-scrollbar"
              style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-glass)' }}
            >
              <button
                onClick={() => setSidebarTab('production')}
                className={`flex-1 min-w-[70px] pt-4 pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2`}
                style={{
                  color: sidebarTab === 'production' ? 'var(--accent-color)' : 'var(--text-muted)',
                  borderBottomColor: sidebarTab === 'production' ? 'var(--accent-color)' : 'transparent',
                  backgroundColor: sidebarTab === 'production' ? 'var(--accent-muted)' : 'transparent',
                }}
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

            {/* Sticky Bottom Generate Button */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800 shrink-0 z-10 w-full relative mt-auto shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-4 bg-accent text-white font-black rounded-xl text-sm shadow-xl shadow-accent/20 hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-wider"
              >
                {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                {isLoading ? 'BEKLEYİN...' : 'SINAVI OLUŞTUR'}
              </button>
            </div>
          </aside>
        )}

        {/* Main Canvas Area */}
        <main className="flex-1 overflow-auto p-12 custom-scrollbar flex flex-col items-center relative" style={{ backgroundColor: 'var(--bg-inset)' }}>
          <div
            className="flex gap-4 mb-8 p-2 rounded-2xl shadow-2xl sticky top-0 z-30"
            style={{
              backgroundColor: 'var(--surface-glass)',
              backdropFilter: `blur(var(--surface-glass-blur, 20px))`,
              WebkitBackdropFilter: `blur(var(--surface-glass-blur, 20px))`,
              border: '1px solid var(--border-color)',
            }}
          >
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
              <div className="w-px h-4" style={{ backgroundColor: 'var(--border-color)' }}></div>
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`text-[10px] uppercase tracking-widest px-3 py-1 font-black rounded-lg transition-colors border ${isFocusMode ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-700 text-zinc-500 hover:text-white'}`}
                title={isFocusMode ? 'Odaktan Çık' : 'Odak Modu'}
              >
                <i className={`fa-solid ${isFocusMode ? 'fa-compress' : 'fa-expand'} mr-2`}></i>
                {isFocusMode ? 'ODAKTAN ÇIK' : 'ODAK MODU'}
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
