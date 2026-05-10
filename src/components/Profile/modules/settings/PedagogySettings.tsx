import React from 'react';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { ToggleSwitch } from '../../components/shared/ToggleSwitch';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import type { PedagogySettingsProps, PedagogySettingsData } from '../../types';

const ZPD_STRATEGIES = [
    { id: 'optimal', label: 'Optimal Gelişim', desc: 'Öğrenciyi %15 zorlayarak ilerletir', icon: 'fa-bullseye' },
    { id: 'scaffold', label: 'Yoğun İskele', desc: 'Maksimum yardım ile hata oranını düşürür', icon: 'fa-layer-group' },
    { id: 'autonomy', label: 'Özerklik Odaklı', desc: 'İpuçlarını azaltarak bağımsız çalışmayı teşvik eder', icon: 'fa-person-running' },
] as const;

export const PedagogySettings: React.FC<PedagogySettingsProps> = () => {
    const { pedagogySettings, setPedagogySettings, debouncedSave } = useProfileSettings();

    const update = (field: keyof PedagogySettingsData, value: unknown) => {
        setPedagogySettings((prev: PedagogySettingsData) => ({ ...prev, [field]: value }));
        debouncedSave();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol Kolon */}
                <div className="space-y-6">
                    {/* Müfredat Senkronizasyonu */}
                    <div>
                        <SectionHeader title="Müfredat Senkronizasyonu" icon="fa-sync" />
                        <div className="space-y-3">
                            <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-[var(--text-primary)]">MEB 2024-2025 Uyumu</p>
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Otomatik kazanım eşleme</p>
                                </div>
                                <ToggleSwitch
                                    enabled={pedagogySettings.curriculumSync}
                                    onChange={(v) => update('curriculumSync', v)}
                                    color="bg-emerald-500"
                                />
                            </div>
                            <select
                                value={pedagogySettings.curriculumYear}
                                onChange={(e) => update('curriculumYear', e.target.value)}
                                className="w-full p-3.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            >
                                <option value="2024-2025">2024-2025 (Yeni Müfredat)</option>
                                <option value="2023-2024">2023-2024 (Eski Müfredat)</option>
                            </select>
                        </div>
                    </div>

                    {/* ZPD Stratejisi */}
                    <div>
                        <SectionHeader title="Vygotsky ZPD Stratejisi" icon="fa-brain" />
                        <div className="space-y-2">
                            {ZPD_STRATEGIES.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => update('zpdStrategy', s.id)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all group ${pedagogySettings.zpdStrategy === s.id
                                            ? 'bg-amber-500/5 border-amber-500/30 shadow-sm'
                                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <i className={`fa-solid ${s.icon} text-xs ${pedagogySettings.zpdStrategy === s.id ? 'text-amber-500' : 'text-zinc-400'}`} />
                                            <span className="text-xs font-black text-[var(--text-primary)]">{s.label}</span>
                                        </div>
                                        {pedagogySettings.zpdStrategy === s.id && <i className="fa-solid fa-circle-check text-amber-500" />}
                                    </div>
                                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight ml-5">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sağ Kolon */}
                <div className="space-y-6">
                    {/* Klinik Dil Politikası */}
                    <div>
                        <SectionHeader title="Klinik Dil Politikası" icon="fa-comment-medical" />
                        <div className="p-5 bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] shadow-inner">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] leading-relaxed italic mb-4">
                                "MEB yönetmeliği gereği öğrenciler için 'tanılayıcı' dil yerine 'destekleyici/pedagojik' dil kullanımı önerilir."
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => update('terminologyMode', 'supportive')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pedagogySettings.terminologyMode === 'supportive' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600'
                                        }`}
                                >
                                    <i className="fa-solid fa-heart mr-1" /> Destekleyici
                                </button>
                                <button
                                    onClick={() => update('terminologyMode', 'clinical')}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pedagogySettings.terminologyMode === 'clinical' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600'
                                        }`}
                                >
                                    <i className="fa-solid fa-flask mr-1" /> Klinik
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* BEP Entegrasyonu */}
                    <div className="p-5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-[var(--text-primary)]">BEP Entegrasyonu</p>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Tüm üretimlerde BEP hedefleri dahil</p>
                            </div>
                            <ToggleSwitch enabled={pedagogySettings.bepIntegration} onChange={(v) => update('bepIntegration', v)} color="bg-amber-500" />
                        </div>
                    </div>

                    {/* Disleksi Erişilebilirlik Kilidi */}
                    <div className="p-5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl border border-amber-500/10">
                        <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-shield-cat" /> Disleksi Erişilebilirlik Kilidi
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-[var(--text-primary)]">Lexend Font Zorunluluğu</span>
                                <div className="w-8 h-4 bg-amber-500 rounded-full relative cursor-not-allowed opacity-80" title="Bu ayar değiştirilemez">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-[3px] right-1" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-[var(--text-primary)]">Satır Aralığı Optimizasyonu</span>
                                <div className="w-8 h-4 bg-amber-500 rounded-full relative cursor-not-allowed opacity-80" title="Minimum 1.6 korunur">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full absolute top-[3px] right-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
