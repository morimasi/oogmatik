// @vitest-environment jsdom

import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import {
  buildCompactA4LayoutWithMinimums,
  getMinFontPT,
} from '@/services/compactA4LayoutService';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import { CompactA4LayoutPanel } from '@/components/ActivityStudio/wizard/panels/CompactA4LayoutPanel';
import type { AgeGroup, LearningDisabilityProfile } from '@/types/creativeStudio';

describe('CompactA4LayoutService - Age-Aware Fonts', () => {
  it('returns correct minimum font per age/profile', () => {
    expect(getMinFontPT('5-7', 'dyslexia')).toBe(14);
    expect(getMinFontPT('8-10', 'adhd')).toBe(12);
    expect(getMinFontPT('11-13', 'dyslexia')).toBe(12);
    expect(getMinFontPT('11-13', 'mixed')).toBe(12);
    expect(getMinFontPT('11-13', 'adhd')).toBe(11);
    expect(getMinFontPT('14+', 'dyscalculia')).toBe(11);
  });

  it('never returns font size below 11pt', () => {
    const ages: AgeGroup[] = ['5-7', '8-10', '11-13', '14+'];
    const profiles: LearningDisabilityProfile[] = [
      'dyslexia',
      'dyscalculia',
      'adhd',
      'mixed',
    ];

    for (const age of ages) {
      for (const profile of profiles) {
        expect(getMinFontPT(age, profile)).toBeGreaterThanOrEqual(11);
      }
    }
  });

  it('enforces minimum on all layout sections', () => {
    const layout = buildCompactA4LayoutWithMinimums(
      { densityLevel: 5, fontSize: 11, lineHeight: 1.6, marginMM: 10 },
      '5-7',
      'dyslexia'
    );

    layout.sections.forEach((section) => {
      expect(section.styling.fontSize).toBeGreaterThanOrEqual(14);
    });
  });
});

describe('CompactA4LayoutPanel', () => {
  beforeEach(() => {
    cleanup();
    useActivityStudioStore.getState().resetStudio();
  });

  it('renders sliders for density, fontSize, lineHeight, and margins', () => {
    render(<CompactA4LayoutPanel />);

    expect(screen.getByLabelText(/Density Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Font Size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Line Height/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Margins/i)).toBeInTheDocument();
  });

  it('shows effective minimum font text based on age group and profile', () => {
    render(<CompactA4LayoutPanel ageGroup="5-7" profile="dyslexia" />);

    expect(screen.getByText(/min 14pt for age 5-7/i)).toBeInTheDocument();
  });

  it('clamps font size to effective minimum', () => {
    render(<CompactA4LayoutPanel ageGroup="8-10" profile="mixed" />);

    const fontSlider = screen.getByLabelText(/Font Size/i) as HTMLInputElement;
    fireEvent.change(fontSlider, { target: { value: '11' } });

    expect(fontSlider.value).toBe('12');
    expect(useActivityStudioStore.getState().compactA4Config?.fontSize).toBe(12);
  });
});
