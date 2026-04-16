import React from 'react';
import { KelimeCumleGeneratedContent, KelimeTamamlamaItem } from '../../../../types/kelimeCumle';

interface Props {
    content: KelimeCumleGeneratedContent;
    showAnswers?: boolean;
}

export const KelimeTamamlamaRenderer: React.FC<Props> = ({ content, showAnswers }) => {
    return (
        <div className="kc-renderer-tamamlama" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem', fontFamily: 'Lexend, sans-serif' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1e293b' }}>
                {content.title}
            </h2>
            
            <p style={{ fontSize: '1rem', textAlign: 'center', color: '#4b5563', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', flex: 1 }}>
                {content.items.map((item: KelimeTamamlamaItem, index: number) => (
                    <div key={index} style={{ 
                        border: '1.5px solid #cbd5e1', 
                        borderRadius: '0.75rem', 
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        background: 'white',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: 800, color: '#64748b' }}>{index + 1}.</span>
                            <div style={{ 
                                flex: 1, 
                                fontSize: '1.5rem', 
                                fontWeight: 700, 
                                letterSpacing: '0.1em',
                                color: '#18181b',
                                fontFamily: 'Lexend, sans-serif'
                            }}>
                                {showAnswers ? item.fullWord : item.word}
                            </div>
                        </div>
                        
                        <div style={{ 
                            fontSize: '0.875rem', 
                            color: '#475569', 
                            padding: '0.5rem 0.75rem', 
                            background: '#f1f5f9', 
                            borderRadius: '0.375rem',
                            borderLeft: '3px solid #64748b'
                        }}>
                            <strong>İpucu:</strong> {item.clue}
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
