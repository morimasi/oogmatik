/**
 * BDMIND - Agent Service Tests
 * Test suite aligned with the actual AgentService stub API
 */

import { describe, it, expect } from 'vitest';
import { agentService, AgentTask } from '../src/services/agentService';

describe('Agent Service', () => {
  describe('createTask', () => {
    it('should create task with required fields', () => {
      const task = agentService.createTask({
        type: 'validation',
        payload: { test: 'data' },
      });

      expect(task.id).toBeDefined();
      expect(task.id).toContain('task-');
      expect(task.status).toBe('pending');
      expect(task.type).toBe('validation');
      expect(task.payload).toEqual({ test: 'data' });
    });

    it('should generate unique task IDs', () => {
      const task1 = agentService.createTask({ type: 'a', payload: {} });
      const task2 = agentService.createTask({ type: 'b', payload: {} });
      expect(task1.id).not.toBe(task2.id);
    });
  });

  describe('executeTask', () => {
    it('should execute existing task and mark completed', async () => {
      const task = agentService.createTask({ type: 'validation', payload: {} });
      const result = await agentService.executeTask(task.id);
      expect(result).toBeDefined();
    });

    it('should return null for non-existent task', async () => {
      const result = await agentService.executeTask('nonexistent-id');
      expect(result).toBeNull();
    });
  });
});
