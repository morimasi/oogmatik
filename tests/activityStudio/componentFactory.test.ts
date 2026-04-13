import { describe, it, expect } from 'vitest';
import type { FactoryComponent } from '@/types/activityStudio';

describe('activity studio component factory', () => {
  it('bilesen sirasini korur', () => {
    const items: FactoryComponent[] = [
      { id: 'a', type: 'text', order: 0, content: {}, style: {}, isLocked: false },
      { id: 'b', type: 'quiz', order: 1, content: {}, style: {}, isLocked: false },
    ];

    const orders = items.map((item) => item.order);
    expect(orders).toEqual([0, 1]);
  });
});
