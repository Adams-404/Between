import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { useState, useEffect } from 'react';
import { getSettings, saveSettings, Settings } from '../services/storage';

/**
 * Hook for managing theme
 * Supports light, dark, and auto (system) modes
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

export function useTheme() {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
    const [isLoading, setIsLoading] = useState(true);

    // Load theme preference on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Determine actual theme based on mode and system preference
    const actualTheme = themeMode === 'auto'
        ? (systemColorScheme || 'light')
        : themeMode;

    const colors = Colors[actualTheme];

    async function loadThemePreference() {
        try {
            console.log('[useTheme] Loading theme preference...');
            const settings = await getSettings();
            console.log('[useTheme] Got settings:', settings);
            setThemeMode(settings.theme);
        } catch (error) {
            console.error('[useTheme] Error loading theme preference:', error);
        } finally {
            setIsLoading(false);
            console.log('[useTheme] Theme loading complete');
        }
    }

    async function updateTheme(mode: ThemeMode) {
        try {
            const settings = await getSettings();
            const updated: Settings = { ...settings, theme: mode };
            await saveSettings(updated);
            setThemeMode(mode);
        } catch (error) {
            console.error('Error updating theme:', error);
        }
    }

    return {
        theme: actualTheme,
        themeMode,
        colors,
        isLoading,
        setTheme: updateTheme,
    };
}
