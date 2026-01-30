import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { getSettings, saveSettings, Settings } from '../services/storage';
import { FontPreference, getFontFamily } from '../constants/Typography';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: 'light' | 'dark';
    themeMode: ThemeMode;
    colors: typeof Colors.light;
    fontPreference: FontPreference;
    fontFamily: ReturnType<typeof getFontFamily>;
    setTheme: (mode: ThemeMode) => Promise<void>;
    setFontPreference: (preference: FontPreference) => Promise<void>;
    isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
    const [fontPreference, setFontPreferenceState] = useState<FontPreference>('apple');
    const [isLoading, setIsLoading] = useState(true);

    // Initial load
    useEffect(() => {
        loadPreferences();
    }, []);

    const actualTheme = themeMode === 'auto'
        ? (systemColorScheme === 'dark' ? 'dark' : 'light')
        : themeMode;

    const colors = Colors[actualTheme];
    const fontFamily = getFontFamily(fontPreference);

    async function loadPreferences() {
        try {
            const settings = await getSettings();
            if (settings?.theme) {
                setThemeMode(settings.theme);
            }
            if (settings?.fontPreference) {
                setFontPreferenceState(settings.fontPreference);
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function updateTheme(mode: ThemeMode) {
        try {
            setThemeMode(mode);
            const settings = await getSettings();
            const updated: Settings = { ...settings, theme: mode };
            await saveSettings(updated);
        } catch (error) {
            console.error('Error updating theme:', error);
        }
    }

    async function updateFontPreference(preference: FontPreference) {
        try {
            setFontPreferenceState(preference);
            const settings = await getSettings();
            const updated: Settings = { ...settings, fontPreference: preference };
            await saveSettings(updated);
        } catch (error) {
            console.error('Error updating font preference:', error);
        }
    }

    return (
        <ThemeContext.Provider value={{
            theme: actualTheme,
            themeMode,
            colors,
            fontPreference,
            fontFamily,
            setTheme: updateTheme,
            setFontPreference: updateFontPreference,
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
