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
    `;

    expect(collectEnglishVisibleTextCandidates(source, 'fixture.tsx').map(({ text }) => text)).toEqual([
      'Dashboard',
      'Save',
      'Read the story and answer the questions.',
      'English',
    ]);
  });
});
