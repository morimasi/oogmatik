import { logError } from '../../utils/logger.js';

/**
 * OOGMATIK - BEHAVIOR TRACKER (v3 Premium)
 * Öğrencinin aktivite sırasındaki davranışlarını (düşünme süresi, tıklama hızı vb.) takip eder.
 */
export interface BehaviorEvent {
  type: 'latent_period' | 'click' | 'error' | 'hint_request' | 'completion';
  timestamp: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class BehaviorTracker {
  private events: BehaviorEvent[] = [];
  private startTime: number | null = null;

  startSession() {
    this.startTime = Date.now();
    this.events = [];
  }

  trackEvent(event: Omit<BehaviorEvent, 'timestamp'>) {
    const newEvent: BehaviorEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    this.events.push(newEvent);
    
    // Opsiyonel: Real-time database'e gönderim yapılabilir
    // console.log('[BehaviorTracker] Event recorded:', newEvent);
  }

  /**
   * Düşünme süresi (Latent Period) analizi
   */
  calculateLatentPeriod(): number {
    const startEvent = this.events.find(e => e.type === 'latent_period');
    return startEvent?.duration || 0;
  }

  getSummary() {
    return {
      totalEvents: this.events.length,
      duration: this.startTime ? Date.now() - this.startTime : 0,
      events: this.events,
    };
  }

  async syncWithServer() {
    try {
      // API çağrısı buraya gelecek
      // await api.post('/analytics/behavior', { studentId, activityId, events: this.events });
    } catch (e) {
      logError('BehaviorTracker sync error', { error: e });
    }
  }
}

export const behaviorTracker = new BehaviorTracker();
