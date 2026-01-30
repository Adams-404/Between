import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { getAllAnswers, Answer } from '../services/storage';
import { Typography } from '../constants/Typography';
import { format } from 'date-fns';

type FilterType = 'all' | 'week' | 'month' | 'year';

export default function HistoryScreen() {
    const { colors } = useTheme();
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [filteredAnswers, setFilteredAnswers] = useState<Answer[]>([]);
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadAnswers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [answers, filter, searchQuery]);

    const loadAnswers = async () => {
        const allAnswers = await getAllAnswers();
        setAnswers(allAnswers);
    };

    const applyFilters = () => {
        let filtered = [...answers];

        // Apply time filter
        const now = new Date();
        switch (filter) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(a => new Date(a.date) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(a => new Date(a.date) >= monthAgo);
                break;
            case 'year':
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                filtered = filtered.filter(a => new Date(a.date) >= yearAgo);
                break;
        }

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(a =>
                a.answerText.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredAnswers(filtered);
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch {
            return dateString;
        }
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>
                    History
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textTertiary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search reflections..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filters}
            >
                {(['all', 'week', 'month', 'year'] as FilterType[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterButton,
                            {
                                backgroundColor: filter === f ? colors.primary : colors.cardBackground,
                                borderColor: filter === f ? colors.primary : colors.border,
                            }
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterText,
                            {
                                color: filter === f ? '#FFFFFF' : colors.text,
                                fontWeight: filter === f ? '600' : '400',
                            }
                        ]}>
                            {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'This Year'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                        {filteredAnswers.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Reflections
                    </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
                    <Text style={[styles.statValue, { color: colors.success }]}>
                        {answers.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Total
                    </Text>
                </View>
            </View>

            {/* List */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {filteredAnswers.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="book-outline" size={64} color={colors.textTertiary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {searchQuery ? 'No reflections found' : 'No reflections yet'}
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                            {searchQuery ? 'Try a different search term' : 'Start writing to see your history'}
                        </Text>
                    </View>
                ) : (
                    filteredAnswers.map((answer) => (
                        <View
                            key={answer.id}
                            style={[styles.answerCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                        >
                            <View style={styles.answerHeader}>
                                <View style={styles.answerDateContainer}>
                                    <Text style={[styles.answerDate, { color: colors.text }]}>
                                        {formatDate(answer.date)}
                                    </Text>
                                    <Text style={[styles.answerRelativeTime, { color: colors.textTertiary }]}>
                                        {getRelativeTime(answer.date)}
                                    </Text>
                                </View>
                                {answer.isFavorite && (
                                    <Ionicons name="heart" size={20} color={colors.primary} />
                                )}
                            </View>
                            <Text style={[styles.answerText, { color: colors.textSecondary }]} numberOfLines={3}>
                                {answer.answerText}
                            </Text>
                            <Text style={[styles.wordCount, { color: colors.textTertiary }]}>
                                {answer.answerText.split(/\s+/).length} words
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: Typography.fontSize.base,
        padding: 0,
    },
    filtersContainer: {
        maxHeight: 50,
    },
    filters: {
        paddingHorizontal: 20,
        gap: 8,
        paddingVertical: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontSize: Typography.fontSize.sm,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: Typography.fontSize.sm,
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    answerCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    answerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    answerDateContainer: {
        flex: 1,
    },
    answerDate: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
        marginBottom: 2,
    },
    answerRelativeTime: {
        fontSize: Typography.fontSize.sm,
    },
    answerText: {
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.fontSize.base * 1.5,
        marginBottom: 8,
    },
    wordCount: {
        fontSize: Typography.fontSize.xs,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: Typography.fontSize.sm,
    },
});
