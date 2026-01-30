import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { getSettings, saveSettings, Settings as SettingsType, clearAllData } from '../../services/storage';
import { requestPermissions, scheduleDailyNotification, cancelAllNotifications } from '../../services/notifications';
import { Typography } from '../../constants/Typography';

export default function SettingsScreen() {
    const { colors, themeMode, setTheme, fontPreference, setFontPreference } = useTheme();
    const insets = useSafeAreaInsets();
    const [settings, setLocalSettings] = useState<SettingsType>({
        theme: 'auto',
        notificationEnabled: false,
        notificationTime: '09:00',
        fontPreference: 'apple',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const loaded = await getSettings();
        setLocalSettings(loaded);
    };

    const handleThemeChange = async () => {
        const modes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
        const currentIndex = modes.indexOf(themeMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];

        await setTheme(nextMode);
        setLocalSettings(prev => ({ ...prev, theme: nextMode }));
    };

    const handleFontChange = async () => {
        const newFont = fontPreference === 'apple' ? 'system' : 'apple';
        await setFontPreference(newFont);
        setLocalSettings(prev => ({ ...prev, fontPreference: newFont }));
    };

    const handleNotificationToggle = async (value: boolean) => {
        if (value) {
            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                Alert.alert(
                    'Permission Required',
                    'Please enable notifications in your device settings to receive daily reminders.'
                );
                return;
            }

            await scheduleDailyNotification(settings.notificationTime);
        } else {
            await cancelAllNotifications();
        }

        const updated = { ...settings, notificationEnabled: value };
        await saveSettings(updated);
        setLocalSettings(updated);
    };

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete all your answers and settings. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAllData();
                        await loadSettings();
                        Alert.alert('Done', 'All data has been cleared.');
                    },
                },
            ]
        );
    };

    const getThemeLabel = () => {
        switch (themeMode) {
            case 'light': return 'Light';
            case 'dark': return 'Dark';
            case 'auto': return 'Auto';
        }
    };

    const getFontLabel = () => {
        return fontPreference === 'apple' ? 'Apple SF Pro' : 'System Font';
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
            <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Settings
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        Appearance
                    </Text>

                    <TouchableOpacity
                        style={[styles.row, { backgroundColor: colors.cardBackground, borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}
                        onPress={handleThemeChange}
                    >
                        <Text style={[styles.rowLabel, { color: colors.text }]}>
                            Theme
                        </Text>
                        <Text style={[styles.rowValue, { color: colors.primary }]}>
                            {getThemeLabel()}
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <TouchableOpacity
                        style={[styles.row, { backgroundColor: colors.cardBackground, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }]}
                        onPress={handleFontChange}
                    >
                        <Text style={[styles.rowLabel, { color: colors.text }]}>
                            Font
                        </Text>
                        <Text style={[styles.rowValue, { color: colors.primary }]}>
                            {getFontLabel()}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Notifications */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        Notifications
                    </Text>

                    <View style={[styles.row, { backgroundColor: colors.cardBackground }]}>
                        <View style={styles.rowContent}>
                            <Text style={[styles.rowLabel, { color: colors.text }]}>
                                Daily Reminder
                            </Text>
                            <Text style={[styles.rowDescription, { color: colors.textTertiary }]}>
                                A gentle reminder at {settings.notificationTime}
                            </Text>
                        </View>
                        <Switch
                            value={settings.notificationEnabled}
                            onValueChange={handleNotificationToggle}
                            trackColor={{ false: colors.muted, true: colors.primaryLight }}
                            thumbColor={settings.notificationEnabled ? colors.primary : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        About
                    </Text>

                    <View style={[styles.infoBox, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            This is a calm space for daily reflection. No pressure, no streaks, no judgment.
                            {'\n\n'}
                            Just one question per day, and your honest answer.
                        </Text>
                    </View>
                </View>

                {/* Data */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        Data
                    </Text>

                    <TouchableOpacity
                        style={[styles.destructiveRow, { backgroundColor: colors.cardBackground }]}
                        onPress={handleClearData}
                    >
                        <Text style={styles.destructiveText}>
                            Clear All Data
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.bold,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 0,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.semibold,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    rowContent: {
        flex: 1,
    },
    rowLabel: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: 2,
    },
    rowDescription: {
        fontSize: Typography.fontSize.sm,
    },
    rowValue: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    infoBox: {
        padding: 16,
        borderRadius: 12,
    },
    infoText: {
        fontSize: Typography.fontSize.sm,
        lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
    },
    destructiveRow: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    destructiveText: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        color: '#EF4444',
    },
});
