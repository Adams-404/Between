import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Question } from '../data/questions';
import { Answer } from '../services/storage';
import { useTheme } from '../hooks/useTheme';
import { Typography } from '../constants/Typography';
import { formatDateForDisplay } from '../services/questions';

interface HistoryItemProps {
    question: Question;
    answer: Answer | null;
    date: string;
    onPress?: () => void;
}

export function HistoryItem({ question, answer, date, onPress }: HistoryItemProps) {
    const { colors } = useTheme();

    const isAnswered = !!answer;
    const displayDate = formatDateForDisplay(date);

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            onPress={onPress}
            disabled={!isAnswered}
        >
            <View style={styles.header}>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                    {displayDate}
                </Text>
                {isAnswered && (
                    <View style={[styles.badge, { backgroundColor: colors.success }]}>
                        <Text style={styles.badgeText}>Answered</Text>
                    </View>
                )}
            </View>

            <Text
                style={[styles.question, { color: isAnswered ? colors.text : colors.textSecondary }]}
                numberOfLines={2}
            >
                {question.text}
            </Text>

            {isAnswered && answer && (
                <Text
                    style={[styles.preview, { color: colors.textTertiary }]}
                    numberOfLines={2}
                >
                    {answer.answerText}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    date: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.semibold,
    },
    question: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
        marginBottom: 8,
    },
    preview: {
        fontSize: Typography.fontSize.sm,
        lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    },
});
