import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LearningSession } from '../types/schemas';

interface Interaction {
  questionId: string;
  timeSpentMs: number;
  attempts: number;
  isCorrect: boolean;
  givenAnswer: any;
  hintsUsed: number;
}

interface SessionState {
  currentSession: LearningSession | null;
  startSession: (userId: string, moduleType: LearningSession['moduleType']) => void;
  recordInteraction: (interaction: Interaction) => void;
  endSession: () => void;
  clearSession: () => void;
}

export const useTurkceSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      currentSession: null,

      startSession: (userId, moduleType) => {
        set({
          currentSession: {
            sessionId: crypto.randomUUID(),
            userId,
            moduleType,
            startTime: new Date(),
            endTime: null,
            interactions: [],
            telemetry: {
              frustrationClicks: 0,
              idleTimeMs: 0,
              readingRulerUsed: false,
            },
            score: 0,
          },
        });
      },

      recordInteraction: (interaction) => {
        const session = get().currentSession;
        if (!session) return;

        // Calculate a simple score contribution based on correctness and attempts
        let scoreAddition = 0;
        if (interaction.isCorrect) {
          scoreAddition = Math.max(
            10 - (interaction.attempts - 1) * 2 - interaction.hintsUsed * 3,
            2
          );
        }

        set({
          currentSession: {
            ...session,
            interactions: [...session.interactions, interaction],
            score: session.score + scoreAddition,
          },
        });
      },

      endSession: () => {
        const session = get().currentSession;
        if (!session) return;

        set({
          currentSession: {
            ...session,
            endTime: new Date(),
          },
        });
      },

      clearSession: () => {
        set({ currentSession: null });
      },
    }),
    {
      name: 'turkce-session-storage',
      // Convert Date objects back to Date after hydration
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        if (parsed.state.currentSession) {
          parsed.state.currentSession.startTime = new Date(parsed.state.currentSession.startTime);
          if (parsed.state.currentSession.endTime) {
            parsed.state.currentSession.endTime = new Date(parsed.state.currentSession.endTime);
          }
        }
        return parsed;
      },
    }
  )
);
