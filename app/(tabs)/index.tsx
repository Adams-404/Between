import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native';
import { QuestionCard } from '../../components/QuestionCard';
import { AnswerInput } from '../../components/AnswerInput';
import { useTheme } from '../../hooks/useTheme';
import { useTodayQuestion } from '../../hooks/useTodayQuestion';
import { saveAnswer, Answer } from '../../services/storage';
import { getTodayDateString } from '../../services/questions';
import { Typography } from '../../constants/Typography';

export default function TodayScreen() {
    const { colors } = useTheme();
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
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Today
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        One question. Your own answer.
                    </Text>
                </View>

                {question && (
                    <>
                        <QuestionCard question={question} />

                        {isAnswered && answer ? (
                            <View style={[styles.answeredContainer, { backgroundColor: colors.cardBackground }]}>
                                <Text style={[styles.answeredLabel, { color: colors.textSecondary }]}>
                                    Your answer:
                                </Text>
                                <Text style={[styles.answeredText, { color: colors.text }]}>
                                    {answer.answerText}
                                </Text>
                                <View style={[styles.lockBadge, { backgroundColor: colors.borderLight }]}>
                                    <Text style={[styles.lockText, { color: colors.textTertiary }]}>
                                        ✓ Answered for today
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View>
                                <Text style={[styles.promptLabel, { color: colors.textSecondary }]}>
                                    Your answer:
                                </Text>
                                <AnswerInput onSubmit={handleSubmitAnswer} />
                            </View>
                        )}
                    </>
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
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
    },
    promptLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    answeredContainer: {
        borderRadius: 12,
        padding: 20,
    },
    answeredLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    answeredText: {
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
        marginBottom: 16,
    },
    lockBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    lockText: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
    },
});
