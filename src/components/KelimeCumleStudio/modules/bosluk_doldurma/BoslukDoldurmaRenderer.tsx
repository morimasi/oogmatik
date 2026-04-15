import React from 'react';
import { KelimeCumleGeneratedContent, BoslukDoldurmaItem } from '../../../../types/kelimeCumle';

interface Props {
    content: KelimeCumleGeneratedContent;
    showAnswers?: boolean;
}

export const BoslukDoldurmaRenderer: React.FC<Props> = ({ content, showAnswers }) => {
    return (
        <div className="kc-renderer-bosluk" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {content.title}
            </h2>
            
            <p style={{ fontSize: '0.875rem', textAlign: 'center', color: '#4b5563', fontStyle: 'italic', marginBottom: '1rem' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                {content.items.map((item: BoslukDoldurmaItem, index: number) => (
                    <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'baseline', 
                        gap: '0.75rem',
                        fontSize: '1.125rem',
                        borderBottom: '1px dashed #e5e7eb',
                        paddingBottom: '0.5rem'
                    }}>
                        <span style={{ fontWeight: 700, minWidth: '1.5rem' }}>{index + 1}.</span>
                        <div style={{ flex: 1, lineHeight: 1.6 }}>
                            {item.sentence.split('………').map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <span style={{ 
                                            display: 'inline-block', 
                                            minWidth: '6rem', 
                                            borderBottom: '2px solid #18181b',
                                            margin: '0 0.5rem',
                                            textAlign: 'center',
                                            color: '#ef4444',
                                            fontWeight: 600
                                        }}>
                                            {showAnswers ? item.answer : ''}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
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
