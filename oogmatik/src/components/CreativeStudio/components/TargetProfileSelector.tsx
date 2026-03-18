
import React from 'react';
import {
    LearningDisabilityProfile,
    AgeGroup,
    TargetSkill,
    DistractorMatrix,
    TargetProfile
} from '../../../types/creativeStudio';

interface TargetProfileSelectorProps {
    profile: TargetProfile;
    onChange: (profile: TargetProfile) => void;
}

const DISABILITY_OPTIONS: { id: LearningDisabilityProfile; label: string; icon: string; color: string }[] = [
    { id: 'dyslexia', label: 'Disleksi', icon: 'fa-book-open', color: 'indigo' },
    { id: 'dyscalculia', label: 'Diskalkuli', icon: 'fa-calculator', color: 'emerald' },
    { id: 'adhd', label: 'DEHB', icon: 'fa-bolt', color: 'amber' },
    { id: 'mixed', label: 'Karma', icon: 'fa-layer-group', color: 'rose' }
];

const AGE_GROUPS: { id: AgeGroup; label: string }[] = [
    { id: '5-7', label: '5-7 yaş' },
    { id: '8-10', label: '8-10 yaş' },
    { id: '11-13', label: '11-13 yaş' },
    { id: '14+', label: '14+ yaş' }
];

const SKILL_OPTIONS: { id: TargetSkill; label: string; icon: string }[] = [
    { id: 'phonological_awareness', label: 'Fonolojik Farkındalık', icon: 'fa-ear-listen' },
    { id: 'visual_discrimination', label: 'Görsel Ayrıştırma', icon: 'fa-eye' },
    { id: 'working_memory', label: 'İşleyen Bellek', icon: 'fa-brain' },
    { id: 'executive_function', label: 'Yürütücü İşlevler', icon: 'fa-sitemap' },
    { id: 'math_logic', label: 'Matematik Mantığı', icon: 'fa-square-root-variable' },
    { id: 'reading_fluency', label: 'Okuma Akıcılığı', icon: 'fa-book-reader' },
    { id: 'attention_focus', label: 'Dikkat & Odak', icon: 'fa-crosshairs' },
    { id: 'motor_skills', label: 'Motor Beceriler', icon: 'fa-hand' }
];

const DISTRACTOR_OPTIONS: { id: DistractorMatrix; label: string }[] = [
    { id: 'visual_reversal', label: 'Ayna Harf (b-d)' },
    { id: 'sequencing', label: 'Sıralama Hatası' },
    { id: 'phonological', label: 'Sesletim Hatası' },
    { id: 'morphological', label: 'Ek/Kök Hatası' },
    { id: 'numerical', label: 'Sayı Karışıklığı' }
];

export const TargetProfileSelector: React.FC<TargetProfileSelectorProps> = ({ profile, onChange }) => {
    const toggleSkill = (skill: TargetSkill) => {
        const skills = profile.targetSkills.includes(skill)
            ? profile.targetSkills.filter(s => s !== skill)
            : [...profile.targetSkills, skill];
        onChange({ ...profile, targetSkills: skills });
    };

    const toggleDistractor = (d: DistractorMatrix) => {
        const types = profile.distractorTypes.includes(d)
            ? profile.distractorTypes.filter(t => t !== d)
            : [...profile.distractorTypes, d];
        onChange({ ...profile, distractorTypes: types });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* ÖÖG Profili */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <i className="fa-solid fa-user-doctor text-indigo-400 text-xs"></i>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Klinik Profil</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {DISABILITY_OPTIONS.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => onChange({ ...profile, disability: opt.id })}
                            className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 group ${profile.disability === opt.id
                                    ? `bg-${opt.color}-500/10 border-${opt.color}-500/40 shadow-lg`
                                    : 'border-white/5 bg-black/20 hover:border-white/20'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${profile.disability === opt.id ? `bg-${opt.color}-500/20 text-${opt.color}-400` : 'bg-zinc-800 text-zinc-500'
                                }`}>
                                <i className={`fa-solid ${opt.icon} text-xs`}></i>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${profile.disability === opt.id ? 'text-white' : 'text-zinc-500'
                                }`}>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Yaş Grubu */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <i className="fa-solid fa-child text-amber-400 text-xs"></i>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Yaş Grubu</span>
                </div>
                <div className="flex gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5">
                    {AGE_GROUPS.map(ag => (
                        <button
                            key={ag.id}
                            onClick={() => onChange({ ...profile, ageGroup: ag.id })}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${profile.ageGroup === ag.id
                                    ? 'bg-amber-600 text-white shadow-lg'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {ag.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hedef Beceriler */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <i className="fa-solid fa-bullseye text-emerald-400 text-xs"></i>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hedef Beceriler</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {SKILL_OPTIONS.map(skill => (
                        <button
                            key={skill.id}
                            onClick={() => toggleSkill(skill.id)}
                            className={`px-3 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all border ${profile.targetSkills.includes(skill.id)
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                    : 'bg-black/20 border-white/5 text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <i className={`fa-solid ${skill.icon} text-[9px]`}></i>
                            {skill.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Çeldirici Matrisi */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <i className="fa-solid fa-shuffle text-rose-400 text-xs"></i>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Çeldirici Matrisi</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {DISTRACTOR_OPTIONS.map(d => (
                        <button
                            key={d.id}
                            onClick={() => toggleDistractor(d.id)}
                            className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${profile.distractorTypes.includes(d.id)
                                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                    : 'bg-black/20 border-white/5 text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
