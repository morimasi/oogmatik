
import React from 'react';
import { useReadingStore } from '../../../store/useReadingStore';
import { LayoutSectionId } from '../../../types';

interface ComponentDefinition {
    id: LayoutSectionId;
    label: string;
    description: string;
    icon: string;
    defaultStyle?: any;
}

const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
    { id: 'header', label: 'Başlık Künyesi', icon: 'fa-heading', description: 'Başlık, tür ve tarih alanı.', defaultStyle: { h: 120 } },
    { id: 'tracker', label: 'Okuma Takipçisi', icon: 'fa-eye', description: 'Okuma sayısını işaretleme alanı.', defaultStyle: { h: 60, w: 220 } },
    { id: 'story_block', label: 'Hikaye Metni', icon: 'fa-book-open', description: 'Ana metin ve görsel alanı.', defaultStyle: { h: 420 } },
    { id: 'vocabulary', label: 'Sözlükçe', icon: 'fa-spell-check', description: 'Zor kelimeler ve anlamları.', defaultStyle: { h: 160 } },
    { id: 'pedagogical_note', label: 'Pedagojik Not', icon: 'fa-user-graduate', description: 'Bilişsel hedefler.', defaultStyle: { h: 100, backgroundColor: '#f0f9ff', borderColor: '#bae6fd', borderWidth: 1 } },
    { id: 'questions_5n1k', label: '5N 1K Analizi', icon: 'fa-circle-question', description: 'Kim, Ne, Nerede soruları.', defaultStyle: { h: 320 } },
    { id: 'questions_test', label: 'Test Soruları', icon: 'fa-list-check', description: 'Çoktan seçmeli sorular.', defaultStyle: { h: 320 } },
    { id: 'logic_problem', label: 'Mantık Sorusu', icon: 'fa-brain-circuit', description: 'Muhakeme ve problem çözme.', defaultStyle: { h: 180, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1 } },
    { id: 'syllable_train', label: 'Hece Treni', icon: 'fa-train-subway', description: 'Heceleme ve sentez çalışması.', defaultStyle: { h: 150 } },
    { id: 'creative', label: 'Yaratıcı Alan', icon: 'fa-paintbrush', description: 'Çizim ve yazma alanı.', defaultStyle: { h: 220 } },
    { id: 'notes', label: 'Not Alanı', icon: 'fa-note-sticky', description: 'Çizgili not alanı.', defaultStyle: { h: 120 } },
];

export const ComponentLibrary = () => {
    const { addComponent } = useReadingStore();

    return (
        <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Bileşen Kütüphanesi</h4>
            <div className="grid grid-cols-1 gap-2.5">
                {COMPONENT_DEFINITIONS.map(def => (
                    <button
                        key={def.id}
                        onClick={() => addComponent(def)}
                        className="group flex items-center gap-3 w-full p-3.5 bg-zinc-900/40 hover:bg-zinc-800 border border-zinc-800/50 hover:border-indigo-500/40 rounded-2xl transition-all text-left overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="fa-solid fa-plus text-[8px] text-indigo-400"></i>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-indigo-600/10 flex items-center justify-center text-zinc-500 group-hover:text-indigo-500 transition-colors shrink-0">
                            <i className={`fa-solid ${def.icon}`}></i>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-zinc-200 truncate">{def.label}</p>
                            <p className="text-[9px] text-zinc-500 truncate leading-tight mt-0.5">{def.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
