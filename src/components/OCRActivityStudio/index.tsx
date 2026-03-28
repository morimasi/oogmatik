/**
 * OOGMATIK — OCR Activity Studio
 * 
 * Ana stüdyo bileşeni — 3 üretim modunu tek arayüzde sunar.
 * Tab yapısı: [📸 Görsel → Varyant] [✍️ Sıfırdan Üret] [🔄 Birebir Klonla]
 * 
 * Dark Glassmorphism tema. Lexend font.
 */

import React, { useState, useCallback } from 'react';
import { useOCRActivityStore } from '../../store/useOCRActivityStore';
import { ocrService } from '../../services/ocrService';
import { promptActivityService } from '../../services/promptActivityService';
import { exactCloneService } from '../../services/exactCloneService';
import { activityApprovalService } from '../../services/activityApprovalService';
import { templateEngine } from '../../services/templateEngine';
import type { ProductionMode, Difficulty, QuestionType, ActivityTemplate } from '../../types/ocr-activity';
import type { _OCRResult } from '../../types/core';

// ─── Alt Bileşenler ──────────────────────────────────────────────────────

interface ModeSelectorProps {
    activeMode: ProductionMode;
    onChange: (mode: ProductionMode) => void;
    disabled: boolean;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ activeMode, onChange, disabled }) => {
    const modes: Array<{ id: ProductionMode; icon: string; label: string; desc: string }> = [
        { id: 'architecture_clone', icon: '📸', label: 'Görsel → Varyant', desc: 'Örnek etkinlikten mimari kopyalama' },
        { id: 'prompt_generation', icon: '✍️', label: 'Sıfırdan Üret', desc: 'Prompt ile yeni etkinlik' },
        { id: 'exact_clone', icon: '🔄', label: 'Birebir Klonla', desc: 'Görseli klonla, içerik yenile' },
    ];

    return (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {modes.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onChange(mode.id)}
                    disabled={disabled}
                    style={{
                        flex: 1,
                        padding: '16px',
                        border: activeMode === mode.id ? '2px solid #818cf8' : '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        background: activeMode === mode.id
                            ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
                            : 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(12px)',
                        color: activeMode === mode.id ? '#e0e7ff' : '#94a3b8',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        textAlign: 'left' as const,
                        transition: 'all 0.3s ease',
                        opacity: disabled ? 0.5 : 1,
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{mode.icon}</span>
                    <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{mode.label}</strong>
                    <span style={{ fontSize: '11px', opacity: 0.7 }}>{mode.desc}</span>
                </button>
            ))}
        </div>
    );
};

// ─── Prompt Paneli (Mod 2) ───────────────────────────────────────────────

interface PromptPanelProps {
    onGenerate: (prompt: string, params: Record<string, unknown>) => void;
    isProcessing: boolean;
}

const PromptPanel: React.FC<PromptPanelProps> = ({ onGenerate, isProcessing }) => {
    const [prompt, setPrompt] = useState('');
    const [gradeLevel, setGradeLevel] = useState(4);
    const [difficulty, setDifficulty] = useState<Difficulty>('Orta');
    const [questionCount, setQuestionCount] = useState(10);
    const [mode, setMode] = useState<'fast' | 'advanced'>('fast');
    const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

    const handleGenerate = () => {
        if (prompt.trim().length < 5) return;
        onGenerate(prompt, {
            gradeLevel,
            difficulty,
            questionCount,
            mode,
            includeAnswerKey,
            subject: 'Genel',
            questionTypes: ['fill_in_the_blank', 'multiple_choice'],
            includeImages: false,
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Prompt Giriş */}
            <div>
                <label style={{ color: '#94a3b8', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                    📝 Etkinlik Açıklaması
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Örn: 4. sınıf matematik toplama çıkarma 10 soru orta zorlukta..."
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        fontFamily: 'Lexend, sans-serif',
                        lineHeight: '1.6',
                        resize: 'vertical',
                    }}
                />
            </div>

            {/* Hızlı Ayarlar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                        Sınıf Düzeyi
                    </label>
                    <select
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(parseInt(e.target.value))}
                        style={selectStyle}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                            <option key={g} value={g}>{g}. Sınıf</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                        Zorluk
                    </label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        style={selectStyle}
                    >
                        <option value="Kolay">Kolay</option>
                        <option value="Orta">Orta</option>
                        <option value="Zor">Zor</option>
                    </select>
                </div>
                <div>
                    <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                        Soru Sayısı
                    </label>
                    <select
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                        style={selectStyle}
                    >
                        {[5, 8, 10, 12, 15, 20].map((n) => (
                            <option key={n} value={n}>{n} soru</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Mod Seçimi & Cevap Anahtarı */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {(['fast', 'advanced'] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: mode === m ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                                background: mode === m ? 'rgba(99,102,241,0.15)' : 'transparent',
                                color: mode === m ? '#c7d2fe' : '#64748b',
                                fontSize: '12px',
                                cursor: 'pointer',
                            }}
                        >
                            {m === 'fast' ? '⚡ Hızlı Mod' : '🧠 AI Modu'}
                        </button>
                    ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '12px', marginLeft: 'auto' }}>
                    <input
                        type="checkbox"
                        checked={includeAnswerKey}
                        onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                    />
                    Cevap Anahtarı
                </label>
            </div>

            {/* Üret Butonu */}
            <button
                onClick={handleGenerate}
                disabled={isProcessing || prompt.trim().length < 5}
                style={{
                    padding: '14px 24px',
                    background: isProcessing
                        ? 'rgba(99,102,241,0.3)'
                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isProcessing ? 'none' : '0 4px 15px rgba(99,102,241,0.3)',
                }}
            >
                {isProcessing ? '⏳ Üretiliyor...' : '🚀 Etkinlik Üret'}
            </button>
        </div>
    );
};

// ─── Görsel Yükleme Paneli (Mod 1 & 3) ──────────────────────────────────

interface ImageUploadPanelProps {
    onImageUpload: (base64: string) => void;
    isProcessing: boolean;
    mode: 'architecture_clone' | 'exact_clone';
}

const ImageUploadPanel: React.FC<ImageUploadPanelProps> = ({ onImageUpload, _isProcessing, mode }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    }, []);

    const processFile = (file: File) => {
        // Boyut kontrolü
        if (file.size > 15 * 1024 * 1024) {
            alert('Dosya çok büyük (max 15MB).');
            return;
        }

        // Format kontrolü
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Desteklenmeyen format. JPG, PNG veya WebP yükleyin.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            setPreview(base64);
            onImageUpload(base64);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                style={{
                    border: isDragOver ? '2px dashed #818cf8' : '2px dashed rgba(255,255,255,0.15)',
                    borderRadius: '16px',
                    padding: preview ? '12px' : '40px',
                    textAlign: 'center',
                    background: isDragOver ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                }}
                onClick={() => document.getElementById('ocr-file-input')?.click()}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Yüklenen görsel"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            borderRadius: '12px',
                            objectFit: 'contain',
                        }}
                    />
                ) : (
                    <>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                            {mode === 'architecture_clone' ? '📸' : '🔄'}
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 4px' }}>
                            {mode === 'architecture_clone'
                                ? 'Örnek etkinlik görselini sürükle veya tıkla'
                                : 'Klonlanacak etkinlik görselini sürükle veya tıkla'}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                            JPG, PNG, WebP · Max 15MB
                        </p>
                    </>
                )}
                <input
                    id="ocr-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};

// ─── A4 Önizleme ─────────────────────────────────────────────────────────

interface A4PreviewProps {
    template: ActivityTemplate | null;
}

const A4Preview: React.FC<A4PreviewProps> = ({ template }) => {
    if (!template) return null;

    const html = templateEngine.renderToHTML(template);

    return (
        <div style={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            overflow: 'auto',
            maxHeight: '600px',
            padding: '0',
        }}>
            <div
                dangerouslySetInnerHTML={{ __html: html }}
                style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '142%' }}
            />
        </div>
    );
};

// ─── Ortak Stiller ───────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '13px',
};

// ─── Ana Bileşen ─────────────────────────────────────────────────────────

interface OCRActivityStudioProps {
    onBack: () => void;
    onResult: (data: unknown) => void;
}

const OCRActivityStudio: React.FC<OCRActivityStudioProps> = ({ onBack, onResult }) => {
    const {
        activeMode,
        currentTemplate,
        isProcessing,
        processingPhase,
        error,
        setMode,
        setTemplate,
        startProcessing,
        stopProcessing,
        setError,
        setBlueprintResult,
    } = useOCRActivityStore();

    const [showPreview, setShowPreview] = useState(false);

    // ── Mod 1: Görsel → Varyant ──
    const handleArchitectureClone = useCallback(async (base64: string) => {
        try {
            startProcessing('analyzing');
            const blueprintResult = await ocrService.processImage(base64);
            setBlueprintResult(blueprintResult);

            startProcessing('generating');
            const template = templateEngine.extractTemplate(
                blueprintResult.structuredData,
                'architecture_clone'
            );
            setTemplate(template);
            setShowPreview(true);
            stopProcessing();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Analiz sırasında hata oluştu.');
        }
    }, [startProcessing, setBlueprintResult, setTemplate, stopProcessing, setError]);

    // ── Mod 2: Sıfırdan Üret ──
    const handlePromptGenerate = useCallback(async (prompt: string, params: Record<string, unknown>) => {
        try {
            startProcessing('generating');

            const mode = params['mode'] as 'fast' | 'advanced';
            let template: ActivityTemplate;

            if (mode === 'fast') {
                template = await promptActivityService.quickGenerate(
                    prompt,
                    (params['gradeLevel'] as number) || 4
                );
            } else {
                template = await promptActivityService.generateFromPrompt({
                    prompt,
                    gradeLevel: (params['gradeLevel'] as number) || 4,
                    subject: (params['subject'] as string) || 'Genel',
                    difficulty: (params['difficulty'] as Difficulty) || 'Orta',
                    questionTypes: (params['questionTypes'] as QuestionType[]) || ['fill_in_the_blank'],
                    questionCount: (params['questionCount'] as number) ?? 10,
                    estimatedDuration: 20,
                    includeAnswerKey: (params['includeAnswerKey'] as boolean) ?? true,
                    includeImages: false,
                    mode: 'advanced',
                });
            }

            setTemplate(template);
            setShowPreview(true);
            stopProcessing();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Üretim sırasında hata oluştu.');
        }
    }, [startProcessing, setTemplate, stopProcessing, setError]);

    // ── Mod 3: Birebir Klonla ──
    const handleExactClone = useCallback(async (base64: string) => {
        try {
            startProcessing('analyzing');
            const template = await exactCloneService.cloneWithNewContent({
                image: base64,
                cloneMode: 'full_content_refresh',
                preserveStyle: true,
            });

            setTemplate(template);
            setShowPreview(true);
            stopProcessing();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Klonlama sırasında hata oluştu.');
        }
    }, [startProcessing, setTemplate, stopProcessing, setError]);

    // ── Onay Kuyruğuna Gönder ──
    const handleSubmitForReview = useCallback(async () => {
        if (!currentTemplate) return;
        try {
            startProcessing('submitting');
            await activityApprovalService.submitForReview(currentTemplate, 'current-user');
            stopProcessing();
            onResult(currentTemplate);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Gönderim sırasında hata oluştu.');
        }
    }, [currentTemplate, startProcessing, stopProcessing, setError, onResult]);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f23, #1a1a3e)',
            color: '#e2e8f0',
            fontFamily: 'Inter, sans-serif',
            padding: '24px',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            marginRight: '16px',
                        }}
                    >
                        ← Geri
                    </button>
                    <span style={{ fontSize: '22px', fontWeight: '700', color: '#e0e7ff' }}>
                        🧪 Etkinlik Üretim Stüdyosu
                    </span>
                </div>
                {currentTemplate && (
                    <button
                        onClick={handleSubmitForReview}
                        disabled={isProcessing}
                        style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                        }}
                    >
                        📤 Onay Kuyruğuna Gönder
                    </button>
                )}
            </div>

            {/* Mod Seçici */}
            <ModeSelector
                activeMode={activeMode}
                onChange={setMode}
                disabled={isProcessing}
            />

            {/* Hata Mesajı */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '12px',
                    color: '#fca5a5',
                    fontSize: '13px',
                    marginBottom: '16px',
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* İşleme Durumu */}
            {isProcessing && (
                <div style={{
                    padding: '16px',
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginBottom: '16px',
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        border: '3px solid rgba(99,102,241,0.3)',
                        borderTopColor: '#818cf8',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 12px',
                    }} />
                    <p style={{ color: '#c7d2fe', fontSize: '14px', margin: 0 }}>
                        {processingPhase === 'analyzing' && '🔍 Görsel analiz ediliyor...'}
                        {processingPhase === 'generating' && '⚙️ Etkinlik üretiliyor...'}
                        {processingPhase === 'submitting' && '📤 Onay kuyruğuna gönderiliyor...'}
                    </p>
                </div>
            )}

            {/* İçerik Alanı */}
            <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: '24px' }}>
                {/* Sol Panel — Giriş */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    padding: '24px',
                }}>
                    {activeMode === 'prompt_generation' ? (
                        <PromptPanel
                            onGenerate={handlePromptGenerate}
                            isProcessing={isProcessing}
                        />
                    ) : (
                        <ImageUploadPanel
                            onImageUpload={activeMode === 'architecture_clone' ? handleArchitectureClone : handleExactClone}
                            isProcessing={isProcessing}
                            mode={activeMode as 'architecture_clone' | 'exact_clone'}
                        />
                    )}
                </div>

                {/* Sağ Panel — Önizleme */}
                {showPreview && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        padding: '24px',
                    }}>
                        <h3 style={{ fontSize: '16px', color: '#c7d2fe', marginTop: 0, marginBottom: '16px' }}>
                            📄 A4 Önizleme
                        </h3>
                        <A4Preview template={currentTemplate} />

                        {/* Metadata Özeti */}
                        {currentTemplate && (
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '10px',
                                fontSize: '12px',
                                color: '#94a3b8',
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <span>📚 {currentTemplate.metadata.subject}</span>
                                    <span>📊 {currentTemplate.metadata.difficulty}</span>
                                    <span>🎓 {currentTemplate.metadata.gradeLevel}. Sınıf</span>
                                    <span>⏱️ ~{currentTemplate.metadata.estimatedDuration} dk</span>
                                </div>
                                {currentTemplate.metadata.pedagogicalNote && (
                                    <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#818cf8' }}>
                                        📝 {currentTemplate.metadata.pedagogicalNote.substring(0, 100)}...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* CSS Animasyon */}
            <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default OCRActivityStudio;
