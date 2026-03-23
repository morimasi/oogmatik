/**
 * OOGMATIK - Admin User Management Dashboard V2
 * Enhanced admin panel for user role management and monitoring
 */

import React, { useState } from 'react';
import AdminAgentManagement from './AdminAgentManagement';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'teacher' | 'parent' | 'student';
    createdAt: string;
    lastLogin?: string;
    isActive: boolean;
    worksheetCount: number;
}

interface AdminDashboardProps {
    currentUserRole: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUserRole }) => {
    const [users, setUsers] = useState<User[]>([
        {
            id: 'user1',
            email: 'teacher@school.com',
            name: 'Ayşe Öğretmen',
            role: 'teacher',
            createdAt: '2026-01-15',
            lastLogin: '2026-03-11',
            isActive: true,
            worksheetCount: 25,
        },
        {
            id: 'user2',
            email: 'student@school.com',
            name: 'Mehmet Öğrenci',
            role: 'student',
            createdAt: '2026-02-01',
            lastLogin: '2026-03-10',
            isActive: true,
            worksheetCount: 8,
        },
    ]);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [newRole, setNewRole] = useState<string>('student');
    const [filterRole, setFilterRole] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'logs' | 'agents'>('users');

    // Only allow admin access
    if (currentUserRole !== 'admin') {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center py-12">
                    <i className="fa-solid fa-lock text-4xl text-red-500 mb-4"></i>
                    <p className="text-red-600 text-lg font-semibold">Bu sayfaya erişim izniniz yok</p>
                    <p className="text-gray-500 mt-2">Sadece yöneticiler bu işlemi gerçekleştirebilir</p>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter(user => {
        if (filterRole && user.role !== filterRole) return false;
        if (filterStatus === 'active' && !user.isActive) return false;
        if (filterStatus === 'inactive' && user.isActive) return false;
        return true;
    });

    const handleRoleChange = (userId: string, newRole: string) => {
        setUsers(prev =>
            prev.map(user =>
                user.id === userId ? { ...user, role: newRole as any } : user
            )
        );
        setShowModal(false);
        alert('Kullanıcı rolü başarıyla güncellendi');
    };

    const handleToggleActive = (userId: string) => {
        setUsers(prev =>
            prev.map(user =>
                user.id === userId ? { ...user, isActive: !user.isActive } : user
            )
        );
    };

    const roleColors: { [key: string]: string } = {
        admin: 'bg-red-100 text-red-800',
        teacher: 'bg-blue-100 text-blue-800',
        parent: 'bg-green-100 text-green-800',
        student: 'bg-yellow-100 text-yellow-800',
    };

    const roleLabels: { [key: string]: string } = {
        admin: 'Yönetici',
        teacher: 'Öğretmen',
        parent: 'Veli',
        student: 'Öğrenci',
    };

    // Permission matrix
    const permissionMatrix = {
        admin: ['create:worksheet', 'read:worksheet', 'update:worksheet', 'delete:worksheet', 'share:worksheet', 'manage:users', 'manage:content', 'view:analytics', 'export:data'],
        teacher: ['create:worksheet', 'read:worksheet', 'update:worksheet', 'delete:worksheet', 'share:worksheet'],
        parent: ['create:worksheet', 'read:worksheet', 'share:worksheet'],
        student: ['create:worksheet', 'read:worksheet'],
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Yönetici Paneli</h1>
                <p className="text-gray-600">Sistemin tüm yönetim işlemlerini gerçekleştirin</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                    <div className="text-sm text-gray-600">Toplam Kullanıcı</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</div>
                    <div className="text-sm text-gray-600">Aktif Kullanıcı</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.role === 'teacher').length}</div>
                    <div className="text-sm text-gray-600">Öğretmen</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">{users.reduce((sum, u) => sum + u.worksheetCount, 0)}</div>
                    <div className="text-sm text-gray-600">Toplam Çalışma</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 px-4 font-medium transition-colors ${
                        activeTab === 'users'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <i className="fa-solid fa-users mr-2"></i>Kullanıcılar
                </button>
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`pb-3 px-4 font-medium transition-colors ${
                        activeTab === 'permissions'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <i className="fa-solid fa-shield mr-2"></i>İzinler
                </button>
                <button
                    onClick={() => setActiveTab('agents')}
                    className={`pb-3 px-4 font-medium transition-colors ${
                        activeTab === 'agents'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <i className="fa-solid fa-robot mr-2"></i>AI Ajanlar
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`pb-3 px-4 font-medium transition-colors ${
                        activeTab === 'logs'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <i className="fa-solid fa-history mr-2"></i>Kayıtlar
                </button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div>
                    <div className="flex gap-4 mb-6">
                        <select
                            value={filterRole}
                            onChange={e => setFilterRole(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tüm Roller</option>
                            <option value="admin">Yönetici</option>
                            <option value="teacher">Öğretmen</option>
                            <option value="parent">Veli</option>
                            <option value="student">Öğrenci</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Pasif</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Ad</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">E-mail</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Rol</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Durum</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Çalışmalar</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Son Giriş</th>
                                    <th className="px-4 py-3 text-right font-semibold text-gray-700">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800">{user.name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                                                {roleLabels[user.role]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {user.isActive ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{user.worksheetCount}</td>
                                        <td className="px-4 py-3 text-gray-600">{user.lastLogin || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewRole(user.role);
                                                        setShowModal(true);
                                                    }}
                                                    className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Rol Değiştir"
                                                >
                                                    <i className="fa-solid fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(user.id)}
                                                    className={`inline-flex items-center justify-center w-8 h-8 rounded transition-colors ${user.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-50'}`}
                                                    title={user.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                                >
                                                    <i className={`fa-solid ${user.isActive ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">İzin Matrisi</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700">İzin</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Yönetici</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Öğretmen</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Veli</th>
                                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Öğrenci</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {['create:worksheet', 'read:worksheet', 'update:worksheet', 'delete:worksheet', 'share:worksheet', 'manage:users', 'manage:content', 'view:analytics', 'export:data'].map(permission => (
                                    <tr key={permission} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-800">{permission}</td>
                                        <td className="px-4 py-3 text-center">
                                            {permissionMatrix.admin.includes(permission) && <i className="fa-solid fa-check text-green-600"></i>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {permissionMatrix.teacher.includes(permission) && <i className="fa-solid fa-check text-green-600"></i>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {permissionMatrix.parent.includes(permission) && <i className="fa-solid fa-check text-green-600"></i>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {permissionMatrix.student.includes(permission) && <i className="fa-solid fa-check text-green-600"></i>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* AI Agents Tab */}
            {activeTab === 'agents' && (
                <div>
                    <AdminAgentManagement />
                </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivite Kayıtları</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600">Audit logging sistemi kurulmuş. Tüm işlemler kaydediliyor.</p>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <i className="fa-solid fa-circle text-green-600 text-xs"></i>
                                <span>2026-03-11 14:30 - Ayşe Öğretmen çalışma sayfası oluşturdu</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <i className="fa-solid fa-circle text-blue-600 text-xs"></i>
                                <span>2026-03-11 12:15 - Mehmet Öğrenci Matematik çalışmasına erişti</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <i className="fa-solid fa-circle text-red-600 text-xs"></i>
                                <span>2026-03-10 09:45 - Erişim reddedildi (izin yok)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Kullanıcı Rolü Değiştir</h2>
                        
                        <div className="mb-4">
                            <p className="text-gray-600 mb-2">Kullanıcı: <strong>{selectedUser.name}</strong></p>
                            <p className="text-gray-600 mb-4">Mevcut Rol: <strong>{roleLabels[selectedUser.role]}</strong></p>

                            <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Rol</label>
                            <select
                                value={newRole}
                                onChange={e => setNewRole(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="student">Öğrenci</option>
                                <option value="parent">Veli</option>
                                <option value="teacher">Öğretmen</option>
                                <option value="admin">Yönetici</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => handleRoleChange(selectedUser.id, newRole)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
