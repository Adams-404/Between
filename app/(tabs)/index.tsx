import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Animated, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useTodayQuestion } from '../../hooks/useTodayQuestion';
import { saveAnswer, Answer } from '../../services/storage';
import { getTodayDateString } from '../../services/questions';
import { Typography } from '../../constants/Typography';
import { triggerHaptic, triggerSuccessHaptic } from '../../utils/haptics';

export default function TodayScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { question, answer, isLoading, isAnswered, refresh } = useTodayQuestion();
    const [text, setText] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (question) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        }
    }, [question]);

    const handleSubmitAnswer = async () => {
        if (!question || !text.trim()) return;

        try {
            setIsSaving(true);
            const newAnswer: Answer = {
                id: Date.now().toString(),
                questionId: question.id,
                date: getTodayDateString(),
                answerText: text.trim(),
                createdAt: Date.now(),
            };

            await saveAnswer(newAnswer);
            triggerSuccessHaptic(); // Haptic feedback on successful save
            setText('');
            refresh();
        } catch (error) {
            console.error('Error saving answer:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const hasText = text.trim().length > 0;

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Date Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.dateHeader}>
                        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                            {today}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.historyButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                        onPress={() => {
                            triggerHaptic();
                            router.push('/history');
                        }}
                    >
                        <Ionicons name="book-outline" size={20} color={colors.primary} />
                        <Text style={[styles.historyButtonText, { color: colors.primary }]}>
                            History
                        </Text>
                    </TouchableOpacity>
                </View>

                {question && (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {/* Question Card */}
                        <View style={[styles.questionCard, {
                            backgroundColor: colors.cardBackground,
                            borderColor: colors.border,
                        }]}>
                            {question.category && (
                                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                                    <Text style={[styles.categoryText, { color: colors.primary }]}>
                                        {question.category}
                                    </Text>
                                </View>
                            )}

                            <Text style={[styles.question, { color: colors.text }]}>
                                {question.text}
                            </Text>
                        </View>

                        {/* Answer Section */}
                        {isAnswered && answer ? (
                            <View style={[styles.answeredCard, {
                                backgroundColor: colors.cardBackground,
                                borderColor: colors.success + '40',
                            }]}>
                                <View style={styles.answeredHeader}>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                    <Text style={[styles.answeredLabel, { color: colors.success }]}>
                                        Reflection Saved
                                    </Text>
                                </View>

                                <Text style={[styles.answeredText, { color: colors.text }]}>
                                    {answer.answerText}
                                </Text>

                                <View style={[styles.answeredFooter, { borderTopColor: colors.border }]}>
                                    <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                                    <Text style={[styles.answeredTime, { color: colors.textTertiary }]}>
                                        {new Date(answer.createdAt).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.answerSection}>
                                <Text style={[styles.answerPrompt, { color: colors.textSecondary }]}>
                                    Your Reflection
                                </Text>

                                <View style={[styles.inputCard, {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.border,
                                }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={text}
                                        onChangeText={setText}
                                        placeholder="Take your time. Write as much or as little as you like..."
                                        placeholderTextColor={colors.textTertiary}
                                        multiline
                                        numberOfLines={8}
                                        editable={!isSaving}
                                        textAlignVertical="top"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.saveButton, {
                                        backgroundColor: hasText ? colors.primary : colors.muted,
                                        opacity: hasText ? 1 : 0.5,
                                    }]}
                                    onPress={handleSubmitAnswer}
                                    disabled={!hasText || isSaving}
                                    activeOpacity={0.8}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                                            <Text style={styles.saveButtonText}>
                                                Save Reflection
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
    },
    historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    historyButtonText: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.semibold,
    },
    questionCard: {
        borderRadius: 24,
        padding: 28,
        marginBottom: 24,
        borderWidth: 1,
        alignItems: 'center',
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 20,
    },
    categoryText: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.bold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    question: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.semibold,
        lineHeight: Typography.fontSize.xxl * 1.4,
        textAlign: 'center',
    },
    answerSection: {
        gap: 16,
    },
    answerPrompt: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.bold,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        minHeight: 180,
    },
    input: {
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.fontSize.base * 1.6,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.bold,
    },
    answeredCard: {
        borderRadius: 20,
        borderWidth: 2,
        padding: 24,
    },
    answeredHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    answeredLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    answeredText: {
        fontSize: Typography.fontSize.lg,
        lineHeight: Typography.fontSize.lg * 1.6,
        marginBottom: 16,
    },
    answeredFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    answeredTime: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
    },
});
