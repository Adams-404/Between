import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { getSettings, saveSettings, Settings as SettingsType, clearAllData, getAllAnswers } from '../../services/storage';
import { requestPermissions, scheduleDailyNotification, cancelAllNotifications } from '../../services/notifications';
import { Typography } from '../../constants/Typography';

export default function SettingsScreen() {
    const { colors, theme, themeMode, setTheme, fontPreference, setFontPreference } = useTheme();
    const insets = useSafeAreaInsets();
    const [settings, setLocalSettings] = useState<SettingsType>({
        theme: 'light',
        notificationEnabled: false,
        notificationTime: '09:00',
        fontPreference: 'apple',
    });
    const [totalEntries, setTotalEntries] = useState(0);

    useEffect(() => {
        loadSettings();
        loadStats();
    }, []);

    const loadSettings = async () => {
        const loaded = await getSettings();
        setLocalSettings(loaded);
    };

    const loadStats = async () => {
        const answers = await getAllAnswers();
        setTotalEntries(answers.length);
    };

    const handleThemeToggle = async (value: boolean) => {
        const newTheme = value ? 'dark' : 'light';
        await setTheme(newTheme);
        setLocalSettings(prev => ({ ...prev, theme: newTheme }));
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

    const handleExportData = async () => {
        const answers = await getAllAnswers();
        const dataStr = JSON.stringify(answers, null, 2);

        Alert.alert(
            'Export Data',
            `You have ${answers.length} entries. Export functionality would save this data to a file.`,
            [{ text: 'OK' }]
        );
        console.log('Export data:', dataStr);
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
                        await loadStats();
                        Alert.alert('Done', 'All data has been cleared.');
                    },
                },
            ]
        );
    };

    const handleRateApp = () => {
        Alert.alert('Rate App', 'This would open the App Store rating page.');
    };

    const handleShareApp = () => {
        Alert.alert('Share App', 'This would open the share dialog.');
    };

    const handlePrivacy = () => {
        Alert.alert('Privacy Policy', 'Your data is stored locally on your device and never shared.');
    };

    const handleTerms = () => {
        Alert.alert('Terms of Service', 'Terms and conditions would be displayed here.');
    };

    const handleSupport = () => {
        Alert.alert('Support', 'Contact support at support@dailyquestions.app');
    };

    const getFontLabel = () => {
        return fontPreference === 'apple' ? 'Apple SF Pro' : 'System Font';
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        APPEARANCE
                    </Text>

                    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.row, styles.rowNoBorder]}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="moon" size={20} color={colors.primary} />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Dark Mode
                                </Text>
                            </View>
                            <Switch
                                value={theme === 'dark'}
                                onValueChange={handleThemeToggle}
                                trackColor={{ false: colors.muted, true: colors.primaryLight }}
                                thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
                            />
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={handleFontChange}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="text" size={20} color={colors.primary} />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Font
                                </Text>
                            </View>
                            <View style={styles.rowRight}>
                                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                                    {getFontLabel()}
                                </Text>
                                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Notifications */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        NOTIFICATIONS
                    </Text>

                    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.row, styles.rowNoBorder]}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="notifications" size={20} color={colors.primary} />
                                <View style={styles.rowContent}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>
                                        Daily Reminder
                                    </Text>
                                    <Text style={[styles.rowDescription, { color: colors.textTertiary }]}>
                                        {settings.notificationTime}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={settings.notificationEnabled}
                                onValueChange={handleNotificationToggle}
                                trackColor={{ false: colors.muted, true: colors.primaryLight }}
                                thumbColor={settings.notificationEnabled ? colors.primary : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </View>

                {/* Data & Storage */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        DATA & STORAGE
                    </Text>

                    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.row, styles.rowNoBorder]}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="stats-chart" size={20} color={colors.primary} />
                                <View style={styles.rowContent}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>
                                        Total Entries
                                    </Text>
                                    <Text style={[styles.rowDescription, { color: colors.textTertiary }]}>
                                        {totalEntries} reflections saved
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={handleExportData}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="download" size={20} color={colors.primary} />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Export Data
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={handleClearData}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="trash" size={20} color="#EF4444" />
                                <Text style={[styles.rowLabel, { color: '#EF4444' }]}>
                                    Clear All Data
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Privacy & Security */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        PRIVACY & SECURITY
                    </Text>

                    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={handlePrivacy}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Privacy Policy
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={handleTerms}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="document-text" size={20} color={colors.primary} />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Terms of Service
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Help & Support */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        HELP & SUPPORT
                    </Text>

                    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={handleSupport}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="help-circle" size={20} color={colors.primary} />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Contact Support
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={handleRateApp}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="star" size={20} color={colors.primary} />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Rate App
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={handleShareApp}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="share-social" size={20} color={colors.primary} />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Share App
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        ABOUT
                    </Text>

                    <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
                        <View style={styles.appIcon}>
                            <Ionicons name="calendar" size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.appName, { color: colors.text }]}>
                            Between
                        </Text>
                        <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
                            Version 1.0.0
                        </Text>
                        <Text style={[styles.appDescription, { color: colors.textTertiary }]}>
                            A calm space for daily reflection. One question per day, your honest answer.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.semibold,
        marginBottom: 10,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    card: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 52,
    },
    rowNoBorder: {
        borderBottomWidth: 0,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowContent: {
        flex: 1,
    },
    rowLabel: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.medium,
    },
    rowDescription: {
        fontSize: Typography.fontSize.sm,
        marginTop: 2,
    },
    rowValue: {
        fontSize: Typography.fontSize.sm,
    },
    divider: {
        height: 0.5,
        marginLeft: 48,
    },
    infoCard: {
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
    },
    appIcon: {
        width: 72,
        height: 72,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 4,
    },
    appVersion: {
        fontSize: Typography.fontSize.sm,
        marginBottom: 16,
    },
    appDescription: {
        fontSize: Typography.fontSize.sm,
        textAlign: 'center',
        lineHeight: Typography.fontSize.sm * 1.5,
    },
});
