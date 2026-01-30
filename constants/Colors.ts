/**
 * Apple iOS System Colors
 * Matching official Apple Human Interface Guidelines
 */

export const Colors = {
    light: {
        // Backgrounds
        background: '#FFFFFF',              // White
        cardBackground: '#F2F2F7',          // System Gray 6

        // Text
        text: '#000000',                    // Black (Primary Label)
        textSecondary: '#3C3C43',           // System Gray (Secondary Label) with 60% opacity
        textTertiary: '#8E8E93',           // System Gray (Tertiary Label)

        // Apple Blue (SF Blue)
        primary: '#007AFF',                 // System Blue
        primaryLight: '#5AC8FA',            // Light Blue

        // Borders & Separators
        border: '#C6C6C8',                  // System Gray 4 (Separator)
        borderLight: '#E5E5EA',             // System Gray 5 (Fill)

        // Other System Colors
        success: '#34C759',                 // System Green
        muted: '#AEAEB2',                   // System Gray 3

        // Tab Bar
        tabIconDefault: '#8E8E93',          // System Gray
        tabIconSelected: '#007AFF',         // System Blue
        accent: '#007AFF',                  // System Blue
    },
    dark: {
        // Backgrounds
        background: '#000000',              // Pure Black
        cardBackground: '#1C1C1E',          // System Gray 6 Dark

        // Text
        text: '#FFFFFF',                    // White (Primary Label)
        textSecondary: '#EBEBF5',           // System Gray (Secondary Label) with 60% opacity
        textTertiary: '#8E8E93',           // System Gray (Tertiary Label)

        // Apple Blue (SF Blue for Dark Mode)
        primary: '#0A84FF',                 // System Blue (Dark)
        primaryLight: '#64D2FF',            // Light Blue (Dark)

        // Borders & Separators
        border: '#38383A',                  // System Gray 4 Dark (Separator)
        borderLight: '#48484A',             // System Gray 5 Dark (Fill)

        // Other System Colors
        success: '#32D74B',                 // System Green (Dark)
        muted: '#636366',                   // System Gray 3 Dark

        // Tab Bar
        tabIconDefault: '#8E8E93',          // System Gray
        tabIconSelected: '#0A84FF',         // System Blue (Dark)
        accent: '#0A84FF',                  // System Blue (Dark)
    },
};
