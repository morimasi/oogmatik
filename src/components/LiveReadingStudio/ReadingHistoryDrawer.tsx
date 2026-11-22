import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  History,
  Trash2,
  FileText,
  Clock,
  Gauge,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  User,
  AlertCircle,
} from 'lucide-react';
import { readingSessionService, SavedReadingSession } from '../../services/readingSessionService';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentStore } from '../../store/useStudentStore';

interface ReadingHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReport?: (session: SavedReadingSession) => void;
}

export const ReadingHistoryDrawer: React.FC<ReadingHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onViewReport,
}) => {
  const { user } = useAuthStore();
  const { activeStudent } = useStudentStore();
  const [sessions, setSessions] = useState<SavedReadingSession[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterOnlyActiveStudent, setFilterOnlyActiveStudent] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      let data: SavedReadingSession[] = [];
      if (filterOnlyActiveStudent && activeStudent?.id) {
        data = await readingSessionService.getStudentSessions(activeStudent.id);
      } else {
        const userId = user?.id || 'guest';
        data = await readingSessionService.getUserSessions(userId);
      }
      setSessions(data);
    } catch {
      // Hata durumunda yerel oturumlara dön
      const local = readingSessionService.getLocalSessions();
      setSessions(
        filterOnlyActiveStudent && activeStudent?.id
          ? local.filter((s) => s.studentId === activeStudent.id)
          : local
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeStudent?.id, filterOnlyActiveStudent]);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, loadSessions]);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bu okuma seansı kaydını silmek istediğinizden emin misiniz?')) {
      return;
    }
    setDeletingId(sessionId);
    try {
      await readingSessionService.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div
        className="w-full max-w-xl bg-slate-900/95 border-l border-slate-700/80 shadow-2xl h-full flex flex-col font-lexend text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reading-history-title"
      >
        {/* Üst Başlık */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 id="reading-history-title" className="text-lg font-bold text-slate-100">
                Seans Geçmişi & Portfolyo
              </h2>
              <p className="text-xs text-slate-400">
                Öğrencinin WCPM hızı, doğruluğu ve fonolojik hata gelişim günlüğü
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSessions}
              disabled={loading}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Yenile"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtre ve Öğrenci Durumu */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Toplam Seans:</span>
            <span className="font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/50">
              {sessions.length}
            </span>
          </div>

          {activeStudent && (
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={filterOnlyActiveStudent}
                onChange={(e) => setFilterOnlyActiveStudent(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
              />
              <span>Yalnızca {activeStudent.name} ({activeStudent.grade || 'Öğrenci'})</span>
            </label>
          )}
        </div>

        {/* Seans Listesi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-sm">Kayıtlı seanslar yükleniyor...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-slate-200 mb-1">Henüz Kayıtlı Seans Yok</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                Sesli okuma koçunu başlatıp seansı tamamladığınızda öğrencinin okuma hızı, doğruluk oranı ve fonolojik analizleri buraya otomatik kaydedilir.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const { metrics } = session;
              const errorCount = metrics.errorBreakdown
                ? Object.values(metrics.errorBreakdown).reduce((a, b) => a + b, 0)
                : 0;

              return (
                <div
                  key={session.id}
                  className="bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-4 transition-all duration-200 group flex flex-col gap-3"
                >
                  {/* Başlık ve Tarih */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-slate-100 truncate">
                          {session.passageTitle}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                          {session.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-indigo-400" />
                          {session.studentName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatDate(session.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                      {onViewReport && (
                        <button
                          onClick={() => onViewReport(session)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition flex items-center gap-1 font-medium"
                          title="Gelişim Raporunu İncele"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Rapor</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        disabled={deletingId === session.id}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                        title="Seansı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metrik Göstergeleri */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/60">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Gauge className="w-2.5 h-2.5 text-indigo-400" /> WCPM
                      </span>
                      <span className="text-sm font-bold text-indigo-300">
                        {metrics.wcpm || 0}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Doğruluk
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        %{metrics.accuracyPercentage || 0}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Prozodi
                      </span>
                      <span className="text-sm font-bold text-amber-300">
                        {metrics.prosodyScore || 0}/100
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400">Hata</span>
                      <span
                        className={`text-sm font-bold ${
                          errorCount > 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {errorCount}
                      </span>
                    </div>
                  </div>

                  {/* Fonolojik Hata Etiketleri */}
                  {metrics.errorBreakdown && errorCount > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] pt-1">
                      <span className="text-slate-500">Fonolojik Odak:</span>
                      {Object.entries(metrics.errorBreakdown)
                        .filter(([_, count]) => count > 0)
                        .map(([category, count]) => (
                          <span
                            key={category}
                            className="px-2 py-0.5 rounded-full bg-rose-950/40 text-rose-300 border border-rose-800/40"
                          >
                            {category}: {count}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Alt Bilgi */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Kayıtlar öğrencinin Bireyselleştirilmiş Eğitim Planı (BEP) notlarına ve genel karnesine otomatik entegre edilir.
          </p>
        </div>
      </div>
    </div>
  );
};
