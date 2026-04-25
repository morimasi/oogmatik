import React from 'react';
import { KelimeCumleGeneratedContent, KarisikCumleItem } from '../../../../types/kelimeCumle';

interface Props {
    content: KelimeCumleGeneratedContent;
    showAnswers?: boolean;
}

export const KarisikCumleRenderer: React.FC<Props> = ({ content, showAnswers }) => {
    if (!content) return null;
    
    return (
        <div className="kc-renderer-karisik" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem', fontFamily: 'Lexend, sans-serif' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b' }}>
                {content.title}
            </h2>
            
            <p style={{ fontSize: '1rem', textAlign: 'center', color: '#4b5563', fontStyle: 'italic', marginBottom: '1rem' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, padding: '0.5rem' }}>
                {content.items.map((item: KarisikCumleItem, index: number) => (
                    <div key={index} style={{ 
                        border: '1.5px solid #e2e8f0', 
                        borderRadius: '0.75rem', 
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        background: '#f8fafc'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: '#64748b', fontSize: '1.125rem' }}>{index + 1}.</span>
                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '0.5rem', 
                                flex: 1, 
                                background: 'white', 
                                padding: '0.75rem', 
                                borderRadius: '0.5rem',
                                border: '1px solid #cbd5e1'
                            }}>
                                {(item.words || []).map((word, wi) => (
                                    <span key={wi} style={{ 
                                        padding: '0.25rem 0.75rem', 
                                        background: '#f1f5f9', 
                                        borderRadius: '0.375rem',
                                        fontSize: '1.125rem',
                                        fontWeight: 600,
                                        color: '#334155'
                                    }}>
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div style={{ 
                            height: '2.5rem', 
                            borderBottom: '2px solid #18181b', 
                            marginLeft: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: '#ef4444'
                        }}>
                            {showAnswers ? item.correctSentence : ''}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ 
                marginTop: 'auto', 
                padding: '1rem', 
                background: '#f8fafc', 
                borderRadius: '0.5rem', 
                borderLeft: '4px solid #3b82f6' 
            }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Pedagojik Not
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.4 }}>
                    {content.pedagogicalNote}
                </div>
            </div>
        </div>
    );
};
