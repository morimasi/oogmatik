// Math Studio — Student & Neuro-Pedagogical Profile Panel

import React from 'react';
import { Student } from '../../../types/core';

interface StudentPanelProps {
    selectedStudentId: string;
    students: Student[];
    onSelectStudent: (studentId: string) => void;
    learningProfile?: string;
    onSelectProfile?: (profile: string) => void;
    ageGroup?: string;
    onSelectAgeGroup?: (age: string) => void;
}

const PROFILE_DETAILS: Record<string, { label: string; icon: string; badge: string; color: string; desc: string }> = {
    dyslexia: {
        label: 'Disleksi Desteği',
        icon: 'fa-book-open-reader',
        badge: 'Görsel & Sade Metin',
        color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300',
        desc: 'Kısa ve net cümleler, sadeleştirilmiş yönergeler ve düşük bilişsel yük.',
    },
    dyscalculia: {
        label: 'Diskalkuli Desteği',
        icon: 'fa-shapes',
        badge: 'Basamak & Sayı Hissi',
        color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
        desc: 'Adım adım işlem basamakları, sayı doğrusu ve somutlaştırılmış modeller.',
    },
    adhd: {
        label: 'DEHB Desteği',
        icon: 'fa-bolt',
        badge: '5-7 Dk Mikro-Döngü',
        color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
        desc: 'Odak dağılmasını önleyen kompakt layout ve net ödül göstergeleri.',
    },
    mixed: {
        label: 'Karma Destek',
        icon: 'fa-puzzle-piece',
        badge: 'Bütüncül ZPD',
        color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
        desc: 'Hem okuma hem hesaplama aşamalarında dengeli nöro-pedagojik yapı.',
    },
};

export const StudentPanel: React.FC<StudentPanelProps> = ({
    selectedStudentId,
    students,
    onSelectStudent,
    learningProfile = 'dyslexia',
    onSelectProfile,
    ageGroup = '8-10',
    onSelectAgeGroup,
}) => {
    const selectedStudent = students.find(s => s.id === selectedStudentId);
    const activeProfileKey = (learningProfile in PROFILE_DETAILS) ? learningProfile : 'dyslexia';
    const activeProfile = PROFILE_DETAILS[activeProfileKey];

    return (
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black text-accent/80 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-user-graduate"></i> Öğrenci & Profil
                </h4>
                {selectedStudent ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Kayıtlı Profil
                    </span>
                ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Serbest Mod
                    </span>
                )}
            </div>

            {/* Student Dropdown */}
            <div className="relative mb-3">
                <select
                    value={selectedStudentId}
                    onChange={(e) => onSelectStudent(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-100 focus:ring-1 focus:ring-accent focus:border-accent outline-none cursor-pointer font-bold appearance-none transition-all shadow-sm"
                >
                    <option value="anonymous">Anonim / Genel Çalışma</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name} ({s.grade || 'Öğrenci'})
                        </option>
                    ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-[10px]"></i>
            </div>

            {/* Neuro-Pedagogy Profile Selectors */}
            <div className="space-y-3">
                <div>
                    <label className="text-[9px] font-bold text-zinc-400 uppercase mb-1.5 block">
                        Özel Destek Modu (Pedagojik Filtre)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(PROFILE_DETAILS).map(([key, item]) => {
                            const isSelected = activeProfileKey === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => onSelectProfile && onSelectProfile(key)}
                                    className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1 ${
                                        isSelected
                                            ? 'bg-accent/15 border-accent text-white shadow-md shadow-accent/10 scale-[1.02]'
                                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <i className={`fa-solid ${item.icon} text-xs ${isSelected ? 'text-accent' : 'text-zinc-500'}`}></i>
                                        <span className="text-[10px] font-bold truncate">{item.label}</span>
                                    </div>
                                    <span className="text-[8px] opacity-70 tracking-tight">{item.badge}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Age Group Selector */}
                {onSelectAgeGroup && (
                    <div>
                        <label className="text-[9px] font-bold text-zinc-400 uppercase mb-1.5 block">
                            Hedef Yaş / Seviye (ZPD)
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {[
                                { id: '5-7', label: '5-7 Yaş' },
                                { id: '8-10', label: '8-10 Yaş' },
                                { id: '11-13', label: '11-13 Yaş' },
                                { id: '14+', label: '14+ Yaş' },
                            ].map(age => (
                                <button
                                    key={age.id}
                                    type="button"
                                    onClick={() => onSelectAgeGroup(age.id)}
                                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                                        ageGroup === age.id
                                            ? 'bg-zinc-700 border-zinc-500 text-white shadow-sm'
                                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {age.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Profile Info Capsule */}
                <div className={`p-3 rounded-xl border bg-gradient-to-br ${activeProfile.color} transition-all`}>
                    <div className="flex items-center gap-2 mb-1">
                        <i className={`fa-solid ${activeProfile.icon} text-xs`}></i>
                        <span className="text-[10px] font-black uppercase tracking-wider">
                            {activeProfile.label} Aktif
                        </span>
                    </div>
                    <p className="text-[9px] leading-relaxed opacity-85">
                        {activeProfile.desc}
                    </p>
                </div>
            </div>
        </div>
    );
};
