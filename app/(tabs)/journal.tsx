import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Modal, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '../../utils/haptics';

interface JournalEntry {
    id: string;
    text: string;
    date: string;
    timestamp: number;
    wordCount: number;
    mood?: string;
}

const STORAGE_KEY = '@journal_entries';

const MOODS = [
    { emoji: '😊', label: 'Happy', color: '#10B981' },
    { emoji: '😌', label: 'Calm', color: '#06B6D4' },
    { emoji: '😔', label: 'Sad', color: '#3B82F6' },
    { emoji: '😤', label: 'Frustrated', color: '#F59E0B' },
    { emoji: '🤗', label: 'Grateful', color: '#8B5CF6' },
];

export default function JournalScreen() {
    const { colors, theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [currentEntry, setCurrentEntry] = useState('');
    const [selectedMood, setSelectedMood] = useState<string | undefined>();
    const [todayEntries, setTodayEntries] = useState<JournalEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    const getTodayDateString = () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    };

    const loadEntries = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const allEntries: JournalEntry[] = JSON.parse(stored);
                const today = getTodayDateString();
                const todaysEntries = allEntries.filter(entry => entry.date === today);
                setTodayEntries(todaysEntries.sort((a, b) => b.timestamp - a.timestamp));

                // Fade in animation
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }
        } catch (error) {
            console.error('Error loading journal entries:', error);
        }
    }, [fadeAnim]);

    useFocusEffect(
        useCallback(() => {
            loadEntries();
        }, [loadEntries])
    );

    const saveEntry = async () => {
        if (!currentEntry.trim()) {
            Alert.alert('Empty Entry', 'Please write something before saving.');
            return;
        }

        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            const allEntries: JournalEntry[] = stored ? JSON.parse(stored) : [];

            const wordCount = currentEntry.trim().split(/\s+/).length;
            const newEntry: JournalEntry = {
                id: Date.now().toString(),
                text: currentEntry.trim(),
                date: getTodayDateString(),
                timestamp: Date.now(),
                wordCount,
                mood: selectedMood,
            };

            allEntries.push(newEntry);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allEntries));

            triggerSuccessHaptic(); // Haptic on successful save
            setCurrentEntry('');
            setSelectedMood(undefined);
            setIsExpanded(false);
            await loadEntries();
        } catch (error) {
            console.error('Error saving journal entry:', error);
            Alert.alert('Error', 'Failed to save entry. Please try again.');
        }
    };

    const deleteEntry = async (id: string) => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const stored = await AsyncStorage.getItem(STORAGE_KEY);
                            if (stored) {
                                const allEntries: JournalEntry[] = JSON.parse(stored);
                                const filtered = allEntries.filter(entry => entry.id !== id);
                                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
                                triggerWarningHaptic(); // Haptic on delete
                                await loadEntries();
                            }
                        } catch (error) {
                            console.error('Error deleting entry:', error);
                        }
                    },
                },
            ]
        );
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    const wordCount = currentEntry.trim().split(/\s+/).filter(w => w).length;
    const totalWordsToday = todayEntries.reduce((sum, entry) => sum + entry.wordCount, 0);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Quick Stats Bar */}
                <View style={[styles.statsBar, { paddingTop: insets.top + 12 }]}>
                    {totalWordsToday > 0 && (
                        <View style={[styles.stat, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="create" size={14} color={colors.primary} />
                            <Text style={[styles.statText, { color: colors.textSecondary }]}>
                                {totalWordsToday} words today
                            </Text>
                        </View>
                    )}
                    {todayEntries.length > 0 && (
                        <View style={[styles.stat, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="document-text" size={14} color={colors.primary} />
                            <Text style={[styles.statText, { color: colors.textSecondary }]}>
                                {todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'}
                            </Text>
                        </View>
                    )}
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Writing Area */}
                    <View style={[styles.writeBox, {
                        backgroundColor: colors.cardBackground,
                        borderColor: isExpanded ? colors.primary : colors.border,
                    }]}>
                        <Text style={[styles.writePrompt, { color: colors.textSecondary }]}>
                            What's on your mind?
                        </Text>

                        <TextInput
                            style={[styles.input, {
                                color: colors.text,
                                minHeight: isExpanded ? 150 : 100,
                            }]}
                            placeholder="Start writing..."
                            placeholderTextColor={colors.textTertiary}
                            value={currentEntry}
                            onChangeText={setCurrentEntry}
                            multiline
                            textAlignVertical="top"
                            onFocus={() => setIsExpanded(true)}
                        />

                        {/* Mood Selector */}
                        {isExpanded && (
                            <View style={styles.moodSelector}>
                                <Text style={[styles.moodLabel, { color: colors.textTertiary }]}>
                                    How are you feeling?
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.moodOptions}>
                                        {MOODS.map((mood) => (
                                            <TouchableOpacity
                                                key={mood.label}
                                                onPress={() => {
                                                    triggerHaptic();
                                                    setSelectedMood(mood.label);
                                                }}
                                                style={[
                                                    styles.moodButton,
                                                    {
                                                        backgroundColor: selectedMood === mood.label
                                                            ? mood.color + '20'
                                                            : colors.background,
                                                        borderColor: selectedMood === mood.label
                                                            ? mood.color
                                                            : colors.border,
                                                    }
                                                ]}
                                            >
                                                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                                <Text style={[
                                                    styles.moodButtonText,
                                                    { color: selectedMood === mood.label ? mood.color : colors.textSecondary }
                                                ]}>
                                                    {mood.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.writeFooter}>
                            <Text style={[styles.wordCount, { color: colors.textTertiary }]}>
                                {wordCount > 0 && `${wordCount} ${wordCount === 1 ? 'word' : 'words'}`}
                            </Text>

                            {currentEntry.trim().length > 0 && (
                                <View style={styles.writeActions}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            triggerHaptic();
                                            setCurrentEntry('');
                                            setSelectedMood(undefined);
                                            setIsExpanded(false);
                                        }}
                                        style={[styles.actionButton, { backgroundColor: colors.border }]}
                                    >
                                        <Text style={[styles.actionButtonText, { color: colors.text }]}>
                                            Clear
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={saveEntry}
                                        style={[styles.actionButton, styles.saveButton, { backgroundColor: colors.primary }]}
                                    >
                                        <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                                        <Text style={styles.saveButtonText}>
                                            Save
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Today's Entries */}
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {todayEntries.length > 0 ? (
                            <View style={styles.entriesSection}>
                                {todayEntries.map((entry, index) => (
                                    <TouchableOpacity
                                        key={entry.id}
                                        style={[styles.entryCard, {
                                            backgroundColor: colors.cardBackground,
                                            borderColor: colors.border,
                                        }]}
                                        onPress={() => {
                                            triggerHaptic();
                                            setSelectedEntry(entry);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.entryHeader}>
                                            <View style={styles.entryMeta}>
                                                {entry.mood && (
                                                    <Text style={styles.entryMoodEmoji}>
                                                        {MOODS.find(m => m.label === entry.mood)?.emoji || '✨'}
                                                    </Text>
                                                )}
                                                <Text style={[styles.entryTime, { color: colors.textTertiary }]}>
                                                    {formatTime(entry.timestamp)}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text
                                            style={[styles.entryText, { color: colors.text }]}
                                            numberOfLines={3}
                                        >
                                            {entry.text}
                                        </Text>

                                        <View style={styles.entryFooter}>
                                            <Text style={[styles.entryWordCount, { color: colors.textTertiary }]}>
                                                {entry.wordCount} {entry.wordCount === 1 ? 'word' : 'words'}
                                            </Text>
                                            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : !currentEntry && (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIcon, { backgroundColor: colors.cardBackground }]}>
                                    <Ionicons name="create-outline" size={32} color={colors.primary} />
                                </View>
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    Start your first entry
                                </Text>
                                <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                                    Capture your thoughts, feelings, and moments
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>

                {/* Entry Detail Modal - Auto Height */}
                {selectedEntry && (
                    <Modal
                        visible={true}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => setSelectedEntry(null)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setSelectedEntry(null)}
                        >
                            <TouchableOpacity
                                activeOpacity={1}
                                style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}
                                onPress={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <View style={styles.modalHeaderBar}>
                                    <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
                                </View>

                                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                                    <View style={styles.modalTitleSection}>
                                        {selectedEntry.mood && (
                                            <Text style={styles.modalMoodEmoji}>
                                                {MOODS.find(m => m.label === selectedEntry.mood)?.emoji || '✨'}
                                            </Text>
                                        )}
                                        <View>
                                            <Text style={[styles.modalDate, { color: colors.text }]}>
                                                {formatDate(selectedEntry.timestamp)}
                                            </Text>
                                            <Text style={[styles.modalTime, { color: colors.textSecondary }]}>
                                                {formatTime(selectedEntry.timestamp)}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => {
                                            triggerWarningHaptic();
                                            setSelectedEntry(null);
                                            deleteEntry(selectedEntry.id);
                                        }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="trash-outline" size={22} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>

                                {/* Modal Body */}
                                <ScrollView
                                    style={styles.modalScroll}
                                    contentContainerStyle={styles.modalScrollContent}
                                >
                                    <Text style={[styles.modalText, { color: colors.text }]}>
                                        {selectedEntry.text}
                                    </Text>
                                </ScrollView>

                                {/* Modal Footer */}
                                <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                                    <Ionicons name="document-text-outline" size={16} color={colors.textTertiary} />
                                    <Text style={[styles.modalWordCount, { color: colors.textSecondary }]}>
                                        {selectedEntry.wordCount} {selectedEntry.wordCount === 1 ? 'word' : 'words'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    statsBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 12,
        gap: 8,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 5,
    },
    statText: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 8,
        paddingBottom: 120,
    },
    writeBox: {
        borderRadius: 20,
        borderWidth: 2,
        padding: 20,
        marginBottom: 24,
    },
    writePrompt: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    input: {
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.fontSize.base * 1.5,
        marginBottom: 12,
    },
    moodSelector: {
        marginBottom: 12,
    },
    moodLabel: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: 8,
    },
    moodOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    moodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        gap: 6,
    },
    moodEmoji: {
        fontSize: 16,
    },
    moodButtonText: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
    },
    writeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 32,
    },
    wordCount: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
    },
    writeActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 14,
    },
    actionButtonText: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.semibold,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    saveButtonText: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.semibold,
        color: '#FFF',
    },
    entriesSection: {
        gap: 12,
    },
    entryCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    entryMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    entryMoodEmoji: {
        fontSize: 18,
    },
    entryTime: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
    },
    entryText: {
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.fontSize.base * 1.5,
        marginBottom: 10,
    },
    entryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    entryWordCount: {
        fontSize: Typography.fontSize.xs,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: Typography.fontSize.sm,
        textAlign: 'center',
        lineHeight: Typography.fontSize.sm * 1.5,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    modalHeaderBar: {
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    modalTitleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    modalMoodEmoji: {
        fontSize: 28,
    },
    modalDate: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 2,
    },
    modalTime: {
        fontSize: Typography.fontSize.sm,
    },
    modalScroll: {
        maxHeight: 400,
    },
    modalScrollContent: {
        padding: 20,
        paddingBottom: 0,
    },
    modalText: {
        fontSize: Typography.fontSize.lg,
        lineHeight: Typography.fontSize.lg * 1.6,
    },
    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderTopWidth: 1,
    },
    modalWordCount: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
    },
});
