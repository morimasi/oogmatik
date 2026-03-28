import { AppError } from '../utils/AppError';
/**
 * OOGMATIK - AI Agent Coordination Service
 * Coordinates 4 expert leader agents for educational content generation
 * @author Claude Code
 */

import { generateWithSchema } from './geminiClient.js';
import { db } from './firebaseClient.js';
import * as firestore from 'firebase/firestore';

const { collection, doc, setDoc, getDocs, query, orderBy, _limit, where } = firestore;

// ========================================
// TYPES
// ========================================

export type AgentRole =
  | 'ozel-ogrenme-uzmani'    // Elif Yıldız - Pedagogy
  | 'ozel-egitim-uzmani'     // Dr. Ahmet Kaya - Clinical/MEB
  | 'yazilim-muhendisi'      // Bora Demir - Engineering
  | 'ai-muhendisi';          // Selin Arslan - AI Architecture

export type AgentTaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';

export interface AgentTask {
  id: string;
  role: AgentRole;
  type: 'validation' | 'generation' | 'analysis' | 'optimization';
  description: string;
  status: AgentTaskStatus;
  priority: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  feedback?: string;
  error?: string;
}

export interface AgentProfile {
  role: AgentRole;
  name: string;
  title: string;
  expertise: string[];
  responsibilities: string[];
  avatar: string;
  color: string;
}

export interface AgentMetrics {
  role: AgentRole;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgResponseTime: number; // ms
  successRate: number; // %
  lastActive: string;
}

export interface AgentConversation {
  id: string;
  userId: string;
  agentRole: AgentRole;
  messages: AgentMessage[];
  createdAt: string;
  updatedAt: string;
  topic: string;
  status: 'active' | 'archived';
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ========================================
// AGENT PROFILES (4 Leader Experts)
// ========================================

export const AGENT_PROFILES: Record<AgentRole, AgentProfile> = {
  'ozel-ogrenme-uzmani': {
    role: 'ozel-ogrenme-uzmani',
    name: 'Elif Yıldız',
    title: 'Özel Öğrenme Uzmanı',
    expertise: [
      'Pedagojik tasarım',
      'ZPD uyumu',
      'Başarı mimarisi',
      'Öğrenme güçlüğü uyarlaması'
    ],
    responsibilities: [
      'Her aktivitenin pedagogicalNote içermesi',
      'İlk maddenin kolay olması (güven inşası)',
      'AgeGroup × Difficulty uyumu kontrolü',
      'Lexend font standardı koruması'
    ],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elif',
    color: '#6366f1'
  },
  'ozel-egitim-uzmani': {
    role: 'ozel-egitim-uzmani',
    name: 'Dr. Ahmet Kaya',
    title: 'Özel Eğitim Uzmanı',
    expertise: [
      'Klinik değerlendirme',
      'BEP (SMART format)',
      'MEB Özel Eğitim Yönetmeliği',
      '573 sayılı KHK uyumu'
    ],
    responsibilities: [
      'Tanı koyucu dil yasağı denetimi',
      'KVKK uyumluluğu (ad+tanı+skor ayrımı)',
      'BEP hedeflerinin SMART formatında olması',
      'Klinik içerik doğruluğu'
    ],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet',
    color: '#22c55e'
  },
  'yazilim-muhendisi': {
    role: 'yazilim-muhendisi',
    name: 'Bora Demir',
    title: 'Yazılım Mühendisi',
    expertise: [
      'TypeScript strict mode',
      'AppError standardı',
      'Rate limiting',
      'Güvenlik ve test'
    ],
    responsibilities: [
      'any tipi yasağı denetimi',
      'AppError formatı koruması',
      'RateLimiter + validateRequest zorunluluğu',
      'Vitest test coverage'
    ],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bora',
    color: '#f59e0b'
  },
  'ai-muhendisi': {
    role: 'ai-muhendisi',
    name: 'Selin Arslan',
    title: 'AI Mühendisi',
    expertise: [
      'Gemini 2.5 Flash optimizasyonu',
      'Prompt mühendisliği',
      'Token maliyet kontrolü',
      'AI güvenliği'
    ],
    responsibilities: [
      'gemini-2.5-flash sabiti koruması',
      'JSON repair motoru (3 katman) koruması',
      'User input sanitizasyonu (max 2000 char)',
      'Batch işleme (count > 10 → 5\'erli grup)'
    ],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Selin',
    color: '#ec4899'
  }
};

// ========================================
// AGENT SERVICE
// ========================================

export const agentService = {
  /**
   * Create a new agent task
   */
  createTask: async (task: Omit<AgentTask, 'id' | 'createdAt' | 'status'>): Promise<AgentTask> => {
    const newTask: AgentTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await setDoc(doc(db, 'agent_tasks', newTask.id), newTask);
    return newTask;
  },

  /**
   * Execute an agent task with the appropriate expert
   */
  executeTask: async (taskId: string): Promise<AgentTask> => {
    const taskDoc = await firestore.getDoc(doc(db, 'agent_tasks', taskId));
    if (!taskDoc.exists()) {
      throw new AppError(`Task ${taskId} not found`, 'INTERNAL_ERROR', 500);
    }

    const task = taskDoc.data() as AgentTask;
    const _profile = AGENT_PROFILES[task.role];

    // Update task status to in_progress
    await firestore.updateDoc(doc(db, 'agent_tasks', taskId), {
      status: 'in_progress',
      startedAt: new Date().toISOString()
    });

    try {
      let result: Record<string, unknown> = {};

      // Execute based on task type
      switch (task.type) {
        case 'validation':
          result = await agentService.validateContent(task.role, task.input);
          break;
        case 'generation':
          result = await agentService.generateContent(task.role, task.input);
          break;
        case 'analysis':
          result = await agentService.analyzeContent(task.role, task.input);
          break;
        case 'optimization':
          result = await agentService.optimizeContent(task.role, task.input);
          break;
      }

      // Update task as completed
      const completedTask: AgentTask = {
        ...task,
        status: 'completed',
        completedAt: new Date().toISOString(),
        output: result
      };

      await firestore.updateDoc(doc(db, 'agent_tasks', taskId), {
        status: 'completed',
        completedAt: completedTask.completedAt,
        output: result
      });

      // Log success
      await agentService.logAgentActivity(task.role, 'task_completed', {
        taskId,
        type: task.type,
        duration: Date.now() - new Date(task.createdAt).getTime()
      });

      return completedTask;
    } catch (error) {
      // Update task as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await firestore.updateDoc(doc(db, 'agent_tasks', taskId), {
        status: 'failed',
        completedAt: new Date().toISOString(),
        error: errorMessage
      });

      // Log failure
      await agentService.logAgentActivity(task.role, 'task_failed', {
        taskId,
        error: errorMessage
      });

      throw error;
    }
  },

  /**
   * Validate content according to agent's expertise
   */
  validateContent: async (
    role: AgentRole,
    content: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const profile = AGENT_PROFILES[role];

    const prompt = `[UZMAN ROL: ${profile.name} - ${profile.title}]

UZMANLARIN:
${profile.expertise.map(e => `• ${e}`).join('\n')}

SORUMLULUKLARIN:
${profile.responsibilities.map(r => `✓ ${r}`).join('\n')}

GÖREV: Aşağıdaki içeriği analiz et ve yukarıdaki sorumluluklar çerçevesinde doğrula.

İÇERİK:
${JSON.stringify(content, null, 2)}

YANIT FORMATI (JSON):
{
  "isValid": boolean,
  "violations": ["ihlal1", "ihlal2"],
  "suggestions": ["öneri1", "öneri2"],
  "severity": "critical" | "warning" | "info",
  "feedback": "Detaylı açıklama"
}`;

    const result = await generateWithSchema(prompt, {
      type: 'OBJECT',
      properties: {
        isValid: { type: 'BOOLEAN' },
        violations: { type: 'ARRAY', items: { type: 'STRING' } },
        suggestions: { type: 'ARRAY', items: { type: 'STRING' } },
        severity: { type: 'STRING' },
        feedback: { type: 'STRING' }
      },
      required: ['isValid', 'violations', 'suggestions', 'severity', 'feedback']
    });

    return result;
  },

  /**
   * Generate content using agent's expertise
   */
  generateContent: async (
    role: AgentRole,
    params: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const profile = AGENT_PROFILES[role];

    const prompt = `[UZMAN ROL: ${profile.name} - ${profile.title}]

UZMANLIKLARIN:
${profile.expertise.map(e => `• ${e}`).join('\n')}

GÖREV: Aşağıdaki parametrelere göre ${profile.title} bakış açısıyla içerik üret.

PARAMETRELER:
${JSON.stringify(params, null, 2)}

STANDARTLAR:
${profile.responsibilities.map(r => `✓ ${r}`).join('\n')}

Lütfen uzmanlık alanına uygun, standartlara uyumlu içerik üret.`;

    const result = await generateWithSchema(prompt, {
      type: 'OBJECT'
    });

    return result;
  },

  /**
   * Analyze content from agent's perspective
   */
  analyzeContent: async (
    role: AgentRole,
    content: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const profile = AGENT_PROFILES[role];

    const prompt = `[UZMAN ROL: ${profile.name} - ${profile.title}]

UZMANLIKLARIN:
${profile.expertise.map(e => `• ${e}`).join('\n')}

GÖREV: Aşağıdaki içeriği ${profile.title} perspektifinden derinlemesine analiz et.

İÇERİK:
${JSON.stringify(content, null, 2)}

YANIT FORMATI (JSON):
{
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "weaknesses": ["zayıf yön 1", "zayıf yön 2"],
  "recommendations": ["öneri 1", "öneri 2"],
  "score": number (0-100),
  "summary": "Özet değerlendirme"
}`;

    const result = await generateWithSchema(prompt, {
      type: 'OBJECT',
      properties: {
        strengths: { type: 'ARRAY', items: { type: 'STRING' } },
        weaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
        recommendations: { type: 'ARRAY', items: { type: 'STRING' } },
        score: { type: 'NUMBER' },
        summary: { type: 'STRING' }
      },
      required: ['strengths', 'weaknesses', 'recommendations', 'score', 'summary']
    });

    return result;
  },

  /**
   * Optimize content based on agent's standards
   */
  optimizeContent: async (
    role: AgentRole,
    content: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const profile = AGENT_PROFILES[role];

    const prompt = `[UZMAN ROL: ${profile.name} - ${profile.title}]

UZMANLIKLARIN:
${profile.expertise.map(e => `• ${e}`).join('\n')}

GÖREV: Aşağıdaki içeriği ${profile.title} standartlarına göre optimize et.

MEVCUT İÇERİK:
${JSON.stringify(content, null, 2)}

STANDARTLAR:
${profile.responsibilities.map(r => `✓ ${r}`).join('\n')}

Lütfen içeriği bu standartlara göre optimize et ve iyileştirilmiş versiyonu dön.`;

    const result = await generateWithSchema(prompt, {
      type: 'OBJECT'
    });

    return result;
  },

  /**
   * Get agent metrics
   */
  getAgentMetrics: async (role: AgentRole): Promise<AgentMetrics> => {
    const tasksSnapshot = await getDocs(
      query(collection(db, 'agent_tasks'), where('role', '==', role))
    );

    const tasks = tasksSnapshot.docs.map(d => d.data() as AgentTask);
    const completed = tasks.filter(t => t.status === 'completed');
    const failed = tasks.filter(t => t.status === 'failed');

    const responseTimes = completed
      .filter(t => t.startedAt && t.completedAt)
      .map(t => new Date(t.completedAt!).getTime() - new Date(t.startedAt!).getTime());

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const successRate = tasks.length > 0
      ? (completed.length / tasks.length) * 100
      : 0;

    const lastActive = tasks.length > 0
      ? tasks.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0].createdAt
      : new Date().toISOString();

    return {
      role,
      totalTasks: tasks.length,
      completedTasks: completed.length,
      failedTasks: failed.length,
      avgResponseTime,
      successRate,
      lastActive
    };
  },

  /**
   * Get all agent metrics
   */
  getAllAgentMetrics: async (): Promise<Record<AgentRole, AgentMetrics>> => {
    const roles: AgentRole[] = [
      'ozel-ogrenme-uzmani',
      'ozel-egitim-uzmani',
      'yazilim-muhendisi',
      'ai-muhendisi'
    ];

    const metricsPromises = roles.map(role => agentService.getAgentMetrics(role));
    const metricsArray = await Promise.all(metricsPromises);

    return roles.reduce((acc, role, index) => {
      acc[role] = metricsArray[index];
      return acc;
    }, {} as Record<AgentRole, AgentMetrics>);
  },

  /**
   * Log agent activity
   */
  logAgentActivity: async (
    role: AgentRole,
    action: string,
    metadata: Record<string, unknown>
  ): Promise<void> => {
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      action,
      metadata,
      timestamp: new Date().toISOString()
    };

    await setDoc(doc(db, 'agent_logs', log.id), log);
  },

  /**
   * Get agent conversation history
   */
  getConversations: async (
    userId: string,
    role?: AgentRole
  ): Promise<AgentConversation[]> => {
    let q = query(
      collection(db, 'agent_conversations'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    if (role) {
      q = query(q, where('agentRole', '==', role));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as AgentConversation);
  },

  /**
   * Create new conversation
   */
  createConversation: async (
    userId: string,
    agentRole: AgentRole,
    topic: string
  ): Promise<AgentConversation> => {
    const conversation: AgentConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      agentRole,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      topic,
      status: 'active'
    };

    await setDoc(doc(db, 'agent_conversations', conversation.id), conversation);
    return conversation;
  },

  /**
   * Add message to conversation
   */
  addMessage: async (
    conversationId: string,
    sender: 'user' | 'agent',
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<AgentMessage> => {
    const message: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };

    const conversationRef = doc(db, 'agent_conversations', conversationId);
    const conversationDoc = await firestore.getDoc(conversationRef);

    if (conversationDoc.exists()) {
      const conversation = conversationDoc.data() as AgentConversation;

      await firestore.updateDoc(conversationRef, {
        messages: [...conversation.messages, message],
        updatedAt: new Date().toISOString()
      });
    }

    return message;
  },

  /**
   * Coordinate multiple agents for complex task
   */
  coordinateAgents: async (
    taskDescription: string,
    requiredRoles: AgentRole[]
  ): Promise<Record<AgentRole, AgentTask>> => {
    const tasks: Record<AgentRole, AgentTask> = {} as Record<AgentRole, AgentTask>;

    // Create tasks for each required agent
    for (const role of requiredRoles) {
      const task = await agentService.createTask({
        role,
        type: 'validation',
        description: taskDescription,
        priority: 1,
        input: { task: taskDescription }
      });

      tasks[role] = task;
    }

    // Execute all tasks in parallel
    const executionPromises = Object.values(tasks).map(task =>
      agentService.executeTask(task.id)
    );

    const results = await Promise.all(executionPromises);

    // Update tasks with results
    results.forEach((result, index) => {
      const role = requiredRoles[index];
      tasks[role] = result;
    });

    return tasks;
  }
};
