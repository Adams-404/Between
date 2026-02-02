import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../hooks/useTheme';
import { ThemeProvider } from '../context/ThemeContext';

function RootLayoutContent() {
    const { theme } = useTheme();

    return (
        <>
            {/* Status bar follows theme color */}
            <StatusBar
                style={theme === 'dark' ? 'light' : 'dark'}
                backgroundColor={theme === 'dark' ? '#000000' : '#FFFFFF'}
            />

            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF'
                    },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="history" />
                <Stack.Screen name="profile" />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <RootLayoutContent />
        </ThemeProvider>
    );
}
