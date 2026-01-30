import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';

export default function TabLayout() {
    const { colors, theme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme === 'dark' ? '#0A84FF' : '#007AFF',
                tabBarInactiveTintColor: colors.textTertiary,
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 20 : 16,
                    left: 16,
                    right: 16,
                    elevation: 0,
                    backgroundColor: 'transparent',
                    borderRadius: 28,
                    height: Platform.OS === 'ios' ? 88 : 70,
                    borderTopWidth: 0,
                    overflow: 'hidden',
                    // Liquid Glass shadow effect
                    shadowColor: theme === 'dark' ? '#000' : '#007AFF',
                    shadowOffset: {
                        width: 0,
                        height: 8,
                    },
                    shadowOpacity: theme === 'dark' ? 0.4 : 0.15,
                    shadowRadius: 24,
                    paddingTop: Platform.OS === 'ios' ? 8 : 0,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
                },
                // Apple Liquid Glass blur background
                tabBarBackground: () => (
                    <BlurView
                        intensity={theme === 'dark' ? 95 : 75}
                        tint={theme === 'dark' ? 'dark' : 'light'}
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            backgroundColor: theme === 'dark'
                                ? 'rgba(18, 18, 18, 0.85)'
                                : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 28,
                            borderWidth: 1,
                            borderColor: theme === 'dark'
                                ? 'rgba(255, 255, 255, 0.15)'
                                : 'rgba(0, 0, 0, 0.08)',
                        }}
                    />
                ),
                tabBarItemStyle: {
                    paddingVertical: 4,
                    marginHorizontal: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                    marginBottom: Platform.OS === 'ios' ? 0 : 2,
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Today',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="today-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="journal"
                options={{
                    title: 'Journal',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="create-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="book-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="analysis"
                options={{
                    title: 'Analysis',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="sparkles-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
