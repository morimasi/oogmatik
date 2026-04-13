// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeSyncPanel } from '@/components/ActivityStudio/wizard/panels/ThemeSyncPanel';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';

describe('ThemeSyncPanel', () => {
  beforeEach(() => {
    cleanup();
    useActivityStudioStore.getState().resetStudio();
  });

  it('renders 4 color input fields', () => {
    render(<ThemeSyncPanel />);

    expect(screen.getByLabelText(/Primary Color/i)).toBeTruthy();
    expect(screen.getByLabelText(/Secondary Color/i)).toBeTruthy();
    expect(screen.getByLabelText(/Accent Color/i)).toBeTruthy();
    expect(screen.getByLabelText(/Paper Color/i)).toBeTruthy();
  });

  it('displays WCAG AAA contrast status live', () => {
    render(<ThemeSyncPanel />);

    const primaryInput = screen.getAllByLabelText(/Primary Color/i)[0];
    fireEvent.change(primaryInput, { target: { value: '#1F2937' } });

    expect(screen.getAllByText(/WCAG AAA/i).length).toBeGreaterThan(0);
  });
});
