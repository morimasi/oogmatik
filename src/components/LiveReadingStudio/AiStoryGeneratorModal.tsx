import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, BookOpen, Layers, Target, Compass, Wand2 } from 'lucide-react';
import { AIStoryConfig, AIReadingStoryService } from '../../services/aiReadingStoryService';
import { ReadingPassage } from './sampleStories';
import { MascotType } from './EduMascot';

interface AiStoryGeneratorModalProps {
  isOpen: boolean;
  currentMascot: MascotType;
  onClose: () => void;
  onStoryGenerated: (passage: ReadingPassage) => void;
}

const PRESET_THEMES = [
  '🐾 Sevimli Hayvanlar & Orman',
  '🚀 Uzay, Gezegenler & Yıldızlar',
  '🤖 Küçük Mucit Can & Robotlar',
  '🌊 Denizaltı & Mavi Okyanus',
  '⚽ Park, Spor & Neşeli Oyunlar',
  '🦕 Dinozorlar Çağı',
  '🏰 Gizemli Kale & Dostluk',
  '🎨 Renkli Boyalar & Sihirli Fırça',
];

export const AiStoryGeneratorModal: React.FC<AiStoryGeneratorModalProps> = ({
  isOpen,
  currentMascot,
  onClose,
  onStoryGenerated,
}) => {
  const [config, setConfig] = useState<AIStoryConfig>({
    ageGroup: '7-9',
    gradeLevel: '2',
    phonologicalFocus: 'mirror_letters',
    length: 'orta',
    theme: '🐾 Sevimli Hayvanlar & Orman',
    customTopic: '',
    mascotTone: currentMascot,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generatedPassage = await AIReadingStoryService.generateCustomStory(config);
      onStoryGenerated(generatedPassage);
      onClose();
    } catch {
      // Hata durumunda dahi AIReadingStoryService fallback döndürür
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="w-full max-w-2xl rounded-[2.5rem] bg-zinc-950/95 border border-white/10 p-6 sm:p-8 shadow-2xl font-lexend text-white relative my-6 max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    <span>AI İLE KİŞİSELLEŞTİRİLMİŞ HİKAYE ÜRETİCİ</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Canlı Koç Entegre
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Öğrencinin yaşına, hece zorluğuna ve ilgi alanına göre saniyeler içinde benzersiz okuma metni
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-5">
              {/* 1. Yaş ve Sınıf Seviyesi */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sınıf ve Yaş Seviyesi (ZPD Uyumu)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { grade: '1', age: '5-7', label: '1. Sınıf (5-7 Yaş)' },
                    { grade: '2', age: '7-9', label: '2. Sınıf (7-9 Yaş)' },
                    { grade: '3', age: '9-11', label: '3. Sınıf (9-11 Yaş)' },
                    { grade: '4', age: '9-11', label: '4. Sınıf (9-11 Yaş)' },
                    { grade: '5-8', age: '11-14', label: '5-8. Sınıf (LGS)' },
                  ].map((item) => (
                    <button
                      key={item.grade}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          gradeLevel: item.grade as any,
                          ageGroup: item.age as any,
                        }))
                      }
                      className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                        config.gradeLevel === item.grade
                          ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-md font-bold'
                          : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Fonolojik Odak / Hece Yapısı */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hedef Fonolojik / Hece Zorluğu</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'mirror_letters', title: 'b / d / p Ayna Harfler', desc: 'Yön algısı ve harf karışıklığı odağı' },
                    { id: 'simple_syllables', title: 'Temel Açık Hece (2 Heceli)', desc: 'Kolay birleştirme ve özgüven inşası' },
                    { id: 'blend_syllables', title: 'Ünsüz Kümeleri & Ters Hece', desc: 'sp, tr, kr gibi zorlu sessiz harf öbekleri' },
                    { id: 'morphological_suffixes', title: 'Ekler & Çekim Ekleri', desc: '-ler, -de, -den eklerini doğru okuma' },
                    { id: 'multi_syllable', title: '3-4 Heceli Zengin Sözcükler', desc: 'Uzun kelimeler ve sözcük dağarcığı' },
                    { id: 'fluency_speed', title: 'Akıcı Hızlı Okuma (WCPM)', desc: 'Hız, prozodi ve noktalama takibi' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, phonologicalFocus: p.id as any }))}
                      className={`p-3 rounded-2xl text-left border transition-all flex flex-col ${
                        config.phonologicalFocus === p.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                          : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      <span className="text-xs text-white">{p.title}</span>
                      <span className="text-[10px] text-zinc-400 font-normal mt-0.5">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Metin Uzunluğu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>Metin Uzunluğu</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'kisa', label: 'Kısa (18-25 Kelime)', desc: 'Özgüven & Isınma' },
                    { id: 'orta', label: 'Orta (35-50 Kelime)', desc: 'Standart Seans' },
                    { id: 'uzun', label: 'Gelişmiş (65-85 Kelime)', desc: 'İleri Akıcılık' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, length: l.id as any }))}
                      className={`p-2.5 rounded-xl text-center border text-xs transition-all ${
                        config.length === l.id
                          ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold'
                          : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      <div>{l.label}</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5 font-normal">{l.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Hikaye Teması & Özel İlgi Alanı */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hikaye Teması / Öğrencinin İlgi Alanı</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_THEMES.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, theme, customTopic: '' }))}
                      className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${
                        config.theme === theme && !config.customTopic
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                          : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-900'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={config.customTopic || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, customTopic: e.target.value }))}
                  placeholder="Veya çocuğun özel hobisini yazın (örn: Lego parçaları, uzay gemisi tamiri, köpek yavrusu...)"
                  className="w-full text-xs p-3 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Footer & Generate Button */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="py-3 px-5 rounded-2xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-400 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Gemini AI Hikayeyi Yazıyor ve Heceliyor...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Benzersiz Hikaye Üret ve Okumaya Başla</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
