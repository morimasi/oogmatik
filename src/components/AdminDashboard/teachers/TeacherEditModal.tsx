import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RefreshCw, User, Mail, Shield, Award, Building, Briefcase, Phone, AlertCircle } from 'lucide-react';
import { TeacherDetail, TeacherListItem } from '../../../types/teacher';
import { adminService } from '../../../services/adminService';
import { authService } from '../../../services/authService';
import { useToastStore } from '../../../store/useToastStore';

interface TeacherEditModalProps {
  teacher: TeacherListItem | TeacherDetail['user'];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherEditModal: React.FC<TeacherEditModalProps> = ({
  teacher,
  isOpen,
  onClose,
  onSuccess
}) => {
  const toast = useToastStore();
  const [formData, setFormData] = useState({
    name: teacher.name || '',
    email: teacher.email || '',
    phone: (teacher as any).phone || '',
    profession: (teacher as any).profession || 'Özel Eğitim Öğretmeni',
    institution: (teacher as any).institution || 'MEB Özel Eğitim Kurumu',
    role: teacher.role || 'teacher',
    status: teacher.status || 'active',
    subscriptionPlan: teacher.subscriptionPlan || 'free',
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Role & Status güncelleme
      await adminService.updateUserRole(teacher.id, formData.role as any);
      await adminService.updateUserStatus(teacher.id, formData.status as any);

      // Profil bilgilerini güncelleme (authService.updateProfile kullan)
      await authService.updateProfile(teacher.id, {
        name: formData.name,
        phone: formData.phone,
        profession: formData.profession,
        institution: formData.institution,
        subscriptionPlan: formData.subscriptionPlan as 'free' | 'pro',
      });

      toast.success(`${formData.name} profil bilgileri başarıyla güncellendi.`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Öğretmen bilgileri güncellenirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl overflow-hidden relative font-lexend"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">Öğretmen Profilini Düzenle</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">ID: {teacher.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Ad Soyad
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  E-Posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Telefon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="05XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Uzmanlık / Ünvan
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Kurum / Okul
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Abonelik Planı
                </label>
                <select
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value as 'free' | 'pro' })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="free">Ücretsiz Plan (Free)</option>
                  <option value="pro">Sınırsız Pro Öğretmen</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Sistem Rolü
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="teacher">Öğretmen</option>
                  <option value="admin">Sistem Yöneticisi (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                  Hesap Durumu
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="active">Aktif</option>
                  <option value="suspended">Askıda (Pasif)</option>
                  <option value="archived">Arşivlenmiş</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] text-[var(--text-muted)] font-bold text-xs border border-[var(--border-color)]"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
