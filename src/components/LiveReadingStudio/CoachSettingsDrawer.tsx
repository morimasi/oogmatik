import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Volume2, Sparkles, BookOpen, Clock, Eye } from 'lucide-react';
import { MascotType } from './EduMascot';

export interface CoachSettings {
  patienceThresholdSeconds: number; // 1.5, 3.0, 5.0
  scaffoldingLevel: 'hece' | 'kelime' | 'cumle';
  mascot: MascotType;
  fontSize: number; // 18 - 34
  isRulerActive: boolean;
  isSyllableColoringActive: boolean;
  isVoiceActive: boolean;
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
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-zinc-900/95 border-l border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-y-auto font-lexend text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Koç & Stüdyo Ayarları</h3>
                  <p className="text-xs text-zinc-400">Öğretmen ve Veli Özelleştirme Paneli</p>
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
              {/* 1. Sabır Penceresi (Grace Window) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Yardım Bekleme Süresi (Sabır Penceresi)</span>
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
                          : 'bg-zinc-800/60 border-white/5 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Çocuk duraksadığında koçun araya girmeden önce çocuğun zihinsel çözümleme yapmasına tanınan süre.
                </p>
              </div>

              {/* 2. Maskot Tercihi */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Okuma Arkadaşı Maskot</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'baykus', name: 'Bilge Baykuş' },
                    { id: 'kedi', name: 'Neşeli Kedi' },
                    { id: 'robot', name: 'Robot Can' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => onUpdateSettings({ mascot: m.id as MascotType })}
                      className={`py-2.5 px-2 text-xs rounded-xl border text-center transition-all ${
                        settings.mascot === m.id
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold'
                          : 'bg-zinc-800/60 border-white/5 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Yazı Boyutu (Lexend Font) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm font-semibold text-zinc-300">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Yazı Boyutu (Lexend)</span>
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="34"
                  step="2"
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* 4. Görsel Destek Araçları */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">
                  Bilişsel & Görsel Ergonomi
                </span>

                {/* Okuma Cetveli */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/40 border border-white/5 cursor-pointer hover:bg-zinc-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-teal-400" />
                    <div>
                      <span className="text-sm font-medium block">Görsel Okuma Cetveli</span>
                      <span className="text-xs text-zinc-500">Diğer satırları karartarak dikkati odaklar</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.isRulerActive}
                    onChange={(e) => onUpdateSettings({ isRulerActive: e.target.checked })}
                    className="w-5 h-5 rounded-md accent-teal-500 cursor-pointer"
                  />
                </label>

                {/* Renkli Hece Modu */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/40 border border-white/5 cursor-pointer hover:bg-zinc-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <div>
                      <span className="text-sm font-medium block">Renkli Hece Desteği</span>
                      <span className="text-xs text-zinc-500">Kelimeleri dönüşümlü renklerle heceler</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.isSyllableColoringActive}
                    onChange={(e) => onUpdateSettings({ isSyllableColoringActive: e.target.checked })}
                    className="w-5 h-5 rounded-md accent-rose-500 cursor-pointer"
                  />
                </label>

                {/* Sesli Koç Geri Bildirimi */}
                <label className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/40 border border-white/5 cursor-pointer hover:bg-zinc-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-sm font-medium block">Canlı Sesli Koç Yanıtları</span>
                      <span className="text-xs text-zinc-500">Koçun sesli konuşması ve fısıldaması</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.isVoiceActive}
                    onChange={(e) => onUpdateSettings({ isVoiceActive: e.target.checked })}
                    className="w-5 h-5 rounded-md accent-indigo-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-teal-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity"
              >
                Ayarları Kaydet ve Devam Et
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
