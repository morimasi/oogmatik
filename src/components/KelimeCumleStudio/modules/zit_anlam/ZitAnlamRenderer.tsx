import React from 'react';
import { KelimeCumleGeneratedContent, ZitAnlamItem } from '../../../../types/kelimeCumle';

interface Props {
    content: KelimeCumleGeneratedContent;
    showAnswers?: boolean;
}

export const ZitAnlamRenderer: React.FC<Props> = ({ content, showAnswers }) => {
    return (
        <div className="kc-renderer-zit" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {content.title}
            </h2>
            
            <p style={{ fontSize: '0.875rem', textAlign: 'center', color: '#4b5563', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                {content.instructions}
            </p>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                columnGap: '3rem', 
                rowGap: '1rem', 
                flex: 1,
                padding: '0 2rem'
            }}>
                {content.items.map((item: ZitAnlamItem, index: number) => (
                    <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        fontSize: '1.25rem',
                        padding: '0.75rem 0',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <span style={{ fontWeight: 800, color: '#94a3b8', minWidth: '1.5rem', fontSize: '1rem' }}>{index + 1}.</span>
                        <span style={{ fontWeight: 600, color: '#18181b', minWidth: '8rem' }}>{item.word}</span>
                        <span style={{ color: '#64748b' }}>↔️</span>
                        <div style={{ 
                            flex: 1, 
                            borderBottom: '2px solid #18181b', 
                            textAlign: 'center',
                            color: '#ef4444',
                            fontWeight: 700,
                            height: '1.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {showAnswers ? item.antonym : ''}
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
