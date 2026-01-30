import { useThemeContext, ThemeMode } from '../context/ThemeContext';

export { ThemeMode };

/**
 * Re-export useTheme using the global context.
 * ensuring all components share the same theme state.
 */
export function useTheme() {
    return useThemeContext();
}
