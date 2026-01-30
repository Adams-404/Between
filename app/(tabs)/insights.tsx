import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { getAllAnswers } from '../../services/storage';
import { Typography } from '../../constants/Typography';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [stats, setStats] = useState({
        total: 0,
        thisWeek: 0,
        thisMonth: 0,
        streak: 0,
        avgWords: 0,
        totalWords: 0,
        favorites: 0,
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const answers = await getAllAnswers();
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisWeek = answers.filter(a => new Date(a.date) >= weekAgo).length;
        const thisMonth = answers.filter(a => new Date(a.date) >= monthAgo).length;

        // Calculate streak
        let streak = 0;
        const sortedDates = answers.map(a => a.date).sort().reverse();
        const today = new Date().toISOString().split('T')[0];

        if (sortedDates.includes(today)) {
            streak = 1;
            for (let i = 1; i < sortedDates.length; i++) {
                const prev = new Date(sortedDates[i - 1]);
                const curr = new Date(sortedDates[i]);
                const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
                if (diffDays === 1) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        // Calculate word stats
        const totalWords = answers.reduce((sum, a) => sum + a.answerText.split(/\s+/).length, 0);
        const avgWords = answers.length > 0 ? Math.round(totalWords / answers.length) : 0;
        const favorites = answers.filter(a => a.isFavorite).length;

        setStats({
            total: answers.length,
            thisWeek,
            thisMonth,
            streak,
            avgWords,
            totalWords,
            favorites,
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text style={[styles.title, { color: colors.text }]}>
                    Insights
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Your reflection journey
                </Text>

                {/* Main Stats */}
                <View style={styles.mainStatsContainer}>
                    <View style={[styles.bigStatCard, { backgroundColor: colors.primary }]}>
                        <Ionicons name="flame" size={32} color="#FFFFFF" />
                        <Text style={styles.bigStatValue}>{stats.streak}</Text>
                        <Text style={styles.bigStatLabel}>Day Streak</Text>
                    </View>

                    <View style={[styles.bigStatCard, { backgroundColor: colors.success }]}>
                        <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                        <Text style={styles.bigStatValue}>{stats.total}</Text>
                        <Text style={styles.bigStatLabel}>Total Reflections</Text>
                    </View>
                </View>

                {/* Time Period Stats */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Activity
                    </Text>

                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="calendar" size={24} color={colors.primary} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{stats.thisWeek}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Week</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{stats.thisMonth}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Month</Text>
                        </View>
                    </View>
                </View>

                {/* Writing Stats */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Writing
                    </Text>

                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="document-text" size={24} color={colors.primary} />
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {stats.avgWords}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Avg Words
                            </Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="create" size={24} color={colors.primary} />
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {stats.totalWords.toLocaleString()}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                Total Words
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Favorites */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Favorites
                    </Text>

                    <View style={[styles.favoriteCard, { backgroundColor: colors.cardBackground }]}>
                        <Ionicons name="heart" size={48} color={colors.primary} />
                        <Text style={[styles.favoriteValue, { color: colors.text }]}>
                            {stats.favorites}
                        </Text>
                        <Text style={[styles.favoriteLabel, { color: colors.textSecondary }]}>
                            Reflections marked as favorites
                        </Text>
                    </View>
                </View>

                {/* Motivational Message */}
                {stats.total > 0 && (
                    <View style={[styles.messageCard, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}>
                        <Ionicons name="sparkles" size={24} color={colors.primary} />
                        <Text style={[styles.messageText, { color: colors.text }]}>
                            {stats.streak > 0
                                ? `Amazing! You're on a ${stats.streak}-day streak. Keep it up!`
                                : stats.total < 7
                                    ? "Great start! Keep reflecting daily to build your habit."
                                    : `You've written ${stats.totalWords.toLocaleString()} words of reflection!`
                            }
                        </Text>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    title: {
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: Typography.fontSize.base,
        marginBottom: 24,
    },
    mainStatsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    bigStatCard: {
        flex: 1,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
    },
    bigStatValue: {
        fontSize: 48,
        fontWeight: Typography.fontWeight.bold,
        color: '#FFFFFF',
        marginTop: 12,
        marginBottom: 4,
    },
    bigStatLabel: {
        fontSize: Typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    statValue: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        marginTop: 12,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: Typography.fontSize.sm,
        textAlign: 'center',
    },
    favoriteCard: {
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    favoriteValue: {
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.bold,
        marginTop: 16,
        marginBottom: 8,
    },
    favoriteLabel: {
        fontSize: Typography.fontSize.sm,
        textAlign: 'center',
    },
    messageCard: {
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
    },
    messageText: {
        flex: 1,
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.fontSize.base * 1.5,
    },
});
