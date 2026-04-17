import React, { useState } from 'react';
import { KelimeCumleConfig } from '../../../types/kelimeCumle';

interface CommonConfigPanelProps {
    config: KelimeCumleConfig;
    generationMode: 'ai' | 'offline';
    onConfigChange: (updates: Partial<KelimeCumleConfig>) => void;
    onModeChange: (mode: 'ai' | 'offline') => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

export const CommonConfigPanel: React.FC<CommonConfigPanelProps> = ({
    config,
    generationMode,
    onConfigChange,
    onModeChange,
    onGenerate,
    isGenerating
}) => {
    const [openSection, setOpenSection] = useState<'pedagogy' | 'visual' | null>('pedagogy');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            
            {/* 1. PEDAGOJİK AYARLAR */}
            <div className={`kc-accordion-item ${openSection === 'pedagogy' ? 'open' : ''}`}>
                <button 
                    className="kc-accordion-header"
                    onClick={() => setOpenSection(openSection === 'pedagogy' ? null : 'pedagogy')}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🧠</span> Üretim & Pedagoji
                    </span>
                    <span>{openSection === 'pedagogy' ? '−' : '+'}</span>
                </button>
                
                {openSection === 'pedagogy' && (
                    <div className="kc-accordion-content">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Üretim Modu */}
                            <div>
                                <label className="kc-label">Üretim Modu</label>
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
                                        ⚡ Hızlı
                                    </button>
                                </div>
                            </div>

                            {/* Yaş Grubu */}
                            <div>
                                <label className="kc-label">Yaş Grubu</label>
                                <select 
                                    className="kc-select"
                                    value={config.ageGroup}
                                    onChange={(e) => onConfigChange({ ageGroup: e.target.value as any })}
                                >
                                    <option value="5-7">5-7 Yaş</option>
                                    <option value="8-10">8-10 Yaş</option>
                                    <option value="11-13">11-13 Yaş</option>
                                    <option value="14+">14+ Yaş (LGS)</option>
                                </select>
                            </div>

                            {/* Zorluk */}
                            <div>
                                <label className="kc-label">Zorluk Seviyesi</label>
                                <select 
                                    className="kc-select"
                                    value={config.difficulty}
                                    onChange={(e) => onConfigChange({ difficulty: e.target.value as any })}
                                >
                                    <option value="Başlangıç">Başlangıç</option>
                                    <option value="Orta">Orta</option>
                                    <option value="İleri">İleri</option>
                                    <option value="Uzman">Uzman</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. GÖRSEL & SAYFA AYARLARI */}
            <div className={`kc-accordion-item ${openSection === 'visual' ? 'open' : ''}`}>
                <button 
                    className="kc-accordion-header"
                    onClick={() => setOpenSection(openSection === 'visual' ? null : 'visual')}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📏</span> Görünüm & Sayfa
                    </span>
                    <span>{openSection === 'visual' ? '−' : '+'}</span>
                </button>
                
                {openSection === 'visual' && (
                    <div className="kc-accordion-content">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            
                            {/* Font Boyutu */}
                            <div>
                                <label className="kc-label">Font Boyutu: {config.fontSize}pt</label>
                                <input 
                                    type="range" 
                                    min="14" 
                                    max="28" 
                                    step="1"
                                    className="kc-range"
                                    value={config.fontSize || 22}
                                    onChange={(e) => onConfigChange({ fontSize: parseInt(e.target.value) })}
                                />
                            </div>

                            {/* Kelime Aralığı */}
                            <div>
                                <label className="kc-label">Kelime Aralığı: {config.wordSpacing}rem</label>
                                <input 
                                    type="range" 
                                    min="0.5" 
                                    max="2.5" 
                                    step="0.1"
                                    className="kc-range"
                                    value={config.wordSpacing || 1.5}
                                    onChange={(e) => onConfigChange({ wordSpacing: parseFloat(e.target.value) })}
                                />
                            </div>

                            {/* Nokta Boyutu */}
                            <div>
                                <label className="kc-label">Nokta Boyutu: {config.dotSize}px</label>
                                <input 
                                    type="range" 
                                    min="4" 
                                    max="20" 
                                    step="1"
                                    className="kc-range"
                                    value={config.dotSize || 12}
                                    onChange={(e) => onConfigChange({ dotSize: parseInt(e.target.value) })}
                                />
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0' }} />

                            {/* Soru Sayısı */}
                            <div>
                                <label className="kc-label">Soru Sayısı: {config.itemCount}</label>
                                <input 
                                    type="range" 
                                    min="5" 
                                    max="60" 
                                    step="1"
                                    className="kc-range"
                                    value={config.itemCount}
                                    onChange={(e) => onConfigChange({ itemCount: parseInt(e.target.value) })}
                                />
                            </div>

                            {/* Sayfa Başına Soru */}
                            <div>
                                <label className="kc-label">Format Yoğunluğu</label>
                                <select 
                                    className="kc-select"
                                    value={config.itemsPerPage || 'auto'}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onConfigChange({ itemsPerPage: val === 'auto' ? 'auto' : parseInt(val) });
                                    }}
                                >
                                    <option value="auto">Otomatik</option>
                                    <option value="5">Düşük Yoğunluk (5)</option>
                                    <option value="10">Normal (10)</option>
                                    <option value="15">Yüksek Yoğunluk (15)</option>
                                    <option value="20">Süper Yoğunluk (20)</option>
                                </select>
                            </div>

                            {/* Cevap Anahtarı */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                                <input 
                                    type="checkbox" 
                                    checked={config.showAnswers}
                                    onChange={(e) => onConfigChange({ showAnswers: e.target.checked })}
                                    style={{ accentColor: 'var(--accent-color)' }}
                                />
                                Cevap Anahtarını Ekle
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* OLUŞTUR BUTONU */}
            <button 
                className="kc-btn-accent-glow"
                onClick={onGenerate}
                disabled={isGenerating}
                style={{ marginTop: '0.5rem', width: '100%' }}
            >
                {isGenerating ? (
                    '⚡ Üretiliyor...'
                ) : (
                    '✨ Verileri Güncelle'
                )}
            </button>
        </div>
    );
};
