import React from 'react';
import { KelimeCumleGeneratedContent, KelimeTamamlamaItem, KelimeCumleDifficulty } from '../../../../types/kelimeCumle';

interface Props {
    content: KelimeCumleGeneratedContent;
    showAnswers?: boolean;
}

/**
 * Zorluk seviyesine göre kelimeyi maskeler.
 * Tohum (seed) olarak kelimenin kendisini kullanarak tutarlı maskeleme sağlar.
 */
const getMaskedWord = (fullWord: string, difficulty: KelimeCumleDifficulty = 'Orta', showAnswers: boolean = false) => {
    if (showAnswers) return fullWord.split('');
    
    const letters = fullWord.split('');
    const result = [...letters];
    
    let hideCount = 0;
    const len = letters.length;

    if (difficulty === 'Başlangıç') {
        hideCount = Math.max(1, Math.floor(len * 0.3));
    } else if (difficulty === 'Orta') {
        hideCount = Math.max(2, Math.floor(len * 0.5));
    } else if (difficulty === 'İleri') {
        hideCount = Math.max(3, Math.floor(len * 0.75));
    } else if (difficulty === 'Uzman') {
        hideCount = len; // Hepsi boş
    }

    // Basit bir deterministik algoritma (kelimeye göre maskeleme)
    // Öğrenci sayfayı yenilediğinde veya yazdırdığında boşluklar değişmemeli
    const indices = Array.from({ length: len }, (_, i) => i);
    
    // Başlangıç seviyesinde baş ve son harfi koru
    let availableIndices = indices;
    if (difficulty !== 'Uzman' && len > 3) {
        availableIndices = indices.slice(1, -1);
    }

    // Harfleri maskele
    const skipStep = Math.max(1, Math.floor(availableIndices.length / hideCount));
    for (let i = 0; i < hideCount && i < availableIndices.length; i++) {
        const idx = availableIndices[i * skipStep % availableIndices.length];
        result[idx] = '';
    }

    return result;
};

export const KelimeTamamlamaRenderer: React.FC<Props> = ({ content, showAnswers }) => {
    const items = content.items as KelimeTamamlamaItem[];
    const difficulty = content.difficulty || 'Orta';

    return (
        <div className="kc-renderer-tamamlama-ultra" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            gap: '0.75rem', 
            fontFamily: 'Lexend, sans-serif',
            padding: '1rem',
            boxSizing: 'border-box'
        }}>
            {/* Header: Kompakt ve Şık */}
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: 900, 
                    margin: 0, 
                    color: '#0f172a',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em'
                }}>
                    {content.title}
                </h2>
                <div style={{ 
                    display: 'inline-block', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    padding: '2px 8px', 
                    background: '#e2e8f0', 
                    borderRadius: '4px',
                    marginTop: '4px',
                    color: '#475569'
                }}>
                    ZORLUK: {difficulty.toUpperCase()} • {items.length} MADDE
                </div>
            </div>
            
            <p style={{ 
                fontSize: '0.85rem', 
                textAlign: 'center', 
                color: '#64748b', 
                margin: '0 0 1rem 0',
                lineHeight: 1.4,
                maxWidth: '80%',
                alignSelf: 'center'
            }}>
                {content.instructions}
            </p>

            {/* Üç Sütunlu Dopdolu Izgara */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '0.75rem', 
                flex: 1,
                alignContent: 'start'
            }}>
                {items.map((item, index) => {
                    const maskedChars = getMaskedWord(item.fullWord, difficulty, showAnswers || false);
                    
                    return (
                        <div key={index} style={{ 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '0.6rem', 
                            padding: '0.6rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            background: '#ffffff',
                            position: 'relative',
                            minHeight: '85px'
                        }}>
                            {/* Numara ve İpucu */}
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <span style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: 800, 
                                    color: '#94a3b8',
                                    minWidth: '18px'
                                }}>
                                    {index + 1}.
                                </span>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    color: '#334155', 
                                    lineHeight: 1.2,
                                    fontWeight: 500,
                                    fontStyle: 'italic'
                                }}>
                                    {item.clue}
                                </div>
                            </div>
                            
                            {/* Harf Kutucukları */}
                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '3px', 
                                marginTop: 'auto',
                                justifyContent: 'center',
                                padding: '2px'
                            }}>
                                {maskedChars.map((char, charIdx) => (
                                    <div key={charIdx} style={{
                                        width: '1.6rem',
                                        height: '1.8rem',
                                        border: char === '' ? '1.5px solid #cbd5e1' : '1px solid #f1f5f9',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        color: char === '' ? 'transparent' : '#1e293b',
                                        background: char === '' ? '#fff' : '#f8fafc',
                                        boxShadow: char === '' ? 'none' : 'inset 0 1px 2px rgba(0,0,0,0.05)'
                                    }}>
                                        {char}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Alt Bilgi & Pedagoji */}
            <div style={{ 
                marginTop: '1rem', 
                padding: '0.6rem 0.8rem', 
                background: '#f8fafc', 
                borderRadius: '0.5rem', 
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <div style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 900, 
                    color: '#6366f1', 
                    textTransform: 'uppercase',
                    writingMode: 'vertical-lr',
                    transform: 'rotate(180deg)',
                    borderRight: '1px solid #e2e8f0',
                    paddingRight: '0.4rem'
                }}>
                    PEDAGOJİ
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.3, flex: 1 }}>
                    {content.pedagogicalNote}
                </div>
            </div>
        </div>
    );
};
