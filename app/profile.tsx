import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { Typography } from '../constants/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic, triggerSuccessHaptic } from '../utils/haptics';

const PROFILE_STORAGE_KEY = '@user_profile';

interface UserProfile {
    name: string;
    email: string;
    bio: string;
    profilePicture?: string;
}

export default function ProfileScreen() {
    const { colors } = useTheme();
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        bio: '',
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

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

    const saveProfile = async () => {
        try {
            await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
            triggerSuccessHaptic();
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save profile.');
        }
    };

    const getInitials = () => {
        if (!profile.name) return '?';
        const names = profile.name.trim().split(' ');
        if (names.length === 1) return names[0][0].toUpperCase();
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        triggerHaptic();
                        router.back();
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>
                    Profile
                </Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                        triggerHaptic();
                        if (isEditing) {
                            saveProfile();
                        } else {
                            setIsEditing(true);
                        }
                    }}
                >
                    <Text style={[styles.editButtonText, { color: colors.primary }]}>
                        {isEditing ? 'Save' : 'Edit'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Picture */}
                <View style={styles.avatarSection}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                        {profile.profilePicture ? (
                            <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
                        ) : (
                            <Text style={[styles.avatarText, { color: colors.primary }]}>
                                {getInitials()}
                            </Text>
                        )}
                    </View>
                    {isEditing && (
                        <TouchableOpacity
                            style={[styles.changePhotoButton, { backgroundColor: colors.primary }]}
                            onPress={() => {
                                triggerHaptic();
                                Alert.alert('Change Photo', 'Photo picker would open here');
                            }}
                        >
                            <Ionicons name="camera" size={18} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Profile Fields */}
                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Name
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.border,
                                    color: colors.text,
                                },
                                !isEditing && styles.inputDisabled
                            ]}
                            value={profile.name}
                            onChangeText={(text) => setProfile({ ...profile, name: text })}
                            placeholder="Your name"
                            placeholderTextColor={colors.textTertiary}
                            editable={isEditing}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Email
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.border,
                                    color: colors.text,
                                },
                                !isEditing && styles.inputDisabled
                            ]}
                            value={profile.email}
                            onChangeText={(text) => setProfile({ ...profile, email: text })}
                            placeholder="your.email@example.com"
                            placeholderTextColor={colors.textTertiary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={isEditing}
                        />
                    </View>

                    {/* Bio */}
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Bio
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.bioInput,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.border,
                                    color: colors.text,
                                },
                                !isEditing && styles.inputDisabled
                            ]}
                            value={profile.bio}
                            onChangeText={(text) => setProfile({ ...profile, bio: text })}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor={colors.textTertiary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            editable={isEditing}
                        />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
    },
    editButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    editButtonText: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 114,
        height: 114,
        borderRadius: 57,
    },
    avatarText: {
        fontSize: 48,
        fontWeight: Typography.fontWeight.bold,
    },
    changePhotoButton: {
        position: 'absolute',
        bottom: 12,
        right: '50%',
        marginRight: -72,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    form: {
        gap: 20,
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: Typography.fontSize.base,
    },
    inputDisabled: {
        opacity: 0.7,
    },
    bioInput: {
        minHeight: 100,
        paddingTop: 14,
    },
});
