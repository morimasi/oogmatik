import React, { useState, useRef, useCallback } from 'react';
import { AdOutput, AD_TARGET_LABELS } from '../../../types/adStudio';
import { generateVideo } from '../../../services/adVideoGenerator';

interface PreviewPanelProps {
  output: AdOutput;
  screenshot?: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ output, screenshot }) => {
  const [videoState, setVideoState] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [videoFormat, setVideoFormat] = useState<'9:16' | '16:9'>('9:16');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleGenerateVideo = useCallback(async () => {
    if (output.scenes.length === 0) return;
    setVideoState('generating');
    setVideoProgress(0);
    setVideoError(null);
    try {
      const { webm } = await generateVideo(output, {
        format: videoFormat,
        onProgress: setVideoProgress,
      });
      const url = URL.createObjectURL(webm);
      setVideoUrl(url);
      setVideoState('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Video olusturulamadi';
      setVideoError(msg);
      setVideoState('error');
    }
  }, [output, videoFormat]);

  const handleDownloadVideo = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `oogmatik-reklam-${output.id.slice(0, 8)}-${videoFormat}.webm`;
    a.click();
  }, [videoUrl, output.id, videoFormat]);

  const renderVideoSection = () => (
    <div className="mt-6 pt-4 border-t border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <i className="fa-solid fa-video text-indigo-500 text-[10px]" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Video</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <select
          value={videoFormat}
          onChange={e => setVideoFormat(e.target.value as '9:16' | '16:9')}
          disabled={videoState === 'generating'}
          className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 text-[9px] font-bold focus:outline-none focus:border-indigo-500/30 cursor-pointer appearance-none disabled:opacity-50"
        >
          <option value="9:16" className="bg-zinc-900">9:16 Dikey (TikTok/Reels)</option>
          <option value="16:9" className="bg-zinc-900">16:9 Yatay (YouTube/Web)</option>
        </select>
        <button
          onClick={handleGenerateVideo}
          disabled={videoState === 'generating'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-[9px] font-bold border border-indigo-500/30 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
        >
          {videoState === 'generating' ? (
            <i className="fa-solid fa-circle-notch fa-spin" />
          ) : (
            <i className="fa-solid fa-play" />
          )}
          {videoState === 'generating' ? `${videoProgress}%` : 'Video Oluştur'}
        </button>
      </div>
      {videoState === 'generating' && (
        <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${videoProgress}%` }} />
        </div>
      )}
      {videoState === 'done' && videoUrl && (
        <div className="space-y-2">
          <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg" />
          <button
            onClick={handleDownloadVideo}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
          >
            <i className="fa-solid fa-download" />
            Videoyu İndir (.webm)
          </button>
        </div>
      )}
      {videoState === 'error' && (
        <p className="text-[10px] text-red-400">{videoError || 'Video olusturulamadi'}</p>
      )}
    </div>
  );

  if (output.format === 'storyboard') {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-zinc-200 mb-3">{output.title}</h4>
        <div className="flex items-center gap-2 text-[9px] text-zinc-500 mb-4">
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{AD_TARGET_LABELS[output.target]}</span>
          <span>{output.audience.join(', ')}</span>
          <span>· {output.duration}s</span>
        </div>
        {output.scenes.map(scene => (
          <div key={scene.sceneNo} className="relative rounded-xl bg-gradient-to-br from-black/40 to-indigo-950/30 border border-white/5 p-4 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-3xl rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                  Sahne {scene.sceneNo}
                </span>
                <span className="text-[8px] font-mono text-zinc-600">{scene.duration}s</span>
              </div>

              <div className="mb-3 rounded-lg overflow-hidden bg-black/30 border border-white/5">
                {scene.sceneVisual && scene.sceneVisual.startsWith('<svg') ? (
                  <div className="w-full [&_svg]:w-full [&_svg]:h-auto" dangerouslySetInnerHTML={{ __html: scene.sceneVisual }} />
                ) : screenshot ? (
                  <img src={screenshot} alt={`Sahne ${scene.sceneNo}`} className="w-full h-auto object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-[120px] text-zinc-600 text-[10px]">
                    <i className="fa-solid fa-image mr-2 opacity-50" />
                    {scene.visualDesc.slice(0, 60)}...
                  </div>
                )}
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed mb-2">
                <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">Görsel: </span>
                {scene.visualDesc}
              </p>
              <div className="border-l-2 border-indigo-500/30 pl-3 mb-2">
                <p className="text-[11px] text-zinc-400 italic">
                  <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-wider not-italic">🎙️ Ses: </span>
                  {scene.voiceover}
                </p>
              </div>
              {scene.textOverlay && (
                <p className="text-[9px] text-zinc-500 font-mono">
                  <span className="text-zinc-600">── </span>
                  {scene.textOverlay}
                </p>
              )}
            </div>
          </div>
        ))}
      {renderVideoSection()}
      </div>
    );
  }

  if (output.format === 'social_media') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-br from-pink-950/40 to-purple-950/30 border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">O</div>
            <div>
              <span className="text-[11px] font-bold text-zinc-200">oogmatik</span>
              <span className="text-[8px] text-zinc-500 block">Sponsored</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">{output.socialCopy}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-950/30 border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">in</div>
            <div>
              <span className="text-[11px] font-bold text-zinc-200">Oogmatik</span>
              <span className="text-[8px] text-zinc-500 block">Eğitim Teknolojileri</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">{output.socialCopy}</p>
        </div>
        {renderVideoSection()}
      </div>
    );
  }

  if (output.format === 'email') {
    return (
      <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
          <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-[8px]">
            <i className="fa-solid fa-envelope" />
          </div>
          <span className="text-[10px] text-zinc-500">Gelen Kutusu</span>
        </div>
        <div className="text-[10px] text-zinc-600">Konu: <span className="text-zinc-300 font-bold">{output.emailSubject}</span></div>
        <div className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{output.emailBody}</div>
        {renderVideoSection()}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-zinc-200">{output.title}</h4>
      <div className="flex items-center gap-2 text-[9px] text-zinc-500 mb-3">
        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{output.format}</span>
        <span>{output.target}</span>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/5 p-4">
        <p className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{output.script}</p>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/5 p-4">
        <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-2">Sosyal Medya Kopyası</p>
        <p className="text-[11px] text-zinc-300">{output.socialCopy}</p>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/5 p-4">
        <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold mb-2">E-posta</p>
        <p className="text-[10px] text-zinc-600">Konu: <span className="text-zinc-300">{output.emailSubject}</span></p>
        <p className="text-[11px] text-zinc-300 mt-1">{output.emailBody}</p>
      </div>
      {renderVideoSection()}
    </div>
  );
};
