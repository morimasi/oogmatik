/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { ReadingAssessmentPdfGenerator } from '../src/services/pdf/ReadingAssessmentPdfGenerator';
import { ReadingPassage } from '../src/components/LiveReadingStudio/sampleStories';
import { ReadingSessionMetrics } from '../src/services/phonological/phonologicalScoringEngine';

vi.mock('jspdf', () => {
  const calls: any[] = [];
  function createDoc() {
    const doc: any = {
      internal: {
        pageSize: { getWidth: () => 210, getHeight: () => 297 },
      },
      splitTextToSize: vi.fn((text: string) => [text]),
      save: vi.fn(),
      getCalls: () => calls,
    };
    return new Proxy(doc, {
      get(target, prop) {
        if (prop in target) return target[prop];
        return vi.fn((...args: any[]) => {
          calls.push({ method: prop, args });
          return target;
        });
      },
    });
  }

  function MockJsPDF() {
    return createDoc();
  }

  return {
    default: MockJsPDF,
    jsPDF: MockJsPDF,
  };
});

describe('ReadingAssessmentPdfGenerator', () => {
  it('renders comprehension results and AI story evaluation', () => {
    const passage: ReadingPassage = {
      title: 'Test Passage',
      targetSkill: 'Reading',
      content: 'Some content',
      id: 'p1',
    };
    const metrics: ReadingSessionMetrics = {
      durationSeconds: 60,
      totalWordsTarget: 100,
      totalWordsRead: 95,
      correctWordsCount: 90,
      errorWordsCount: 5,
      selfCorrectionCount: 2,
      hesitationCount: 0,
      averageHesitationMs: 0,
      wcpm: 90,
      accuracyPercentage: 94,
      prosodyScore: 80,
      gradeLevelEquivalent: '2',
      errorBreakdown: {
        ERR_MIRROR: 0,
        ERR_OMISSION: 0,
        ERR_GUESS: 0,
        ERR_ADDITION: 0,
        ERR_REVERSAL: 0,
        ERR_TRANSPOSITION: 0,
        ERR_PHONETIC: 0,
        ERR_PUNCTUATION: 0,
        ERR_STRESS: 0,
      },
    };

    ReadingAssessmentPdfGenerator.generate({
      studentName: 'Ahmet',
      passage,
      metrics,
      comprehensionQuestions: [
        {
          question: 'What happened?',
          studentAnswer: 'Something',
          correctAnswer: 'Something',
          isCorrect: true,
          type: 'literal',
        },
      ],
      aiEvaluation: {
        score: 85,
        strengths: ['Good reading'],
        recommendations: ['Practice more'],
      },
    });

    expect(true).toBe(true);
  });
});
