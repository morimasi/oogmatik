// ============================================================
// VisionStudio — Paylaşım & Yayınlama Merkezi (Share & Publish Hub)
// 1. Topluluk Kütüphanesinde Yayınlama (Public Library)
// 2. Öğrencilere Ödev/Görev Olarak Atama (Student Assignment)
// 3. Bağlantı Paylaşımı (Direct Link & WhatsApp)
// 4. JSON / Veri Dışa Aktarma & Yedekleme
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Share2,
  Users,
  Globe,
  Copy,
  Check,
  Download,
  ExternalLink,
  X,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { GeneratedActivity } from '../../../types/visionStudio';
import { useStudentStore } from '../../../store/useStudentStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { persistActivityEdits } from '../../../services/visionStudio/activityRepository';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebaseClient';

interface SharePublishModalProps {
  activity: GeneratedActivity;
  isOpen: boolean;
  onClose: () => void;
  onActivityUpdated: (updated: GeneratedActivity) => void;
}

export function SharePublishModal({
  activity,
  isOpen,
  onClose,
  onActivityUpdated,
}: SharePublishModalProps) {
  const { user } = useAuthStore();
  const { students, fetchStudents } = useStudentStore();

  const [activeTab, setActiveTab] = useState<'community' | 'students' | 'link' | 'export'>('community');
  const [isPublic, setIsPublic] = useState<boolean>(activity.isPublic ?? false);
  const [isSavingPublic, setIsSavingPublic] = useState(false);
  const [publicSuccess, setPublicSuccess] = useState(false);

  // Öğrenci atama state'i
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Link kopyalama feedback
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const unsub = fetchStudents(user.id, user.role === 'admin');
      return () => unsub?.();
    }
  }, [user?.id, user?.role, fetchStudents]);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/?visionActivityId=${activity.id}`;

  const handleTogglePublic = async () => {
    setIsSavingPublic(true);
    setPublicSuccess(false);
    try {
      const nextPublic = !isPublic;
      const updatedActivity: GeneratedActivity = {
        ...activity,
        isPublic: nextPublic,
      };
      await persistActivityEdits(updatedActivity);
      setIsPublic(nextPublic);
      onActivityUpdated(updatedActivity);
      setPublicSuccess(true);
      setTimeout(() => setPublicSuccess(false), 3000);
    } catch (err) {
      console.error('[VisionStudio] Topluluk paylaşımı kaydedilemedi:', err);
    } finally {
      setIsSavingPublic(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📚 "${activity.title}" başlıklı çalışma kâğıdını bdmind üzerinde inceleyin:\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleToggleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAssignToStudents = async () => {
    if (selectedStudentIds.length === 0 || !user?.id) return;
    setIsAssigning(true);
    setAssignSuccess(false);
    try {
      const now = new Date().toISOString();
      const newAssignments = [];

      for (const sId of selectedStudentIds) {
        const studentObj = students.find((s) => s.id === sId);
        newAssignments.push({
          studentId: sId,
          studentName: studentObj?.name || 'Öğrenci',
          assignedAt: now,
        });

        // Firestore assignments koleksiyonuna gerçek kayıt ekle
        await addDoc(collection(db, 'assignments'), {
          studentId: sId,
          teacherId: user.id,
          activityId: activity.id,
          activityTitle: activity.title,
          activitySubject: activity.subject,
          activityType: 'vision_studio',
          assignedDate: now,
          dueDate: new Date(dueDate).toISOString(),
          status: 'assigned',
          score: null,
          createdAt: serverTimestamp(),
        });
      }

      const mergedAssigned = [
        ...(activity.assignedStudents ?? []),
        ...newAssignments,
      ];

      const updatedActivity: GeneratedActivity = {
        ...activity,
        assignedStudents: mergedAssigned,
      };

      await persistActivityEdits(updatedActivity);
      onActivityUpdated(updatedActivity);
      setAssignSuccess(true);
      setSelectedStudentIds([]);
      setTimeout(() => setAssignSuccess(false), 3000);
    } catch (err) {
      console.error('[VisionStudio] Öğrenci ataması başarısız:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activity, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activity.title.replace(/\s+/g, '_')}_yedek.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık Bloğu */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Yayınla & Paylaş Merkezi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm">
                {activity.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sekmeler */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 dark:border-slate-800 dark:bg-slate-800/40">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-all ${
              activeTab === 'community'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4" /> Toplulukta Yayınla
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-all ${
              activeTab === 'students'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" /> Öğrencilere Ata
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-all ${
              activeTab === 'link'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ExternalLink className="h-4 w-4" /> Hızlı Bağlantı
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-all ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Download className="h-4 w-4" /> Dışa Aktar
          </button>
        </div>

        {/* Gövde */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 1. TOPLULUK SEKMESİ */}
          {activeTab === 'community' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      bdmind Topluluk Kütüphanesinde Yayınla
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Bu materyali kamuya açık hale getirerek Türkiye genelindeki diğer özel eğitim ve branş öğretmenlerinin görmesini, kütüphanelerine eklemesini ve yararlanmasını sağlayabilirsiniz.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTogglePublic}
                    disabled={isSavingPublic}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isPublic
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isSavingPublic ? 'Kaydediliyor…' : isPublic ? 'Yayından Kaldır' : 'Toplulukta Yayınla'}
                  </button>
                </div>
              </div>

              {isPublic && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Bu etkinlik şu anda bdmind Topluluk Kütüphanesinde tüm öğretmenler için yayında!
                </div>
              )}

              {publicSuccess && (
                <p className="text-xs text-emerald-600 font-bold">Tercihiniz başarıyla güncellendi!</p>
              )}
            </div>
          )}

          {/* 2. ÖĞRENCİLERE ATA SEKMESİ */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Öğrenci Seçimi ({selectedStudentIds.length}/{students.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Çalışma kâğıdını dijital ödev olarak seçilen öğrencilere atayın.
                  </p>
                </div>
                {students.length > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleSelectAllStudents}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {selectedStudentIds.length === students.length ? 'Seçimi Temizle' : 'Tümünü Seç'}
                  </button>
                )}
              </div>

              {students.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                  Kayıtlı öğrenciniz bulunmuyor. Öğrenci Yönetimi panelinden öğrenci ekleyebilirsiniz.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-100 p-2 dark:border-slate-800 space-y-1">
                  {students.map((student) => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        onClick={() => handleToggleStudent(student.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 font-semibold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs">{student.name}</span>
                          {student.grade && (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                              {student.grade}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Son Teslim Tarihi:</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAssignToStudents}
                  disabled={selectedStudentIds.length === 0 || isAssigning}
                  className="ml-auto rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAssigning ? 'Atanıyor…' : 'Seçili Öğrencilere Ata'}
                </button>
              </div>

              {assignSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl">
                  <CheckCircle2 className="h-4 w-4" />
                  Öğrencilere ödev başarıyla atandı!
                </div>
              )}
            </div>
          )}

          {/* 3. BAĞLANTI SEKMESİ */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Bu bağlantıyı velilerle veya diğer öğretmenlerle doğrudan paylaşabilirsiniz. Giriş yapmış kullanıcılar sayfayı doğrudan görüntüleyebilir ve indirebilir.
              </p>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedLink ? 'Kopyalandı' : 'Kopyala'}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                >
                  💬 WhatsApp ile Paylaş
                </button>
              </div>
            </div>
          )}

          {/* 4. DIŞA AKTAR SEKMESİ */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Etkinliğinizi yapılandırılmış veri formatında dışa aktararak çevrimdışı arşivleyebilir veya başka bir sisteme aktarabilirsiniz.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <FileText className="h-8 w-8 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    JSON Veri Yedeği
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Tüm soru, cevap ve pedagojik notları .json formatında indir
                  </span>
                </button>

                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-800 dark:bg-slate-800/60 opacity-80">
                  <Download className="h-8 w-8 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    PDF & Yazıcı
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Sol araç çubuğundaki "Yazdır" ve "PDF Olarak Kaydet" butonlarını kullanın
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default SharePublishModal;
