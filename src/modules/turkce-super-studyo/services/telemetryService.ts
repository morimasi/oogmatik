import { LearningSession } from '../types/schemas';

/**
 * Telemetry Service
 * Pushes real-time performance metrics to PostHog, custom backend,
 * or the Oogmatik Dashboard.
 */

export const pushTelemetryToDashboard = async (session: LearningSession): Promise<void> => {
  // Extract critical insights
  const { interactions, telemetry, score } = session;
  const errorRate = interactions.filter((i) => !i.isCorrect).length / interactions.length || 0;

  const payload = {
    userId: session.userId,
    module: session.moduleType,
    date: new Date().toISOString(),
    metrics: {
      score,
      totalInteractions: interactions.length,
      errorRate: (errorRate * 100).toFixed(1) + '%',
      hintsUsed: interactions.reduce((sum, i) => sum + i.hintsUsed, 0),
      frustrationClicks: telemetry.frustrationClicks,
      idleTimeMs: telemetry.idleTimeMs,
      usedRuler: telemetry.readingRulerUsed,
    },
  };

  console.log(`[Telemetry Service] Öğretmen/Veli Dashboard'una Analiz Verisi İtiliyor:`, payload);

  // In a real app, this sends data to the analytics backend. Example:
  /*
  await fetch('/api/telemetry/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  */
};
