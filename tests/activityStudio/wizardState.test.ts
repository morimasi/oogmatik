import { describe, it, expect } from 'vitest';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';

describe('activity studio wizard state', () => {
  it('adimlar arasinda ileri geri gecis yapar', () => {
    const store = useActivityStudioStore.getState();
    store.resetStudio();

    expect(useActivityStudioStore.getState().currentStep).toBe('goal');

    useActivityStudioStore.getState().setStep('content');
    expect(useActivityStudioStore.getState().currentStep).toBe('content');

    useActivityStudioStore.getState().setStep('preview');
    expect(useActivityStudioStore.getState().steps.find((step) => step.id === 'content')?.status).toBe('completed');
  });
});
