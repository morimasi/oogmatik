const USER_FACING_TEXT_FIELDS = new Set([
  'answer',
  'answers',
  'A',
  'B',
  'C',
  'D',
  'aciklama',
  'baslik',
  'choices',
  'content',
  'creativePrompt',
  'creativeTask',
  'definition',
  'description',
  'dogruCevap',
  'dogru_cevap',
  'explanation',
  'example',
  'emailBody',
  'emailSubject',
  'gercek_yasam_baglantisi',
  'fullStory',
  'genre',
  'goal',
  'goals',
  'hint',
  'instruction',
  'items',
  'learningObjectives',
  'mainIdea',
  'message',
  'note',
  'options',
  'paragraph',
  'paragraphs',
  'panels',
  'pedagogicalGoals',
  'pedagogicalNote',
  'prompt',
  'question',
  'questions',
  'scenes',
  'sceneVisual',
  'sceneVisuals',
  'soru_metni',
  'unite_adi',
  'cozum_anahtari',
  'secenekler',
  'soruMetni',
  'sorular',
  'setting',
  'script',
  'socialCopy',
  'story',
  'subtitle',
  'targetSkills',
  'text',
  'title',
  'transitionWords',
  'textOverlay',
  'vocabulary',
  'word',
  'words',
  'visualDesc',
  'voiceover',
]);

const ENGLISH_FUNCTION_WORDS = new Set([
  'a', 'about', 'after', 'all', 'also', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'between', 'both', 'but', 'by', 'can',
  'could', 'did', 'do', 'does', 'during', 'each', 'every', 'few', 'for', 'from', 'had',
  'has', 'have', 'he', 'her', 'here', 'him', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'just', 'may', 'me', 'more', 'most', 'much', 'my',
  'no', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'out',
  'over', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the',
  'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'us', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'who', 'why', 'will', 'with', 'would', 'you', 'your',
]);

const isLikelyEnglishProse = (value: string): boolean => {
  if (value.length < 18) return false;

  const words = value.toLocaleLowerCase('en-US').match(/[a-z]+/g) ?? [];
  if (words.length < 4) return false;

  const functionWordCount = words.filter((word) => ENGLISH_FUNCTION_WORDS.has(word)).length;
  return functionWordCount >= 3 && functionWordCount / words.length >= 0.2;
};

const collectTextPaths = (value: unknown, path: string, paths: string[]): void => {
  if (typeof value === 'string') {
    if (isLikelyEnglishProse(value)) paths.push(path);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectTextPaths(item, `${path}[${index}]`, paths));
    return;
  }

  if (typeof value !== 'object' || value === null) return;

  for (const [key, child] of Object.entries(value)) {
    if (key === 'imagePrompt') continue;
    if (path.endsWith('sceneVisuals') && /^\d+$/.test(key)) {
      collectTextPaths(child, `${path}.${key}`, paths);
      continue;
    }
    if (!USER_FACING_TEXT_FIELDS.has(key)) continue;
    collectTextPaths(child, path ? `${path}.${key}` : key, paths);
  }
};

export const findLikelyEnglishUserFacingText = (value: unknown): string[] => {
  const paths: string[] = [];
  collectTextPaths(value, '', paths);
  return paths;
};
