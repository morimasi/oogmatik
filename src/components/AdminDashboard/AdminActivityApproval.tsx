/**
 * OOGMATIK — Admin Etkinlik Onay Paneli
 */

import React, { useState, useEffect, useCallback } from 'react';
import { activityApprovalService } from '../../services/activityApprovalService';
// @ts-ignore
import { templateEngine } from '../../services/templateEngine';
import type { ActivityDraft } from '../../types/admin';
import type { ApprovalStatus } from '../../types/ocr-activity';
import { filterDraftsBySource, type ApprovalSourceFilter } from '../../services/activityStudioApprovalFilter';

// ─── Mod etiketi yardımcısı ─────────────────────────────────────────────

const modeLabel: Record<string, string> = {
    prompt_generation: '✍️ Sıfırdan Üretim',
};

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending_review: { bg: 'rgba(234,179,8,0.15)', text: '#facc15', border: 'rgba(234,179,8,0.3)' },
    approved: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
    rejected: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
    draft: { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
};

// ─── Ana Bileşen ─────────────────────────────────────────────────────────

export const AdminActivityApproval: React.FC = () => {
    const [drafts, setDrafts] = useState<ActivityDraft[]>([]);
    const [selectedDraft, setSelectedDraft] = useState<ActivityDraft | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [filter, setFilter] = useState<ApprovalStatus | 'all'>('pending_review');
    const [sourceFilter, setSourceFilter] = useState<ApprovalSourceFilter>('all');
    const [loading, setLoading] = useState(false);

    // Taslakları yükle
    const loadDrafts = useCallback(async () => {
        setLoading(true);
        try {
            const filterParam = filter === 'all' ? undefined : { status: filter as ApprovalStatus };
            const result = await activityApprovalService.getPendingReviews(filterParam);
            setDrafts(result);
        } catch (err) {
            console.error('Taslak yükleme hatası:', err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadDrafts();
    }, [loadDrafts]);

    const filteredDrafts = filterDraftsBySource(drafts, sourceFilter);

    // Onayla
    const handleApprove = async (draftId: string) => {
        try {
            await activityApprovalService.approve(draftId, 'admin-user');
            await loadDrafts();
            setSelectedDraft(null);
        } catch (err) {
            console.error('Onay hatası:', err);
        }
    };

    // Reddet
    const handleReject = async (draftId: string) => {
        if (!rejectReason.trim()) return;
        try {
            await activityApprovalService.reject(draftId, 'admin-user', rejectReason);
            setRejectReason('');
            setShowRejectForm(false);
            await loadDrafts();
            setSelectedDraft(null);
        } catch (err) {
            console.error('Red hatası:', err);
        }
    };

    return (
        <div style={{
            padding: '24px',
            fontFamily: 'Inter, sans-serif',
            color: '#e2e8f0',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#e0e7ff', margin: 0 }}>
                    ✅ Etkinlik Onay Kuyruğu
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {(['all', 'pending_review', 'approved', 'rejected'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '6px 14px',
                                border: filter === f ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
                                color: filter === f ? '#c7d2fe' : '#64748b',
                                fontSize: '12px',
                                cursor: 'pointer',
                            }}
                        >
                            {f === 'all' ? 'Tümü' : f === 'pending_review' ? '⏳ Bekleyen' : f === 'approved' ? '✅ Onaylı' : '❌ Red'}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {([
                    { id: 'all', label: 'Tüm Kaynaklar' },
                    { id: 'activity-studio', label: 'Activity Studio' },
                    { id: 'other', label: 'Diğerleri' },
                ] as const).map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSourceFilter(item.id)}
                        style={{
                            padding: '6px 12px',
                            border: sourceFilter === item.id ? '1px solid #14b8a6' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            background: sourceFilter === item.id ? 'rgba(20,184,166,0.15)' : 'transparent',
                            color: sourceFilter === item.id ? '#99f6e4' : '#64748b',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedDraft ? '380px 1fr' : '1fr', gap: '20px' }}>
                {/* Taslak Listesi */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '16px',
                    maxHeight: '70vh',
                    overflow: 'auto',
                }}>
                    {loading ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>Yükleniyor...</p>
                    ) : filteredDrafts.length === 0 ? (
                        <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>
                            {filter === 'pending_review' ? 'Onay bekleyen etkinlik yok.' : 'Sonuç bulunamadı.'}
                        </p>
                    ) : (
                        filteredDrafts.map((draft) => {
                            const statusStyle = statusColors[draft.status || 'draft'];
                            return (
                                <div
                                    key={draft.id}
                                    onClick={() => setSelectedDraft(draft)}
                                    style={{
                                        padding: '14px',
                                        border: selectedDraft?.id === draft.id
                                            ? '1px solid #818cf8'
                                            : '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '12px',
                                        marginBottom: '8px',
                                        cursor: 'pointer',
                                        background: selectedDraft?.id === draft.id
                                            ? 'rgba(99,102,241,0.08)'
                                            : 'rgba(255,255,255,0.02)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <strong style={{ fontSize: '14px', color: '#e2e8f0', display: 'block' }}>
                                                {draft.title}
                                            </strong>
                                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                {modeLabel[draft.productionMode || ''] || draft.baseType}
                                            </span>
                                        </div>
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            background: statusStyle?.bg,
                                            color: statusStyle?.text,
                                            border: `1px solid ${statusStyle?.border}`,
                                        }}>
                                            {draft.status === 'pending_review' ? 'Bekliyor' : draft.status === 'approved' ? 'Onaylı' : draft.status === 'rejected' ? 'Red' : 'Taslak'}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '11px', color: '#94a3b8' }}>
                                        <span>📚 {draft.metadata?.subject || '—'}</span>
                                        <span>🎓 {draft.metadata?.gradeLevel || '—'}. Sınıf</span>
                                        <span>📊 {draft.metadata?.difficulty || '—'}</span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#475569', marginTop: '6px' }}>
                                        {new Date(draft.createdAt).toLocaleString('tr-TR')}
                                        {draft.version && ` · ${draft.version}`}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Detay Paneli */}
                {selectedDraft && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '24px',
                    }}>
                        <h3 style={{ fontSize: '18px', color: '#e0e7ff', marginTop: 0 }}>
                            {selectedDraft.title}
                        </h3>

                        {/* Metadata Kartları */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '12px',
                            marginBottom: '20px',
                        }}>
                            {[
                                { label: 'Konu', value: selectedDraft.metadata?.subject || '—', icon: '📚' },
                                { label: 'Sınıf', value: `${selectedDraft.metadata?.gradeLevel || '—'}. Sınıf`, icon: '🎓' },
                                { label: 'Zorluk', value: selectedDraft.metadata?.difficulty || '—', icon: '📊' },
                                { label: 'Süre', value: `${selectedDraft.metadata?.estimatedDuration || '—'} dk`, icon: '⏱️' },
                            ].map((card, i) => (
                                <div key={i} style={{
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.04)',
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{card.icon}</div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>{card.label}</div>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#c7d2fe' }}>{card.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Pedagojik Not */}
                        {selectedDraft.metadata?.pedagogicalNote && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(99,102,241,0.08)',
                                borderLeft: '4px solid #6366f1',
                                borderRadius: '0 10px 10px 0',
                                marginBottom: '20px',
                                fontSize: '13px',
                                color: '#c7d2fe',
                                lineHeight: '1.5',
                            }}>
                                <strong>📝 Pedagojik Not:</strong><br />
                                {selectedDraft.metadata.pedagogicalNote}
                            </div>
                        )}

                        {/* Hedef Beceriler & Kazanımlar */}
                        {(selectedDraft.metadata?.targetSkills?.length ?? 0) > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <strong style={{ fontSize: '13px', color: '#94a3b8' }}>🎯 Hedef Beceriler:</strong>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                    {selectedDraft.metadata?.targetSkills?.map((skill, i) => (
                                        <span key={i} style={{
                                            padding: '4px 10px',
                                            background: 'rgba(99,102,241,0.1)',
                                            border: '1px solid rgba(99,102,241,0.2)',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            color: '#a5b4fc',
                                        }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Red Gerekçesi (eğer reddedilmişse) */}
                        {selectedDraft.status === 'rejected' && selectedDraft.rejectionReason && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(239,68,68,0.1)',
                                borderLeft: '4px solid #ef4444',
                                borderRadius: '0 10px 10px 0',
                                marginBottom: '20px',
                                fontSize: '13px',
                                color: '#fca5a5',
                            }}>
                                <strong>❌ Red Gerekçesi:</strong> {selectedDraft.rejectionReason}
                            </div>
                        )}

                        {/* Onay/Red Butonları */}
                        {selectedDraft.status === 'pending_review' && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <button
                                    onClick={() => handleApprove(selectedDraft.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                                    }}
                                >
                                    ✅ Onayla
                                </button>
                                <button
                                    onClick={() => setShowRejectForm(!showRejectForm)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'rgba(239,68,68,0.15)',
                                        color: '#f87171',
                                        border: '1px solid rgba(239,68,68,0.3)',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ❌ Reddet
                                </button>
                            </div>
                        )}

                        {/* Red Gerekçesi Formu */}
                        {showRejectForm && (
                            <div style={{ marginTop: '12px' }}>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Red gerekçesi yazın (zorunlu)..."
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        borderRadius: '10px',
                                        color: '#e2e8f0',
                                        fontSize: '13px',
                                        resize: 'vertical',
                                        marginBottom: '8px',
                                    }}
                                />
                                <button
                                    onClick={() => handleReject(selectedDraft.id)}
                                    disabled={!rejectReason.trim()}
                                    style={{
                                        padding: '10px 20px',
                                        background: rejectReason.trim() ? '#ef4444' : 'rgba(239,68,68,0.3)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        cursor: rejectReason.trim() ? 'pointer' : 'not-allowed',
                                    }}
                                >
                                    Red Gerekçesiyle Reddet
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
