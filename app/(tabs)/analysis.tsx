import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { getAllAnswers, Answer } from '../../services/storage';
import { analyzeAnswers, AnalysisResult } from '../../services/analysis';
import { Typography } from '../../constants/Typography';

export default function AnalysisScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const loadAnalysis = useCallback(async () => {
        try {
            // Only set loading on initial load, not refresh
            if (!refreshing) setIsLoading(true);

            const allAnswers = await getAllAnswers();
            const analysis = analyzeAnswers(allAnswers);
            setResult(analysis);
        } catch (error) {
            console.error('Error loading analysis:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    useFocusEffect(
        useCallback(() => {
            loadAnalysis();
        }, [loadAnalysis])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadAnalysis();
    }, [loadAnalysis]);

    if (isLoading && !result) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
            <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
                <Text style={[styles.title, { color: colors.text }]}>
                    Insights
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Understanding your reflection patterns
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* AI Insight Card */}
                <View style={[styles.aiCard, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}>
                    <View style={styles.aiHeader}>
                        <Ionicons name="sparkles" size={20} color={colors.primary} />
                        <Text style={[styles.aiTitle, { color: colors.primary }]}>AI Insight</Text>
                    </View>
                    <Text style={[styles.aiText, { color: colors.text }]}>
                        {result?.insight}
                    </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {result?.totalAnswers || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Total Reflections
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {result?.topThemes?.[0]?.category || '-'}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Top Theme
                        </Text>
                    </View>
                </View>

                {/* Themes List */}
                {result?.topThemes && result.topThemes.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Themes</Text>
                        {result.topThemes.map((theme, index) => (
                            <View key={theme.category} style={[styles.themeRow, { borderBottomColor: colors.border }]}>
                                <View style={styles.themeInfo}>
                                    <View style={[styles.rankBadge, { backgroundColor: index === 0 ? colors.primary : colors.border }]}>
                                        <Text style={[styles.rankText, { color: index === 0 ? '#FFF' : colors.textSecondary }]}>
                                            #{index + 1}
                                        </Text>
                                    </View>
                                    <Text style={[styles.themeName, { color: colors.text }]}>
                                        {theme.category}
                                    </Text>
                                </View>
                                <Text style={[styles.themeCount, { color: colors.textSecondary }]}>
                                    {theme.count} {theme.count === 1 ? 'entry' : 'entries'}
                                </Text>
                            </View>
                        ))}
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
    aiCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    aiTitle: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.bold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 8,
    },
    aiText: {
        fontSize: Typography.fontSize.lg,
        lineHeight: Typography.fontSize.lg * 1.5,
        fontWeight: Typography.fontWeight.medium,
        fontStyle: 'italic',
    },
    statsGrid: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 4,
        textAlign: 'center',
        textTransform: 'capitalize', // For the category text
    },
    statLabel: {
        fontSize: Typography.fontSize.xs,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
        marginBottom: 16,
    },
    themeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    themeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rankBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.bold,
    },
    themeName: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.medium,
        textTransform: 'capitalize',
    },
    themeCount: {
        fontSize: Typography.fontSize.sm,
    },
});
