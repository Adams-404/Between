import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

interface CosmicBackgroundProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function CosmicBackground({ children, style }: CosmicBackgroundProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // We define the specific gradient colors here for the Orbit theme
    const darkGradient = ['#311146', '#220B34', '#150528', '#050014'] as const; // Lighter top-left to Darkest bottom-right
    const lightGradient = ['#F0F0FF', '#E6E6FF'] as const;

    return (
        <LinearGradient
            colors={isDark ? darkGradient : lightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, style]}
        >
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
