import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, BookOpen, Star, Sparkles, Filter, Check } from 'lucide-react';
import { SAMPLE_READING_PASSAGES, ReadingPassage } from './sampleStories';
import { useStudentStore } from '../../store/useStudentStore';

interface PassageLibraryModalProps {
  isOpen: boolean;
  selectedPassageId: string;
  onClose: () => void;
  onSelectPassage: (passage: ReadingPassage) => void;
}

export const PassageLibraryModal: React.FC<PassageLibraryModalProps> = ({
  isOpen,
  selectedPassageId,
  onClose,
  onSelectPassage,
}) => {
  const { activeStudent } = useStudentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');

  const studentGradeNum = activeStudent?.grade ? activeStudent.grade.replace(/[^0-9]/g, '') : null;

  const filteredPassages = useMemo(() => {
    return SAMPLE_READING_PASSAGES.filter((p) => {
      // Metin arama
      if (searchQuery.trim()) {
        const q = searchQuery.toLocaleLowerCase('tr-TR');
        const matchTitle = p.title.toLocaleLowerCase('tr-TR').includes(q);
        const matchSkill = p.targetSkill.toLocaleLowerCase('tr-TR').includes(q);
        const matchText = p.text.toLocaleLowerCase('tr-TR').includes(q);
        if (!matchTitle && !matchSkill && !matchText) return false;
      }

      // Sınıf filtresi
      if (selectedGradeFilter !== 'all') {
        if (!p.level.toLowerCase().includes(selectedGradeFilter)) return false;
      }

      // Zorluk filtresi
      if (selectedDifficultyFilter !== 'all') {
        if (p.difficultyRating.toString() !== selectedDifficultyFilter) return false;
      }

      return true;
    });
  }, [searchQuery, selectedGradeFilter, selectedDifficultyFilter]);

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
            className="w-full max-w-4xl rounded-[2.5rem] bg-zinc-950/95 border border-white/10 p-6 sm:p-8 shadow-2xl font-lexend text-white relative my-6 max-h-[92vh] overflow-y-auto flex flex-col"
          >
            {/* Üst Başlık */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    <span>OKUMA METİNLERİ KÜTÜPHANESİ</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {SAMPLE_READING_PASSAGES.length} Kademeli Metin
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Öğrencinin ZPD seviyesine, fonolojik hece yapısına ve kelime dağarcığına göre metin seçin
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Arama ve Filtreler */}
            <div className="py-4 space-y-3 border-b border-white/10 flex-shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Metin adı, kazanım veya kelime ara..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900 border border-white/10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              {/* Hızlı Filtre Butonları */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-zinc-500 text-[11px] font-semibold flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Sınıf:
                </span>
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: '1', label: '1. Sınıf' },
                  { id: '2', label: '2. Sınıf' },
                  { id: '3', label: '3. Sınıf' },
                  { id: '4', label: '4. Sınıf' },
                  { id: 'ileri', label: '5-8. Sınıf' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedGradeFilter(f.id)}
                    className={`px-3 py-1 rounded-xl font-bold transition-all ${
                      selectedGradeFilter === f.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}

                <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

                <span className="text-zinc-500 text-[11px] font-semibold hidden sm:inline">Zorluk:</span>
                {[
                  { id: 'all', label: 'Tüm Zorluklar' },
                  { id: '1', label: '★ Kolay' },
                  { id: '2', label: '★★ Orta' },
                  { id: '3', label: '★★★ İleri' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDifficultyFilter(d.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      selectedDifficultyFilter === d.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Metin Kartları Izgarası */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 overflow-y-auto flex-1 pr-1">
              {filteredPassages.length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-500 text-sm">
                  Arama kriterlerine uygun okuma metni bulunamadı.
                </div>
              ) : (
                filteredPassages.map((passage) => {
                  const isSelected = passage.id === selectedPassageId;
                  const isRecommended = studentGradeNum && passage.level.includes(studentGradeNum);

                  return (
                    <div
                      key={passage.id}
                      onClick={() => {
                        onSelectPassage(passage);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                          : 'bg-zinc-900/60 hover:bg-zinc-900 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div>
                        {/* Rozetler */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {passage.targetSkill}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isRecommended && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Öğrenci Seviyesi
                              </span>
                            )}
                            <div className="flex items-center text-amber-400 text-xs">
                              {Array.from({ length: passage.difficultyRating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Başlık */}
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors mb-1">
                          {passage.title}
                        </h4>

                        {/* Metin Önizlemesi */}
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                          "{passage.text}"
                        </p>
                      </div>

                      {/* Alt Bilgiler */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-500">
                        <span>{passage.level}</span>
                        <span className="font-medium text-zinc-400">
                          {passage.words.length} Kelime · {passage.comprehensionQuestions?.length || 0} Soru
                        </span>
                        {isSelected && (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                            <Check className="w-3 h-3" /> Seçili
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
