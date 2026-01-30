import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

export interface TextProps extends RNTextProps {
    weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

/**
 * Custom Text component that applies proper font weights
 * Uses system font (SF Pro on iOS) by default
 */
export function Text({ style, weight = 'regular', ...props }: TextProps) {
    const fontWeights = {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    };

    const textStyle = [
        styles.base,
        {
            fontWeight: fontWeights[weight] as any,
        },
        style,
    ];

    return <RNText style={textStyle} {...props} />;
}

const styles = StyleSheet.create({
    base: {
        // Let React Native use system font (SF Pro on iOS, Roboto on Android)
    },
});
