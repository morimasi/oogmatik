import React, { useState } from 'react';
import { AdOutput } from '../../../types/adStudio';
import { auditAdContent } from '../../../services/adComplianceAuditor';

interface AdLiveEditorProps {
  output: AdOutput;
  onSave: (updated: AdOutput) => void;
  onClose: () => void;
}

export const AdLiveEditor: React.FC<AdLiveEditorProps> = ({ output, onSave, onClose }) => {
  const [title, setTitle] = useState(output.title);
  const [socialCopy, setSocialCopy] = useState(output.socialCopy);
  const [emailSubject, setEmailSubject] = useState(output.emailSubject);
  const [emailBody, setEmailBody] = useState(output.emailBody);
  const [script, setScript] = useState(output.script);
  const [scenes, setScenes] = useState(output.scenes);
  const [activeTab, setActiveTab] = useState<'main' | 'scenes' | 'social' | 'email'>('main');

  const handleSceneChange = (index: number, field: 'visualDesc' | 'voiceover' | 'textOverlay', value: string) => {
    setScenes(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = () => {
    const updatedScore = auditAdContent(`${script} ${socialCopy} ${emailBody}`, title);
    const updated: AdOutput = {
      ...output,
      title,
      socialCopy,
      emailSubject,
      emailBody,
      script,
      scenes,
      score: updatedScore,
      updatedAt: new Date().toISOString(),
      version: output.version + 1,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-[2rem] bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
              <i className="fa-solid fa-pen-to-square" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Canlı Reklam Düzenleyici</h3>
              <p className="text-[10px] text-zinc-400">Reklam metinlerini ve sahne detaylarını doğrudan özelleştirin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1 p-2 bg-black/40 border-b border-white/5 overflow-x-auto">
          {[
            { id: 'main', label: 'Genel & Senaryo', icon: 'fa-file-lines' },
            { id: 'scenes', label: `Sahneler (${scenes.length})`, icon: 'fa-clapperboard' },
            { id: 'social', label: 'Sosyal Medya', icon: 'fa-hashtag' },
            { id: 'email', label: 'E-posta', icon: 'fa-envelope' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'main' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Reklam Başlığı
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500/40"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Tam Video Senaryosu (Hook, Problem, Çözüm, CTA)
                </label>
                <textarea
                  rows={8}
                  value={script}
                  onChange={e => setScript(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500/40 leading-relaxed font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === 'scenes' && (
            <div className="space-y-4">
              {scenes.map((scene, idx) => (
                <div key={scene.sceneNo} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-400">Sahne {scene.sceneNo} ({scene.duration}s)</span>
                  </div>

                  <div>
                    <label className="text-[9px] text-zinc-500 block mb-0.5">Görsel / Kamera Açıklaması</label>
                    <input
                      type="text"
                      value={scene.visualDesc}
                      onChange={e => handleSceneChange(idx, 'visualDesc', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-white/5 text-zinc-200 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-zinc-500 block mb-0.5">🎙️ Seslendirme Metni</label>
                    <textarea
                      rows={2}
                      value={scene.voiceover}
                      onChange={e => handleSceneChange(idx, 'voiceover', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-white/5 text-zinc-200 text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-zinc-500 block mb-0.5">Ekranda Görünecek Yazı (Text Overlay)</label>
                    <input
                      type="text"
                      value={scene.textOverlay}
                      onChange={e => handleSceneChange(idx, 'textOverlay', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-white/5 text-zinc-200 text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Sosyal Medya Paylaşım Metni
                </label>
                <textarea
                  rows={6}
                  value={socialCopy}
                  onChange={e => setSocialCopy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500/40 leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  E-posta Konu Başlığı
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500/40"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  E-posta Gövde Metni
                </label>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500/40 leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-white/10 bg-black/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white text-xs font-bold transition-all"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg"
          >
            <i className="fa-solid fa-check" />
            Değişiklikleri Kaydet (v{output.version + 1})
          </button>
        </div>
      </div>
    </div>
  );
};
