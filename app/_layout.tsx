import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../hooks/useTheme';
import { CosmicBackground } from '../components/CosmicBackground';

export default function RootLayout() {
    const { theme } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF' }}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="(tabs)" />
            </Stack>
        </View>
    );
}
