import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { QuestionCard } from '../../components/QuestionCard';
import { AnswerInput } from '../../components/AnswerInput';
import { useTheme } from '../../hooks/useTheme';
import { useTodayQuestion } from '../../hooks/useTodayQuestion';
import { saveAnswer, Answer } from '../../services/storage';
import { getTodayDateString } from '../../services/questions';
import { Typography } from '../../constants/Typography';

export default function TodayScreen() {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';
    const { question, answer, isLoading, isAnswered, refresh } = useTodayQuestion();

    const handleSubmitAnswer = async (text: string) => {
        if (!question) return;

        const newAnswer: Answer = {
            id: Date.now().toString(),
            questionId: question.id,
            date: getTodayDateString(),
            answerText: text,
            createdAt: Date.now(),
        };

        await saveAnswer(newAnswer);
        refresh();
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: 'transparent' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.welcomeText, { color: colors.primary }]}>
                        DAILY INSIGHT
                    </Text>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Today's Question
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        One question to reflect on your day.
                    </Text>
                </View>

                {question && (
                    <View style={styles.contentContainer}>
                        <QuestionCard question={question} />

                        {isAnswered && answer ? (
                            <View style={[styles.answeredContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                                <Text style={[styles.answeredLabel, { color: colors.textSecondary }]}>
                                    Your reflection:
                                </Text>
                                <Text style={[styles.answeredText, { color: colors.text }]}>
                                    {answer.answerText}
                                </Text>
                                <View style={[styles.lockBadge, { backgroundColor: 'rgba(52, 211, 153, 0.2)' }]}>
                                    <Text style={[styles.lockText, { color: '#34D399' }]}>
                                        ✓ Captured for today
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View>
                                <Text style={[styles.promptLabel, { color: colors.textSecondary }]}>
                                    Your reflection:
                                </Text>
                                <AnswerInput onSubmit={handleSubmitAnswer} />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
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
    // planetOrb and secondaryOrb removed
    scrollContent: {
        padding: 24,
        paddingBottom: 120,
    },
    header: {
        marginTop: 20,
        marginBottom: 40,
    },
    welcomeText: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.bold,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    title: {
        fontSize: 36,
        fontWeight: '800', // Extra bold
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: Typography.fontSize.lg,
        lineHeight: 28,
        maxWidth: '80%',
    },
    contentContainer: {
        gap: 8,
    },
    promptLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
    },
    answeredContainer: {
        borderRadius: 24,
        padding: 32,
        overflow: 'hidden',
        borderWidth: 1,
    },
    answeredLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    answeredText: {
        fontSize: Typography.fontSize.lg,
        lineHeight: Typography.fontSize.lg * 1.5,
        marginBottom: 24,
    },
    lockBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    lockText: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.bold,
    },
});
