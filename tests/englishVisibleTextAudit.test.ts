import { describe, expect, it } from 'vitest';
import { collectEnglishVisibleTextCandidates } from '../scripts/audit-user-facing-english.mjs';

describe('English visible-text audit', () => {
  it('flags visible English phrases but ignores code keys and image-only prompts', () => {
    const source = `
      const view = <button title="Dashboard">Save</button>;
      const modelOnly = { imagePrompt: 'storybook illustration', id: 'dashboard' };
      const content = { instruction: 'Read the story and answer the questions.' };
      const localized = <span>Çalışmayı Kaydet</span>;
      const languageOption = <button>English</button>;
      const image = <img alt="Preview" />;
      const imageWithLabel = <img alt="Watermark Logo" />;
      const profile = <img alt="Avatar" />;
      const controls = <div aria-label="Density Level" title="Zoom level" />;
      const property = <input placeholder="Radius" />;
      const styleLabel = <label>Border Radius and opacity</label>;
      const apiError = {
        error: 'Failed to generate image',
        message: 'The image service is not available right now.',
      };
    `;

    expect(collectEnglishVisibleTextCandidates(source, 'fixture.tsx').map(({ text }) => text)).toEqual([
      'Dashboard',
      'Save',
      'Read the story and answer the questions.',
      'English',
      'Preview',
      'Watermark Logo',
      'Avatar',
      'Density Level',
      'Zoom level',
      'Radius',
      'Border Radius and opacity',
      'Failed to generate image',
      'The image service is not available right now.',
    ]);
  });
});
