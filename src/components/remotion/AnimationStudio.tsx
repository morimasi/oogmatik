import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { AnimationService } from '../../services/animationService';
import { NeuroProfileParamsType, AnimationPayloadType } from '../../utils/schemas';
import { DyslexiaSyllablePulse } from './templates/DyslexiaSyllablePulse';
import { AdhdZenMode } from './templates/AdhdZenMode';
import { DyscalculiaLiquidBars } from './templates/DyscalculiaLiquidBars';
import { Loader2, PlayCircle, Settings, BrainCircuit } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Oogmatik sisteminde toast uyarıları kullanılır.

export const AnimationStudio: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [animationData, setAnimationData] = useState<AnimationPayloadType | null>(null);

  // Mock Neuro-Profile for UI selection
  const [profile, setProfile] = useState<NeuroProfileParamsType>({
    profileType: 'dyslexia',
    ageGroup: '8-10',
    readingSpeed: 'normal',
    attentionSpan: 30,
  });

  const [prompt, setPrompt] = useState('Kelime: "Gökkuşağı". Hecelere ayrılacak.');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Lütfen bir animasyon istemi girin.');
      return;
    }

    setLoading(true);
    try {
      const result = await AnimationService.generateAnimationTimeline(prompt, profile);
      setAnimationData(result);
      toast.success('Animasyon zaman çizelgesi başarıyla üretildi!');
    } catch (error: any) {
      toast.error(error.message || 'Animasyon üretilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const renderPlayerContent = () => {
    if (!animationData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <PlayCircle className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-sans">Önizleme Almak İçin Bir Animasyon Üretin</p>
        </div>
      );
    }

    let SelectedTemplate;
    switch (profile.profileType) {
      case 'dyslexia':
        SelectedTemplate = DyslexiaSyllablePulse;
        break;
      case 'adhd':
        SelectedTemplate = AdhdZenMode;
        break;
      case 'dyscalculia':
        SelectedTemplate = DyscalculiaLiquidBars;
        break;
      default:
        SelectedTemplate = DyslexiaSyllablePulse;
    }

    // Ekrandaki max objeyi (ai'nin ürettiği cognitive load limitini) logluyoruz.
    console.log('[Klinik Kısıt] Ekranda Maksimum Obje:', animationData.cognitiveLoadParams.maxConcurrentObjects);

    return (
      <Player
        component={SelectedTemplate}
        inputProps={{ data: animationData }}
        durationInFrames={150} // Dinamik olarak hesaba katılabilir ama preview için sabitledik
        fps={30}
        compositionWidth={1280}
        compositionHeight={720}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
        }}
        controls
        loop
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-inter flex flex-col items-center justify-start">
      {/* HEADER */}
      <div className="max-w-7xl w-full mb-8 flex justify-between items-center pb-6 border-b border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
            <BrainCircuit className="text-cyan-400 w-8 h-8" />
            Oogmatik Animasyon Stüdyosu v2.0
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Ultra Premium Nöro-Adaptif Oynatıcı</p>
        </div>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SOL PANEL (Ayarlar) - DARK GLASSMORPHISM */}
        <div className="lg:col-span-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
            <Settings className="w-5 h-5 text-indigo-400" /> Profil ve İstek (AI Params)
          </h2>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-medium">Hedef Kitle (Profil)</label>
            <select
              value={profile.profileType}
              onChange={(e) => setProfile({ ...profile, profileType: e.target.value as any })}
              className="bg-slate-900 border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
              <option value="dyslexia">Disleksi (Kinetik Tipografi & Nabız)</option>
              <option value="adhd">DEHB (Zen Geçişleri & Düşük Yük)</option>
              <option value="dyscalculia">Diskalkuli (Likit Miktar Çubukları)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-medium">Klinik ZPD - Yaş Grubu</label>
            <select
              value={profile.ageGroup}
              onChange={(e) => setProfile({ ...profile, ageGroup: e.target.value as any })}
              className="bg-slate-900 border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
              <option value="5-7">5-7 Yaş (Okul Öncesi / 1. Sınıf)</option>
              <option value="8-10">8-10 Yaş (İlkokul)</option>
              <option value="11-13">11-13 Yaş (Ortaokul)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-medium">Animasyon Senaryosu</label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Örn: 3 ve 5'i toplayan bir uzay gemisi..."
              className="bg-slate-900 border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-auto relative overflow-hidden group bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-indigo-500/30"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Yaratılıyor...
              </span>
            ) : (
              'Zaman Çizelgesi Oluştur (AI)'
            )}
          </button>
        </div>

        {/* SAĞ PANEL (Remotion Player) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="w-full aspect-video bg-black/40 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
            {renderPlayerContent()}
          </div>

          {/* AI PEDAGOGICAL NOTE PANEL */}
          {animationData && (
            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-5 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Klinik Pedagojik Rapor
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-lexend">
                {animationData.pedagogicalNote}
              </p>
              <div className="flex gap-4 mt-4 pt-4 border-t border-indigo-500/20">
                <span className="text-xs font-mono text-cyan-400">
                  Nesne Yükü: {animationData.cognitiveLoadParams.maxConcurrentObjects} / 3 Max
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  Kalabalık Puanı (Crowding): {animationData.cognitiveLoadParams.visualCrowdingScore}/100
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
