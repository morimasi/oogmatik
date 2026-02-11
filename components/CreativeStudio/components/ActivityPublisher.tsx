
import React, { useState } from 'react';
import { adminService } from '../../../services/adminService';
import { ACTIVITY_CATEGORIES } from '../../../constants';
import { DynamicActivity } from '../../../types/admin';

interface ActivityPublisherProps {
    blueprint: any;
    onClose: () => void;
    onSuccess: () => void;
}

export const ActivityPublisher: React.FC<ActivityPublisherProps> = ({ blueprint, onClose, onSuccess }) => {
    const [config, setConfig] = useState<Partial<DynamicActivity>>({
        title: blueprint.title || "Yeni Aktivite",
        description: blueprint.pedagogicalNote || "Kişiselleştirilmiş klinik çalışma.",
        category: 'visual-perception',
        icon: 'fa-wand-magic-sparkles',
        isActive: true,
        isPremium: false,
        engineConfig: {
            mode: 'hybrid',
            baseBlueprint: JSON.stringify(blueprint.layoutArchitecture),
            parameters: {
                allowDifficulty: true,
                allowDistraction: true,
                allowFontSize: true
            }
        }
    });

    const [isSaving, setIsSaving] = useState(false);

    const handlePublish = async () => {
        setIsSaving(true);
        try {
            const activityId = `dyn_${Date.now()}`;
            await adminService.publishNewActivity({
                ...config,
                id: activityId,
                updatedAt: new Date().toISOString()
            } as DynamicActivity);
            onSuccess();
        } catch (e) {
            alert("Yayınlama başarısız.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-[3rem] shadow-2xl p-8 flex flex-col gap-6">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">Sisteme Enjekte Et</h3>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Global Menü & Kategori Ataması</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Menü Başlığı</label>
                        <input 
                            type="text" value={config.title} onChange={e => setConfig({...config, title: e.target.value})}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Hedef Kategori</label>
                        <select 
                            value={config.category} onChange={e => setConfig({...config, category: e.target.value})}
                            className="w-full p-4 bg-zinc-800 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500"
                        >
                            {ACTIVITY_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Aktif Parametreler</h4>
                        <div className="flex gap-4">
                            {['Zorluk', 'Çeldirici', 'Punto'].map(p => (
                                <span key={p} className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] text-zinc-400 font-bold border border-zinc-700">✓ {p}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={onClose} className="flex-1 py-4 text-zinc-500 font-black uppercase text-[10px] hover:text-white transition-colors">Vazgeç</button>
                    <button 
                        onClick={handlePublish} disabled={isSaving}
                        className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check-circle"></i>}
                        SİSTEME KAYDET VE YAYINLA
                    </button>
                </div>
            </div>
        </div>
    );
};
