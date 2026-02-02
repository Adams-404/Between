import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Alert, Linking, Modal, TextInput, PanResponder, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';
import { getSettings, saveSettings, Settings as SettingsType, clearAllData, getAllAnswers } from '../../services/storage';
import { requestPermissions, scheduleDailyNotification, cancelAllNotifications } from '../../services/notifications';
import { Typography } from '../../constants/Typography';
import { triggerHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '../../utils/haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

const PROFILE_STORAGE_KEY = '@user_profile';

interface UserProfile {
    name: string;
    email: string;
    bio: string;
    profilePicture?: string;
}

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
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        bio: '',
    });
    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
    const [editingProfile, setEditingProfile] = useState<UserProfile>({
        name: '',
        email: '',
        bio: '',
    });
    const pan = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadSettings();
        loadStats();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    const loadSettings = async () => {
        const loaded = await getSettings();
        setLocalSettings(loaded);
    };

    const loadStats = async () => {
        const answers = await getAllAnswers();
        setTotalEntries(answers.length);
    };

    const loadProfile = async () => {
        try {
            const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
            if (stored) {
                setProfile(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const getInitials = () => {
        if (!profile.name) return '?';
        const names = profile.name.trim().split(' ');
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    const openProfileModal = () => {
        setEditingProfile({ ...profile });
        setIsProfileModalVisible(true);
    };

    const saveProfileChanges = async () => {
        try {
            await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(editingProfile));
            setProfile(editingProfile);
            triggerSuccessHaptic();
            setIsProfileModalVisible(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save profile.');
        }
    };

    const closeProfileModal = () => {
        setIsProfileModalVisible(false);
        pan.setValue(0);
    };

    // Pan responder for swipe down gesture
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only activate if swiping down
                return gestureState.dy > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                // Only allow downward movement
                if (gestureState.dy > 0) {
                    pan.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                // If dragged down more than 150px, close the modal
                if (gestureState.dy > 150) {
                    triggerHaptic();
                    closeProfileModal();
                } else {
                    // Spring back to original position
                    Animated.spring(pan, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

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
                {/* Profile Section */}
                <TouchableOpacity
                    style={[styles.profileCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                    onPress={() => {
                        triggerHaptic();
                        openProfileModal();
                    }}
                    activeOpacity={0.7}
                >
                    <View style={styles.profileContent}>
                        <View style={[styles.profileAvatar, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                            {profile.profilePicture ? (
                                <View style={styles.avatarImageContainer}>
                                    {/* Image would go here */}
                                    <Text style={[styles.avatarText, { color: colors.primary }]}>
                                        {getInitials()}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={[styles.avatarText, { color: colors.primary }]}>
                                    {getInitials()}
                                </Text>
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: colors.text }]}>
                                {profile.name || 'Set your name'}
                            </Text>
                            <Text style={[styles.profileEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                                {profile.email || profile.bio || 'Tap to edit profile'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </View>
                </TouchableOpacity>

                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                        APPEARANCE
                    </Text>

                    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
                        <View style={[styles.row, styles.rowNoBorder]}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="moon" size={20} color="#8B5CF6" />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Dark Mode
                                </Text>
                            </View>
                            <Switch
                                value={theme === 'dark'}
                                onValueChange={(value) => {
                                    triggerHaptic();
                                    handleThemeToggle(value);
                                }}
                                trackColor={{ false: colors.muted, true: colors.primaryLight }}
                                thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
                            />
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={() => {
                                triggerHaptic();
                                handleFontChange();
                            }}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="text" size={20} color="#8B5CF6" />
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
                                <Ionicons name="notifications" size={20} color="#F59E0B" />
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
                                onValueChange={(value) => {
                                    triggerHaptic();
                                    handleNotificationToggle(value);
                                }}
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
                            onPress={() => {
                                triggerHaptic();
                                handleExportData();
                            }}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="download" size={20} color="#10B981" />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Export Data
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={() => {
                                triggerWarningHaptic();
                                handleClearData();
                            }}
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
                            onPress={() => {
                                triggerHaptic();
                                handlePrivacy();
                            }}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Privacy Policy
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={() => {
                                triggerHaptic();
                                handleTerms();
                            }}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="document-text" size={20} color="#3B82F6" />
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
                            onPress={() => {
                                triggerHaptic();
                                handleSupport();
                            }}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="help-circle" size={20} color="#3B82F6" />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Contact Support
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={() => {
                                triggerHaptic();
                                handleRateApp();
                            }}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="star" size={20} color="#F59E0B" />
                                <Text style={[styles.rowLabel, { color: colors.text }]}>
                                    Rate App
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <TouchableOpacity
                            style={[styles.row, styles.rowNoBorder]}
                            onPress={() => {
                                triggerHaptic();
                                handleShareApp();
                            }}
                        >
                            <View style={styles.rowLeft}>
                                <Ionicons name="share-social" size={20} color="#10B981" />
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

            {/* Profile Edit Modal */}
            <Modal
                visible={isProfileModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeProfileModal}
                statusBarTranslucent={true}
            >
                <View style={StyleSheet.absoluteFill}>
                    <BlurView
                        intensity={100}
                        tint={theme === 'dark' ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                    {/* Semi-transparent overlay for better blur effect */}
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />

                    <TouchableOpacity
                        style={styles.modalOverlayTouchable}
                        activeOpacity={1}
                        onPress={() => {
                            triggerHaptic();
                            closeProfileModal();
                        }}
                    >
                        <Animated.View
                            style={[
                                styles.modalContent,
                                { backgroundColor: colors.background },
                                {
                                    transform: [{ translateY: pan }]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={(e) => e.stopPropagation()}
                                style={{ flex: 1 }}
                            >
                                {/* Modal Handle - Draggable area */}
                                <View style={styles.modalHandle} {...panResponder.panHandlers}>
                                    <View style={[styles.handle, { backgroundColor: colors.border }]} />
                                </View>

                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            triggerHaptic();
                                            closeProfileModal();
                                        }}
                                        style={styles.modalButton}
                                    >
                                        <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                                        Edit Profile
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            triggerHaptic();
                                            saveProfileChanges();
                                        }}
                                        style={styles.modalButton}
                                    >
                                        <Text style={[styles.modalButtonText, { color: colors.primary, fontWeight: Typography.fontWeight.semibold }]}>
                                            Save
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Content */}
                                <ScrollView
                                    style={styles.modalScroll}
                                    contentContainerStyle={styles.modalScrollContent}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {/* Avatar */}
                                    <View style={styles.modalAvatarSection}>
                                        <View style={[styles.modalAvatar, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                                            <Text style={[styles.modalAvatarText, { color: colors.primary }]}>
                                                {getInitials()}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.changePhotoButton, { backgroundColor: colors.primary }]}
                                            onPress={() => {
                                                triggerHaptic();
                                                Alert.alert('Change Photo', 'Photo picker would open here');
                                            }}
                                        >
                                            <Ionicons name="camera" size={18} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Form */}
                                    <View style={styles.modalForm}>
                                        {/* Name */}
                                        <View style={styles.modalField}>
                                            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                                                NAME
                                            </Text>
                                            <TextInput
                                                style={[
                                                    styles.modalInput,
                                                    {
                                                        backgroundColor: colors.cardBackground,
                                                        borderColor: colors.border,
                                                        color: colors.text,
                                                    }
                                                ]}
                                                value={editingProfile.name}
                                                onChangeText={(text) => setEditingProfile({ ...editingProfile, name: text })}
                                                placeholder="Your name"
                                                placeholderTextColor={colors.textTertiary}
                                            />
                                        </View>

                                        {/* Email */}
                                        <View style={styles.modalField}>
                                            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                                                EMAIL
                                            </Text>
                                            <TextInput
                                                style={[
                                                    styles.modalInput,
                                                    {
                                                        backgroundColor: colors.cardBackground,
                                                        borderColor: colors.border,
                                                        color: colors.text,
                                                    }
                                                ]}
                                                value={editingProfile.email}
                                                onChangeText={(text) => setEditingProfile({ ...editingProfile, email: text })}
                                                placeholder="your.email@example.com"
                                                placeholderTextColor={colors.textTertiary}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                        </View>

                                        {/* Bio */}
                                        <View style={styles.modalField}>
                                            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                                                BIO
                                            </Text>
                                            <TextInput
                                                style={[
                                                    styles.modalInput,
                                                    styles.modalBioInput,
                                                    {
                                                        backgroundColor: colors.cardBackground,
                                                        borderColor: colors.border,
                                                        color: colors.text,
                                                    }
                                                ]}
                                                value={editingProfile.bio}
                                                onChangeText={(text) => setEditingProfile({ ...editingProfile, bio: text })}
                                                placeholder="Tell us about yourself..."
                                                placeholderTextColor={colors.textTertiary}
                                                multiline
                                                numberOfLines={4}
                                                textAlignVertical="top"
                                            />
                                        </View>
                                    </View>
                                </ScrollView>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </Modal>
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
    profileCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    profileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    profileAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: Typography.fontWeight.bold,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: Typography.fontSize.sm,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalOverlayTouchable: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: '75%',
        maxHeight: '95%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    modalHandle: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 0,
    },
    modalButton: {
        paddingHorizontal: 4,
        paddingVertical: 8,
        minWidth: 60,
    },
    modalButtonText: {
        fontSize: Typography.fontSize.base,
    },
    modalTitle: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
    },
    modalScroll: {
        flex: 1,
    },
    modalScrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    modalAvatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    modalAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalAvatarText: {
        fontSize: 40,
        fontWeight: Typography.fontWeight.bold,
    },
    changePhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: '50%',
        marginRight: -60,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    modalForm: {
        gap: 20,
    },
    modalField: {
        gap: 8,
    },
    modalLabel: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.semibold,
        letterSpacing: 0.5,
    },
    modalInput: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: Typography.fontSize.base,
    },
    modalBioInput: {
        minHeight: 100,
        paddingTop: 14,
    },
});
