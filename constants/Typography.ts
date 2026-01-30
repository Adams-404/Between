/**
 * Typography system
 * Apple iOS System Fonts
 * 
 * NOTE: On iOS, the system font IS SF Pro (San Francisco).
 * We don't need to load external fonts - just use the system default.
 * React Native automatically uses SF Pro on iOS when no fontFamily is specified.
 */

export type FontPreference = 'apple' | 'system';

// The preference doesn't actually change the font family
// because iOS uses SF Pro as the system font by default
// This is here for potential future Android customization
export const getFontFamily = (preference: FontPreference = 'apple') => {
    // On iOS: this will always use SF Pro (system font)
    // On Android: this will use Roboto (system font)
    return undefined; // Let React Native use the system default
};

export const Typography = {
    // Don't specify fontFamily - let system use default (SF Pro on iOS)
    fontFamily: undefined,

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
    // These map directly to SF Pro weights on iOS
    fontWeight: {
        normal: '400' as const,      // SF Pro Regular
        medium: '500' as const,      // SF Pro Medium  
        semibold: '600' as const,    // SF Pro Semibold
        bold: '700' as const,        // SF Pro Bold
    },
};

// Helper to create text style with proper font weight
// No font family needed - iOS will use SF Pro automatically
export const getTextStyle = (fontPreference: FontPreference = 'apple') => {
    return {
        regular: { fontWeight: '400' as const },
        medium: { fontWeight: '500' as const },
        semibold: { fontWeight: '600' as const },
        bold: { fontWeight: '700' as const },
    };
};
