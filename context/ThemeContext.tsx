import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { getSettings, saveSettings, Settings } from '../services/storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: 'light' | 'dark';
    themeMode: ThemeMode;
    colors: typeof Colors.light;
    setTheme: (mode: ThemeMode) => Promise<void>;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
    const [isLoading, setIsLoading] = useState(true);

    // Initial load
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Listen for system changes if mode is auto?
    // useColorScheme() hook will trigger re-render if system theme changes.

    const actualTheme = themeMode === 'auto'
        ? (systemColorScheme === 'dark' ? 'dark' : 'light')
        : themeMode;

    const colors = Colors[actualTheme];

    async function loadThemePreference() {
        try {
            const settings = await getSettings();
            if (settings?.theme) {
                setThemeMode(settings.theme);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function updateTheme(mode: ThemeMode) {
        try {
            setThemeMode(mode); // Optimistic update
            const settings = await getSettings();
            const updated: Settings = { ...settings, theme: mode };
            await saveSettings(updated);
        } catch (error) {
            console.error('Error updating theme:', error);
            // Revert on error? simplified for now
        }
    }

    return (
        <ThemeContext.Provider value={{
            theme: actualTheme,
            themeMode,
            colors,
            setTheme: updateTheme,
            isLoading
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
}
