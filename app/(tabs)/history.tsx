import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HistoryItem } from '../../components/HistoryItem';
import { QuestionCard } from '../../components/QuestionCard';
import { useTheme } from '../../hooks/useTheme';
import { getAllAnswers, Answer, toggleFavorite } from '../../services/storage';
import { getPastDates, getQuestionForDate, formatDateForDisplay } from '../../services/questions';
import { Typography } from '../../constants/Typography';
import { QUESTIONS } from '../../data/questions';

export default function HistoryScreen() {
    const { colors } = useTheme();
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<{ answer: Answer; date: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState<{ date: string; question: any; answer: Answer | null }[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const loadHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            const allAnswers = await getAllAnswers();
            setAnswers(allAnswers);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [loadHistory])
    );

    useEffect(() => {
        // Prepare data for rendering/filtering
        let items: { date: string; question: any; answer: Answer | null }[] = [];

        let targetAnswers = answers;

        // Filter by Favorites if toggle is active
        if (showFavoritesOnly) {
            targetAnswers = targetAnswers.filter(a => a.isFavorite);
        }

        if (searchQuery.trim()) {
            // Search mode: Search across target answers
            const query = searchQuery.toLowerCase();
            const matchingAnswers = targetAnswers.filter(answer => {
                const question = QUESTIONS.find(q => q.id === answer.questionId);
                const questionText = question?.text.toLowerCase() || '';
                const answerText = answer.answerText.toLowerCase();
                const category = question?.category?.toLowerCase() || '';

                return (
                    questionText.includes(query) ||
                    answerText.includes(query) ||
                    category.includes(query)
                );
            });

            // Map to display items
            items = matchingAnswers.map(answer => ({
                date: answer.date,
                question: QUESTIONS.find(q => q.id === answer.questionId),
                answer: answer
            }));
        } else {
            // Default/Favorites mode
            if (showFavoritesOnly) {
                // Determine dates from the favorite answers
                items = targetAnswers.map(answer => ({
                    date: answer.date,
                    question: QUESTIONS.find(q => q.id === answer.questionId),
                    answer: answer
                }));
            } else {
                // Standard View: Show last 30 days
                const dates = getPastDates(30);
                const answersByDate = new Map(answers.map(a => [a.date, a]));

                items = dates.map(date => ({
                    date,
                    question: getQuestionForDate(date),
                    answer: answersByDate.get(date) || null
                }));
            }
        }

        setFilteredItems(items);
    }, [searchQuery, answers, showFavoritesOnly]);

    const handleToggleFavorite = async () => {
        if (!selectedAnswer) return;

        try {
            const updatedAnswer = await toggleFavorite(selectedAnswer.answer.id);
            if (updatedAnswer) {
                // Update local state
                setAnswers(prev => prev.map(a => a.id === updatedAnswer.id ? updatedAnswer : a));
                setSelectedAnswer({ ...selectedAnswer, answer: updatedAnswer });
            }
        } catch (error) {
            console.error('Failed to toggle favorite', error);
        }
    };

    if (isLoading && answers.length === 0) {
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

                <View style={styles.filterContainer}>
                    <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                        <Ionicons name="search-outline" size={20} color={colors.textTertiary} style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search history..."
                            placeholderTextColor={colors.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            clearButtonMode="while-editing"
                            returnKeyType="search"
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            {
                                backgroundColor: showFavoritesOnly ? colors.primary : colors.cardBackground,
                                borderColor: colors.border
                            }
                        ]}
                        onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    >
                        <Ionicons
                            name={showFavoritesOnly ? "star" : "star-outline"}
                            size={20}
                            color={showFavoritesOnly ? "#FFFFFF" : colors.text}
                        />
                    </TouchableOpacity>
                </View>

                {!searchQuery && !showFavoritesOnly && (
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Past 30 days
                    </Text>
                )}
                {showFavoritesOnly && (
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Showing favorites
                    </Text>
                )}
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <HistoryItem
                            key={item.date}
                            question={item.question}
                            answer={item.answer}
                            date={item.date}
                            onPress={() => item.answer && setSelectedAnswer({ answer: item.answer, date: item.date })}
                        />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search" size={48} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {searchQuery ? "No matching answers found." : "No history yet."}
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
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 12, // Space between search and filter btn
    },
    filterButton: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: Typography.fontSize.base,
        height: 24,
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
    },
    emptyText: {
        marginTop: 16,
        fontSize: Typography.fontSize.base,
        textAlign: 'center',
    },
});
