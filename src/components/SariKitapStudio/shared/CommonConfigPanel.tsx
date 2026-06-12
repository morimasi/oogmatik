import React from 'react';
import type { SariKitapConfig, SariKitapDifficulty } from '../../../types/sariKitap';
import type { AgeGroup, LearningDisabilityProfile } from '../../../types/creativeStudio';
import { AGE_GROUPS, DIFFICULTIES, PROFILES, TOPICS } from '../constants';

interface CommonConfigPanelProps {
    config: SariKitapConfig;
    onUpdate: (updates: Partial<SariKitapConfig>) => void;
}

export const CommonConfigPanel: React.FC<CommonConfigPanelProps> = React.memo(
    ({ config, onUpdate }) => {
        const [openSections, setOpenSections] = React.useState<string[]>(['pedagoji', 'visual']);

        const toggleSection = (id: string) => {
            setOpenSections(prev => 
                prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
            );
        };

        const isSectionOpen = (id: string) => openSections.includes(id);

        return (
            <div className="sk-config-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div className="sk-section-title">
                    <span>🛠️</span> Kontrol Paneli
                </div>

                {/* 1. Üretim Modu (Kaldırıldı - Sadece AI Aktif) */}

                {/* 2. Pedagojik Filtreler (Accordion) */}
                <div className={`sk-accordion-item ${isSectionOpen('pedagoji') ? 'open' : ''}`}>
                    <button className="sk-accordion-header" onClick={() => toggleSection('pedagoji')}>
                        <span>🎓 Pedagoji</span>
                        <span>{isSectionOpen('pedagoji') ? '−' : '+'}</span>
                    </button>
                    {isSectionOpen('pedagoji') && (
                        <div className="sk-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <label className="sk-label">Yaş Grubu</label>
                                <select
                                    className="sk-select"
                                    value={config.ageGroup}
                                    onChange={(e) => onUpdate?.({ ageGroup: e.target.value as AgeGroup })}
                                >
                                    {AGE_GROUPS.map((ag) => (
                                        <option key={ag.value} value={ag.value}>{ag.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="sk-label">Zorluk Seviyesi</label>
                                <select
                                    className="sk-select"
                                    value={config.difficulty}
                                    onChange={(e) => onUpdate?.({ difficulty: e.target.value as SariKitapDifficulty })}
                                >
                                    {DIFFICULTIES.map((d) => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="sk-label">Konu</label>
                                <select
                                    className="sk-select"
                                    value={config.topics[0] ?? TOPICS[0]}
                                    onChange={(e) => onUpdate?.({ topics: [e.target.value] })}
                                >
                                    {TOPICS.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-inset)', borderRadius: '0.75rem', marginTop: '0.5rem' }}>
                                <label className="sk-label" style={{ margin: 0, fontSize: '0.7rem' }}>✨ Benzersiz İçerik</label>
                                <button
                                    onClick={() => onUpdate?.({ isUnique: !config.isUnique })}
                                    style={{
                                        background: config.isUnique ? 'var(--accent-color)' : 'var(--bg-muted)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '2rem',
                                        padding: '0.2rem 0.6rem',
                                        fontSize: '0.6rem',
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {config.isUnique ? 'AKTİF' : 'PASİF'}
                                </button>
                            </div>
                         </div>
                     )}
                 </div>

                {/* 3. Görsel Ayarlar (Accordion) */}
                <div className={`sk-accordion-item ${isSectionOpen('visual') ? 'open' : ''}`}>
                    <button className="sk-accordion-header" onClick={() => toggleSection('visual')}>
                        <span>🎨 Görünüm</span>
                        <span>{isSectionOpen('visual') ? '−' : '+'}</span>
                    </button>
                    {isSectionOpen('visual') && (
                        <div className="sk-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {/* Font Boyutu */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <label className="sk-label" style={{ margin: 0 }}>Yazı Büyüklüğü</label>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)' }}>{config.typography.fontSize}pt</span>
                                </div>
                                <input
                                    type="range"
                                    className="sk-range"
                                    min={12}
                                    max={32}
                                    step={1}
                                    value={config.typography.fontSize}
                                    onChange={(e) =>
                                        onUpdate?.({
                                            typography: { ...config.typography, fontSize: Number(e.target.value) },
                                        })
                                    }
                                />
                            </div>

                            {/* Kelime Aralığı (rem) */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <label className="sk-label" style={{ margin: 0 }}>Kelime Aralığı</label>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)' }}>{config.typography.wordSpacing}rem</span>
                                </div>
                                <input
                                    type="range"
                                    className="sk-range"
                                    min={0.5}
                                    max={3.0}
                                    step={0.1}
                                    value={config.typography.wordSpacing}
                                    onChange={(e) =>
                                        onUpdate?.({
                                            typography: { ...config.typography, wordSpacing: Number(e.target.value) },
                                        })
                                    }
                                />
                            </div>

                            {/* Satır Aralığı */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <label className="sk-label" style={{ margin: 0 }}>Satır Aralığı</label>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)' }}>{config.typography.lineHeight}x</span>
                                </div>
                                <input
                                    type="range"
                                    className="sk-range"
                                    min={1.0}
                                    max={4.0}
                                    step={0.1}
                                    value={config.typography.lineHeight}
                                    onChange={(e) =>
                                        onUpdate?.({
                                            typography: { ...config.typography, lineHeight: Number(e.target.value) },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

CommonConfigPanel.displayName = 'CommonConfigPanel';
