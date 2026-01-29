import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
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
        <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            {date && (
                <Text style={[styles.date, { color: colors.accent || colors.primary }]}>
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
        borderRadius: 24,
        padding: 32,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    date: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    question: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.medium,
        lineHeight: Typography.fontSize.xxl * 1.4,
        marginBottom: 20,
        textAlign: 'center',
    },
    categoryBadge: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    categoryText: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
