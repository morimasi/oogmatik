
import { User, UserRole } from '../types';

const USERS_KEY = 'app_users_db';
const CURRENT_USER_KEY = 'app_current_user';

// Default Admin
const DEFAULT_ADMIN: User = {
    id: 'admin-001',
    email: 'admin@bursadisleksi.com',
    name: 'Sistem Yöneticisi',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    worksheetCount: 12,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    status: 'active',
    subscriptionPlan: 'enterprise'
};

// Helper to generate mock users for admin dashboard visualization
const generateMockUsers = (): User[] => {
    const names = ["Ahmet Yılmaz", "Ayşe Demir", "Mehmet Öztürk", "Fatma Kaya", "Can Yıldız", "Elif Çelik", "Burak Şahin", "Ceren Arslan"];
    return names.map((name, i) => ({
        id: `user-${100 + i}`,
        email: `user${100 + i}@ornek.com`,
        name,
        role: 'user',
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
        worksheetCount: Math.floor(Math.random() * 50),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        status: Math.random() > 0.8 ? 'suspended' : 'active',
        subscriptionPlan: Math.random() > 0.7 ? 'pro' : 'free'
    }));
};

// Helper to get users DB
const getUsersDB = (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
        // Initial seed with admin and mock users
        const initialUsers = [DEFAULT_ADMIN, ...generateMockUsers()];
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        return initialUsers;
    }
    return JSON.parse(stored);
};

// Helper to save users DB
const saveUsersDB = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authService = {
    login: async (email: string, password: string): Promise<User> => {
        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const users = getUsersDB();
        // Simplified password check (In real app, hash check)
        // For demo: password is '123456' for users, 'admin123' for admin
        
        const user = users.find(u => u.email === email);
        
        if (!user) throw new Error('Kullanıcı bulunamadı.');
        if (user.status === 'suspended') throw new Error('Hesabınız askıya alınmıştır. Yönetici ile iletişime geçin.');
        
        // Mock Password Validation
        if (user.role === 'admin' && password !== 'admin123') throw new Error('Hatalı şifre.');
        if (user.role === 'user' && password !== '123456') throw new Error('Hatalı şifre.');

        // Update last login
        user.lastLogin = new Date().toISOString();
        saveUsersDB(users);

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
    },

    register: async (email: string, password: string, name: string): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const users = getUsersDB();
        if (users.find(u => u.email === email)) {
            throw new Error('Bu e-posta adresi zaten kayıtlı.');
        }

        const newUser: User = {
            id: Date.now().toString(),
            email,
            name,
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            worksheetCount: 0,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            status: 'active',
            subscriptionPlan: 'free'
        };

        users.push(newUser);
        saveUsersDB(users);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        return newUser;
    },

    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    getCurrentUser: (): User | null => {
        const stored = localStorage.getItem(CURRENT_USER_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
        const users = getUsersDB();
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) throw new Error('Kullanıcı bulunamadı');

        const updatedUser = { ...users[index], ...updates };
        users[index] = updatedUser;
        saveUsersDB(users);
        
        // Update session if it's the current user
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        }
        
        return updatedUser;
    },

    // Get available contacts for messaging (excluding current user)
    getContacts: (currentUserId: string): User[] => {
        const users = getUsersDB();
        return users.filter(u => u.id !== currentUserId && u.status === 'active');
    },

    // --- ADMIN METHODS ---
    getAllUsers: (): User[] => {
        return getUsersDB();
    },

    // Admin can delete any user (except self usually, handled in UI)
    deleteUser: async (userId: string): Promise<void> => {
        let users = getUsersDB();
        users = users.filter(u => u.id !== userId);
        saveUsersDB(users);
    },

    // Admin can edit any user properties
    adminUpdateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
        const users = getUsersDB();
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) throw new Error('Kullanıcı bulunamadı');

        const updatedUser = { ...users[index], ...updates };
        users[index] = updatedUser;
        saveUsersDB(users);
        return updatedUser;
    },

    // Admin create user without login
    adminCreateUser: async (user: Partial<User>): Promise<User> => {
        const users = getUsersDB();
        if (users.find(u => u.email === user.email)) {
            throw new Error('E-posta zaten kullanımda.');
        }
        
        const newUser: User = {
            id: Date.now().toString(),
            email: user.email || '',
            name: user.name || '',
            role: user.role || 'user',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            worksheetCount: 0,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
            status: user.status || 'active',
            subscriptionPlan: user.subscriptionPlan || 'free'
        };
        
        users.push(newUser);
        saveUsersDB(users);
        return newUser;
    },

    toggleUserStatus: (userId: string) => {
        const users = getUsersDB();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].status = users[index].status === 'active' ? 'suspended' : 'active';
            saveUsersDB(users);
        }
    }
};
