// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

afterEach(() => {
  cleanup();
});

import { DyslexicText } from '../atoms/DyslexicText';
import { HintButton } from '../molecules/HintButton';

// Mock matchMedia for Radix UI Popover
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // ResizeObserver is needed for some components
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('DyslexicText Component', () => {
  it('renders standard text correctly', () => {
    render(<DyslexicText text="Merhaba Dünya" />);
    expect(screen.getByText('Merhaba Dünya')).toBeInTheDocument();
  });

  it('syllabifies text if enabled', () => {
    const { container } = render(<DyslexicText text="Merhaba Dünya" syllabify={true} />);
    // "Merhaba" length is 7 -> mid = 3, so first part is "Mer", second is "haba"
    // "Dünya" length is 5 -> mid = 2, so first part is "Dü", second is "nya"
    expect(container).toHaveTextContent('Mer');
    expect(container).toHaveTextContent('haba');
    expect(container).toHaveTextContent('Dü');
    expect(container).toHaveTextContent('nya');
  });
});

describe('HintButton Component', () => {
  it('renders trigger button correctly', () => {
    render(<HintButton hint="Bu bir ipucudur" />);
    expect(screen.getByRole('button', { name: /İpucu/i })).toBeInTheDocument();
  });

  it('shows hint popover when clicked and calls onHintUsed', async () => {
    const handleHintUsed = vi.fn();
    render(<HintButton hint="Bu bir gizli ipucudur" onHintUsed={handleHintUsed} />);

    const button = screen.getByRole('button', { name: /İpucu/i });
    fireEvent.click(button);

    // Check if onHintUsed is called
    expect(handleHintUsed).toHaveBeenCalledTimes(1);

    // Hint text should appear in the document
    const popoverContent = await screen.findByText('Bu bir gizli ipucudur');
    expect(popoverContent).toBeInTheDocument();
  });
});
