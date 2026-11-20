import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AdOutput, AD_TARGET_LABELS, AD_FORMAT_LABELS } from '../../../types/adStudio';
import { generateVideo } from '../../../services/adVideoGenerator';
import { AdVisualMockupRenderer } from './AdVisualMockupRenderer';
import { AdScoreBadge } from './AdScoreBadge';
import { AdVoicePlayer } from './AdVoicePlayer';
import { AdLiveEditor } from './AdLiveEditor';

interface PreviewPanelProps {
  output: AdOutput;
  screenshot?: string;
  onUpdateOutput?: (updated: AdOutput) => void;
}

type PreviewViewMode = 'mockup' | 'storyboard' | 'copy' | 'video';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ output, screenshot, onUpdateOutput }) => {
  const [viewMode, setViewMode] = useState<PreviewViewMode>('mockup');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Video generator state
  const [videoState, setVideoState] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [videoFormat, setVideoFormat] = useState<'9:16' | '16:9'>('9:16');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    revokeBlobUrl();
    setVideoUrl(null);
    setVideoState('idle');
    setVideoProgress(0);
    setVideoError(null);
  }, [output.id, revokeBlobUrl]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeBlobUrl();
    };
  }, [revokeBlobUrl]);

  const copyText = async (text: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleCancelVideo = useCallback(() => {
    abortRef.current?.abort();
    setVideoState('idle');
    setVideoProgress(0);
    setVideoError(null);
  }, []);

  const handleGenerateVideo = useCallback(async () => {
    if (output.scenes.length === 0) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setVideoState('generating');
    setVideoProgress(0);
    setVideoError(null);
    try {
      // Sahnenin kendi yüksek çözünürlüklü SVG/vektör görseli varsa onu koru!
      // Yalnızca görseli bulunmayan sahneler için screenshot fallback kullan.
      const patchedOutput = {
        ...output,
        scenes: output.scenes.map(s => ({
          ...s,
          sceneVisual: s.sceneVisual && s.sceneVisual.trim().length > 0 ? s.sceneVisual : (screenshot || ''),
        })),
      };
      const { webm } = await generateVideo(patchedOutput, {
        format: videoFormat,
        signal: abortRef.current.signal,
        onProgress: setVideoProgress,
      });
      revokeBlobUrl();
      const url = URL.createObjectURL(webm);
      blobUrlRef.current = url;
      setVideoUrl(url);
      setVideoState('done');
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Video oluşturulamadı';
      setVideoError(msg);
      setVideoState('error');
    }
  }, [output, videoFormat, screenshot, revokeBlobUrl]);

  const handleDownloadVideo = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `bdmind-reklam-${(output.id || '0000').slice(0, 8)}-${videoFormat}.webm`;
    a.click();
  }, [videoUrl, output.id, videoFormat]);

  const renderVideoControls = () => (
    <div className="rounded-2xl bg-black/40 border border-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-video text-indigo-400 text-xs" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">Video İşleme Motoru</span>
        </div>
        <span className="text-[9px] text-zinc-500 font-mono">{output.duration} saniye</span>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={videoFormat}
          onChange={e => setVideoFormat(e.target.value as '9:16' | '16:9')}
          disabled={videoState === 'generating'}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-300 text-[10px] font-bold focus:outline-none cursor-pointer"
        >
          <option value="9:16">9:16 Dikey (Instagram / TikTok Reels)</option>
          <option value="16:9">16:9 Yatay (YouTube / Web Tanıtım)</option>
        </select>
        <button
          onClick={handleGenerateVideo}
          disabled={videoState === 'generating'}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 shadow-md"
        >
          {videoState === 'generating' ? (
            <i className="fa-solid fa-circle-notch fa-spin text-xs" />
          ) : (
            <i className="fa-solid fa-play text-xs" />
          )}
          {videoState === 'generating' ? `%${videoProgress}` : 'Video Üret'}
        </button>
      </div>

      {videoState === 'generating' && (
        <div className="space-y-2 pt-1">
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${videoProgress}%` }}
            />
          </div>
          <button
            onClick={handleCancelVideo}
            className="w-full flex items-center justify-center gap-1.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-[9px] font-bold border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            <i className="fa-solid fa-ban" /> İptal Et
          </button>
        </div>
      )}

      {videoState === 'done' && videoUrl && (
        <div className="space-y-2 pt-2">
          <video ref={videoRef} src={videoUrl} controls className="w-full rounded-xl border border-white/10 shadow-lg" />
          <button
            onClick={handleDownloadVideo}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
          >
            <i className="fa-solid fa-download" />
            Videoyu WebM Olarak İndir
          </button>
        </div>
      )}

      {videoState === 'error' && (
        <p className="text-[10px] text-red-400">{videoError || 'Video oluşturulamadı'}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-4 font-lexend">
      {/* Top Header Card */}
      <div className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-black uppercase tracking-wider">
              {AD_FORMAT_LABELS[output.format] || output.format}
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              {AD_TARGET_LABELS[output.target] || output.target}
            </span>
            <span className="text-[9px] text-zinc-500 font-mono">v{output.version}</span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight leading-snug">{output.title}</h3>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setIsEditorOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-[10px] font-bold transition-all whitespace-nowrap"
        >
          <i className="fa-solid fa-pen-to-square text-[9px]" />
          Düzenle
        </button>
      </div>

      {/* AI Score Badge */}
      <AdScoreBadge score={output.score} />

      {/* Voiceover TTS Player */}
      <AdVoicePlayer textToSpeak={output.script || output.socialCopy} label="Seslendirme Önizleme (TTS)" />

      {/* View Mode Switcher */}
      <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
        {[
          { id: 'mockup', label: 'Cihaz Mockup', icon: 'fa-mobile-screen' },
          { id: 'storyboard', label: `Storyboard (${output.scenes.length})`, icon: 'fa-clapperboard' },
          { id: 'copy', label: 'Pazarlama Metinleri', icon: 'fa-file-lines' },
          { id: 'video', label: 'Video Oluşturucu', icon: 'fa-video' },
        ].map(vm => (
          <button
            key={vm.id}
            onClick={() => setViewMode(vm.id as PreviewViewMode)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              viewMode === vm.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <i className={`fa-solid ${vm.icon}`} />
            {vm.label}
          </button>
        ))}
      </div>

      {/* 1. MOCKUP VIEW */}
      {viewMode === 'mockup' && (
        <AdVisualMockupRenderer output={output} screenshot={screenshot} />
      )}

      {/* 2. STORYBOARD VIEW */}
      {viewMode === 'storyboard' && (
        <div className="space-y-3">
          {output.scenes.map(scene => (
            <div key={scene.sceneNo} className="relative rounded-2xl bg-black/40 border border-white/5 p-4 overflow-hidden space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Sahne {scene.sceneNo}
                </span>
                <span className="text-[9px] font-mono text-zinc-500">{scene.duration} saniye · {scene.transition}</span>
              </div>

              {/* Visual Preview */}
              <div className="rounded-xl overflow-hidden bg-black/50 border border-white/5 aspect-video flex items-center justify-center">
                {screenshot ? (
                  <img src={screenshot} alt={`Sahne ${scene.sceneNo}`} className="w-full h-full object-cover" />
                ) : scene.sceneVisual && scene.sceneVisual.startsWith('<svg') ? (
                  <div className="w-full h-full [&_svg]:w-full [&_svg]:h-full" dangerouslySetInnerHTML={{ __html: scene.sceneVisual }} />
                ) : (
                  <div className="p-4 text-center text-zinc-500 text-xs">
                    <i className="fa-solid fa-image text-2xl mb-1 text-indigo-500/50" />
                    <p className="text-[10px] text-zinc-400">{scene.visualDesc.slice(0, 70)}...</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-zinc-200 leading-relaxed">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Kamera & Atmosfer:</span>
                {scene.visualDesc}
              </p>

              {scene.voiceover && (
                <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">🎙️ Seslendirme:</span>
                  <p className="text-xs text-indigo-200 italic leading-snug">"{scene.voiceover}"</p>
                </div>
              )}

              {scene.textOverlay && (
                <div className="text-[10px] text-zinc-400 font-mono">
                  <span className="text-zinc-600 font-bold">Yazı: </span>
                  <span className="text-amber-400/90">{scene.textOverlay}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. MARKETING COPY VIEW */}
      {viewMode === 'copy' && (
        <div className="space-y-3">
          {/* Script Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Tam Reklam Senaryosu</span>
              <button
                onClick={() => copyText(output.script, 'script')}
                className="text-[9px] text-zinc-400 hover:text-white font-bold flex items-center gap-1"
              >
                <i className={`fa-solid ${copiedSection === 'script' ? 'fa-check text-emerald-400' : 'fa-copy'}`} />
                {copiedSection === 'script' ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono text-[11px] bg-black/30 p-3 rounded-xl border border-white/5">
              {output.script}
            </p>
          </div>

          {/* Social Copy Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Sosyal Medya Metni</span>
              <button
                onClick={() => copyText(output.socialCopy, 'social')}
                className="text-[9px] text-zinc-400 hover:text-white font-bold flex items-center gap-1"
              >
                <i className={`fa-solid ${copiedSection === 'social' ? 'fa-check text-emerald-400' : 'fa-copy'}`} />
                {copiedSection === 'social' ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap bg-black/30 p-3 rounded-xl border border-white/5">
              {output.socialCopy}
            </p>
          </div>

          {/* Email Copy Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">E-posta Kampanyası</span>
              <button
                onClick={() => copyText(`Konu: ${output.emailSubject}\n\n${output.emailBody}`, 'email')}
                className="text-[9px] text-zinc-400 hover:text-white font-bold flex items-center gap-1"
              >
                <i className={`fa-solid ${copiedSection === 'email' ? 'fa-check text-emerald-400' : 'fa-copy'}`} />
                {copiedSection === 'email' ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="text-[11px] text-zinc-400 font-bold">
                Konu: <span className="text-white">{output.emailSubject}</span>
              </div>
              <div className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed border-t border-white/5 pt-2">
                {output.emailBody}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIDEO CONTROLS VIEW */}
      {viewMode === 'video' && renderVideoControls()}

      {/* Pedagogical Note Footer */}
      {output.pedagogicalNote && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-[10px] text-emerald-200/90 leading-relaxed flex items-start gap-2.5">
          <i className="fa-solid fa-graduation-cap text-emerald-400 text-sm mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">Öğretmen & Veli Pedagojik Notu</span>
            {output.pedagogicalNote}
          </div>
        </div>
      )}

      {/* Live Editor Modal */}
      {isEditorOpen && (
        <AdLiveEditor
          output={output}
          onSave={updated => {
            onUpdateOutput?.(updated);
          }}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
