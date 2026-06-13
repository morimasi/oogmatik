import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Award, ArrowLeft, RefreshCw, Mail, Calendar } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { useToastStore } from '../../store/useToastStore';
import { TeacherListItem, TeacherDetail } from '../../types/teacher';
import { TeacherOverview } from './teachers/TeacherOverview';
import { TeacherStudents } from './teachers/TeacherStudents';
import { TeacherActivityModule } from './teachers/TeacherActivityModule';
import { TeacherAnalyticsModule } from './teachers/TeacherAnalyticsModule';
import { TeacherManagementModule } from './teachers/TeacherManagementModule';

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

  const handleUpdate = useCallback(() => {
    loadTeachers();
    if (selectedTeacher) {
      loadTeacherDetail(selectedTeacher.user.id);
    }
  }, [selectedTeacher]);

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
            {detailTab === 'overview' && <TeacherOverview teacher={t} />}

            {detailTab === 'students' && <TeacherStudents teacher={t} />}

            {detailTab === 'activity' && <TeacherActivityModule teacher={t} />}

            {detailTab === 'analytics' && <TeacherAnalyticsModule teacher={t} />}

            {detailTab === 'management' && <TeacherManagementModule teacher={t} onUpdate={handleUpdate} />}
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
            <Award className="w-10 h-10 text-indigo-400 opacity-50" />
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
