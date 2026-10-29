import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sliders,
  Volume2,
  Sparkles,
  BookOpen,
  Clock,
  Eye,
  VolumeX,
  ShieldCheck,
  FastForward,
  HeartHandshake
} from 'lucide-react';
import { MascotType } from './EduMascot';

export type ReadingMode = 'flow' | 'karaoke' | 'window';

export interface CoachSettings {
  patienceThresholdSeconds: number; // 1.5, 3.0, 5.0
  scaffoldingLevel: 'hece' | 'kelime' | 'cumle';
  mascot: MascotType;
  fontSize: number; // 18 - 36
  isRulerActive: boolean;
  isSyllableColoringActive: boolean;
  isVoiceActive: boolean;
  voiceSpeed: number; // 0.75, 0.88, 1.0, 1.15
  voicePitch: number; // 0.9, 1.12, 1.25
  phonologicalTolerance: 'strict' | 'balanced' | 'lenient';
  readingMode: ReadingMode;
  autoAdvanceOnSilence: boolean;
  celebrationFrequency: 'frequent' | 'normal' | 'minimal';
}

interface CoachSettingsDrawerProps {
  isOpen: boolean;
  settings: CoachSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<CoachSettings>) => void;
}

export const CoachSettingsDrawer: React.FC<CoachSettingsDrawerProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-zinc-950/95 border-l border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-y-auto font-lexend text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Koç & Stüdyo Ayarları</h3>
                  <p className="text-xs text-zinc-400">Tüm Parametreleri Anında Canlıya Yansıtır</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6">
              {/* 1. Okuma Sahnesi Modu (Flow / Karaoke / Sarı Kitap Pencere) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Eye className="w-4 h-4 text-teal-400" />
                  <span>Okuma Sahnesi Görünümü</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'flow', label: 'Doğal Akış', desc: 'Kitap Sayfası' },
                    { id: 'karaoke', label: 'Karaoke', desc: 'Geniş & Canlı' },
                    { id: 'window', label: 'Sarı Kitap Pencere', desc: '0 Görsel Yük' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onUpdateSettings({ readingMode: m.id as ReadingMode })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settings.readingMode === m.id
                          ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold shadow-md'
                          : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="text-xs">{m.label}</div>
                      <div className="text-[9px] text-zinc-500 font-normal">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Sabır Penceresi (Grace Window) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm font-semibold text-zinc-300">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Zihinsel Çözümleme Süresi (Sabır Penceresi)</span>
                  </span>
                  <span className="text-xs text-amber-300 font-mono font-bold">{settings.patienceThresholdSeconds}s</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 1.5, label: '1.5 sn (Hızlı)' },
                    { val: 3.0, label: '3.0 sn (Dengeli)' },
                    { val: 5.0, label: '5.0 sn (Sabırlı)' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => onUpdateSettings({ patienceThresholdSeconds: item.val })}
                      className={`py-2 px-2 text-xs rounded-xl border text-center transition-all ${
                        settings.patienceThresholdSeconds === item.val
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Çocuk duraksadığında koçun araya girmeden önce çocuğun kendi beyninde kelimeyi çözmesine (decoding) tanıdığı süre.
                </p>
              </div>

              {/* 3. Fonolojik Tolerans Seviyesi */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Fonolojik Hata Toleransı</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'strict', label: 'Birebir Net', desc: 'Tam Doğru Telaffuz' },
                    { id: 'balanced', label: 'Dengeli', desc: '1 Harf Toleransı' },
                    { id: 'lenient', label: 'Özgüven Modu', desc: 'Yüksek Hoşgörü' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ phonologicalTolerance: t.id as any })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settings.phonologicalTolerance === t.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                          : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="text-xs">{t.label}</div>
                      <div className="text-[9px] text-zinc-500 font-normal">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. İskele Kurma Seviyesi (Scaffolding Level) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Kademeli İskele Kurma (Scaffolding)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'hece', label: 'İlk Hece', desc: 'ha-...' },
                    { id: 'kelime', label: 'Tüm Heceleme', desc: 'ha-li-fe' },
                    { id: 'cumle', label: 'Akıcı Model', desc: 'Cümle Vurgusu' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onUpdateSettings({ scaffoldingLevel: s.id as any })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settings.scaffoldingLevel === s.id
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold'
                          : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="text-xs">{s.label}</div>
                      <div className="text-[9px] text-zinc-500 font-normal">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Maskot Tercihi */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Okuma Arkadaşı Maskot</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'baykus', name: 'Bilge Baykuş', desc: 'Sakin & Bilge' },
                    { id: 'kedi', name: 'Neşeli Kedi', desc: 'Sevimli & Neşeli' },
                    { id: 'robot', name: 'Robot Can', desc: 'Meraklı & Zeki' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onUpdateSettings({ mascot: m.id as MascotType })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        settings.mascot === m.id
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                          : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-850'
                      }`}
                    >
                      <div className="text-xs">{m.name}</div>
                      <div className="text-[9px] text-zinc-500 font-normal">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Koç Ses Ayarları (Sesli Fısıldama / Hız / Perde) */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                    {settings.isVoiceActive ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                    <span>Koç Sesli Fısıldama (TTS)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.isVoiceActive}
                    onChange={(e) => onUpdateSettings({ isVoiceActive: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                {settings.isVoiceActive && (
                  <div className="grid grid-cols-2 gap-3 pl-2">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Konuşma Hızı</span>
                        <span className="font-mono text-emerald-400">{settings.voiceSpeed}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.75"
                        max="1.15"
                        step="0.05"
                        value={settings.voiceSpeed}
                        onChange={(e) => onUpdateSettings({ voiceSpeed: Number(e.target.value) })}
                        className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Ses Tonu (Perde)</span>
                        <span className="font-mono text-emerald-400">{settings.voicePitch}</span>
                      </div>
                      <input
                        type="range"
                        min="0.9"
                        max="1.3"
                        step="0.05"
                        value={settings.voicePitch}
                        onChange={(e) => onUpdateSettings({ voicePitch: Number(e.target.value) })}
                        className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Otomatik İlerleme ve Kutlama Sıklığı */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-zinc-300 block">Sessizlikte Kendiliğinden İlerle (Auto-Advance)</span>
                    <span className="text-[11px] text-zinc-500 block">Öğrenci 2 kez takıldığında koç kelimeyi okur ve devam eder</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoAdvanceOnSilence}
                    onChange={(e) => onUpdateSettings({ autoAdvanceOnSilence: e.target.checked })}
                    className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                    <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
                    <span>Övgü ve Kutlama Sıklığı</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'frequent', label: 'Sık (Her 3 kelime)' },
                      { id: 'normal', label: 'Normal (Her 6 kelime)' },
                      { id: 'minimal', label: 'Cümle Sonunda' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => onUpdateSettings({ celebrationFrequency: f.id as any })}
                        className={`p-2 rounded-xl border text-center text-xs transition-all ${
                          settings.celebrationFrequency === f.id
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                            : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-850'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 8. Görsel & Font Ayarları */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-sm font-semibold text-zinc-300">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Yazı Boyutu (Lexend Font)</span>
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="36"
                  step="2"
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-zinc-350">Disleksi Hece Renklendirme (Pastel Hece Ayrımı)</span>
                  <input
                    type="checkbox"
                    checked={settings.isSyllableColoringActive}
                    onChange={(e) => onUpdateSettings({ isSyllableColoringActive: e.target.checked })}
                    className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-350">Odak Cetveli (Uzak Kelimeleri Karart)</span>
                  <input
                    type="checkbox"
                    checked={settings.isRulerActive}
                    onChange={(e) => onUpdateSettings({ isRulerActive: e.target.checked })}
                    className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
