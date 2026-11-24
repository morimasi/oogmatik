// Kelime-Cümle Studio — Student & Neuro-Pedagogical Profile Panel

import React from 'react';
import { Student } from '../../../types/core';

interface StudentProfilePanelProps {
    selectedStudentId: string;
    students: Student[];
    onSelectStudent: (studentId: string) => void;
    learningProfile?: string;
    onSelectProfile: (profile: string) => void;
}

const PROFILE_DETAILS: Record<string, { label: string; icon: string; badge: string; color: string; desc: string }> = {
    dyslexia: {
        label: 'Disleksi Desteği',
        icon: 'fa-book-open-reader',
        badge: 'Fonolojik & Geniş Aralık',
        color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300',
        desc: 'Geniş kelime aralığı (1.8rem), Lexend font, b-d/p-q harf karışıklığına duyarlı net ayrıştırma.',
    },
    adhd: {
        label: 'DEHB Desteği',
        icon: 'fa-bolt',
        badge: '5-7 Dk Mikro-Döngü',
        color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
        desc: 'Az maddeli mikro sayfalandırma, dikkat dağıtıcı öğeleri sıfırlayan odaklanmış layout.',
    },
    mixed: {
        label: 'Karma Destek',
        icon: 'fa-puzzle-piece',
        badge: 'Morfolojik & Semantik',
        color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
        desc: 'Hem kelime tamamlama hem cümle kurgulama adımlarında bütüncül ZPD desteği.',
    },
};

export const StudentProfilePanel: React.FC<StudentProfilePanelProps> = ({
    selectedStudentId,
    students,
    onSelectStudent,
    learningProfile = 'dyslexia',
    onSelectProfile,
}) => {
    const selectedStudent = students.find(s => s.id === selectedStudentId);
    const activeProfileKey = (learningProfile in PROFILE_DETAILS) ? learningProfile : 'dyslexia';
    const activeProfile = PROFILE_DETAILS[activeProfileKey];

    return (
        <div className="kc-panel" style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <div className="kc-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <i className="fa-solid fa-user-graduate text-xs"></i>
                    <span>Öğrenci & Profil</span>
                </div>
                {selectedStudent ? (
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        Kayıtlı
                    </span>
                ) : (
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border-subtle)' }}>
                        Serbest Mod
                    </span>
                )}
            </div>

            {/* Student Dropdown */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <select
                    value={selectedStudentId}
                    onChange={(e) => onSelectStudent(e.target.value)}
                    className="kc-select"
                    style={{ width: '100%', paddingRight: '2rem', cursor: 'pointer', fontWeight: 600 }}
                >
                    <option value="anonymous">Anonim / Genel Öğrenci</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name} ({s.grade || 'Öğrenci'})
                        </option>
                    ))}
                </select>
            </div>

            {/* Neuro-Pedagogical Support Profile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="kc-label" style={{ fontSize: '0.7rem' }}>
                    Pedagojik Destek Modu
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                    {Object.entries(PROFILE_DETAILS).map(([key, item]) => {
                        const isSelected = activeProfileKey === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onSelectProfile(key)}
                                className={`kc-module-card ${isSelected ? 'active' : ''}`}
                                style={{
                                    padding: '0.5rem 0.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    borderRadius: '8px',
                                    border: isSelected ? '1px solid var(--accent-color)' : '1px solid var(--border-subtle)',
                                    background: isSelected ? 'var(--accent-glow-subtle)' : 'var(--bg-secondary)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                            >
                                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '0.9rem', color: isSelected ? 'var(--accent-color)' : 'var(--text-muted)' }}></i>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    {item.label.split(' ')[0]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Active Profile Info Capsule */}
                <div style={{
                    marginTop: '0.25rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.4
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                        <i className={`fa-solid ${activeProfile.icon}`} style={{ color: 'var(--accent-color)', fontSize: '0.75rem' }}></i>
                        <span>{activeProfile.label} Aktif ({activeProfile.badge})</span>
                    </div>
                    {activeProfile.desc}
                </div>
            </div>
        </div>
    );
};
