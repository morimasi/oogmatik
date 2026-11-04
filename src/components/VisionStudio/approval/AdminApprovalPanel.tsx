// ============================================================
// VisionStudio — Admin Onay Paneli
// pending etkinlikleri listeler, onay / red işlemi yapar
// ============================================================
import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import {
  getPendingActivities,
  updateActivityStatus,
} from '../../../services/visionStudio/activityRepository';
import type { GeneratedActivity, ActivitySection } from '../../../types/visionStudio';
import { useAuthStore } from '../../../store/useAuthStore';

export default function VisionStudioAdminPanel() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<GeneratedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getPendingActivities();
      setActivities(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Yukleme hatasi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleApprove(id: string) {
    if (!user?.id) return;
    setActionLoading(id);
    try {
      await updateActivityStatus(id, 'approved', user.id, 'admin');
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Onay hatasi');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    if (!user?.id || !rejectionReason.trim()) return;
    setActionLoading(id);
    try {
      await updateActivityStatus(id, 'rejected', user.id, 'admin', rejectionReason.trim());
      setActivities((prev) => prev.filter((a) => a.id !== id));
      setRejectingId(null);
      setRejectionReason('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Red hatasi');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Yukleniyor…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            Etkinlik Onay Kuyrugu
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {activities.length} etkinlik onay bekliyor
          </p>
        </div>
        <button
          onClick={load}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Yenile
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline text-xs">Kapat</button>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-600">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Onay bekleyen etkinlik yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Sol: Bilgiler */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-800 dark:text-white truncate">
                    {activity.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>📚 {activity.subject}</span>
                    <span>🎓 {activity.grade}</span>
                    <span>📂 {activity.category}</span>
                    <span>
                      {activity.difficulty === 'kolay' ? '🟢' : activity.difficulty === 'orta' ? '🟡' : '🔴'}{' '}
                      {activity.difficulty}
                    </span>
                    <span>⏱ {activity.durationMinutes} dk</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                    {activity.instructions}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 italic">
                    {activity.pedagogicalNote}
                  </p>
                </div>

                {/* Sag: Aksiyonlar */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPreviewId(previewId === activity.id ? null : activity.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg px-3 py-1.5 transition-colors"
                    aria-label="Onizle"
                  >
                    <Eye className="h-3.5 w-3.5" /> Onizle
                  </button>

                  <button
                    onClick={() => handleApprove(activity.id)}
                    disabled={actionLoading === activity.id}
                    className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                    aria-label="Onayla"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {actionLoading === activity.id ? '…' : 'Onayla'}
                  </button>

                  <button
                    onClick={() => setRejectingId(activity.id)}
                    disabled={actionLoading === activity.id}
                    className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                    aria-label="Reddet"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reddet
                  </button>
                </div>
              </div>

              {/* Ret gerekçesi girişi */}
              {rejectingId === activity.id && (
                <div className="mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Red gerekçesi (zorunlu)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                    rows={2}
                    placeholder="Öğretmene iletilecek açıklama…"
                    aria-label="Red gerekçesi"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleReject(activity.id)}
                      disabled={!rejectionReason.trim() || actionLoading === activity.id}
                      className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg px-4 py-1.5 font-semibold transition-colors"
                    >
                      {actionLoading === activity.id ? 'Gonderiliyor…' : 'Reddet'}
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 underline underline-offset-2"
                    >
                      Iptal
                    </button>
                  </div>
                </div>
              )}

              {/* Onizleme: ilk 3 bolum */}
              {previewId === activity.id && (
                <div className="mt-4 border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3">
                  {activity.sections.slice(0, 3).map((sec: ActivitySection) => (
                    <div key={sec.id} className="text-sm text-slate-700 dark:text-slate-300">
                      {sec.title && <p className="font-semibold mb-0.5">{sec.title}</p>}
                      {'text' in sec.content && (
                        <p className="text-slate-600 dark:text-slate-400 text-xs">{(sec.content as { text: string }).text}</p>
                      )}
                      {'questionText' in sec.content && (
                        <p className="text-slate-600 dark:text-slate-400 text-xs">{(sec.content as { questionText: string }).questionText}</p>
                      )}
                    </div>
                  ))}
                  {activity.sections.length > 3 && (
                    <p className="text-xs text-slate-400">…ve {activity.sections.length - 3} bolum daha</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
