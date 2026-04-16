import React, { useMemo } from 'react';
import { KelimeCumleGeneratedContent, ZitAnlamItem } from '../../../../types/kelimeCumle';

interface Props {
    content: KelimeCumleGeneratedContent;
    showAnswers?: boolean;
}

export const ZitAnlamRenderer: React.FC<Props> = ({ content, showAnswers }) => {
    // Sağ taraftaki kelime havuzunu karıştır
    const wordBank = useMemo(() => {
        const answers = content.items.map((item: any) => item.antonym);
        return answers.sort(() => Math.random() - 0.5);
    }, [content.items]);

    return (
        <div className="kc-renderer-zit" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.2rem', fontFamily: 'Lexend, sans-serif', color: '#000' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', letterSpacing: '0.05em', marginBottom: '0.2rem', fontFamily: 'Lexend, sans-serif' }}>
                {content.title || "KELİME-CÜMLE ÇALIŞMASI (ZIT ANLAM)"}
            </h2>
            <div style={{ fontSize: '0.85rem', textAlign: 'center', fontWeight: 600, marginBottom: '0.5rem' }}>
                {content.instructions || "Cümlelerde boşluklara uygun kelimeyi yaz ve oku."}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a', padding: '0.25rem 0', gap: '0.15rem' }}>
                {content.items.map((item: ZitAnlamItem, index: number) => (
                    <div key={index} style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'minmax(0, 1fr) 130px', 
                        alignItems: 'center', 
                        fontSize: '1.05rem', // Orijinal pdf boyutu
                        padding: '0.2rem 0',
                        gap: '1rem',
                        borderBottom: index !== content.items.length - 1 ? '1px dashed rgba(0,0,0,0.1)' : 'none'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, minWidth: '1.2rem', textAlign: 'right' }}>{index + 1}</span>
                            <span style={{ fontSize: '1.05rem' }}>“{item.word}” kelimesinin zıt anlamı</span>
                            <div style={{ 
                                flex: 1, 
                                borderBottom: '2px dotted #000', 
                                textAlign: 'center',
                                color: '#ef4444',
                                fontWeight: 700,
                                margin: '0 0.5rem',
                                position: 'relative'
                            }}>
                                <span style={{position:'absolute', bottom:'-2px', left:0, width:'100%', textAlign:'center'}}>{showAnswers ? item.antonym : ''}</span>
                                &nbsp; {/* Space filler for border */}
                            </div>
                        </div>
                        <div style={{ 
                            fontWeight: 'bold', 
                            fontSize: '1rem', 
                            textAlign: 'left',
                            color: '#1e293b'
                        }}>
                            {wordBank[index] || ''}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ 
                marginTop: 'auto', 
                padding: '0.4rem 0.75rem', 
                background: '#f8fafc', 
                borderRadius: '0.25rem', 
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #3b82f6'
            }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Pedagojik Not
                </div>
                <div style={{ fontSize: '0.7rem', color: '#1e3a8a', lineHeight: 1.2 }}>
                    {content.pedagogicalNote}
                </div>
            </div>
        </div>
    );
};
