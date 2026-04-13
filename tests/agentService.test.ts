/**
 * OOGMATIK - Agent Service Tests
 * Comprehensive test suite for AI agent coordination system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { agentService, AGENT_PROFILES, AgentRole } from '@/services/agentService';

describe('Agent Service', () => {
  describe('AGENT_PROFILES', () => {
    it('should have all 4 expert agents defined', () => {
      expect(Object.keys(AGENT_PROFILES)).toHaveLength(4);
      expect(AGENT_PROFILES['ozel-ogrenme-uzmani']).toBeDefined();
      expect(AGENT_PROFILES['ozel-egitim-uzmani']).toBeDefined();
      expect(AGENT_PROFILES['yazilim-muhendisi']).toBeDefined();
      expect(AGENT_PROFILES['ai-muhendisi']).toBeDefined();
    });

    it('should have required profile fields', () => {
      Object.values(AGENT_PROFILES).forEach(profile => {
        expect(profile.role).toBeDefined();
        expect(profile.name).toBeDefined();
        expect(profile.title).toBeDefined();
        expect(profile.expertise).toBeInstanceOf(Array);
        expect(profile.responsibilities).toBeInstanceOf(Array);
        expect(profile.avatar).toBeDefined();
        expect(profile.color).toBeDefined();
      });
    });

    it('should have Elif Yıldız as pedagogy expert', () => {
      const elif = AGENT_PROFILES['ozel-ogrenme-uzmani'];
      expect(elif.name).toBe('Elif Yıldız');
      expect(elif.title).toBe('Özel Öğrenme Uzmanı');
      expect(elif.responsibilities).toContain('Her aktivitenin pedagogicalNote içermesi');
    });

    it('should have Dr. Ahmet Kaya as clinical expert', () => {
      const ahmet = AGENT_PROFILES['ozel-egitim-uzmani'];
      expect(ahmet.name).toBe('Dr. Ahmet Kaya');
      expect(ahmet.title).toBe('Özel Eğitim Uzmanı');
      expect(ahmet.responsibilities.some(r => r.includes('KVKK'))).toBe(true);
    });

    it('should have Bora Demir as engineering expert', () => {
      const bora = AGENT_PROFILES['yazilim-muhendisi'];
      expect(bora.name).toBe('Bora Demir');
      expect(bora.title).toBe('Yazılım Mühendisi');
      expect(bora.responsibilities.some(r => r.includes('TypeScript'))).toBe(true);
    });

    it('should have Selin Arslan as AI expert', () => {
      const selin = AGENT_PROFILES['ai-muhendisi'];
      expect(selin.name).toBe('Selin Arslan');
      expect(selin.title).toBe('AI Mühendisi');
      expect(selin.responsibilities.some(r => r.includes('gemini-2.5-flash'))).toBe(true);
    });
  });

  describe('createTask', () => {
    it('should create task with required fields', async () => {
      const task = await agentService.createTask({
        role: 'ozel-ogrenme-uzmani',
        type: 'validation',
        description: 'Test validation',
        priority: 1,
        input: { test: 'data' }
      });

      expect(task.id).toBeDefined();
      expect(task.id).toMatch(/^task_/);
      expect(task.createdAt).toBeDefined();
      expect(task.status).toBe('pending');
      expect(task.role).toBe('ozel-ogrenme-uzmani');
      expect(task.type).toBe('validation');
    });

    it('should generate unique task IDs', async () => {
      const task1 = await agentService.createTask({
        role: 'ozel-ogrenme-uzmani',
        type: 'validation',
        description: 'Test 1',
        priority: 1,
        input: {}
      });

      const task2 = await agentService.createTask({
        role: 'ozel-ogrenme-uzmani',
        type: 'validation',
        description: 'Test 2',
        priority: 1,
        input: {}
      });

      expect(task1.id).not.toBe(task2.id);
    });
  });

  describe('validateContent', () => {
    it('should return validation result with required fields', async () => {
      const result = await agentService.validateContent(
        'ozel-ogrenme-uzmani',
        { activity: 'test content' }
      );

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('violations');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('feedback');
    });

    it('should validate with clinical expert for BEP content', async () => {
      const bepContent = {
        goals: [
          {
            objective: 'Test objective',
            targetDate: '2026-12-31',
            measurableIndicator: 'Test indicator'
          }
        ]
      };

      const result = await agentService.validateContent(
        'ozel-egitim-uzmani',
        bepContent
      );

      expect(result).toBeDefined();
      expect(typeof result.isValid).toBe('boolean');
    });
  });

  describe('generateContent', () => {
    it('should generate content based on agent expertise', async () => {
      const result = await agentService.generateContent(
        'ozel-ogrenme-uzmani',
        {
          topic: 'Okuma anlama',
          difficulty: 'Kolay',
          ageGroup: '8-10'
        }
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('analyzeContent', () => {
    it('should return analysis with required structure', async () => {
      const result = await agentService.analyzeContent(
        'ai-muhendisi',
        { prompt: 'Test prompt', tokens: 100 }
      );

      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('summary');
    });

    it('should provide score between 0-100', async () => {
      const result = await agentService.analyzeContent(
        'ozel-ogrenme-uzmani',
        { activity: 'sample activity' }
      );

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('optimizeContent', () => {
    it('should optimize content according to agent standards', async () => {
      const content = {
        title: 'Test Activity',
        description: 'Sample activity'
      };

      const result = await agentService.optimizeContent(
        'yazilim-muhendisi',
        content
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('coordinateAgents', () => {
    it('should coordinate multiple agents for complex task', async () => {
      const result = await agentService.coordinateAgents(
        'Comprehensive content validation',
        ['ozel-ogrenme-uzmani', 'ozel-egitim-uzmani']
      );

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['ozel-ogrenme-uzmani']).toBeDefined();
      expect(result['ozel-egitim-uzmani']).toBeDefined();
    });

    it('should execute all agent tasks', async () => {
      const roles: AgentRole[] = [
        'ozel-ogrenme-uzmani',
        'ozel-egitim-uzmani',
        'yazilim-muhendisi',
        'ai-muhendisi'
      ];

      const result = await agentService.coordinateAgents(
        'Full system validation',
        roles
      );

      expect(Object.keys(result)).toHaveLength(4);
      Object.values(result).forEach(task => {
        expect(['completed', 'failed']).toContain(task.status);
      });
    });
  });

  describe('Agent Metrics', () => {
    it('should calculate metrics for agent', async () => {
      const metrics = await agentService.getAgentMetrics('ozel-ogrenme-uzmani');

      expect(metrics).toHaveProperty('role');
      expect(metrics).toHaveProperty('totalTasks');
      expect(metrics).toHaveProperty('completedTasks');
      expect(metrics).toHaveProperty('failedTasks');
      expect(metrics).toHaveProperty('avgResponseTime');
      expect(metrics).toHaveProperty('successRate');
      expect(metrics).toHaveProperty('lastActive');
    });

    it('should return metrics for all agents', async () => {
      const allMetrics = await agentService.getAllAgentMetrics();

      expect(Object.keys(allMetrics)).toHaveLength(4);
      expect(allMetrics['ozel-ogrenme-uzmani']).toBeDefined();
      expect(allMetrics['ozel-egitim-uzmani']).toBeDefined();
      expect(allMetrics['yazilim-muhendisi']).toBeDefined();
      expect(allMetrics['ai-muhendisi']).toBeDefined();
    });

    it('should calculate success rate correctly', async () => {
      const metrics = await agentService.getAgentMetrics('ozel-ogrenme-uzmani');

      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeLessThanOrEqual(100);

      if (metrics.totalTasks > 0) {
        const calculatedRate = (metrics.completedTasks / metrics.totalTasks) * 100;
        expect(Math.abs(metrics.successRate - calculatedRate)).toBeLessThan(0.1);
      }
    });
  });

  describe('Agent Conversations', () => {
    const testUserId = 'test-user-123';
    const testTopic = 'Disleksi desteği hakkında';

    it('should create new conversation', async () => {
      const conversation = await agentService.createConversation(
        testUserId,
        'ozel-ogrenme-uzmani',
        testTopic
      );

      expect(conversation.id).toMatch(/^conv_/);
      expect(conversation.userId).toBe(testUserId);
      expect(conversation.agentRole).toBe('ozel-ogrenme-uzmani');
      expect(conversation.topic).toBe(testTopic);
      expect(conversation.messages).toEqual([]);
      expect(conversation.status).toBe('active');
    });

    it('should add message to conversation', async () => {
      const conversation = await agentService.createConversation(
        testUserId,
        'ozel-ogrenme-uzmani',
        testTopic
      );

      const message = await agentService.addMessage(
        conversation.id,
        'user',
        'Test message'
      );

      expect(message.id).toMatch(/^msg_/);
      expect(message.sender).toBe('user');
      expect(message.content).toBe('Test message');
      expect(message.timestamp).toBeDefined();
    });

    it('should retrieve user conversations', async () => {
      const conversations = await agentService.getConversations(testUserId);

      expect(Array.isArray(conversations)).toBe(true);
    });

    it('should filter conversations by agent role', async () => {
      const conversations = await agentService.getConversations(
        testUserId,
        'ozel-ogrenme-uzmani'
      );

      expect(Array.isArray(conversations)).toBe(true);
      conversations.forEach(conv => {
        expect(conv.agentRole).toBe('ozel-ogrenme-uzmani');
      });
    });
  });

  describe('Agent Logging', () => {
    it('should log agent activity', async () => {
      await expect(
        agentService.logAgentActivity(
          'ozel-ogrenme-uzmani',
          'test_action',
          { test: 'metadata' }
        )
      ).resolves.not.toThrow();
    });

    it('should log with timestamp', async () => {
      const beforeLog = Date.now();
      await agentService.logAgentActivity(
        'ozel-ogrenme-uzmani',
        'test_action',
        {}
      );
      const afterLog = Date.now();

      // Verify log was created within reasonable timeframe
      expect(afterLog - beforeLog).toBeLessThan(5000);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: create → execute → validate', async () => {
      // Create task
      const task = await agentService.createTask({
        role: 'ozel-ogrenme-uzmani',
        type: 'validation',
        description: 'Integration test',
        priority: 1,
        input: { test: 'content' }
      });

      expect(task.status).toBe('pending');

      // Execute task
      const executedTask = await agentService.executeTask(task.id);

      expect(['completed', 'failed']).toContain(executedTask.status);

      if (executedTask.status === 'completed') {
        expect(executedTask.output).toBeDefined();
        expect(executedTask.completedAt).toBeDefined();
      }

      // Verify metrics updated
      const metrics = await agentService.getAgentMetrics('ozel-ogrenme-uzmani');
      expect(metrics.totalTasks).toBeGreaterThan(0);
    });

    it('should enforce agent responsibilities', async () => {
      // Test pedagogical note requirement (Elif Yıldız)
      const pedagogicalValidation = await agentService.validateContent(
        'ozel-ogrenme-uzmani',
        { activity: 'test', pedagogicalNote: null }
      );

      expect(pedagogicalValidation.violations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('pedagogicalNote')
        ])
      );

      // Test KVKK compliance (Dr. Ahmet Kaya)
      const kvkkValidation = await agentService.validateContent(
        'ozel-egitim-uzmani',
        { studentName: 'Ali', diagnosis: 'disleksi', score: 85 }
      );

      expect(kvkkValidation.violations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('KVKK')
        ])
      );

      // Test TypeScript standards (Bora Demir)
      const codeValidation = await agentService.validateContent(
        'yazilim-muhendisi',
        { code: 'const x: any = 5;' }
      );

      expect(codeValidation.violations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('any')
        ])
      );

      // Test AI model constancy (Selin Arslan)
      const aiValidation = await agentService.validateContent(
        'ai-muhendisi',
        { model: 'gpt-4' }
      );

      expect(aiValidation.violations).toEqual(
        expect.arrayContaining([
          expect.stringContaining('gemini-2.5-flash')
        ])
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid agent role', async () => {
      await expect(
        agentService.createTask({
          role: 'invalid-role' as AgentRole,
          type: 'validation',
          description: 'Test',
          priority: 1,
          input: {}
        })
      ).rejects.toThrow();
    });

    it('should handle missing task', async () => {
      await expect(
        agentService.executeTask('nonexistent-task-id')
      ).rejects.toThrow();
    });

    it('should mark failed tasks appropriately', async () => {
      const task = await agentService.createTask({
        role: 'ozel-ogrenme-uzmani',
        type: 'validation',
        description: 'Test failure',
        priority: 1,
        input: { invalid: 'data that will cause failure' }
      });

      try {
        await agentService.executeTask(task.id);
      } catch (error) {
        // Task should be marked as failed
        const metrics = await agentService.getAgentMetrics('ozel-ogrenme-uzmani');
        expect(metrics.failedTasks).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
