import React from 'react';
import { useSuperTurkceStore } from '../../store';
import { MEB_CURRICULUM, GradeLevel } from '../../types';

const Cockpit: React.FC = () => {
    const {
        selectedGrade,
        setGrade,
        selectedUnitId,
        setUnitId,
        selectedObjective,
        setObjective
    } = useSuperTurkceStore();

    const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGrade(Number(e.target.value) as GradeLevel);
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUnitId(e.target.value);
    };

    const currentCurriculum = selectedGrade ? MEB_CURRICULUM[selectedGrade as GradeLevel] : null;
    const currentUnit = currentCurriculum?.units.find((u: any) => u.id === selectedUnitId);

    return (
        <div className="w-80 h-full bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div>
                <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Üretim Kokpiti</h2>
                <p className="text-sm text-slate-500 mt-1">A4 Etkinlik Fabrikası</p>
            </div>

            <div className="space-y-4">
                {/* Sınıf Seçimi */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Sınıf Seviyesi</label>
                    <select
                        value={selectedGrade || ''}
                        onChange={handleGradeChange}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
                    >
                        <option value="" disabled>Sınıf Seçiniz</option>
                        <option value="4">4. Sınıf</option>
                        <option value="5">5. Sınıf</option>
                        <option value="6">6. Sınıf</option>
                        <option value="7">7. Sınıf</option>
                        <option value="8">8. Sınıf</option>
                    </select>
                </div>

                {/* Ünite Seçimi */}
                {selectedGrade && currentCurriculum && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Tema / Konu</label>
                        <select
                            value={selectedUnitId || ''}
                            onChange={handleUnitChange}
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
                        >
                            <option value="" disabled>Konu Alanı Seçiniz</option>
                            {currentCurriculum.units.map((unit: any) => (
                                <option key={unit.id} value={unit.id}>{unit.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Kazanım Seçimi */}
                {selectedUnitId && currentUnit && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">MEB Kazanımı</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {currentUnit.objectives.map(objective => (
                                <div
                                    key={objective.id}
                                    onClick={() => setObjective(objective)}
                                    className={`p-3 rounded-lg border text-sm cursor-pointer transition-colors ${selectedObjective?.id === objective.id
                                        ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                                        }`}
                                >
                                    <span className="font-semibold block mb-0.5 text-xs opacity-70">{objective.id}</span>
                                    {objective.title}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Çift Çekirdek Motor Seçimi (Dual Engine) */}
            <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-3">Üretim Motoru</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => useSuperTurkceStore.getState().setEngineMode('fast')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${useSuperTurkceStore.getState().engineMode === 'fast'
                            ? 'bg-white text-brand-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span>⚡️ Hızlı</span>
                    </button>
                    <button
                        onClick={() => useSuperTurkceStore.getState().setEngineMode('ai')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${useSuperTurkceStore.getState().engineMode === 'ai'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span>✨ AI Mod</span>
                    </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    {useSuperTurkceStore.getState().engineMode === 'fast'
                        ? 'Şablon veriyle anında PDF üretilir. (Maliyetsiz)'
                        : 'Seçlien konuya özel sıfırdan metin yazılır. (Yaratıcı)'}
                </p>
            </div>

            {/* Üretim Hedefi & Zorluk Ayarları */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Hedef Kitle (Disleksi)</label>
                    <select
                        value={useSuperTurkceStore.getState().audience}
                        onChange={(e) => useSuperTurkceStore.getState().setAudience(e.target.value as any)}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
                    >
                        <option value="normal">Normal Akran Grubu</option>
                        <option value="hafif_disleksi">Hafif Disleksi (Yumuşatılmış Algoritma)</option>
                        <option value="derin_disleksi">Derin Disleksi (Kaçınılacak Harfler)</option>
                    </select>
                </div>

                {/* Disleksi Limitörü: b-d, p-q Karışıklıkları */}
                {useSuperTurkceStore.getState().audience === 'derin_disleksi' && (
                    <div className="space-y-2 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                        <label className="text-xs font-semibold text-red-800 uppercase tracking-wider block">Harf Dışlama Filtresi</label>
                        <p className="text-[10px] text-red-600 mb-2 leading-relaxed">Bu harfler metinden otomatik çıkarılır.</p>
                        <div className="flex flex-wrap gap-2">
                            {['b', 'd', 'p', 'q', 'm', 'n'].map(letter => (
                                <button
                                    key={letter}
                                    onClick={() => useSuperTurkceStore.getState().toggleAvoidLetter(letter)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${useSuperTurkceStore.getState().avoidLetters.includes(letter)
                                        ? 'bg-red-500 text-white shadow-sm'
                                        : 'bg-white border border-red-200 text-red-700 hover:bg-red-100'
                                        }`}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ekstra Ayarlar: İllüstrasyon Aç/Kapa */}
                <div className="space-y-1.5 flex items-center justify-between bg-purple-50 p-2 rounded-xl border border-purple-100 mt-2">
                    <div>
                        <label className="text-xs font-semibold text-purple-800 tracking-wider block">Yapay Zeka İllüstrasyonları</label>
                        <p className="text-[10px] text-purple-600">PDF çıktısına otomatik bağlamsal çizim ekle.</p>
                    </div>
                    <button
                        onClick={() => useSuperTurkceStore.getState().setIncludeIllustration(!useSuperTurkceStore.getState().includeIllustration)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${useSuperTurkceStore.getState().includeIllustration ? 'bg-purple-600' : 'bg-slate-300'}`}
                    >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${useSuperTurkceStore.getState().includeIllustration ? 'translate-x-2' : '-translate-x-2'}`} />
                    </button>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Zorluk Derecesi</label>
                    <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                        {['kolay', 'orta', 'zor', 'lgs'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => useSuperTurkceStore.getState().setDifficulty(lvl as any)}
                                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase transition-all ${useSuperTurkceStore.getState().difficulty === lvl
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {lvl === 'lgs' ? 'LGS' : lvl}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Çıktı Formatı Seçimi */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Çıktı Formatı (A4 Şablonu)</label>
                <div className="space-y-2">
                    {[
                        { id: 'SUPER_TURKCE_MATCHING', icon: 'fa-link', label: 'Eşleştirme (Çizgi Çekme)' },
                        { id: 'FILL_IN_THE_BLANKS', icon: 'fa-language', label: 'Boşluk Doldurma' },
                        { id: 'FIVE_W_ONE_H', icon: 'fa-newspaper', label: '5N1K Haber Analizi' },
                        { id: 'CREATIVE_WRITING', icon: 'fa-pen-fancy', label: 'Yaratıcı Yazarlık' }
                    ].map(format => (
                        <div
                            key={format.id}
                            onClick={() => useSuperTurkceStore.getState().toggleActivityType(format.id as any)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition-all ${useSuperTurkceStore.getState().selectedActivityTypes.includes(format.id as any)
                                    ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${useSuperTurkceStore.getState().selectedActivityTypes.includes(format.id as any)
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                <i className={`fa-solid ${format.icon} text-xs`}></i>
                            </div>
                            <span className="font-medium tracking-tight">{format.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sihirli Üret (Generate) Butonu */}
            <div className="mt-auto pt-6 pb-2">
                <button
                    onClick={() => {
                        const types = useSuperTurkceStore.getState().selectedActivityTypes;
                        if (types.length === 0) {
                            alert('Lütfen en az bir çıktı formatı seçiniz.');
                            return;
                        }
                        // İlerki versiyonda AI servisi burada tetiklenecek. 
                        // Şimdilik sadece toast mesajı veya loading animasyonu olabilir.
                        alert('PDF Üretim Simülasyonu Başlatıldı! Sağ taraftaki önizleme alanını kontrol edin.');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5"
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Sihirli A4 Üret
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-2">
                    {useSuperTurkceStore.getState().engineMode === 'fast'
                        ? 'Algoritmik motor anında üretir.'
                        : 'AI motoru kredinizden 1 jeton kullanacaktır.'}
                </p>
            </div>

        </div>
    );
};

export default Cockpit;
