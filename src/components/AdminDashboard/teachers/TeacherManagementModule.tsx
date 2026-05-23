import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Calendar, Mail, Crown, Boxes, ChevronRight, UserCog, Ban, UserCheck, RefreshCw, Trash2, KeyRound, Clock, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { TeacherDetail } from '../../../types/teacher';
import { adminService } from '../../../services/adminService';
import { useToastStore } from '../../../store/useToastStore';

interface TeacherManagementModuleProps {
  teacher: TeacherDetail;
  onUpdate: () => void;
}

export const TeacherManagementModule: React.FC<TeacherManagementModuleProps> = ({ teacher, onUpdate }) => {
  const t = teacher;
  const toast = useToastStore();
  const [suspending, setSuspending] = useState(false);
  const [roleChanging, setRoleChanging] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const SUPER_ADMIN_EMAIL = 'morimasi@gmail.com';
  const isSuper = t.user.email === SUPER_ADMIN_EMAIL;

  const handleToggleStatus = useCallback(async () => {
    setSuspending(true);
    const newStatus = t.user.status === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(t.user.id, newStatus);
      toast.success(`${t.user.name} durumu ${newStatus === 'active' ? 'aktifleştirildi' : 'askıya alındı'}.`);
      onUpdate();
    } catch {
      toast.error('Durum güncellenemedi.');
    } finally {
      setSuspending(false);
    }
  }, [t.user.id, t.user.status, t.user.name, toast, onUpdate]);

  const handleRoleChange = useCallback(async (newRole: string) => {
    setRoleChanging(true);
    try {
      await adminService.updateUserRole(t.user.id, newRole as any);
      toast.success(`Rol "${newRole === 'admin' ? 'Admin' : 'Öğretmen'}" olarak güncellendi.`);
      onUpdate();
    } catch {
      toast.error('Rol güncellenemedi.');
    } finally {
      setRoleChanging(false);
    }
  }, [t.user.id, toast, onUpdate]);

  const handleDeleteAccount = useCallback(async () => {
    setDeleting(true);
    try {
      await adminService.updateUserStatus(t.user.id, 'deleted');
      toast.success(`${t.user.name} hesabı silindi.`);
      onUpdate();
      setShowDeleteConfirm(false);
    } catch {
      toast.error('Hesap silinemedi.');
    } finally {
      setDeleting(false);
    }
  }, [t.user.id, t.user.name, toast, onUpdate]);

  const accountInfo = [
    { label: 'E-posta', value: t.user.email, icon: 'fa-envelope', color: 'from-blue-500 to-blue-600' },
    { label: 'Kayıt Tarihi', value: new Date(t.user.createdAt).toLocaleDateString('tr-TR'), icon: 'fa-calendar-plus', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Son Giriş', value: t.user.lastLogin ? new Date(t.user.lastLogin).toLocaleDateString('tr-TR') + ' ' + new Date(t.user.lastLogin).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Kayıt yok', icon: 'fa-right-to-bracket', color: 'from-amber-500 to-amber-600' },
    { label: 'Plan', value: t.user.subscriptionPlan === 'pro' ? 'Pro' : 'Ücretsiz', icon: 'fa-crown', color: 'from-purple-500 to-pink-500' },
    { label: 'Toplam İçerik', value: `${t.analytics.totalWorksheets + t.analytics.totalAssessments + t.analytics.totalPlans} adet`, icon: 'fa-boxes', color: 'from-indigo-500 to-indigo-600' },
  ];

  return (
    <div className="space-y-5">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Account Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6 shadow-lg"
        >
          <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
            <Shield className="w-3.5 h-3.5 text-rose-500" /> Hesap Durumu
          </h3>
          <div className={`p-4 rounded-2xl border-2 transition-all ${t.user.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-2xl ${t.user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'} flex items-center justify-center text-white shadow-lg`}>
                {t.user.status === 'active' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-black text-[var(--text-primary)]">{t.user.status === 'active' ? 'Aktif Hesap' : 'Askıdaki Hesap'}</p>
                <p className="text-[9px] font-bold text-[var(--text-muted)]">
                  {t.user.status === 'active' ? 'Öğretmen platforma tam erişime sahip.' : 'Öğretmen platforma erişemez. Verileri korunur.'}
                </p>
              </div>
            </div>
            {!isSuper && (
              <button
                onClick={handleToggleStatus}
                disabled={suspending}
                className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 ${t.user.status === 'active' ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/20 hover:scale-[1.02]' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20 hover:scale-[1.02]'} active:scale-95 disabled:opacity-60`}
              >
                {suspending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : t.user.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                {suspending ? 'İşleniyor...' : t.user.status === 'active' ? 'Hesabı Askıya Al' : 'Hesabı Aktifleştir'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Role Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6 shadow-lg"
        >
          <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
            <KeyRound className="w-3.5 h-3.5 text-indigo-500" /> Rol Yetkilendirme
          </h3>
          <div className="p-4 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl border border-indigo-200 dark:border-indigo-800 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <UserCog className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Mevcut Rol</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 mt-0.5 rounded-lg text-[10px] font-black ${t.user.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                  <Shield className="w-3 h-3" /> {t.user.role === 'admin' ? 'Admin' : 'Öğretmen'}
                </span>
              </div>
            </div>
          </div>
          {!isSuper ? (
            <div className="space-y-2">
              <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Rol Değiştir</p>
              <div className="flex gap-2">
                {(['teacher', 'admin'] as const).map((role) => {
                  const isActive = t.user.role === role;
                  return (
                    <button
                      key={role}
                      onClick={() => !isActive && handleRoleChange(role)}
                      disabled={isActive || roleChanging}
                      className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 cursor-default' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-indigo-300'}`}
                    >
                      {roleChanging ? <RefreshCw className="w-3 h-3 animate-spin" /> : role === 'teacher' ? 'Öğretmen Yap' : 'Admin Yap'}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400">Süper Admin hesabının rolü değiştirilemez.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6 shadow-lg"
      >
        <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
          <Calendar className="w-3.5 h-3.5 text-blue-500" /> Hesap Bilgileri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {accountInfo.map(info => (
            <div key={info.label} className="flex items-center gap-3 p-3.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/20 transition-all">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                <i className={`fa-solid ${info.icon} text-sm`} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">{info.label}</p>
                <p className="text-[11px] font-black text-[var(--text-primary)] truncate">{info.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--bg-paper)] rounded-[2rem] border-2 border-rose-200 dark:border-rose-800 p-6 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.15em]">Tehlike Bölgesi</h3>
              <p className="text-[8px] font-bold text-[var(--text-muted)]">Geri alınamaz işlemler</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] mb-5 leading-relaxed">
            Öğretmen hesabını silmek geri alınamaz. Hesap silindiğinde kullanıcı platforma giriş yapamaz. 
            Öğrenci verileri, değerlendirmeler ve planlar korunur ancak hesaba erişim kalıcı olarak kapatılır.
          </p>
          {!isSuper ? (
            !showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-transparent border-2 border-rose-500 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all inline-flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hesabı Kalıcı Olarak Sil
              </button>
            ) : (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-3">
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Bu işlem geri alınamaz! Emin misiniz?
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all">
                    İptal
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-pink-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {deleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    {deleting ? 'Siliniyor...' : 'Evet, Kalıcı Olarak Sil'}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400">Süper Admin hesabı silinemez.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
