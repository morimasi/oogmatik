export interface RateLimitStatus {
  success: boolean;
  remainingTokens: number;
  message?: string;
}

class AITokenLimiter {
  private tokenStore: Record<string, { tokens: number; lastReset: number }> = {};
  private readonly MAX_TOKENS = 5000;
  private readonly RESET_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor() {
    // Load from local storage if available for persistence
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ai_token_store');
        if (stored) {
          this.tokenStore = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Could not load token store', e);
      }
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_token_store', JSON.stringify(this.tokenStore));
    }
  }

  public checkAndConsume(userId: string, tokensNeeded: number): RateLimitStatus {
    const now = Date.now();
    let userData = this.tokenStore[userId];

    // Initialize or reset if older than 30 days
    if (!userData || now - userData.lastReset > this.RESET_INTERVAL_MS) {
      userData = { tokens: this.MAX_TOKENS, lastReset: now };
    }

    if (userData.tokens < tokensNeeded) {
      return {
        success: false,
        remainingTokens: userData.tokens,
        message:
          'Aylık AI jeton limitinize ulaştınız. Lütfen paketinizi yükseltin veya gelecek ayı bekleyin.',
      };
    }

    // Consume tokens
    userData.tokens -= tokensNeeded;
    this.tokenStore[userId] = userData;
    this.save();

    return {
      success: true,
      remainingTokens: userData.tokens,
    };
  }

  public getRemaining(userId: string): number {
    const userData = this.tokenStore[userId];
    if (!userData) return this.MAX_TOKENS;
    return userData.tokens;
  }
}

export const aiRateLimiter = new AITokenLimiter();
