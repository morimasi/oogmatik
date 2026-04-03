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
      const [activitySuggestions, skillGaps, balanceAnalysis] = await Promise.all([
        aiAssistant.suggestActivities(workbook.id, context as any),
        aiAssistant.detectSkillGaps(workbook.id),
        aiAssistant.analyzePageBalance(workbook.id),
      ]);

      // Combine all suggestions
      const allSuggestions: AISuggestion[] = [
        ...activitySuggestions.map((s) => ({
          id: crypto.randomUUID(),
          type: 'add-activity' as AIWorkbookSuggestionType,
          title: `${s.activityType} ekle`,
          description: s.reason,
          confidence: s.confidence,
          data: s,
          status: 'pending' as const,
        })),
        ...skillGaps.map((gap) => ({
          id: crypto.randomUUID(),
          type: 'fill-skill-gap' as AIWorkbookSuggestionType,
          title: `${gap.skill} becerisi eksik`,
          description: gap.suggestion,
          confidence: gap.severity > 0.7 ? 0.9 : 0.6,
          data: gap,
          status: 'pending' as const,
        })),
      ];

      // Balance suggestions
      if (balanceAnalysis.needsRebalancing) {
        allSuggestions.push({
          id: crypto.randomUUID(),
          type: 'improve-balance',
          title: 'Sayfa dengesi iyileştir',
          description: `${balanceAnalysis.suggestions.join(', ')}`,
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
        suggestions.map((s) =>
          s.id === suggestion.id ? { ...s, status: 'applied' as const } : s
        )
      );
    } catch (error) {
      console.error('Öneri uygulanırken hata:', error);
    }
  }

  function handleReject(suggestionId: string) {
    setSuggestions(
      suggestions.map((s) =>
        s.id === suggestionId ? { ...s, status: 'rejected' as const } : s
      )
    );
  }

  return (
    <div className="workbook-ai bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Asistan</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kitapçığınızı iyileştirmek için öneriler
          </p>
        </div>
        <button
          onClick={loadSuggestions}
          disabled={loading}
          className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Suggestions List */}
      {!loading && suggestions.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {suggestions.filter((s) => s.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bekleyen</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {suggestions.filter((s) => s.status === 'applied').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Uygulandı</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {suggestions.filter((s) => s.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Reddedildi</div>
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

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onAccept,
  onReject,
}) => {
  const isApplied = suggestion.status === 'applied';
  const isRejected = suggestion.status === 'rejected';
  const isPending = suggestion.status === 'pending';

  return (
    <div
      className={`p-4 rounded-lg border-2 transition ${
        isApplied
          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
          : isRejected
          ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700 opacity-60'
          : 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
          {getTypeIcon(suggestion.type)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {suggestion.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {suggestion.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Güven: {Math.round(suggestion.confidence * 100)}%
          </div>
          <div
            className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
          >
            <div
              className={`h-full ${
                suggestion.confidence > 0.7
                  ? 'bg-green-500'
                  : suggestion.confidence > 0.5
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${suggestion.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(suggestion)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <CheckCircle className="w-4 h-4" />
            Uygula
          </button>
          <button
            onClick={() => onReject(suggestion.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <X className="w-4 h-4" />
            Reddet
          </button>
        </div>
      )}

      {isApplied && (
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Uygulandı
        </div>
      )}

      {isRejected && (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
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
  const colors: Record<AIWorkbookSuggestionType, string> = {
    'add-activity': 'bg-blue-100 dark:bg-blue-900',
    'reorder-pages': 'bg-purple-100 dark:bg-purple-900',
    'adjust-difficulty': 'bg-orange-100 dark:bg-orange-900',
    'add-divider': 'bg-gray-100 dark:bg-gray-700',
    'improve-balance': 'bg-green-100 dark:bg-green-900',
    'fill-skill-gap': 'bg-red-100 dark:bg-red-900',
    'add-assessment': 'bg-yellow-100 dark:bg-yellow-900',
    'improve-pedagogy': 'bg-pink-100 dark:bg-pink-900',
  };
  return colors[type] || 'bg-gray-100 dark:bg-gray-700';
}

function getTypeIcon(type: AIWorkbookSuggestionType): React.ReactNode {
  // Simple icon representation
  return <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
}
