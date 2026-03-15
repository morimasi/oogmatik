import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSuperTurkceStore } from '../../store';
import { MEB_CURRICULUM, GradeLevel } from '../../types';
import { generateDynamicMockData } from '../../../features/grid-pdf/mockDataGenerator';
import { getFormatsByCategory, getFormatById } from '../../../features/activity-formats/registry';

// FORMAT_REGISTRY artık modular registry'den geliyor; bu alan temizlendi.


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
        toggleActivityType
    } = useSuperTurkceStore();

    // Aktif kategoriye ait formatları modüler registry'den al
    const activeFormats = activeCategory ? getFormatsByCategory(activeCategory) : [];
    // Seçili format aktif ayarlar state'i — her format id'si için defaults'dan ayar değerleri tutar
    const [formatSettings, setFormatSettings] = useState<Record<string, Record<string, any>>>({});

    // Belirli bir format için bir ayarın değerini güncelle
    const updateFormatSetting = (formatId: string, key: string, value: any) => {
        setFormatSettings(prev => ({
            ...prev,
            [formatId]: { ...(prev[formatId] || {}), [key]: value }
        }));
    };

    // Bir format için tüm ayarları getir (yoksa defaults'dan doldur)
    const getSettingsFor = (formatId: string): Record<string, any> => {
        const formatDef = getFormatById(formatId);
        if (!formatDef) return {};
        const defaults: Record<string, any> = {};
        formatDef.settings.forEach(s => { defaults[s.key] = s.defaultValue; });
        return { ...defaults, ...(formatSettings[formatId] || {}) };
    };

    const currentCurriculum = selectedGrade ? MEB_CURRICULUM[selectedGrade as GradeLevel] : null;
    const currentUnit = currentCurriculum?.units.find((u: any) => u.id === selectedUnitId);

    const handleGenerate = () => {
        if (!selectedGrade || !selectedObjective) {
            alert('Lütfen önce müfredat (Sınıf, Tema ve Kazanım) ayarlarını tamamlayın.');
            return;
        }
        if (selectedActivityTypes.length === 0) {
            alert('Lütfen en az 1 adet Etkinlik/Soru Formatı seçin (Örn: Boşluk doldurma).');
            return;
        }

        // Faz 8: Draft'lara formatın kendi settings'i ve aktif UI ayarları gömülür
        const draftItems = selectedActivityTypes.map((type: string) => ({
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            type,
            settings: {
                difficulty,
                audience,
                engineMode,
                // Formata özel ultra ayarlar
                ...getSettingsFor(type)
            },
            data: null
        }));

        useSuperTurkceStore.getState().setDraftComponents(draftItems);

        alert(`🎉 HARİKA! Seçili formatlar eklendi: Toplam ${draftItems.length} taslak bileşeni oluşturuldu.\nMatbaa kalitesinde karma PDF (Okul Koridoru formatı) oluşturuluyor...`);

        // Faz 7: Dinamik & Müfredata Bağlı Mock (AI / Hızlı Motor)
        // 1.5 saniye sonra AI / Hızlı Motor verisi geliyormuş gibi yap, ama bu sefer DİNAMİK JSON olacak.
        setTimeout(() => {
            draftItems.forEach((draft: any) => {
                const dynamicData = generateDynamicMockData(
                    draft.type,
                    selectedGrade,
                    selectedObjective,
                    engineMode,
                    difficulty
                );
                useSuperTurkceStore.getState().updateDraftData(draft.id, dynamicData);
            });
        }, 1500);
    };

    return (
        <div className="w-[360px] h-full bg-white border-r border-slate-200 flex flex-col shadow-sm relative z-10">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-brand-500"></i>
                    Stüdyo Kontrolü
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                    Özelleştirilebilir Üretim Ağı
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">

                {/* 1. MÜFREDAT HEDEFLEME (4-8. Sınıf) */}
                <section className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">1. Müfredat & Kapsam</h3>

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={selectedGrade || ''}
                            onChange={(e) => setGrade(Number(e.target.value) as GradeLevel)}
                            className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-brand-500 transition-all font-medium"
                        >
                            <option value="" disabled>Sınıf</option>
                            <option value="4">4. Sınıf</option>
                            <option value="5">5. Sınıf</option>
                            <option value="6">6. Sınıf</option>
                            <option value="7">7. Sınıf</option>
                            <option value="8">8. Sınıf</option>
                        </select>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as any)}
                            className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-brand-500 transition-all font-medium"
                        >
                            <option value="kolay">Kolay Seviye</option>
                            <option value="orta">Orta Seviye</option>
                            <option value="zor">Zor Seviye</option>
                            <option value="lgs">Yeni Nesil (LGS)</option>
                        </select>
                    </div>

                    {selectedGrade && currentCurriculum && (
                        <select
                            value={selectedUnitId || ''}
                            onChange={(e) => setUnitId(e.target.value)}
                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-brand-500 transition-all font-medium"
                        >
                            <option value="" disabled>Tema / Alt Konu Alanı Seç</option>
                            {currentCurriculum.units.map((unit: any) => (
                                <option key={unit.id} value={unit.id}>{unit.title}</option>
                            ))}
                        </select>
                    )}

                    {selectedUnitId && currentUnit && (
                        <div className="space-y-2 mt-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Açık MEB Kazanımları</label>
                            <div className="bg-slate-50 rounded-xl p-2 max-h-40 overflow-y-auto border border-slate-100 space-y-1">
                                {currentUnit.objectives.map(objective => (
                                    <div
                                        key={objective.id}
                                        onClick={() => setObjective(objective)}
                                        className={`p-2.5 rounded-lg text-xs cursor-pointer transition-all border ${selectedObjective?.id === objective.id
                                            ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-sm'
                                            : 'bg-white border-transparent text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        <span className="font-bold opacity-70 block mb-0.5">{objective.id}</span>
                                        {objective.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* 2. ETKİNLİK MOTORLARI (10+ Format) */}
                <section className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex justify-between">
                        <span>2. Etkinlik Bileşenleri</span>
                        <span className="bg-brand-100 text-brand-600 px-2 rounded-full text-[10px] py-0.5">{activeFormats.length} Format</span>
                    </h3>

                    <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                        Bu stüdyoya özel hazırlanmış soru/etkinlik bileşenlerini çoklu seçerek kağıdınızın dizgisini tasarlayın.
                    </p>

                    <div className="grid grid-cols-1 gap-2">
                        {activeFormats.map(format => {
                            const isSelected = selectedActivityTypes.includes(format.id as any);
                            return (
                                <div key={format.id} className={`rounded-xl border transition-all overflow-hidden ${isSelected ? 'border-brand-500 bg-brand-50/30' : 'border-slate-200 bg-white hover:border-brand-300'}`}>
                                    <div
                                        onClick={() => toggleActivityType(format.id as any)}
                                        className="flex items-center gap-3 p-3 cursor-pointer"
                                    >
                                        <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30' : 'bg-slate-100 text-slate-500'}`}>
                                            <i className={`fa-solid ${format.icon} text-sm`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-brand-800' : 'text-slate-700'}`}>{format.label}</h4>
                                        </div>
                                        {/* Checkbox Icon */}
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300'}`}>
                                            {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
                                        </div>
                                    </div>

                                    {/* Ultra İnce Ayarlar (Sadece Seçiliyken Açılır) */}
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-3 pb-3 pt-1 border-t border-brand-200/50"
                                            >
                                                <div className="bg-white rounded-lg p-2.5 border border-brand-100 shadow-sm space-y-2">
                                                    <label className="text-[10px] font-bold text-brand-600 uppercase">🔧 Bu Motora Özel İnce Ayarlar</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {format.settings.map((setting, idx) => {
                                                            const currentVal = (formatSettings[format.id] || {})[setting.key] ?? setting.defaultValue;
                                                            return (
                                                                <div key={idx} className="flex flex-col gap-0.5 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded text-[10px] text-slate-600 w-full">
                                                                    <label className="font-semibold text-slate-500">{setting.label}</label>
                                                                    {/* type: toggle */}
                                                                    {setting.type === 'toggle' && (
                                                                        <button
                                                                            onClick={() => updateFormatSetting(format.id, setting.key, !currentVal)}
                                                                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${currentVal ? 'bg-brand-500' : 'bg-slate-300'
                                                                                }`}
                                                                        >
                                                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentVal ? 'translate-x-4' : 'translate-x-1'
                                                                                }`} />
                                                                        </button>
                                                                    )}
                                                                    {/* type: select */}
                                                                    {setting.type === 'select' && (
                                                                        <select
                                                                            value={String(currentVal)}
                                                                            onChange={e => updateFormatSetting(format.id, setting.key, e.target.value)}
                                                                            className="text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 text-slate-700 outline-none"
                                                                        >
                                                                            {(setting.options || []).map(opt => (
                                                                                <option key={opt} value={opt}>{opt}</option>
                                                                            ))}
                                                                        </select>
                                                                    )}
                                                                    {/* type: range or number */}
                                                                    {(setting.type === 'range' || setting.type === 'number') && (
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="range"
                                                                                min={setting.min ?? 1}
                                                                                max={setting.max ?? 10}
                                                                                step={setting.step ?? 1}
                                                                                value={Number(currentVal)}
                                                                                onChange={e => updateFormatSetting(format.id, setting.key, Number(e.target.value))}
                                                                                className="flex-1 h-1 accent-brand-500"
                                                                            />
                                                                            <span className="text-brand-600 font-bold w-4 text-center">{currentVal}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 3. MOTOR VE PEDAGOJİ AYARLARI */}
                <section className="space-y-3 pb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">3. Pedagoji & Kaynak</h3>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setEngineMode('fast')}
                            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${engineMode === 'fast'
                                ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <span className="text-sm font-bold">⚡️ Hızlı</span>
                            <span className="text-[9px] opacity-70">Hazır Veri</span>
                        </button>
                        <button
                            onClick={() => setEngineMode('ai')}
                            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${engineMode === 'ai'
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm border border-transparent'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <span className="text-sm font-bold">✨ AI Üretimi</span>
                            <span className="text-[9px] opacity-80">1 Jeton Düşer</span>
                        </button>
                    </div>

                    <select
                        value={audience}
                        onChange={(e) => setAudience(e.target.value as any)}
                        className="w-full h-10 px-3 bg-red-50 text-red-800 border-none rounded-xl text-sm outline-none cursor-pointer font-bold mt-2"
                    >
                        <option value="normal">🎓 Hedef Kitle: Normal Öğrenci</option>
                        <option value="hafif_disleksi">🧩 Hafif Disleksi Eğitimi</option>
                        <option value="derin_disleksi">⚠️ Derin Disleksi Eğitimi</option>
                    </select>

                </section>
            </div>

            {/* Sabit Footer: Üret Butonu */}
            <div className="p-5 border-t border-slate-200 bg-white">
                <button
                    onClick={handleGenerate}
                    className="w-full flex flex-col items-center justify-center py-3 bg-slate-900 hover:bg-black text-white rounded-xl shadow-xl transition-all hover:-translate-y-0.5 group"
                >
                    <div className="flex items-center gap-2 font-black tracking-wide">
                        <i className="fa-solid fa-layer-group text-brand-400 group-hover:scale-110 transition-transform"></i>
                        A4 KOMPAKT ÇIKTI ÜRET
                    </div>
                    <span className="text-[10px] text-slate-300 mt-1 font-semibold">{selectedActivityTypes.length} Farklı Etkinlik Şablonu İşlenecek</span>
                </button>
            </div>

        </div>
    );
};

export default Cockpit;
