import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSuperTurkceStore } from '../../store';
import { MEB_CURRICULUM, GradeLevel } from '../../types';
import { generateDynamicMockData } from '../../../features/grid-pdf/mockDataGenerator';
import { getFormatsByCategory, getFormatById } from '../../../features/activity-formats/registry';
import { SuperTypography, SuperButton, SuperBadge, SuperInput } from '../../../shared/ui/atoms';
import { SettingWidget, ActionRow } from '../../../shared/ui/molecules';

const Cockpit: React.FC = () => {
  const {
    activeCategory,
    selectedGrade,
    setGrade,
    selectedUnitId,
    setUnitId,
    selectedObjective,
    setObjective,
    engineMode,
    setEngineMode,
    audience,
    setAudience,
    difficulty,
    setDifficulty,
    selectedActivityTypes,
    toggleActivityType,
    studentSelection,
    setStudentSelection,
    selectedStudentId,
    setSelectedStudentId,
    manualStudentName,
    manualStudentClass,
    setManualStudentInfo,
    students
  } = useSuperTurkceStore();

  const activeFormats = activeCategory ? getFormatsByCategory(activeCategory) : [];
  const [formatSettings, setFormatSettings] = useState<Record<string, Record<string, any>>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const updateFormatSetting = (formatId: string, key: string, value: any) => {
    setFormatSettings((prev) => ({
      ...prev,
      [formatId]: { ...(prev[formatId] || {}), [key]: value },
    }));
  };

  const getSettingsFor = (formatId: string): Record<string, any> => {
    const formatDef = getFormatById(formatId);
    if (!formatDef) return {};
    const defaults: Record<string, any> = {};
    formatDef.settings.forEach((s) => {
      defaults[s.key] = s.defaultValue;
    });
    return { ...defaults, ...(formatSettings[formatId] || {}) };
  };

  const currentCurriculum = selectedGrade ? MEB_CURRICULUM[selectedGrade as GradeLevel] : null;
  const currentUnit = currentCurriculum?.units.find((u: any) => u.id === selectedUnitId);

  // Ünite veya hedef değiştiğinde eski üretimi temizle (Kullanıcının isteği üzerine)
  React.useEffect(() => {
    if (selectedObjective) {
      useSuperTurkceStore.getState().setDraftComponents([]);
    }
  }, [selectedObjective, selectedGrade]);

  const handleGenerate = async () => {
    if (!selectedGrade || !selectedObjective) {
      return;
    }
    if (selectedActivityTypes.length === 0) {
      return;
    }

    setIsGenerating(true);

    try {
      const draftItems = selectedActivityTypes.map((type: string) => ({
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        type,
        settings: {
          difficulty,
          audience,
          engineMode,
          ...getSettingsFor(type),
        },
        data: null,
      }));

      useSuperTurkceStore.getState().setDraftComponents(draftItems);

      await Promise.all(
        draftItems.map(async (draft: any) => {
          const dynamicData = await generateDynamicMockData(
            draft.type,
            selectedGrade,
            selectedObjective,
            engineMode,
            difficulty,
            audience,
            draft.settings
          );
          useSuperTurkceStore.getState().updateDraftData(draft.id, dynamicData);
        })
      );

      const updatedDrafts = useSuperTurkceStore.getState().draftComponents;
      useSuperTurkceStore
        .getState()
        .saveToArchive(selectedGrade, selectedObjective.title, engineMode, updatedDrafts);
    } catch (error: any) {
      console.error('Üretim hatası:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedStudent = students.find((s: Student) => s.id === selectedStudentId);

  return (
    <div className="w-[380px] h-full bg-[#0a0a0b] border-r border-white/5 flex flex-col shadow-2xl relative z-20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-[#121214]/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
          </div>
          <div>
            <SuperTypography variant="h4" weight="extrabold">Stüdyo Kontrolü</SuperTypography>
            <SuperTypography variant="caption" color="muted" weight="semibold" className="uppercase tracking-[0.2em] text-[9px]">
              Elite Production Node
            </SuperTypography>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

        {/* 0. ÖĞRENCİ YÖNETİMİ (Yeni) */}
        <SettingWidget
          label="Öğrenci Yönetimi"
          description="Materyal kime özel üretilecek?"
          icon={<i className="fa-solid fa-user-graduate"></i>}
        >
          <div className="space-y-4">
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5">
              {[
                { id: 'existing', label: 'Mevcut', icon: 'fa-list-ul' },
                { id: 'manual', label: 'Manuel', icon: 'fa-pen-to-square' },
                { id: 'blank', label: 'Boş', icon: 'fa-square' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setStudentSelection(option.id as any)}
                  className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg transition-all ${studentSelection === option.id ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <i className={`fa-solid ${option.icon} text-[10px] mb-1`}></i>
                  <span className="text-[10px] font-bold uppercase">{option.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {studentSelection === 'existing' && (
                <motion.div
                  key="existing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <select
                    value={selectedStudentId || ''}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>Öğrenci Seçin</option>
                    {students.map((s: Student) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                    ))}
                  </select>
                  {selectedStudent && (
                    <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-200">{selectedStudent.name}</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-mono">{selectedStudent.className} / {selectedStudent.grade}. Sınıf</span>
                      </div>
                      <SuperBadge variant="glass" size="sm">Seçildi</SuperBadge>
                    </div>
                  )}
                </motion.div>
              )}

              {studentSelection === 'manual' && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <SuperInput
                    placeholder="İsim Soyisim"
                    value={manualStudentName}
                    onChange={(val) => setManualStudentInfo(val, manualStudentClass)}
                    className="col-span-1"
                  />
                  <SuperInput
                    placeholder="Sınıf (Örn: 4-A)"
                    value={manualStudentClass}
                    onChange={(val) => setManualStudentInfo(manualStudentName, val)}
                    className="col-span-1"
                  />
                </motion.div>
              )}

              {studentSelection === 'blank' && (
                <motion.div
                  key="blank"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center"
                >
                  <SuperTypography variant="caption" color="muted">
                    İsim alanı boş bırakılacak, el yazısı ile doldurulabilir.
                  </SuperTypography>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SettingWidget>

        {/* 1. MÜFREDAT HEDEFLEME */}
        <SettingWidget
          label="Kapsam & Zorluk"
          description="Müfredat kazanımı ve materyal seviyesi"
          icon={<i className="fa-solid fa-graduation-cap"></i>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Sınıf</label>
                <select
                  value={selectedGrade || ''}
                  onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>Seç</option>
                  {[4, 5, 6, 7, 8].map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Zorluk</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  <option value="kolay">Kolay</option>
                  <option value="orta">Orta</option>
                  <option value="zor">Zor</option>
                  <option value="lgs">LGS (Yeni Nesil)</option>
                </select>
              </div>
            </div>

            {selectedGrade && currentCurriculum && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Tema / Ünite</label>
                <select
                  value={selectedUnitId || ''}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>Ünite Seçin</option>
                  {currentCurriculum.units.map((u: any) => <option key={u.id} value={u.id}>{u.title}</option>)}
                </select>
              </div>
            )}

            {selectedUnitId && currentUnit && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 flex justify-between">
                  <span>Hedef Kazanımlar</span>
                  <span className="text-zinc-600">{currentUnit.objectives.length} Kayıt</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {currentUnit.objectives.map((obj: any) => {
                    const isSelected = selectedObjective?.id === obj.id;
                    return (
                      <div
                        key={obj.id}
                        onClick={() => setObjective(obj)}
                        className={`
                                        p-3 rounded-xl border text-xs cursor-pointer transition-all
                                        ${isSelected ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-transparent border-white/5 text-zinc-400 hover:border-white/10'}
                                    `}
                      >
                        <div className="font-bold opacity-60 mb-1">{obj.id}</div>
                        <div className="leading-relaxed">{obj.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </SettingWidget>

        {/* 2. ETKİNLİK MOTORLARI */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <SuperTypography variant="caption" weight="bold" className="uppercase tracking-widest text-zinc-500 italic">
              2. Üretim Matrisleri
            </SuperTypography>
            <SuperBadge variant="glass">{activeFormats.length} Moül</SuperBadge>
          </div>

          <div className="space-y-3">
            {activeFormats.map(format => {
              const isSelected = selectedActivityTypes.includes(format.id as any);
              return (
                <div key={format.id} className="space-y-2">
                  <ActionRow
                    title={format.label}
                    description="AI destekli şablon"
                    icon={<i className={`fa-solid ${format.icon}`}></i>}
                    onClick={() => toggleActivityType(format.id as any)}
                    className={isSelected ? 'border-indigo-500/50 bg-indigo-500/5' : ''}
                    action={
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-700'}`}>
                        {isSelected && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                      </div>
                    }
                  />

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 pr-1"
                      >
                        <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 space-y-4 shadow-inner">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            <SuperTypography variant="caption" weight="bold" className="text-[10px] text-indigo-400 uppercase">
                              Motor İnce Ayarları
                            </SuperTypography>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            {format.settings.map((setting, sIdx) => {
                              const currentVal = (formatSettings[format.id] || {})[setting.key] ?? setting.defaultValue;
                              return (
                                <div key={sIdx} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <SuperTypography variant="caption" color="secondary" weight="semibold">
                                      {setting.label}
                                    </SuperTypography>
                                    <span className="text-[10px] font-mono text-indigo-400 opacity-60">
                                      {currentVal}
                                    </span>
                                  </div>

                                  {setting.type === 'range' && (
                                    <input
                                      type="range"
                                      min={setting.min || 1}
                                      max={setting.max || 10}
                                      value={currentVal}
                                      onChange={(e) => updateFormatSetting(format.id, setting.key, Number(e.target.value))}
                                      className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-full appearance-none transition-all"
                                    />
                                  )}

                                  {setting.type === 'toggle' && (
                                    <button
                                      onClick={() => updateFormatSetting(format.id, setting.key, !currentVal)}
                                      className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${currentVal ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-transparent border-zinc-800 text-zinc-500'}`}
                                    >
                                      <span className="text-[11px] font-bold uppercase">{currentVal ? 'Aktif' : 'Pasif'}</span>
                                      <i className={`fa-solid ${currentVal ? 'fa-toggle-on' : 'fa-toggle-off'} text-lg`}></i>
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>

        {/* 3. ENGINE SELECTION */}
        <SettingWidget
          label="Zekâ & Pedagoji"
          description="Üretim motoru ve hedef kitle tercihi"
          icon={<i className="fa-solid fa-microchip"></i>}
        >
          <div className="space-y-4">
            <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-white/5 shadow-inner">
              <button
                onClick={() => setEngineMode('fast')}
                className={`
                            flex-1 py-3 px-4 rounded-xl text-center transition-all duration-500 flex flex-col items-center gap-0.5
                            ${engineMode === 'fast' ? 'bg-[#1a1a1c] text-white shadow-xl shadow-black/40 ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-300'}
                        `}
              >
                <i className="fa-solid fa-bolt-lightning text-amber-500 text-xs mb-1"></i>
                <span className="text-xs font-bold leading-none">Hızlı</span>
                <span className="text-[9px] opacity-40 uppercase tracking-tighter">Algoritmik</span>
              </button>
              <button
                onClick={() => setEngineMode('ai')}
                className={`
                            flex-1 py-3 px-4 rounded-xl text-center transition-all duration-500 flex flex-col items-center gap-0.5
                            ${engineMode === 'ai' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}
                        `}
              >
                <i className="fa-solid fa-wand-magic-sparkles text-indigo-200 text-xs mb-1"></i>
                <span className="text-xs font-bold leading-none">AI Üretimi</span>
                <span className="text-[9px] opacity-60 uppercase tracking-tighter">Gemini 2.0</span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Pedagojik Mod</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                className={`
                            w-full h-10 px-3 border rounded-xl text-xs outline-none font-bold transition-all
                            ${audience === 'normal' ? 'bg-zinc-800/50 border-zinc-700 text-zinc-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-400 ring-4 ring-rose-500/5'}
                        `}
              >
                <option value="normal">Standart (MEB Uyumlu)</option>
                <option value="hafif_disleksi">Hafif Disleksi Desteği</option>
                <option value="derin_disleksi">Yoğun Disleksi Desteği</option>
              </select>
            </div>
          </div>
        </SettingWidget>

      </div>

      {/* Production Button Footer */}
      <div className="p-6 border-t border-white/5 bg-[#121214]/80 backdrop-blur-xl">
        <SuperButton
          variant="primary"
          size="lg"
          className="w-full !rounded-2xl"
          isLoading={isGenerating}
          disabled={selectedActivityTypes.length === 0}
          onClick={handleGenerate}
          leftIcon={!isGenerating && <i className="fa-solid fa-layer-group text-indigo-200"></i>}
        >
          {isGenerating ? 'KOMPAKT TASLAK OLUŞTURULUYOR' : 'A4 TASLAK ÜRETİMİNİ BAŞLAT'}
        </SuperButton>
        <div className="text-center mt-3 scale-95 opacity-60">
          <SuperTypography variant="caption" color="muted" weight="semibold" className="uppercase tracking-[0.1em] text-[8px]">
            {isGenerating ? 'AI Nöronları Ateşleniyor...' : `${selectedActivityTypes.length} Farklı Modül Hazırlandı`}
          </SuperTypography>
        </div>
      </div>
    </div>
  );
};

export default Cockpit;
