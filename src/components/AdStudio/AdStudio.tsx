import React from 'react';
import { useAdGenerator } from '../../hooks/useAdGenerator';
import { useScreenshotCapture } from '../../hooks/useScreenshotCapture';
import { StepWizard } from './components/StepWizard';
import { TargetSelector } from './components/TargetSelector';
import { AudienceSelector } from './components/AudienceSelector';
import { ToneSelector } from './components/ToneSelector';
import { FormatPicker } from './components/FormatPicker';
import { BrandSettings } from './components/BrandSettings';
import { AdvancedOptions } from './components/AdvancedOptions';
import { PreviewPanel } from './components/PreviewPanel';
import { VersionHistory } from './components/VersionHistory';
import { ABTestPanel } from './components/ABTestPanel';
import { BatchGenerator } from './components/BatchGenerator';
import { CampaignManager } from './components/CampaignManager';
import { TemplateLibrary } from './components/TemplateLibrary';
import { MediaLibrary } from './components/MediaLibrary';
import { ExportPanel } from './components/ExportPanel';
import { ModulePreview } from './components/ModulePreview';

type Panel = 'studio' | 'history' | 'campaigns' | 'templates' | 'media' | 'brand';

export const AdStudio: React.FC = () => {
  const generator = useAdGenerator();
  const [activePanel, setActivePanel] = React.useState<Panel>('studio');
  const { previewRef, captured, capture } = useScreenshotCapture();
  const captureTargetRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (generator.output && !captured[generator.output.target]) {
      captureTargetRef.current = generator.output.target;
      const timer = setTimeout(async () => {
        if (captureTargetRef.current === generator.output?.target) {
          await capture(generator.output.target);
        }
      }, 500);
      return () => { clearTimeout(timer); captureTargetRef.current = null; };
    }
  }, [generator.output, captured, capture]);

  const stepLabels = ['Hedef', 'Kitle', 'Ton', 'Format', 'Ayarlar'];

  const renderStep = () => {
    switch (generator.step) {
      case 1:
        return <TargetSelector target={generator.settings.target} onChange={v => generator.updateSettings('target', v)} />;
      case 2:
        return <AudienceSelector audience={generator.settings.audience} onChange={v => generator.updateSettings('audience', v)} />;
      case 3:
        return (
          <ToneSelector
            tone={generator.settings.tone}
            toneMix={generator.settings.toneMix}
            onToneChange={v => generator.updateSettings('tone', v)}
            onMixChange={generator.updateToneMix}
          />
        );
      case 4:
        return (
          <FormatPicker
            format={generator.settings.format}
            duration={generator.settings.duration}
            onFormatChange={v => generator.updateSettings('format', v)}
            onDurationChange={v => generator.updateSettings('duration', v)}
          />
        );
      case 5:
        return (
          <div className="space-y-6">
            <AdvancedOptions settings={generator.settings} onChange={generator.updateSettings} />
            <BrandSettings />
          </div>
        );
      default:
        return null;
    }
  };

  const navItems: { key: Panel; label: string; icon: string }[] = [
    { key: 'studio', label: 'Stüdyo', icon: 'fa-wand-magic-sparkles' },
    { key: 'history', label: 'Geçmiş', icon: 'fa-clock-rotate-left' },
    { key: 'campaigns', label: 'Kampanyalar', icon: 'fa-bullhorn' },
    { key: 'templates', label: 'Şablonlar', icon: 'fa-copy' },
    { key: 'media', label: 'Medya', icon: 'fa-photo-film' },
    { key: 'brand', label: 'Marka Kiti', icon: 'fa-palette' },
  ];

  return (
    <div className="space-y-6 font-lexend">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-black border border-white/5 p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
              <i className="fa-solid fa-circle text-[6px] mr-1.5 align-middle text-indigo-400" />
              Premium
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">v1.0.0</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            Reklam Stüdyosu
          </h1>
          <p className="text-zinc-400 text-sm font-medium max-w-2xl">
            AI destekli reklam içeriği üreticisi. Tüm modüller için storyboard, video script, sosyal medya ve e-posta kampanyaları oluşturun.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 rounded-2xl bg-white/5 border border-white/5 p-1 overflow-x-auto">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setActivePanel(item.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activePanel === item.key
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            <i className={`fa-solid ${item.icon}`} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      {activePanel === 'studio' && (
        <div className="grid grid-cols-5 gap-6">
          {/* Left: Wizard */}
          <div className="col-span-3 rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6">
            <StepWizard
              step={generator.step}
              stepLabels={stepLabels}
              onNext={generator.nextStep}
              onPrev={generator.prevStep}
              onStepClick={generator.setStep}
              isGenerating={generator.isGenerating}
              onGenerate={generator.generate}
              hasOutput={!!generator.output}
              onReset={generator.reset}
            />
            <div className="mt-6">
              {renderStep()}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="col-span-2 rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6 overflow-y-auto max-h-[700px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <i className="fa-solid fa-eye text-indigo-500" />
                Önizleme
              </h3>
              {generator.output && <ExportPanel output={generator.output} />}
            </div>
            {generator.isGenerating ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-500" />
                <span className="text-sm text-zinc-400 font-medium">Reklam içeriği üretiliyor...</span>
              </div>
            ) : generator.error ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <i className="fa-solid fa-circle-xmark text-4xl text-red-500" />
                <p className="text-sm text-red-400 font-medium">{generator.error}</p>
                <button onClick={() => generator.setError(null)} className="text-[10px] text-zinc-500 underline">Kapat</button>
              </div>
            ) : generator.output ? (
              <>
                <PreviewPanel output={generator.output} screenshot={captured[generator.output.target]} />
                <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
                  <div ref={previewRef}>
                    <ModulePreview target={generator.output.target} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-500">
                <i className="fa-solid fa-wand-magic-sparkles text-4xl" />
                <p className="text-sm font-medium">Ayarları yapılandır ve reklamını oluştur</p>
              </div>
            )}
          </div>

          {/* Bottom: AB Test + Batch */}
          {generator.output && (
            <div className="col-span-5 grid grid-cols-2 gap-6">
              <ABTestPanel settings={generator.settings} />
              <BatchGenerator />
            </div>
          )}
        </div>
      )}

      {activePanel === 'history' && <VersionHistory />}
      {activePanel === 'campaigns' && <CampaignManager />}
      {activePanel === 'templates' && <TemplateLibrary />}
      {activePanel === 'media' && <MediaLibrary />}
      {activePanel === 'brand' && <BrandSettings />}
    </div>
  );
};

AdStudio.displayName = 'AdStudio';
