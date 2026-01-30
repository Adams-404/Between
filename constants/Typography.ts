/**
 * Typography system
 * Apple iOS System Fonts
 */

export type FontPreference = 'apple' | 'system';

// Apple SF Pro font family (iOS system font)
// iOS automatically maps these to the correct SF font
const AppleFonts = {
    regular: 'System',  // iOS will use SF Pro
    medium: 'System',
    semibold: 'System',
    bold: 'System',
};

// Explicit system fonts
const SystemFonts = {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
};

export const getFontFamily = (preference: FontPreference = 'apple') => {
    return preference === 'apple' ? AppleFonts : SystemFonts;
};

export const Typography = {
    // Font families - use Apple fonts by default
    fontFamily: AppleFonts,

    // Font sizes (Apple HIG recommended)
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },

    // Line heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Font weights (iOS system weights)
    fontWeight: {
        normal: '400' as const,      // Regular
        medium: '500' as const,      // Medium
        semibold: '600' as const,    // Semibold
        bold: '700' as const,        // Bold
    },
};

// Helper to create text style with font family
export const getTextStyle = (fontPreference: FontPreference = 'apple') => {
    const fonts = getFontFamily(fontPreference);
    return {
        regular: { fontFamily: fonts.regular, fontWeight: '400' as const },
        medium: { fontFamily: fonts.medium, fontWeight: '500' as const },
        semibold: { fontFamily: fonts.semibold, fontWeight: '600' as const },
        bold: { fontFamily: fonts.bold, fontWeight: '700' as const },
    };
};
