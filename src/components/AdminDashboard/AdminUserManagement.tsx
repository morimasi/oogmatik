import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  Shield as ShieldCheck, 
  UserMinus as UserX, 
  UserPlus as UserCheck, 
  MoreHorizontal, 
  Mail, 
  Calendar, 
  Activity as ActivityIcon,
  RefreshCcw as RefreshCw,
  ChevronDown,
  LockKeyhole as Lock,
  LockKeyholeOpen as Unlock,
  CircleCheck as CheckCircle2,
  AlertCircle,
  Clock,
  Archive as ArchiveIconUI
} from 'lucide-react';
import { UserStatus, UserRole } from '../../types';
import { authService } from '../../services/authService';
import { adminService } from '../../services/adminService';
import { emailService } from '../../services/emailService';
import { UserFilter, ManagedUser } from '../../types/admin';
import { useToastStore } from '../../store/useToastStore';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  teacher: 'Eğitici',
  student: 'Öğrenci',
  editor: 'Editör',
  superadmin: 'Süper Admin',
  parent: 'Veli',
  guest: 'Misafir',
  user: 'Kullanıcı'
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  teacher: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  student: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  editor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  superadmin: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  parent: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  guest: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
  user: 'text-teal-500 bg-teal-500/10 border-teal-500/20'
};

/**
 * AdminUserManagement — Premium User Operations Center
 * Deep integration with RBAC and Dark Glassmorphism Design
 */
export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<UserFilter>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'newest'
  });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const toast = useToastStore();

  const SUPER_ADMIN_EMAIL = 'morimasi@gmail.com';

  useEffect(() => {
    loadUsers();
    // Menü dışına tıklanınca kapat
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { users: data } = await authService.getAllUsers(0, 500);
      setUsers(data as unknown as ManagedUser[]);
    } catch (e) {
      toast.error('Kullanıcı listesi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = user.name.toLowerCase().includes(filter.search.toLowerCase()) || 
                          user.email.toLowerCase().includes(filter.search.toLowerCase());
      const matchRole = filter.role === 'all' || user.role === filter.role;
      // Arşivlenmişleri sadece 'archived' filtresi seçiliyse göster, yoksa gizle
      const matchStatus = filter.status === 'all' 
        ? user.status !== 'archived'
        : user.status === filter.status;
        
      return matchSearch && matchRole && matchStatus;
    }).sort((a, b) => {
      if (filter.sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (filter.sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      if (filter.sortBy === 'name') return a.name.localeCompare(b.name);
      if (filter.sortBy === 'activity') return (b.worksheetCount || 0) - (a.worksheetCount || 0);
      return 0;
    });
  }, [users, filter]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const user = users.find(u => u.id === userId);
    if (user?.email === SUPER_ADMIN_EMAIL) {
      toast.error('Kritik: Super Admin rolü değiştirilemez!');
      return;
    }
    if (newRole === 'superadmin') {
      toast.error('Geçersiz İşlem: Sadece bir kullanıcı Super Admin olabilir.');
      return;
    }
    
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`${user?.name} rolü ${ROLE_LABELS[newRole]} olarak güncellendi.`);
    } catch (e) {
      toast.error('Rol güncelleme hatası');
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.email === SUPER_ADMIN_EMAIL) {
      toast.error('Kritik: Super Admin hesabı askıya alınamaz!');
      return;
    }

    const isApproval = currentStatus === 'pending';
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminService.updateUserStatus(userId, newStatus as any);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
      
      if (isApproval && user) {
        toast.success('Hesap onaylandı! E-posta gönderiliyor...');
        const emailSent = await emailService.sendApprovalEmail(user.email, user.name);
        if (emailSent) {
          toast.success(`${user.email} adresine onay e-postası otomatik olarak gönderildi.`);
        } else {
          toast.error('Onay e-postası gönderilirken bir hata oluştu.');
        }
      } else {
        toast.success(newStatus === 'active' ? 'Hesap aktifleştirildi.' : 'Hesap askıya alındı.');
      }
    } catch (e) {
      toast.error('Durum güncelleme hatası');
    }
  };

  const handleDeleteUser = async (user: ManagedUser) => {
    if (user.email === SUPER_ADMIN_EMAIL) {
      toast.error('Super Admin silinemez!');
      return;
    }
    if (!confirm(`${user.name} kullanıcısını kalıcı olarak silmek istediğinize emin misiniz?`)) return;

    try {
      await adminService.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast.success('Kullanıcı başarıyla silindi.');
    } catch (e) {
      toast.error('Kullanıcı silinirken hata oluştu.');
    }
  };

  const handleArchiveUser = async (userId: string, isArchived: boolean) => {
    const user = users.find(u => u.id === userId);
    if (user?.email === SUPER_ADMIN_EMAIL) {
      toast.error('Super Admin arşivlenemez!');
      return;
    }

    const newStatus = isArchived ? 'active' : 'archived';
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
      toast.success(isArchived ? 'Kullanıcı arşivden çıkarıldı.' : 'Kullanıcı arşivlendi.');
    } catch (e) {
      toast.error('Arşivleme işlemi başarısız.');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 font-lexend">
      
      {/* ── Control Bar ─────────────────────────────────────────────── */}
      <div className="bg-white/40 dark:bg-black/20 p-5 rounded-[2rem] border border-zinc-200 dark:border-white/5 backdrop-blur-xl flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="İsim veya e-posta ile ara..." 
            value={filter.search}
            onChange={e => setFilter({...filter, search: e.target.value})}
            className="w-full pl-12 pr-6 py-3 bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-white/5">
            <Filter size={14} className="text-zinc-400" />
            <select 
              value={filter.role} 
              onChange={e => setFilter({...filter, role: e.target.value as any})}
              className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none py-2"
            >
              <option value="all">Tüm Roller</option>
              {Object.entries(ROLE_LABELS).map(([role, label]) => (
                <option key={role} value={role}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-white/5">
            <ActivityIcon size={14} className="text-zinc-400" />
            <select 
              value={filter.status} 
              onChange={e => setFilter({...filter, status: e.target.value as any})}
              className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none py-2"
            >
              <option value="all">Aktif & Bekleyenler</option>
              <option value="active">Aktif</option>
              <option value="suspended">Askıda</option>
              <option value="pending">Onay Bekliyor</option>
              <option value="archived">Arşivlenmiş</option>
            </select>
          </div>

          <button 
            onClick={loadUsers}
            className="p-3 bg-white/50 dark:bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-indigo-500 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── User Directory Table ─────────────────────────────────────── */}
      <div className="bg-white/40 dark:bg-black/20 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden flex-1 flex flex-col backdrop-blur-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              <tr>
                <th className="px-8 py-5">Üyelik Profili</th>
                <th className="px-6 py-5">Erişim Durumu</th>
                <th className="px-6 py-5">Yetki Seviyesi</th>
                <th className="px-6 py-5">Kayıt / Aktivite</th>
                <th className="px-8 py-5 text-right">Yönetim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Kullanıcı Veritabanı Taranıyor</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-zinc-500 font-bold uppercase text-xs">Eşleşen üye kaydı bulunamadı.</td></tr>
              ) : (
                <AnimatePresence>
                  {filteredUsers.map((user, idx) => {
                    const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
                    const isUserArchived = user.status === 'archived';

                    return (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                        key={user.id} 
                        className={`hover:bg-white/50 dark:hover:bg-white/5 transition-all group ${isSuperAdmin ? 'bg-indigo-500/5 dark:bg-indigo-500/5' : ''} ${isUserArchived ? 'opacity-40 grayscale-[0.5]' : ''}`}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                               <img src={user.avatar} alt="" className="w-12 h-12 rounded-2xl border-2 border-white dark:border-zinc-800 shadow-md group-hover:scale-105 transition-transform" />
                               <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 
                                ${user.status === 'active' ? 'bg-emerald-500' : user.status === 'archived' ? 'bg-zinc-500' : 'bg-rose-500'}`} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-tight truncate">{user.name}</p>
                                    {isSuperAdmin && <ShieldCheck size={14} className="text-indigo-500" />}
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold">
                                    <Mail size={10} /> {user.email}
                                </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          {isSuperAdmin ? (
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 active-glow">
                               <ShieldCheck size={12} /> Root Access
                            </span>
                          ) : (
                            <button 
                                onClick={() => handleStatusChange(user.id, user.status)}
                                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    user.status === 'active' 
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 group/st' 
                                    : user.status === 'pending'
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 group/st animate-pulse'
                                    : user.status === 'archived'
                                    ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 group/st'
                                }`}
                            >
                                <span className="group-hover/st:hidden flex items-center gap-2">
                                  {user.status === 'active' ? <CheckCircle2 size={12} /> : user.status === 'pending' ? <Clock size={12} /> : user.status === 'archived' ? <ArchiveIconUI size={12} /> : <AlertCircle size={12} />}
                                  {user.status === 'active' ? 'AKTİF' : user.status === 'pending' ? 'ONAY BEKLİYOR' : user.status === 'archived' ? 'ARŞİVLENMİŞ' : 'ASKIYA ALINDI'}
                                </span>
                                <span className={user.status === 'archived' ? 'hidden' : 'hidden group-hover/st:flex items-center gap-2'}>
                                  {user.status === 'active' ? <UserX size={12} /> : <UserCheck size={12} />}
                                  {user.status === 'active' ? 'ENGELLE' : user.status === 'pending' ? 'ONAYLA & BAŞLAT' : 'AKTİFLEŞTİR'}
                                </span>
                            </button>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {isSuperAdmin ? (
                            <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest italic">
                               <Lock size={12} /> Değiştirilemez
                            </div>
                          ) : (
                            <div className="relative group/role">
                              <select 
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                  className={`appearance-none pl-4 pr-10 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border cursor-pointer outline-none transition-all focus:ring-2 focus:ring-indigo-500/30 ${ROLE_COLORS[user.role] || 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}
                              >
                                  {Object.entries(ROLE_LABELS).map(([role, label]) => (
                                    <option key={role} value={role}>{label}</option>
                                  ))}
                              </select>
                              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                               <Calendar size={10} /> {new Date(user.createdAt || Date.now()).toLocaleDateString('tr-TR')}
                             </div>
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                               <ActivityIcon size={10} /> {user.worksheetCount || 0} Aktivite
                             </div>
                          </div>
                        </td>

                        <td className="px-8 py-5 text-right relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === user.id ? null : user.id);
                            }}
                            className={`p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all active:scale-90 ${openMenuId === user.id ? 'bg-indigo-500/10 text-indigo-500 ring-2 ring-indigo-500/20' : ''}`}
                          >
                              <MoreHorizontal size={18} />
                          </button>

                          <AnimatePresence>
                            {openMenuId === user.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-8 top-full mt-2 w-48 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="p-2 space-y-1">
                                  <button onClick={() => {toast.info("Düzenleme özelliği yakında!"); setOpenMenuId(null);}} className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 hover:text-indigo-500 rounded-xl transition-all">
                                    <Search size={14} /> Bilgileri Görüntüle
                                  </button>
                                  <button onClick={() => {handleStatusChange(user.id, user.status); setOpenMenuId(null);}} className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-amber-500/10 hover:text-amber-500 rounded-xl transition-all">
                                    {user.status === 'suspended' ? <Unlock size={14} /> : <Lock size={14} />}
                                    {user.status === 'suspended' ? 'Erişimi Aç' : 'Erişimi Engelle'}
                                  </button>
                                  <button onClick={() => {handleArchiveUser(user.id, isUserArchived); setOpenMenuId(null);}} className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all">
                                    <ArchiveIconUI size={14} /> 
                                    {isUserArchived ? 'Arşivden Çıkar' : 'Arşive Gönder'}
                                  </button>
                                  <div className="h-px bg-zinc-100 dark:bg-white/5 my-1" />
                                  <button onClick={() => {handleDeleteUser(user); setOpenMenuId(null);}} className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                    <UserX size={14} /> Kaydı Tamamen Sil
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-6 py-4 bg-black/10 rounded-[2rem] border border-white/5 backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Veritabanında kayıtlı <span className="text-indigo-500">{users.length}</span> kullanıcıdan <span className="text-white">{filteredUsers.length}</span> tanesi gösteriliyor.</p>
        <div className="flex items-center gap-2">
           <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 text-zinc-500 border border-white/5 hover:bg-zinc-700 transition-colors">1</button>
           <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-white transition-colors">2</button>
        </div>
      </div>
    </div>
  );
};

AdminUserManagement.displayName = 'AdminUserManagement';
