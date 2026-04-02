// src/services/themeIntelligence.ts
// Theme Intelligence Service - AI-Powered Personalization
// Privacy-first: All data stored locally in IndexedDB

import { AppTheme } from '../types';

/**
 * Theme preference data structure
 */
export interface ThemePreferenceData {
  userId: string;
  themeSwitches: Array<{
    from: AppTheme;
    to: AppTheme;
    timestamp: number;
  }>;
  timeOfDayPreferences: Array<{
    hour: number;
    theme: AppTheme;
  }>;
  sessionDurations: Array<{
    theme: AppTheme;
    duration: number; // minutes
  }>;
  eyeStrainReports: number;
  lastRecommendation?: {
    theme: AppTheme;
    timestamp: number;
    accepted: boolean;
  };
}

/**
 * Theme recommendation result
 */
export interface ThemeRecommendation {
  theme: AppTheme;
  confidence: number; // 0-1
  reason: string;
  factors: string[];
}

/**
 * Theme Intelligence Service
 * Analyzes user behavior and recommends optimal themes
 */
export class ThemeIntelligenceService {
  private dbName = 'oogmatik-theme-intelligence';
  private storeName = 'preferences';
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'userId' });
        }
      };
    });
  }

  /**
   * Get user theme data from local storage
   */
  async getUserThemeData(userId: string): Promise<ThemePreferenceData> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(userId);

      request.onsuccess = () => {
        resolve(
          request.result || {
            userId,
            themeSwitches: [],
            timeOfDayPreferences: [],
            sessionDurations: [],
            eyeStrainReports: 0,
          }
        );
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save user theme data
   */
  async saveUserThemeData(data: ThemePreferenceData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Track theme switch
   */
  async trackThemeSwitch(userId: string, from: AppTheme, to: AppTheme): Promise<void> {
    const data = await this.getUserThemeData(userId);
    const hour = new Date().getHours();

    data.themeSwitches.push({
      from,
      to,
      timestamp: Date.now(),
    });

    // Track time-of-day preference
    data.timeOfDayPreferences.push({ hour, theme: to });

    // Keep only last 100 switches
    if (data.themeSwitches.length > 100) {
      data.themeSwitches = data.themeSwitches.slice(-100);
    }

    if (data.timeOfDayPreferences.length > 100) {
      data.timeOfDayPreferences = data.timeOfDayPreferences.slice(-100);
    }

    await this.saveUserThemeData(data);
  }

  /**
   * Track session duration with theme
   */
  async trackSessionDuration(
    userId: string,
    theme: AppTheme,
    durationMinutes: number
  ): Promise<void> {
    const data = await this.getUserThemeData(userId);

    data.sessionDurations.push({
      theme,
      duration: durationMinutes,
    });

    // Keep only last 50 sessions
    if (data.sessionDurations.length > 50) {
      data.sessionDurations = data.sessionDurations.slice(-50);
    }

    await this.saveUserThemeData(data);
  }

  /**
   * Report eye strain
   */
  async reportEyeStrain(userId: string): Promise<void> {
    const data = await this.getUserThemeData(userId);
    data.eyeStrainReports++;
    await this.saveUserThemeData(data);
  }

  /**
   * Recommend optimal theme based on user behavior
   */
  async recommendTheme(userId: string): Promise<ThemeRecommendation> {
    const data = await this.getUserThemeData(userId);
    const currentHour = new Date().getHours();
    const factors: string[] = [];
    let confidence = 0.5;
    let recommendedTheme: AppTheme = 'light';

    // Factor 1: Time of day (weight: 0.3)
    const isDarkHours = currentHour >= 18 || currentHour < 6;
    const isEveningHours = currentHour >= 18 && currentHour < 22;

    if (isDarkHours) {
      const darkPreferences = data.timeOfDayPreferences.filter(
        (p) =>
          (p.hour >= 18 || p.hour < 6) &&
          (p.theme.includes('dark') ||
            p.theme.includes('oled') ||
            p.theme.includes('obsidian'))
      );

      if (darkPreferences.length > 5) {
        recommendedTheme = 'oled-black';
        confidence += 0.3;
        factors.push('Gece saatlerinde koyu tema tercihiniz var');
      } else if (isEveningHours) {
        recommendedTheme = 'anthracite';
        confidence += 0.2;
        factors.push('Akşam saatleri için yumuşak karanlık tema');
      }
    } else {
      // Daytime
      const lightPreferences = data.timeOfDayPreferences.filter(
        (p) => p.hour >= 6 && p.hour < 18 && p.theme === 'light'
      );

      if (lightPreferences.length > 5) {
        recommendedTheme = 'light';
        confidence += 0.3;
        factors.push('Gündüz saatlerinde aydınlık tema tercihiniz var');
      }
    }

    // Factor 2: Eye strain reports (weight: 0.4)
    if (data.eyeStrainReports > 3) {
      recommendedTheme = 'dyslexia-cream';
      confidence += 0.4;
      factors.push('Göz yorgunluğu raporlarınız mevcut');
    }

    // Factor 3: Session duration analysis (weight: 0.2)
    const themeDurations = new Map<AppTheme, number>();
    data.sessionDurations.forEach((session) => {
      const current = themeDurations.get(session.theme) || 0;
      themeDurations.set(session.theme, current + session.duration);
    });

    // Find theme with longest total duration
    let longestTheme: AppTheme = 'light';
    let longestDuration = 0;
    themeDurations.forEach((duration, theme) => {
      if (duration > longestDuration) {
        longestDuration = duration;
        longestTheme = theme;
      }
    });

    if (longestDuration > 120) {
      // More than 2 hours
      if (confidence < 0.7) {
        recommendedTheme = longestTheme;
        confidence += 0.2;
        factors.push(`${longestTheme} temasında en uzun süre çalıştınız`);
      }
    }

    // Factor 4: Recent switches (weight: 0.1)
    const recentSwitches = data.themeSwitches.slice(-5);
    const mostRecentTheme = recentSwitches[recentSwitches.length - 1]?.to;
    if (mostRecentTheme && confidence < 0.8) {
      recommendedTheme = mostRecentTheme;
      confidence += 0.1;
      factors.push('Son tercihlerinize göre');
    }

    // Cap confidence at 0.95
    confidence = Math.min(confidence, 0.95);

    return {
      theme: recommendedTheme,
      confidence,
      reason: factors.join('. ') || 'Genel kullanım alışkanlıklarınıza göre',
      factors,
    };
  }

  /**
   * Track recommendation acceptance
   */
  async trackRecommendationAcceptance(
    userId: string,
    theme: AppTheme,
    accepted: boolean
  ): Promise<void> {
    const data = await this.getUserThemeData(userId);
    data.lastRecommendation = {
      theme,
      timestamp: Date.now(),
      accepted,
    };
    await this.saveUserThemeData(data);
  }

  /**
   * Clear all user data (KVKK compliance)
   */
  async clearUserData(userId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(userId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Singleton instance
 */
export const themeIntelligence = new ThemeIntelligenceService();
