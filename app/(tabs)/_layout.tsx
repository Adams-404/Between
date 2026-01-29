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
                tabBarActiveTintColor: colors.primary, // More vibrant active color
                tabBarInactiveTintColor: colors.textTertiary,
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 20,
                    right: 20,
                    elevation: 0,
                    backgroundColor: theme === 'dark' ? '#121212' : '#FFFFFF', // Solid background for readability
                    borderRadius: 30,
                    height: 70, // Increased height
                    borderTopWidth: 0,
                    // Shadow for depth
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.2, // Reduced opacity
                    shadowRadius: 10,
                    paddingBottom: 10, // Add padding bottom
                },
                // Remove BlurView background as it often conflicts with solid designs or simple gradients
                tabBarBackground: undefined, // Let the backgroundColor handle it for simplicity and reliability
                tabBarItemStyle: {
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginBottom: 5,
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
