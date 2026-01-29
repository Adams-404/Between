import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native';
import { HistoryItem } from '../../components/HistoryItem';
import { QuestionCard } from '../../components/QuestionCard';
import { useTheme } from '../../hooks/useTheme';
import { getAllAnswers, Answer } from '../../services/storage';
import { getPastDates, getQuestionForDate, formatDateForDisplay } from '../../services/questions';
import { Typography } from '../../constants/Typography';

export default function HistoryScreen() {
    const { colors } = useTheme();
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<{ answer: Answer; date: string } | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setIsLoading(true);
            const allAnswers = await getAllAnswers();
            setAnswers(allAnswers);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get past 30 days
    const dates = getPastDates(30);

    // Create a map of answers by date for quick lookup
    const answersByDate = new Map(answers.map(a => [a.date, a]));

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    History
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {answers.length} {answers.length === 1 ? 'question' : 'questions'} answered
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {dates.map(date => {
                    const question = getQuestionForDate(date);
                    const answer = answersByDate.get(date) || null;

                    return (
                        <HistoryItem
                            key={date}
                            question={question}
                            answer={answer}
                            date={date}
                            onPress={() => answer && setSelectedAnswer({ answer, date })}
                        />
                    );
                })}
            </ScrollView>

            {/* Answer Detail Modal */}
            <Modal
                visible={!!selectedAnswer}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedAnswer(null)}
            >
                {selectedAnswer && (
                    <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => setSelectedAnswer(null)}
                                style={styles.closeButton}
                            >
                                <Text style={[styles.closeButtonText, { color: colors.primary }]}>
                                    Close
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.modalContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <QuestionCard
                                question={getQuestionForDate(selectedAnswer.date)}
                                date={formatDateForDisplay(selectedAnswer.date)}
                            />

                            <View style={[styles.answerContainer, { backgroundColor: colors.cardBackground }]}>
                                <Text style={[styles.answerLabel, { color: colors.textSecondary }]}>
                                    Your answer:
                                </Text>
                                <Text style={[styles.answerText, { color: colors.text }]}>
                                    {selectedAnswer.answer.answerText}
                                </Text>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                )}
            </Modal>
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
    header: {
        padding: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: Typography.fontSize.base,
        color: '#6B7280',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 0,
        paddingBottom: 40,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        padding: 20,
        paddingBottom: 8,
        alignItems: 'flex-end',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
    },
    modalContent: {
        padding: 20,
        paddingTop: 8,
    },
    answerContainer: {
        borderRadius: 12,
        padding: 20,
    },
    answerLabel: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    answerText: {
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
    },
});
