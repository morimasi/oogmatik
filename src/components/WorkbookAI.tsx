/**
 * OOGMATIK — WorkbookAI Assistant Component
 *
 * AI-powered suggestions UI for workbook enhancement
 *
 * @module components/WorkbookAI
 * @version 2.0.0
 * @author Selin Arslan (AI Mühendisi) + Bora Demir (Yazılım Mühendisi)
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, X, Loader, AlertTriangle } from 'lucide-react';
import { WorkbookAIAssistant } from '../services/workbookAIAssistant/WorkbookAIAssistant';
import type { Workbook, AISuggestion, AIWorkbookSuggestionType } from '../types/workbook';

interface WorkbookAIProps {
  workbook: Workbook;
  onApplySuggestion: (suggestion: AISuggestion) => Promise<void>;
}

export const WorkbookAI: React.FC<WorkbookAIProps> = ({ workbook, onApplySuggestion }) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiAssistant = new WorkbookAIAssistant();

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, [workbook.id]);

  async function loadSuggestions() {
    setLoading(true);
    setError(null);

    try {
      const context = {
        profile: workbook.studentProfile?.learningDisabilityProfile || 'mixed',
        ageGroup: workbook.studentProfile?.ageGroup || '8-10',
        currentPages: workbook.pages.length,
        targetPageCount: 25,
        existingActivities: workbook.pages
          .filter((p) => p.type === 'activity')
          .map((p) => p.content)
          .filter((c) => c.type === 'activity')
          .map((c: any) => c.activityType),
      };

      // Multiple AI queries in parallel
      const [activityRes, skillRes, balanceAnalysis] = await Promise.all([
        aiAssistant.suggestActivities(context as any),
        aiAssistant.detectSkillGaps(context as any),
        aiAssistant.analyzePageBalance(context as any),
      ]);

      const activitySuggestions = activityRes.suggestions || [];
      const skillGaps = skillRes.gaps || [];

      // Combine all suggestions
      const allSuggestions: AISuggestion[] = [
        ...activitySuggestions.map((s: any) => ({
          id: crypto.randomUUID(),
          type: 'add-activity' as AIWorkbookSuggestionType,
          title: `${s.activityType} ekle`,
          description: s.reason,
          confidence: s.recommendedDifficulty === 'Orta' ? 0.8 : 0.6,
          data: s,
          status: 'pending' as const,
        })),
        ...skillGaps.map((gap: any) => ({
          id: crypto.randomUUID(),
          type: 'fill-skill-gap' as AIWorkbookSuggestionType,
          title: `${gap.skillArea} becerisi eksik`,
          description: gap.suggestedActivities?.join(', ') || 'Aktivite önerisi yok',
          confidence: 0.7,
          data: gap,
          status: 'pending' as const,
        })),
      ];

      // Balance suggestions
      if (balanceAnalysis.verdict !== 'Mukemmel' && balanceAnalysis.verdict !== 'Iyi') {
        allSuggestions.push({
          id: crypto.randomUUID(),
          type: 'improve-balance',
          title: 'Sayfa dengesi iyileştir',
          description: balanceAnalysis.recommendations?.join(', ') || 'Tavsiye yok',
          confidence: 0.8,
          data: balanceAnalysis,
          status: 'pending',
        });
      }

      setSuggestions(allSuggestions.slice(0, 10)); // Max 10 suggestion
    } catch (err) {
      setError('AI önerileri yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(suggestion: AISuggestion) {
    try {
      await onApplySuggestion(suggestion);
      setSuggestions(
        suggestions.map((s) => (s.id === suggestion.id ? { ...s, status: 'applied' as const } : s))
      );
    } catch (error) {
      console.error('Öneri uygulanırken hata:', error);
    }
  }

  function handleReject(suggestionId: string) {
    setSuggestions(
      suggestions.map((s) => (s.id === suggestionId ? { ...s, status: 'rejected' as const } : s))
    );
  }

  return (
    <div className="workbook-ai rounded-xl p-6 shadow-lg" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(to bottom right, var(--accent-color), var(--accent-muted))' }}>
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>AI Asistan</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Kitapçığınızı iyileştirmek için öneriler
          </p>
        </div>
        <button
          onClick={loadSuggestions}
          disabled={loading}
          className="ml-auto px-4 py-2 text-white rounded-lg transition disabled:opacity-50 hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
          <span style={{ color: '#ef4444' }}>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-color)' }} />
        </div>
      )}

      {/* Suggestions List */}
      {!loading && suggestions.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          Şu anda öneri yok. Kitapçığınızı geliştirdikçe AI önerileri burada görünecek!
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && suggestions.length > 0 && (
        <div className="mt-6 pt-6 grid grid-cols-3 gap-4 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-color)' }}>
              {suggestions.filter((s) => s.status === 'pending').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bekleyen</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>
              {suggestions.filter((s) => s.status === 'applied').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Uygulandı</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>
              {suggestions.filter((s) => s.status === 'rejected').length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Reddedildi</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SUGGESTION CARD
// ============================================================================

interface SuggestionCardProps {
  suggestion: AISuggestion;
  onAccept: (suggestion: AISuggestion) => void;
  onReject: (id: string) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onAccept, onReject }) => {
  const isApplied = suggestion.status === 'applied';
  const isRejected = suggestion.status === 'rejected';
  const isPending = suggestion.status === 'pending';

  return (
    <div
      className="p-4 rounded-lg border-2 transition"
      style={{
        backgroundColor: isApplied ? 'rgba(34, 197, 94, 0.1)' : isRejected ? 'var(--bg-inset)' : 'var(--accent-muted)',
        borderColor: isApplied ? 'rgba(34, 197, 94, 0.3)' : isRejected ? 'var(--border-color)' : 'var(--accent-color)',
        opacity: isRejected ? 0.6 : 1
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-paper)' }}>
          {getTypeIcon(suggestion.type)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{suggestion.title}</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{suggestion.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Güven: {Math.round(suggestion.confidence * 100)}%
          </div>
          <div className="h-2 w-20 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
            <div
              className="h-full"
              style={{
                width: `${suggestion.confidence * 100}%`,
                backgroundColor: suggestion.confidence > 0.7 ? '#22c55e' : suggestion.confidence > 0.5 ? '#eab308' : '#ef4444'
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(suggestion)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <CheckCircle className="w-4 h-4" />
            Uygula
          </button>
          <button
            onClick={() => onReject(suggestion.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)' }}
          >
            <X className="w-4 h-4" />
            Reddet
          </button>
        </div>
      )}

      {isApplied && (
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#16a34a' }}>
          <CheckCircle className="w-4 h-4" />
          Uygulandı
        </div>
      )}

      {isRejected && (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <X className="w-4 h-4" />
          Reddedildi
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HELPERS
// ============================================================================

function getTypeColor(type: AIWorkbookSuggestionType): string {
  // Not used directly in styles anymore due to custom tokening, but kept for logic
  return 'var(--bg-inset)';
}

function getTypeIcon(type: AIWorkbookSuggestionType): React.ReactNode {
  // Simple icon representation
  return <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />;
}
