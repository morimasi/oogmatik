// Unit test for ReadingAssessmentPdfGenerator with new sections
import { ReadingAssessmentPdfGenerator } from '../src/services/pdf/ReadingAssessmentPdfGenerator';
import { ReadingPassage } from '../src/components/LiveReadingStudio/sampleStories';
import { ReadingSessionMetrics } from '../src/services/phonological/phonologicalScoringEngine';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => {
    const calls: any[] = [];
    return {
      setFillColor: jest.fn(),
      rect: jest.fn(),
      setTextColor: jest.fn(),
      setFont: jest.fn(),
      setFontSize: jest.fn(),
      text: jest.fn((...args) => calls.push({ method: 'text', args })),
      splitTextToSize: jest.fn((text) => [text]),
      roundedRect: jest.fn(),
      line: jest.fn(),
      save: jest.fn(),
      getCalls: () => calls,
    };
  });
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
        ERR_MORPH: 0,
        ERR_TRANSP: 0,
        SUCCESS_SELF: 2,
      },
      pedagogicalSummary: 'Summary',
      recommendations: ['Rec1'],
      // new fields
      comprehensionResults: { Q1: true, Q2: false },
      aiStoryEvaluation: { coherenceScore: 85, creativityScore: 70, overallRating: 'Good' },
    };

    ReadingAssessmentPdfGenerator.generate({ studentName: 'Test', passage, metrics });
    // Get the mock instance
    const JsPdfMock = require('jspdf');
    const instance = JsPdfMock.mock.results[0].value;
    const textCalls = instance.text.mock.calls.map((c: any) => c[0]);
    expect(textCalls).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Anlama Sorusu Sonuclari'),
        expect.stringContaining('Q1: Dogru'),
        expect.stringContaining('Q2: Yanlis'),
        expect.stringContaining('AI Hikaye Degerlendirme'),
        expect.stringContaining('Coherence Score: 85'),
      ])
    );
  });
});
