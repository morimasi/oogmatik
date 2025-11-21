
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
    worksheetCount: 0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
};

// Helper to get users DB
const getUsersDB = (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
        const initialUsers = [DEFAULT_ADMIN];
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
        
        // Mock Password Validation
        if (user.role === 'admin' && password !== 'admin123') throw new Error('Hatalı şifre.');
        if (user.role === 'user' && password !== '123456') throw new Error('Hatalı şifre.');

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
            worksheetCount: 0,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
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

    // Admin Methods
    getAllUsers: (): User[] => {
        return getUsersDB();
    },

    deleteUser: (userId: string) => {
        let users = getUsersDB();
        users = users.filter(u => u.id !== userId);
        saveUsersDB(users);
    }
};
