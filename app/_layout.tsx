import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../hooks/useTheme';
import { View, Text, ActivityIndicator } from 'react-native';

export default function RootLayout() {
    const { theme, isLoading } = useTheme();

    // Don't block rendering while theme loads - show the app immediately
    return (
        <>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
            </Stack>
        </>
    );
}
