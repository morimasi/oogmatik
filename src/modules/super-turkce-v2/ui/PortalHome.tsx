import React from 'react';
import { motion } from 'framer-motion';
import { StudioDef } from '../../core/types';
import { useSuperTurkceV2Store } from '../../core/store';

const STUDIOS: StudioDef[] = [
    { id: 'okuma-anlama', title: 'Okuma Anlama & Yorumlama', description: 'Metinleri derinlemesine analiz etme ve LGS tarzı nesil yorumlama araçları.', icon: 'fa-book-open', colorHex: '#3B82F6' },
    { id: 'mantik-muhakeme', title: 'Mantık Muhakeme & Paragraf', description: 'Eleştirel düşünme, şifre çözücüler ve uzamsal algı gelişim fabrikası.', icon: 'fa-brain', colorHex: '#8B5CF6' },
    { id: 'dil-bilgisi', title: 'Dil Bilgisi ve Anlatım', description: 'Kuralları ezberletmeyen, oyunlaştırılmış cümle ve sözcük donanımları.', icon: 'fa-tree', colorHex: '#10B981' },
    { id: 'yazim-noktalama', title: 'Yazım Kuralları & Noktalama', description: 'Metin doktoru ve görsel odaklı noktalama düzeltme dedektifliği.', icon: 'fa-user-doctor', colorHex: '#F59E0B' },
    { id: 'deyimler', title: 'Deyimler & Atasözleri', description: 'Soyut kültürel ifadeleri somutlaştıran karikatürize etkinlikler.', icon: 'fa-images', colorHex: '#EC4899' },
    { id: 'ses-olaylari', title: 'Hece ve Ses Olayları', description: 'Disleksi dostu fonetik ayrıştırma ve ses farkındalığı panelleri.', icon: 'fa-microphone-lines', colorHex: '#06B6D4' }
];

interface Props {
    onBack: () => void;
}

export const PortalHome: React.FC<Props> = ({ onBack }) => {
    const setStudioId = useSuperTurkceV2Store(state => state.setStudioId);

    return (
        <div className="w-full h-full bg-slate-50 overflow-y-auto p-8 relative">
            {/* Üst Kısım */}
            <div className="max-w-7xl mx-auto flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                        <i className="fa-solid fa-arrow-left text-xl"></i>
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Çalışma Kağıdı Fabrikası <span className="text-brand-500">V2</span></h1>
                        <p className="text-slate-500 mt-1 font-medium">Özel Öğrenme ve Disleksi Destekli Matbaa Kalitesinde Premium Üretim</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
                        <i className="fa-solid fa-box-archive"></i> Arşivim
                    </button>
                </div>
            </div>

            {/* Grid Listesi */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STUDIOS.map((studio, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={studio.id}
                        onClick={() => setStudioId(studio.id)}
                        className="group bg-white rounded-3xl p-6 border-2 border-transparent hover:border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                    >
                        {/* Arka plan gradyan vurgusu */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 blur-3xl transition-transform group-hover:scale-150" style={{ backgroundColor: studio.colorHex }}></div>

                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm text-white text-2xl" style={{ backgroundColor: studio.colorHex }}>
                            <i className={`fa-solid ${studio.icon}`}></i>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-brand-600 transition-colors">{studio.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 h-10">{studio.description}</p>

                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600">
                                10+ Premium Şablon
                            </span>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                                <i className="fa-solid fa-arrow-right"></i>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
