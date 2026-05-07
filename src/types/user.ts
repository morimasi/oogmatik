export type UserRole = 'user' | 'admin' | 'teacher' | 'parent' | 'student' | 'editor' | 'superadmin' | 'guest';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  lastLogin: string;
  worksheetCount: number;
  status: UserStatus;
  subscriptionPlan: 'free' | 'pro';
  favorites: string[];
  lastActiveActivity?: {
    id: string;
    title: string;
    date: string;
  };
  profession?: string;
  institution?: string;
  phone?: string;
  bio?: string;
  permissions?: string[];
  accessibleModules?: string[];
}
