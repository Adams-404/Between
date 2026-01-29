import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Question } from '../data/questions';
import { useTheme } from '../hooks/useTheme';
import { Typography } from '../constants/Typography';

interface QuestionCardProps {
    question: Question;
    date?: string;
}

export function QuestionCard({ question, date }: QuestionCardProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
            {date && (
                <Text style={[styles.date, { color: colors.textTertiary }]}>
                    {date}
                </Text>
            )}
            <Text style={[styles.question, { color: colors.text }]}>
                {question.text}
            </Text>
            {question.category && (
                <View style={[styles.categoryBadge, { backgroundColor: colors.borderLight }]}>
                    <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                        {question.category}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    date: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    question: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.semibold,
        lineHeight: Typography.fontSize.xxl * Typography.lineHeight.normal,
        marginBottom: 16,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
        textTransform: 'capitalize',
    },
});
