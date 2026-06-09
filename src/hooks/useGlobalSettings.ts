import { useEffect } from 'react';
import { UiSettings, AppTheme } from '../types';

export const useGlobalSettings = (
    uiSettings: UiSettings, 
    theme: AppTheme, 
    sidebarWidth: number
) => {
    // Apply UI settings to document root when they change
    useEffect(() => {
        document.documentElement.style.setProperty('--app-font-family', uiSettings.fontFamily);
        document.documentElement.style.setProperty('--app-font-size-scale', uiSettings.fontSizeScale.toString());
        document.documentElement.style.setProperty('--app-line-height', uiSettings.lineHeight.toString());
        document.documentElement.style.setProperty('--app-letter-spacing', uiSettings.letterSpacing === 'wide' ? '0.05em' : 'normal');

        // Font weight mapping: thin=300, normal=400, medium=500, bold=700, black=900
        const weightMap: Record<string, string> = { thin: '300', normal: '400', medium: '500', bold: '700', black: '900' };
        document.documentElement.style.setProperty('--app-font-weight', weightMap[uiSettings.fontWeight] || '400');
        document.documentElement.style.setProperty('--app-saturation', `${uiSettings.saturation}%`);
        document.documentElement.style.setProperty('--app-contrast', `${uiSettings.contrastLevel}%`);

        if (uiSettings.compactMode) {
            document.documentElement.classList.add('ui-compact');
        } else {
            document.documentElement.classList.remove('ui-compact');
        }

        // Apply premium intensity (glass blur effect)
        const blurValue = (uiSettings.premiumIntensity / 100) * 20; // Max 20px blur
        document.documentElement.style.setProperty('--premium-blur', `${blurValue}px`);
        document.documentElement.style.setProperty(
            '--premium-opacity', 
            `${0.5 + (uiSettings.premiumIntensity / 100) * 0.4}`
        );
    }, [uiSettings]);

    // Handle basic dark/light theme classes
    useEffect(() => {
        const DARK_THEMES: AppTheme[] = [
            'dark',
            'anthracite',
            'space',
            'anthracite-gold',
            'anthracite-cyber',
            'oled-black',
        ];
        
        if (DARK_THEMES.includes(theme) || theme.includes('anthracite')) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Remove old theme classes
        document.documentElement.className = document.documentElement.className
            .split(' ')
            .filter((c) => !c.startsWith('theme-') && c !== 'dark' && c !== 'ui-compact' && c !== 'printing-forced-light')
            .join(' ');

        // Add new theme classes
        if (DARK_THEMES.includes(theme) || theme.includes('anthracite')) document.documentElement.classList.add('dark');
        if (uiSettings.compactMode) document.documentElement.classList.add('ui-compact');
        document.documentElement.classList.add(`theme-${theme}`);
    }, [theme, uiSettings.compactMode]);

    // Sidebar width
    useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
    }, [sidebarWidth]);

    // Print trigger - force light theme before print, restore after
    useEffect(() => {
        const handleBeforePrint = () => {
            document.documentElement.classList.add('printing-forced-light');
            document.documentElement.classList.remove('dark');
            document.body.style.filter = 'none';
        };

        const handleAfterPrint = () => {
            document.documentElement.classList.remove('printing-forced-light');
            
            const DARK_THEMES: AppTheme[] = [
                'dark', 'anthracite', 'space', 'anthracite-gold', 
                'anthracite-cyber', 'oled-black'
            ];
            if (DARK_THEMES.includes(theme) || theme.includes('anthracite')) {
                document.documentElement.classList.add('dark');
            }
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [theme]);
};
