/**
 * @file tests/store/useInfographicLayoutStore.test.ts
 * @description useInfographicLayoutStore Zustand Store Tests
 *
 * Test Coverage:
 * - Undo/Redo functionality
 * - History stack (max 20 levels)
 * - Partial layout updates
 * - Reset functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfographicLayoutStore } from '../../src/store/useInfographicLayoutStore';
import { DEFAULT_LAYOUT_CONFIG } from '../../src/services/layout/CompactLayoutEngine';

describe('useInfographicLayoutStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useInfographicLayoutStore());
    act(() => {
      result.current.resetLayout();
    });
  });

  describe('Initial State', () => {
    it('should initialize with default layout config', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      expect(result.current.layoutConfig).toEqual(DEFAULT_LAYOUT_CONFIG);
      expect(result.current.history.length).toBe(1);
      expect(result.current.historyIndex).toBe(0);
    });

    it('should not allow undo on initial state', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      expect(result.current.canUndo()).toBe(false);
    });

    it('should not allow redo on initial state', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      expect(result.current.canRedo()).toBe(false);
    });
  });

  describe('Update Layout', () => {
    it('should update layout config partially', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
      });

      expect(result.current.layoutConfig.contentDensity).toBe(80);
      expect(result.current.layoutConfig.pageSize).toBe(DEFAULT_LAYOUT_CONFIG.pageSize);
    });

    it('should add new state to history', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
      });

      expect(result.current.history.length).toBe(2);
      expect(result.current.historyIndex).toBe(1);
    });

    it('should enable undo after update', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
      });

      expect(result.current.canUndo()).toBe(true);
    });
  });

  describe('Undo Functionality', () => {
    it('should undo to previous state', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
      });

      const updatedDensity = result.current.layoutConfig.contentDensity;
      expect(updatedDensity).toBe(80);

      act(() => {
        result.current.undo();
      });

      expect(result.current.layoutConfig.contentDensity).toBe(DEFAULT_LAYOUT_CONFIG.contentDensity);
    });

    it('should decrease historyIndex on undo', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
      });

      expect(result.current.historyIndex).toBe(1);

      act(() => {
        result.current.undo();
      });

      expect(result.current.historyIndex).toBe(0);
    });

    it('should enable redo after undo', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
        result.current.undo();
      });

      expect(result.current.canRedo()).toBe(true);
    });

    it('should not undo beyond initial state', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
        result.current.undo();
        result.current.undo(); // Should be no-op
      });

      expect(result.current.historyIndex).toBe(0);
      expect(result.current.canUndo()).toBe(false);
    });
  });

  describe('Redo Functionality', () => {
    it('should redo to next state', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
        result.current.undo();
      });

      expect(result.current.layoutConfig.contentDensity).toBe(DEFAULT_LAYOUT_CONFIG.contentDensity);

      act(() => {
        result.current.redo();
      });

      expect(result.current.layoutConfig.contentDensity).toBe(80);
    });

    it('should increase historyIndex on redo', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
        result.current.undo();
      });

      expect(result.current.historyIndex).toBe(0);

      act(() => {
        result.current.redo();
      });

      expect(result.current.historyIndex).toBe(1);
    });

    it('should not redo beyond last state', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
        result.current.redo(); // Should be no-op
      });

      expect(result.current.historyIndex).toBe(1);
      expect(result.current.canRedo()).toBe(false);
    });
  });

  describe('History Stack Limit (Bora Demir Memory Optimization)', () => {
    it('should limit history to 20 entries', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        // Create 25 updates (exceeds 20 limit)
        for (let i = 1; i <= 25; i++) {
          result.current.updateLayout({ contentDensity: i });
        }
      });

      // Should cap at 20
      expect(result.current.history.length).toBeLessThanOrEqual(20);
    });

    it('should keep most recent 20 states when limit exceeded', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        for (let i = 1; i <= 25; i++) {
          result.current.updateLayout({ contentDensity: i });
        }
      });

      // Last state should be density = 25
      expect(result.current.layoutConfig.contentDensity).toBe(25);

      // Oldest state should be removed (density = 1-5 gone)
      act(() => {
        // Undo to oldest available state
        for (let i = 0; i < 19; i++) {
          result.current.undo();
        }
      });

      // Should not be able to undo back to density = 1
      expect(result.current.layoutConfig.contentDensity).toBeGreaterThan(5);
    });
  });

  describe('History Branching', () => {
    it('should clear redo history on new update after undo', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
        result.current.updateLayout({ contentDensity: 90 });
        result.current.undo(); // Back to 80
      });

      expect(result.current.canRedo()).toBe(true);

      act(() => {
        result.current.updateLayout({ contentDensity: 85 }); // New branch
      });

      // Redo should no longer be available (history branched)
      expect(result.current.canRedo()).toBe(false);
      expect(result.current.layoutConfig.contentDensity).toBe(85);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to default config', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
        result.current.updateLayout({ columnCount: 3 });
        result.current.resetLayout();
      });

      expect(result.current.layoutConfig).toEqual(DEFAULT_LAYOUT_CONFIG);
    });

    it('should clear history on reset', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
        result.current.updateLayout({ contentDensity: 90 });
        result.current.resetLayout();
      });

      expect(result.current.history.length).toBe(1);
      expect(result.current.historyIndex).toBe(0);
      expect(result.current.canUndo()).toBe(false);
    });
  });

  describe('Complex Update Scenarios', () => {
    it('should handle multiple partial updates', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
        result.current.updateLayout({ columnCount: 3 });
        result.current.updateLayout({ pageSize: 'Letter' });
      });

      expect(result.current.layoutConfig.contentDensity).toBe(80);
      expect(result.current.layoutConfig.columnCount).toBe(3);
      expect(result.current.layoutConfig.pageSize).toBe('Letter');
      expect(result.current.history.length).toBe(4); // initial + 3 updates
    });

    it('should preserve unmodified properties during partial update', () => {
      const { result } = renderHook(() => useInfographicLayoutStore());

      const initialMargins = result.current.layoutConfig.margins;

      act(() => {
        result.current.updateLayout({ contentDensity: 80 });
      });

      expect(result.current.layoutConfig.margins).toEqual(initialMargins);
    });
  });
});
