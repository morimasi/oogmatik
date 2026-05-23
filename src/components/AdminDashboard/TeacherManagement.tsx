import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  GraduationCap,
  FileText,
  ClipboardCheck,
  BookOpen,
  Activity,
  Calendar,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  ChevronDown,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { adminService } from '../../services/adminService';
import { teacherService } from '../../services/teacherService';
import { useToastStore } from '../../store/useToastStore';
import { TeacherListItem, TeacherDetail, TeacherActivityType, TeacherStudentSummary, TeacherActivity } from '../../types/teacher';

const ACTIVITY_LABELS: Record<TeacherActivityType, string> = {
  worksheet: 'Çalışma Kağıdı',
  assessment: 'Değerlendirme',
  plan: 'Müfredat Planı',
  report: 'Rapor',
  login: 'Giriş',
  export: 'Dışa Aktarma',
  student_added: 'Öğrenci Ekleme',
};

const ACTIVITY_ICONS: Record<TeacherActivityType, string> = {
  worksheet: 'fa-file-pen',
  assessment: 'fa-clipboard-check',
  plan: 'fa-graduation-cap',
  report: 'fa-file-medical',
  login: 'fa-right-to-bracket',
  export: 'fa-download',
  student_added: 'fa-user-plus',
};

const ACTIVITY_COLORS: Record<TeacherActivityType, string> = {
  worksheet: 'bg-blue-500',
  assessment: 'bg-emerald-500',
  plan: 'bg-indigo-500',
  report: 'bg-amber-500',
  login: 'bg-zinc-500',
  export: 'bg-purple-500',
  student_added: 'bg-teal-500',
};

const STATUS_CONFIG = {
  active: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-500' },
  suspended: { label: 'Askıda', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400', dot: 'bg-rose-500' },
  pending: { label: 'Onay Bekliyor', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500' },
};

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetail | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'students' | 'activity' | 'analytics' | 'management'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const toast = useToastStore();

  const SUPER_ADMIN_EMAIL = 'morimasi@gmail.com';

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch {
      toast.error('Öğretmen listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherDetail = async (teacherId: string) => {
    setDetailLoading(true);
    try {
      const detail = await teacherService.getTeacherDetail(teacherId);
      if (detail) {
        setSelectedTeacher(detail);
      } else {
        toast.error('Öğretmen detayı alınamadı.');
      }
    } catch {
      toast.error('Detay yüklenirken hata oluştu.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = useCallback(async (teacherId: string, currentStatus: string, teacherName: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(teacherId, newStatus);
      toast.success(`${teacherName} durumu ${newStatus === 'active' ? 'aktifleştirildi' : 'askıya alındı'}.`);
      loadTeachers();
      if (selectedTeacher?.user.id === teacherId) {
        loadTeacherDetail(teacherId);
      }
    } catch {
      toast.error('Durum güncellenemedi.');
    }
  }, [selectedTeacher, toast]);

  const handleRoleChange = useCallback(async (teacherId: string, newRole: string, teacherName: string) => {
    try {
      await adminService.updateUserRole(teacherId, newRole as any);
      toast.success(`${teacherName} rolü "${newRole}" olarak güncellendi.`);
      loadTeachers();
      if (selectedTeacher?.user.id === teacherId) {
        loadTeacherDetail(teacherId);
      }
    } catch {
      toast.error('Rol güncellenemedi.');
    }
  }, [selectedTeacher, toast]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchTerm, statusFilter]);

  if (selectedTeacher) {
    const t = selectedTeacher;
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button onClick={() => { setSelectedTeacher(null); setDetailTab('overview'); }} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-muted)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-[var(--text-primary)] transition-all border border-[var(--border-color)]">
          <ArrowLeft className="w-3.5 h-3.5" /> Öğretmen Listesi
        </button>

        {detailLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Teacher Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 shadow-xl">
              <div className="flex items-start gap-6">
                <img src={t.user.avatar} alt="" className="w-20 h-20 rounded-2xl border-2 border-white/20 shadow-xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-black text-white">{t.user.name}</h2>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${STATUS_CONFIG[t.user.status as keyof typeof STATUS_CONFIG]?.color || 'bg-zinc-100 text-zinc-700'}`}>
                      {STATUS_CONFIG[t.user.status as keyof typeof STATUS_CONFIG]?.label || t.user.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-indigo-200 text-[10px] font-bold">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {t.user.email}</span>
                    {t.user.profession && <span>· {t.user.profession}</span>}
                    {t.user.institution && <span>· {t.user.institution}</span>}
                    <span>· Kayıt: {new Date(t.user.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-[1.5rem] p-1 border border-[var(--border-color)]">
              {[
                { id: 'overview' as const, label: 'Genel Bakış', icon: 'fa-chart-pie' },
                { id: 'students' as const, label: 'Öğrenciler', icon: 'fa-user-graduate' },
                { id: 'activity' as const, label: 'Aktivite Geçmişi', icon: 'fa-clock-rotate-left' },
                { id: 'analytics' as const, label: 'Analizler', icon: 'fa-chart-line' },
                { id: 'management' as const, label: 'Yönetim', icon: 'fa-sliders' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setDetailTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${detailTab === tab.id ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                  <i className={`fa-solid ${tab.icon}`} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {detailTab === 'overview' && (
              <div className="space-y-5">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Öğrenci', value: t.analytics.totalStudents, icon: 'fa-user-graduate', color: 'from-blue-500 to-blue-600' },
                    { label: 'Çalışma Kağıdı', value: t.analytics.totalWorksheets, icon: 'fa-file-pen', color: 'from-emerald-500 to-emerald-600' },
                    { label: 'Değerlendirme', value: t.analytics.totalAssessments, icon: 'fa-clipboard-check', color: 'from-amber-500 to-amber-600' },
                    { label: 'Plan', value: t.analytics.totalPlans, icon: 'fa-graduation-cap', color: 'from-indigo-500 to-indigo-600' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-5 shadow-lg hover:shadow-xl transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                          <i className={`fa-solid ${stat.icon}`} />
                        </div>
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <p className="text-3xl font-black text-[var(--text-primary)]">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Daily Activity Chart */}
                <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                    <Activity className="w-3.5 h-3.5 text-indigo-500" /> Son 7 Gün Aktivite
                  </h3>
                  <div className="flex items-end gap-2 h-28">
                    {t.analytics.dailyActivity.map((day) => {
                      const maxVal = Math.max(...t.analytics.dailyActivity.map(d => d.count), 1);
                      const height = Math.max((day.count / maxVal) * 100, 4);
                      const dayLabel = new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' });
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[8px] font-black text-[var(--text-muted)]">{day.count}</span>
                          <div className="w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden" style={{ height: '100px' }}>
                            <div className="bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ height: `${height}%`, marginTop: `${100 - height}%` }} />
                          </div>
                          <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">{dayLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Son Aktiviteler
                  </h3>
                  <div className="space-y-2">
                    {t.recentActivity.slice(0, 8).map((act) => (
                      <div key={act.id} className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] group hover:border-[var(--accent-color)]/20 transition-all">
                        <div className={`w-8 h-8 rounded-xl ${ACTIVITY_COLORS[act.type]} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                          <i className={`fa-solid ${ACTIVITY_ICONS[act.type]} text-xs`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-[var(--text-primary)] truncate">{act.title}</p>
                          <p className="text-[9px] font-bold text-[var(--text-muted)]">{act.details}</p>
                        </div>
                        <span className="text-[8px] font-bold text-[var(--text-muted)] shrink-0">{new Date(act.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'students' && (
              <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Öğrenciler ({t.students.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-color)]">
                        <th className="text-left pb-3 pr-4">Öğrenci</th>
                        <th className="text-left pb-3 pr-4">Sınıf</th>
                        <th className="text-center pb-3 pr-4">Değerlendirme</th>
                        <th className="text-center pb-3 pr-4">Ort. Puan</th>
                        <th className="text-right pb-3">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.students.map((s: TeacherStudentSummary) => (
                        <tr key={s.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)] transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[9px] font-black">{s.name.charAt(0)}</div>
                              <span className="text-[10px] font-bold text-[var(--text-primary)]">{s.name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-[10px] font-bold text-[var(--text-muted)]">{s.grade || '-'}</td>
                          <td className="py-3 pr-4 text-center">
                            <span className="px-2 py-0.5 bg-[var(--bg-secondary)] rounded text-[9px] font-black text-[var(--text-primary)]">{s.assessmentCount}</span>
                          </td>
                          <td className="py-3 pr-4 text-center">
                            <span className={`text-[10px] font-black ${s.avgScore >= 70 ? 'text-emerald-500' : s.avgScore >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                              %{s.avgScore}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                              {s.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {detailTab === 'activity' && (
              <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6">
                <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Tüm Aktivite Geçmişi
                </h3>
                <div className="space-y-1.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {t.recentActivity.map((act: TeacherActivity) => (
                    <div key={act.id} className="flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/20 transition-all">
                      <div className={`w-8 h-8 rounded-xl ${ACTIVITY_COLORS[act.type]} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                        <i className={`fa-solid ${ACTIVITY_ICONS[act.type]} text-xs`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-[var(--text-primary)]">{ACTIVITY_LABELS[act.type]}</span>
                          <span className="text-[7px] px-1.5 py-0.5 rounded bg-[var(--bg-paper)] text-[var(--text-muted)] font-bold uppercase">{act.type}</span>
                        </div>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] truncate">{act.title}</p>
                        {act.details && <p className="text-[8px] text-zinc-400">{act.details}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[8px] font-black text-[var(--text-muted)]">{new Date(act.createdAt).toLocaleDateString('tr-TR')}</p>
                        <p className="text-[7px] text-zinc-400">{new Date(act.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailTab === 'analytics' && (
              <div className="space-y-5">
                {/* Activity by Type */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(Object.entries(t.analytics.activityByType) as [TeacherActivityType, number][]).filter(([_, v]) => v > 0).map(([type, count]) => (
                    <div key={type} className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-xl ${ACTIVITY_COLORS[type]} flex items-center justify-center text-white`}>
                          <i className={`fa-solid ${ACTIVITY_ICONS[type]} text-xs`} />
                        </div>
                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">{ACTIVITY_LABELS[type]}</span>
                      </div>
                      <p className="text-2xl font-black text-[var(--text-primary)]">{count}</p>
                    </div>
                  ))}
                </div>

                {/* Monthly Trend */}
                <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> Aylık Trend
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-color)]">
                          <th className="text-left pb-2 pr-4">Ay</th>
                          <th className="text-center pb-2 pr-4">Çalışma Kağıdı</th>
                          <th className="text-center pb-2 pr-4">Değerlendirme</th>
                          <th className="text-center pb-2">Plan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {t.analytics.monthlyTrend.map((m) => {
                          const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                          const monthName = monthNames[parseInt(m.month.split('-')[1]) - 1] || m.month;
                          return (
                            <tr key={m.month} className="border-b border-[var(--border-color)] last:border-0">
                              <td className="py-2.5 pr-4 text-[10px] font-bold text-[var(--text-primary)]">{monthName}</td>
                              <td className="py-2.5 pr-4 text-center">
                                <span className="text-[10px] font-black text-blue-500">{m.worksheets}</span>
                              </td>
                              <td className="py-2.5 pr-4 text-center">
                                <span className="text-[10px] font-black text-amber-500">{m.assessments}</span>
                              </td>
                              <td className="py-2.5 text-center">
                                <span className="text-[10px] font-black text-indigo-500">{m.plans}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Score Summary */}
                <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Performans Özeti
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                      <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Ort. Öğrenci Puanı</p>
                      <p className="text-2xl font-black text-indigo-500">%{t.analytics.avgStudentScore}</p>
                    </div>
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                      <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Aktif Öğrenci</p>
                      <p className="text-2xl font-black text-emerald-500">{t.analytics.activeStudents}/{t.analytics.totalStudents}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'management' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Status Control */}
                <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                    <Shield className="w-3.5 h-3.5 text-rose-500" /> Hesap Durumu
                  </h3>
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl border ${t.user.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {t.user.status === 'active' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                        <span className="text-[10px] font-black">{t.user.status === 'active' ? 'Aktif Hesap' : 'Askıdaki Hesap'}</span>
                      </div>
                      <p className="text-[9px] text-[var(--text-muted)] font-bold">
                        {t.user.status === 'active' ? 'Öğretmen platforma tam erişime sahip.' : 'Öğretmen platforma erişemez. Verileri korunur.'}
                      </p>
                    </div>
                    {t.user.email !== SUPER_ADMIN_EMAIL && (
                      <button onClick={() => handleToggleStatus(t.user.id, t.user.status, t.user.name)} className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                        {t.user.status === 'active' ? 'Hesabı Askıya Al' : 'Hesabı Aktifleştir'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Role Control */}
                <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" /> Rol Yetkilendirme
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[var(--text-primary)]">Mevcut Rol</p>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black">{t.user.role === 'admin' ? 'Admin' : 'Öğretmen'}</span>
                      </div>
                    </div>
                    {t.user.email !== SUPER_ADMIN_EMAIL && (
                      <div className="flex gap-2">
                        {(['teacher', 'admin'] as const).map((role) => (
                          <button key={role} onClick={() => handleRoleChange(t.user.id, role, t.user.name)} disabled={t.user.role === role} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${t.user.role === role ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'}`}>
                            {role === 'teacher' ? 'Öğretmen Yap' : 'Admin Yap'}
                          </button>
                        ))}
                      </div>
                    )}
                    {t.user.email === SUPER_ADMIN_EMAIL && (
                      <p className="text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> Süper Admin hesabının rolü değiştirilemez.
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6">
                  <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> Hesap Bilgileri
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'E-posta', value: t.user.email, icon: 'fa-envelope' },
                      { label: 'Kayıt Tarihi', value: new Date(t.user.createdAt).toLocaleDateString('tr-TR'), icon: 'fa-calendar-plus' },
                      { label: 'Son Giriş', value: t.user.lastLogin ? new Date(t.user.lastLogin).toLocaleDateString('tr-TR') : '-', icon: 'fa-right-to-bracket' },
                      { label: 'Plan', value: t.user.subscriptionPlan === 'pro' ? 'Pro' : 'Ücretsiz', icon: 'fa-crown' },
                      { label: 'Toplam İçerik', value: `${t.analytics.totalWorksheets + t.analytics.totalAssessments + t.analytics.totalPlans} adet`, icon: 'fa-boxes' },
                    ].map(info => (
                      <div key={info.label} className="flex items-center gap-2.5 text-[10px]">
                        <i className={`fa-solid ${info.icon} w-4 text-center text-[var(--text-muted)]`} />
                        <span className="font-bold text-[var(--text-muted)]">{info.label}:</span>
                        <span className="font-black text-[var(--text-primary)]">{info.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-rose-200 dark:border-rose-800 p-6">
                  <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-3.5 h-3.5" /> Tehlike Bölgesi
                  </h3>
                  <p className="text-[9px] font-bold text-[var(--text-muted)] mb-4 leading-relaxed">
                    Öğretmen hesabını kalıcı olarak silmek geri alınamaz. Tüm veriler (öğrenciler, değerlendirmeler, planlar) korunur ancak hesap erişime kapatılır.
                  </p>
                  {t.user.email !== SUPER_ADMIN_EMAIL && (
                    <button className="w-full py-3 bg-transparent border-2 border-rose-500 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                      <i className="fa-solid fa-trash-can mr-2" /> Hesabı Sil
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">
            Öğretmen Yönetimi
          </h2>
          <span className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-[9px] font-black shadow-md shadow-indigo-500/20">
            {teachers.length} Öğretmen
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadTeachers} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[var(--border-color)]">
            <RefreshCw className="w-3.5 h-3.5" /> Yenile
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Öğretmen adı veya e-posta ile ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 placeholder:text-zinc-400"
          />
        </div>
        <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
          {(['all', 'active', 'suspended', 'pending'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-[var(--accent-color)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
              {s === 'all' ? 'Tümü' : STATUS_CONFIG[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Teacher Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-[var(--bg-secondary)] rounded-[2.5rem] animate-pulse border border-[var(--border-color)]" />
          ))}
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
            <GraduationCap className="w-10 h-10 text-indigo-400 opacity-50" />
          </div>
          <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Eşleşen Öğretmen Bulunamadı' : 'Henüz Öğretmen Yok'}
          </h3>
          <p className="text-sm font-bold text-[var(--text-muted)] mb-8 max-w-sm">
            {searchTerm || statusFilter !== 'all' ? 'Filtrelemeyi kaldırarak tüm öğretmenleri görüntüleyebilirsiniz.' : 'Sisteme kayıtlı öğretmen bulunmamaktadır.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => {
            return (
              <motion.div
                key={teacher.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
                onClick={() => loadTeacherDetail(teacher.id)}
              >
                {/* Top accent */}
                <div className={`h-1.5 w-full ${STATUS_CONFIG[teacher.status as keyof typeof STATUS_CONFIG]?.dot || 'bg-zinc-400'}`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={teacher.avatar} alt="" className="w-12 h-12 rounded-2xl border-2 border-[var(--border-color)] shadow-md" />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-paper)] ${teacher.status === 'active' ? 'bg-emerald-500' : teacher.status === 'suspended' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-[var(--text-primary)] truncate max-w-[160px]">{teacher.name}</h3>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] truncate max-w-[160px]">{teacher.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${teacher.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                      {teacher.role === 'admin' ? 'Admin' : 'Öğretmen'}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: 'Öğrenci', value: teacher.studentCount, icon: 'fa-user-graduate', color: 'text-blue-500' },
                      { label: 'İçerik', value: teacher.worksheetCount, icon: 'fa-file-pen', color: 'text-emerald-500' },
                      { label: 'Değerlendirme', value: teacher.assessmentCount, icon: 'fa-clipboard-check', color: 'text-amber-500' },
                      { label: 'Plan', value: teacher.planCount, icon: 'fa-graduation-cap', color: 'text-indigo-500' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-[var(--bg-secondary)] rounded-xl p-2.5 border border-[var(--border-color)]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <i className={`fa-solid ${stat.icon} text-[8px] ${stat.color}`} />
                          <span className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className="text-base font-black text-[var(--text-primary)]">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-1.5 text-[8px] font-bold text-[var(--text-muted)]">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(teacher.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {teacher.subscriptionPlan === 'pro' && (
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded text-[7px] font-black">PRO</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[7px] font-black ${STATUS_CONFIG[teacher.status as keyof typeof STATUS_CONFIG]?.color || 'bg-zinc-100 text-zinc-600'}`}>
                        {STATUS_CONFIG[teacher.status as keyof typeof STATUS_CONFIG]?.label || teacher.status}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
