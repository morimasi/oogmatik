// src/hooks/useAmbientLight.ts
// Ambient Light Sensor Hook - Experimental API
// Automatically adjust theme based on environment lighting

import { useState, useEffect } from 'react';
import { AppTheme } from '../types';

interface AmbientLightData {
  lux: number;
  recommendedTheme: AppTheme;
  brightness: 'dark' | 'dim' | 'normal' | 'bright';
}

/**
 * Hook to detect ambient light and recommend appropriate theme
 * Uses Ambient Light Sensor API (experimental)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AmbientLightSensor
 *
 * Browser Support:
 * - Chrome 79+ (behind flag)
 * - Edge 79+ (behind flag)
 * - Not supported: Firefox, Safari
 *
 * @returns Ambient light data with theme recommendation
 */
export function useAmbientLight(): AmbientLightData {
  const [lux, setLux] = useState<number>(500); // Default: normal room lighting
  const [brightness, setBrightness] = useState<'dark' | 'dim' | 'normal' | 'bright'>('normal');
  const [recommendedTheme, setRecommendedTheme] = useState<AppTheme>('light');

  useEffect(() => {
    // Check if Ambient Light Sensor API is available
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new (window as any).AmbientLightSensor({
          frequency: 1, // Update once per second
        });

        sensor.onreading = () => {
          const illuminance = sensor.illuminance as number;
          setLux(illuminance);

          // Categorize brightness
          let brightnessLevel: 'dark' | 'dim' | 'normal' | 'bright';
          let theme: AppTheme;

          if (illuminance < 50) {
            // Very dark environment (e.g., night, cinema)
            brightnessLevel = 'dark';
            theme = 'oled-black'; // True black for OLED
          } else if (illuminance < 200) {
            // Dim lighting (e.g., evening, indoor low light)
            brightnessLevel = 'dim';
            theme = 'anthracite'; // Dark but not pure black
          } else if (illuminance < 1000) {
            // Normal indoor lighting
            brightnessLevel = 'normal';
            theme = 'anthracite'; // Comfortable dark or light
          } else {
            // Bright environment (e.g., outdoors, office)
            brightnessLevel = 'bright';
            theme = 'light'; // Light theme for readability
          }

          setBrightness(brightnessLevel);
          setRecommendedTheme(theme);
        };

        sensor.onerror = (error: Error) => {
          console.warn('Ambient Light Sensor error:', error.message);
        };

        sensor.start();

        return () => {
          sensor.stop();
        };
      } catch (error) {
        console.warn('Failed to initialize Ambient Light Sensor:', error);
      }
    } else {
      // Fallback: Use time-of-day heuristic
      const hour = new Date().getHours();

      if (hour >= 6 && hour < 18) {
        // Daytime (6 AM - 6 PM)
        setBrightness('normal');
        setRecommendedTheme('light');
        setLux(800);
      } else if (hour >= 18 && hour < 22) {
        // Evening (6 PM - 10 PM)
        setBrightness('dim');
        setRecommendedTheme('anthracite');
        setLux(200);
      } else {
        // Night (10 PM - 6 AM)
        setBrightness('dark');
        setRecommendedTheme('oled-black');
        setLux(30);
      }
    }
  }, []);

  return {
    lux,
    recommendedTheme,
    brightness,
  };
}

/**
 * Hook to auto-apply theme based on ambient light
 * @param enabled Whether auto-theme is enabled
 * @param onThemeChange Callback when theme should change
 */
export function useAutoTheme(
  enabled: boolean,
  onThemeChange: (theme: AppTheme) => void
): void {
  const { recommendedTheme } = useAmbientLight();
  const [lastRecommended, setLastRecommended] = useState<AppTheme>(recommendedTheme);

  useEffect(() => {
    if (!enabled) return;

    // Only trigger change if recommendation actually changed
    if (recommendedTheme !== lastRecommended) {
      onThemeChange(recommendedTheme);
      setLastRecommended(recommendedTheme);
    }
  }, [enabled, recommendedTheme, lastRecommended, onThemeChange]);
}

/**
 * Get theme recommendation based on manual lux input
 * Useful for testing without actual sensor
 */
export function getThemeForLux(lux: number): AppTheme {
  if (lux < 50) return 'oled-black';
  if (lux < 200) return 'anthracite';
  if (lux < 1000) return 'anthracite';
  return 'light';
}

/**
 * Check if Ambient Light Sensor is supported
 */
export function isAmbientLightSupported(): boolean {
  return 'AmbientLightSensor' in window;
}
