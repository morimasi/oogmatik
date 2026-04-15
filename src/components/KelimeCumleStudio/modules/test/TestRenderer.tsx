import React from 'react';
import { KelimeCumleGeneratedContent, TestItem } from '../../../../types/kelimeCumle';

interface Props {
    content: KelimeCumleGeneratedContent;
    showAnswers?: boolean;
}

export const TestRenderer: React.FC<Props> = ({ content, showAnswers }) => {
    return (
        <div className="kc-renderer-test" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {content.title}
            </h2>
            
            <p style={{ fontSize: '0.875rem', textAlign: 'center', color: '#4b5563', fontStyle: 'italic', marginBottom: '1rem' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', flex: 1, padding: '0.5rem' }}>
                {content.items.map((item: TestItem, index: number) => (
                    <div key={index} style={{ 
                        border: '1.5px solid #e2e8f0', 
                        borderRadius: '0.75rem', 
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        background: '#f8fafc'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
                            <span>{index + 1}.</span>
                            <div style={{ flex: 1 }}>{item.question}</div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            {['A', 'B', 'C', 'D'].map((letter, i) => {
                                const isCorrect = showAnswers && item.options[i] === item.answer;
                                return (
                                    <div key={letter} style={{ 
                                        display: 'flex', 
                                        gap: '0.5rem', 
                                        fontSize: '1rem', 
                                        alignItems: 'center',
                                        padding: '0.375rem 0.5rem',
                                        borderRadius: '0.375rem',
                                        background: isCorrect ? '#dcfce7' : 'transparent',
                                        border: isCorrect ? '1px solid #22c55e' : '1px solid transparent',
                                        color: isCorrect ? '#166534' : 'inherit',
                                        fontWeight: isCorrect ? 700 : 400
                                    }}>
                                        <span style={{ 
                                            fontWeight: 800, 
                                            color: isCorrect ? '#166534' : '#64748b',
                                            minWidth: '1.25rem' 
                                        }}>{letter})</span>
                                        <span style={{ flex: 1 }}>{item.options[i]}</span>
                                    </div>
                                );
                            })}
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
