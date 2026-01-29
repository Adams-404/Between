import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HistoryItem } from '../../components/HistoryItem';
import { QuestionCard } from '../../components/QuestionCard';
import { useTheme } from '../../hooks/useTheme';
import { getAllAnswers, Answer, toggleFavorite } from '../../services/storage';
import { getQuestionForDate, formatDateForDisplay } from '../../services/questions';
import { Typography } from '../../constants/Typography';
import { QUESTIONS } from '../../data/questions';

export default function FavoritesScreen() {
    const { colors } = useTheme();
    const [favorites, setFavorites] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<{ answer: Answer; date: string } | null>(null);

    const loadFavorites = useCallback(async () => {
        try {
            setIsLoading(true);
            const allAnswers = await getAllAnswers();
            const favoriteAnswers = allAnswers.filter(a => a.isFavorite);
            setFavorites(favoriteAnswers);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const handleToggleFavorite = async () => {
        if (!selectedAnswer) return;

        try {
            const updatedAnswer = await toggleFavorite(selectedAnswer.answer.id);
            if (updatedAnswer) {
                // If unfavorited, remove from list or update
                if (!updatedAnswer.isFavorite) {
                    setFavorites(prev => prev.filter(a => a.id !== updatedAnswer.id));
                    setSelectedAnswer(null); // Close modal since it's no longer a favorite? Or just update icon.
                    // User might want to keep reading, so let's just update state but maybe not close immediately?
                    // Actually, if it's a Favorites screen, removing it might feel abrupt if it disappears. 
                    // But standard behavior is removing it.
                    // Let's keep it simple: update the "selected" state.
                } else {
                    setSelectedAnswer({ ...selectedAnswer, answer: updatedAnswer });
                }
                loadFavorites(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to toggle favorite', error);
        }
    };

    if (isLoading && favorites.length === 0) {
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
                    Favorites
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {favorites.length} {favorites.length === 1 ? 'moment' : 'moments'} saved
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {favorites.length > 0 ? (
                    favorites.map(answer => {
                        const question = QUESTIONS.find(q => q.id === answer.questionId);
                        if (!question) return null;

                        return (
                            <HistoryItem
                                key={answer.id}
                                question={question}
                                answer={answer}
                                date={answer.date}
                                onPress={() => setSelectedAnswer({ answer, date: answer.date })}
                            />
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="star-outline" size={48} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No favorites yet. {"\n"}Star your most meaningful reflections.
                        </Text>
                    </View>
                )}
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

                            <TouchableOpacity
                                onPress={handleToggleFavorite}
                                style={styles.favoriteButton}
                            >
                                <Ionicons
                                    name={selectedAnswer.answer.isFavorite ? "star" : "star-outline"}
                                    size={24}
                                    color={selectedAnswer.answer.isFavorite ? "#FFD700" : colors.textSecondary}
                                />
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
        paddingBottom: 100,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        padding: 20,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
    },
    favoriteButton: {
        padding: 8,
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
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: Typography.fontSize.base,
        textAlign: 'center',
        lineHeight: 24,
    },
});
