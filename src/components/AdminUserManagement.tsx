
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import { UserFilter } from '../types/admin';

export const AdminUserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<UserFilter>({
        search: '',
        role: 'all',
        status: 'all',
        sortBy: 'newest'
    });
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        // In a real app, this would use server-side pagination/filtering
        const { users: data } = await authService.getAllUsers(0, 100);
        setUsers(data);
        setLoading(false);
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchSearch = user.name.toLowerCase().includes(filter.search.toLowerCase()) || 
                                user.email.toLowerCase().includes(filter.search.toLowerCase());
            const matchRole = filter.role === 'all' || user.role === filter.role;
            const matchStatus = filter.status === 'all' || user.status === filter.status;
            return matchSearch && matchRole && matchStatus;
        }).sort((a, b) => {
            if (filter.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (filter.sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (filter.sortBy === 'name') return a.name.localeCompare(b.name);
            if (filter.sortBy === 'activity') return (b.worksheetCount || 0) - (a.worksheetCount || 0);
            return 0;
        });
    }, [users, filter]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        await adminService.updateUserRole(userId, newRole);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    const handleStatusChange = async (userId: string, currentStatus: UserStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        await adminService.updateUserStatus(userId, newStatus);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Filters Bar */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                    <input 
                        type="text" 
                        placeholder="İsim veya e-posta ile ara..." 
                        value={filter.search}
                        onChange={e => setFilter({...filter, search: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <select 
                        value={filter.role} 
                        onChange={e => setFilter({...filter, role: e.target.value as any})}
                        className="px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm font-medium"
                    >
                        <option value="all">Tüm Roller</option>
                        <option value="user">Kullanıcı</option>
                        <option value="admin">Yönetici</option>
                    </select>

                    <select 
                        value={filter.status} 
                        onChange={e => setFilter({...filter, status: e.target.value as any})}
                        className="px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm font-medium"
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="active">Aktif</option>
                        <option value="suspended">Askıda</option>
                    </select>

                    <select 
                        value={filter.sortBy} 
                        onChange={e => setFilter({...filter, sortBy: e.target.value as any})}
                        className="px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm font-medium"
                    >
                        <option value="newest">En Yeni</option>
                        <option value="oldest">En Eski</option>
                        <option value="name">İsim (A-Z)</option>
                        <option value="activity">Aktivite Yoğunluğu</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4 pl-6">Kullanıcı</th>
                                <th className="p-4">Durum</th>
                                <th className="p-4">Rol</th>
                                <th className="p-4">Kayıt Tarihi</th>
                                <th className="p-4 text-center">Etkinlikler</th>
                                <th className="p-4 text-right pr-6">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i></td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-zinc-500">Kullanıcı bulunamadı.</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-600" />
                                                <div>
                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                                                    <p className="text-xs text-zinc-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => handleStatusChange(user.id, user.status)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                                                    user.status === 'active' 
                                                    ? 'bg-green-50 text-green-700 border-green-100 hover:bg-red-50 hover:text-red-700 hover:border-red-100 group/status' 
                                                    : 'bg-red-50 text-red-700 border-red-100 hover:bg-green-50 hover:text-green-700 hover:border-green-100 group/status'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                <span className="group-hover/status:hidden">{user.status === 'active' ? 'Aktif' : 'Askıda'}</span>
                                                <span className="hidden group-hover/status:inline">{user.status === 'active' ? 'Engelle' : 'Aktifleştir'}</span>
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <select 
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                                className={`px-2 py-1 rounded text-xs font-bold border cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}
                                            >
                                                <option value="user">Kullanıcı</option>
                                                <option value="admin">Yönetici</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-zinc-500 font-mono text-xs">
                                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                                                {user.worksheetCount || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button className="text-zinc-400 hover:text-indigo-600 p-2 transition-colors" title="Detayları Gör">
                                                <i className="fa-solid fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="text-xs text-zinc-400 text-right px-2">
                Toplam {filteredUsers.length} kullanıcı gösteriliyor.
            </div>
        </div>
    );
};
