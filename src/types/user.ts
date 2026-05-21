export type UserRole = 'superadmin' | 'admin' | 'teacher';
export type UserRoleType = UserRole | 'student' | 'parent' | 'guest' | 'editor';
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
  pedagogySettings?: {
    curriculumSync: boolean;
    curriculumYear: string;
    zpdStrategy: 'optimal' | 'scaffold' | 'autonomy';
    terminologyMode: 'supportive' | 'clinical';
    bepIntegration: boolean;
    fontStandard: string;
  };
  aiAssistantSettings?: {
    tone: string;
    creativity: number;
    imageMode: 'cartoon' | 'realistic' | 'schematic' | 'lineart';
    scaffolding: 'low' | 'balanced' | 'high' | 'max';
    autoSuggest: boolean;
    voiceAssistant: boolean;
    analysisDepth: 'detailed' | 'summary' | 'bullet';
  };
}
