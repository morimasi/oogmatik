import React from 'react';
import type { RendererProps } from '../../registry';
import type { BellekConfig } from '../../../../types/sariKitap';

/**
 * Bellek Renderer — 4 Fazlı Profesyonel Bellek Kelime Etkinliği
 * Faz A: Çalışma Alanı (kelimeleri incele/ezberle)
 * Faz B: Hatırlama (bazı hücreler boş)
 * Faz C: Karışık Liste (orijinal + dikkat dağıtıcı)
 * Faz D: Cümle Tamamlama
 */

function shuffleForRender<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export const BellekRenderer = React.memo(({ config, content }: RendererProps) => {
    if (config.type !== 'bellek') return null;
    const c = config as BellekConfig;

    const memData = content.memoryData;
    const studyWords = memData?.studyWords ?? content.wordBlocks?.flat() ?? [];
    const blankIndices = new Set(memData?.blankIndices ?? []);
    const distractors = memData?.distractors ?? [];
    const sentencePrompts = memData?.sentencePrompts ?? [];

    const phases = c.phases ?? ['A', 'B', 'C', 'D'];
    const cols = c.gridColumns ?? 4;

    // Grid'i satırlara böl
    const rows: string[][] = [];
    for (let i = 0; i < studyWords.length; i += cols) {
        rows.push(studyWords.slice(i, i + cols));
    }

    // Faz C: karışık liste
    const mixedList = shuffleForRender([...studyWords, ...distractors]);

    const sectionStyle: React.CSSProperties = {
        marginBottom: '0.4rem',
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '0.7rem', fontWeight: 800, color: '#18181b',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        marginBottom: '0.25rem', paddingBottom: '0.15rem',
        borderBottom: '1.5px solid #18181b',
        display: 'flex', alignItems: 'center', gap: '0.4rem'
    };

    const cellStyle = (isEmpty: boolean): React.CSSProperties => ({
        border: '1.5px solid #18181b',
        borderRadius: '0.25rem',
        padding: '0.3rem 0.15rem',
        fontSize: '0.8rem',
        textAlign: 'center',
        fontWeight: 600,
        fontFamily: 'Lexend, sans-serif',
        color: isEmpty ? 'transparent' : '#18181b',
        background: isEmpty ? '#fefce8' : 'white',
        minHeight: '1.6rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative' as const,
    });

    const numberBadge = (num: number): React.ReactNode => (
        <span style={{
            position: 'absolute', top: '0.1rem', left: '0.2rem',
            fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8'
        }}>
            {num}
        </span>
    );

    return (
        <div className="sk-renderer-bellek" style={{
            padding: 0, display: 'flex', flexDirection: 'column', height: '100%'
        }}>
            {/* Başlık */}
            <h2 style={{
                fontSize: '1rem', fontWeight: 800, marginBottom: '0.3rem',
                textAlign: 'center', color: '#18181b', textTransform: 'uppercase',
                letterSpacing: '0.12em', borderBottom: '2px solid #18181b',
                paddingBottom: '0.3rem'
            }}>
                {content.title}
            </h2>

            {/* ═══ FAZ A: Çalışma Alanı ═══ */}
            {phases.includes('A') && (
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>
                        <span style={{
                            background: '#18181b', color: 'white', borderRadius: '50%',
                            width: '1.1rem', height: '1.1rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem'
                        }}>A</span>
                        Kelimeleri İncele ve Ezberle
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        gap: '0.25rem'
                    }}>
                        {studyWords.map((word, i) => (
                            <div key={i} style={cellStyle(false)}>
                                {c.showNumbers && numberBadge(i + 1)}
                                {word}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ FAZ B: Hatırlama ═══ */}
            {phases.includes('B') && (
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>
                        <span style={{
                            background: '#18181b', color: 'white', borderRadius: '50%',
                            width: '1.1rem', height: '1.1rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem'
                        }}>B</span>
                        Hatırladığın Kelimeleri Yaz
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        gap: '0.25rem'
                    }}>
                        {studyWords.map((word, i) => {
                            const isBlank = blankIndices.has(i);
                            return (
                                <div key={i} style={cellStyle(isBlank)}>
                                    {c.showNumbers && numberBadge(i + 1)}
                                    {isBlank ? (
                                        <span style={{
                                            color: '#cbd5e1', fontSize: '0.7rem',
                                            borderBottom: '1.5px dashed #94a3b8',
                                            width: '80%', display: 'inline-block',
                                            height: '1rem'
                                        }}>
                                            &nbsp;
                                        </span>
                                    ) : word}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══ FAZ C: Karışık Liste ═══ */}
            {phases.includes('C') && (
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>
                        <span style={{
                            background: '#18181b', color: 'white', borderRadius: '50%',
                            width: '1.1rem', height: '1.1rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem'
                        }}>C</span>
                        Doğru Kelimeleri Bul ve İşaretle (✓)
                    </div>
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '0.25rem'
                    }}>
                        {mixedList.map((word, i) => {
                            const isOriginal = studyWords.includes(word);
                            return (
                                <div key={i} style={{
                                    border: '1px solid #94a3b8',
                                    borderRadius: '0.25rem',
                                    padding: '0.2rem 0.5rem',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    fontFamily: 'Lexend, sans-serif',
                                    color: '#18181b',
                                    background: 'white',
                                    display: 'flex', alignItems: 'center', gap: '0.2rem'
                                }}>
                                    <span style={{
                                        width: '0.7rem', height: '0.7rem',
                                        border: '1.5px solid #94a3b8', borderRadius: '0.15rem',
                                        display: 'inline-block', flexShrink: 0
                                    }} />
                                    {word}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══ FAZ D: Cümle Tamamlama ═══ */}
            {phases.includes('D') && sentencePrompts.length > 0 && (
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>
                        <span style={{
                            background: '#18181b', color: 'white', borderRadius: '50%',
                            width: '1.1rem', height: '1.1rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem'
                        }}>D</span>
                        Kelimelerle Cümle Kur
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {sentencePrompts.map((prompt, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem'
                            }}>
                                <span style={{
                                    fontSize: '0.6rem', fontWeight: 700, color: '#64748b',
                                    minWidth: '1rem'
                                }}>
                                    {i + 1}.
                                </span>
                                <div style={{
                                    flex: 1, borderBottom: '1.5px solid #cbd5e1',
                                    padding: '0.15rem 0', fontSize: '0.7rem',
                                    fontFamily: 'Lexend, sans-serif', color: '#94a3b8',
                                    fontStyle: 'italic', minHeight: '1.2rem'
                                }}>
                                    {prompt}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alt bilgi */}
            <div style={{
                marginTop: 'auto', paddingTop: '0.3rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.6rem', color: '#94a3b8', padding: '0.3rem 0.25rem 0'
            }}>
                <span>Bellek Etkinliği • {c.difficulty} • {studyWords.length} kelime</span>
                <span>Oogmatik © Sarı Kitap</span>
                <span>1</span>
            </div>
        </div>
    );
});
BellekRenderer.displayName = 'BellekRenderer';
