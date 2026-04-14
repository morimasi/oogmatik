import React from 'react';
import type { SariKitapConfig, SariKitapDifficulty } from '../../../types/sariKitap';
import type { AgeGroup, LearningDisabilityProfile } from '../../../types/creativeStudio';
import { AGE_GROUPS, DIFFICULTIES, PROFILES, TOPICS } from '../constants';

interface CommonConfigPanelProps {
    config: SariKitapConfig;
    onUpdate: (updates: Partial<SariKitapConfig>) => void;
    generationMode: 'ai' | 'offline';
    onModeChange: (mode: 'ai' | 'offline') => void;
}

export const CommonConfigPanel: React.FC<CommonConfigPanelProps> = React.memo(
    ({ config, onUpdate, generationMode, onModeChange }) => {
        return (
            <div className="sk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="sk-section-title">Ayarlar</div>

                {/* Üretim Modu */}
                <div>
                    <label className="sk-label">Üretim Modu</label>
                    <div className="sk-mode-toggle">
                        <button
                            className={generationMode === 'ai' ? 'active' : ''}
                            onClick={() => onModeChange('ai')}
                        >
                            🤖 AI
                        </button>
                        <button
                            className={generationMode === 'offline' ? 'active' : ''}
                            onClick={() => onModeChange('offline')}
                        >
                            📦 Çevrimdışı
                        </button>
                    </div>
                </div>

                {/* Yaş Grubu */}
                <div>
                    <label className="sk-label">Yaş Grubu</label>
                    <select
                        className="sk-select"
                        value={config.ageGroup}
                        onChange={(e) => onUpdate({ ageGroup: e.target.value as AgeGroup })}
                    >
                        {AGE_GROUPS.map((ag) => (
                            <option key={ag.value} value={ag.value}>{ag.label}</option>
                        ))}
                    </select>
                </div>

                {/* Zorluk */}
                <div>
                    <label className="sk-label">Zorluk Seviyesi</label>
                    <select
                        className="sk-select"
                        value={config.difficulty}
                        onChange={(e) => onUpdate({ difficulty: e.target.value as SariKitapDifficulty })}
                    >
                        {DIFFICULTIES.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>

                {/* Profil */}
                <div>
                    <label className="sk-label">Öğrenme Profili</label>
                    <select
                        className="sk-select"
                        value={config.profile}
                        onChange={(e) => onUpdate({ profile: e.target.value as LearningDisabilityProfile })}
                    >
                        {PROFILES.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>

                {/* Konu */}
                <div>
                    <label className="sk-label">Konu</label>
                    <select
                        className="sk-select"
                        value={config.topics[0] ?? 'Doğa'}
                        onChange={(e) => onUpdate({ topics: [e.target.value] })}
                    >
                        {TOPICS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Tipografi */}
                <div>
                    <label className="sk-label">Font Boyutu ({config.typography.fontSize}pt)</label>
                    <input
                        type="range"
                        className="sk-input"
                        style={{ padding: '0.25rem' }}
                        min={14}
                        max={28}
                        step={1}
                        value={config.typography.fontSize}
                        onChange={(e) =>
                            onUpdate({
                                typography: { ...config.typography, fontSize: Number(e.target.value) },
                            })
                        }
                    />
                </div>

                <div>
                    <label className="sk-label">Satır Aralığı ({config.typography.lineHeight})</label>
                    <input
                        type="range"
                        className="sk-input"
                        style={{ padding: '0.25rem' }}
                        min={1.6}
                        max={3.0}
                        step={0.1}
                        value={config.typography.lineHeight}
                        onChange={(e) =>
                            onUpdate({
                                typography: { ...config.typography, lineHeight: Number(e.target.value) },
                            })
                        }
                    />
                </div>
            </div>
        );
    }
);

CommonConfigPanel.displayName = 'CommonConfigPanel';
