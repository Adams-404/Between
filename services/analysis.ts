import { QUESTIONS } from '../data/questions';
import { Answer } from './storage';

/**
 * Service for analyzing user answers to generate "AI-like" insights
 * Uses local heuristics to protect privacy (offline-first)
 */

interface NeedAnalysis {
    category: string;
    count: number;
}

export interface AnalysisResult {
    period: string; // e.g., "Last 30 days"
    totalAnswers: number;
    topThemes: NeedAnalysis[];
    longestStreak?: number; // Not implemented yet as per "no streaks" rule, but maybe "days active"
    insight: string;
    mood?: 'reflective' | 'gratitude' | 'growth' | 'mixed';
}

/**
 * Generate an insight string based on user data
 */
function generateInsightText(themes: NeedAnalysis[], total: number): string {
    if (total === 0) {
        return "Start answering questions to reveal patterns in your thinking.";
    }

    if (total < 5) {
        return "You're just getting started. Keep reflecting to see deeper connections emerge.";
    }

    const topTheme = themes[0];
    const secondTheme = themes[1];

    if (!topTheme) return "Your reflections are varied and diverse.";

    // Simple template-based "AI" generation
    const templates = [
        `It seems you've been focusing a lot on ${topTheme.category} lately.`,
        `Your recent answers continually circle back to themes of ${topTheme.category}.`,
        `You are currently in a season of ${topTheme.category}.`,
    ];

    let text = templates[Math.floor(Math.random() * templates.length)];

    if (secondTheme) {
        text += ` There's also a strong undercurrent of ${secondTheme.category} in your thoughts.`;
    }

    // Add a concluding encouraging remark based on the top category
    const advice: Record<string, string> = {
        'growth': "Remember that growth is often uncomfortable, but always worth it.",
        'reflection': "Looking back is the best way to move forward with intention.",
        'gratitude': "Noticing the small things is a powerful way to shift your mindset.",
        'anxiety': "Be gentle with yourself. These feelings are valid.", // example
        'hope': "Hold onto that feeling. It's a light in the dark.",
        'courage': "Brave actions often feel like fear until they are done.",
    };

    const adviceText = advice[topTheme.category.toLowerCase()] || "Trust your process.";

    return `${text} ${adviceText}`;
}

export function analyzeAnswers(answers: Answer[]): AnalysisResult {
    // 1. Count categories
    const categoryCounts: Record<string, number> = {};

    answers.forEach(answer => {
        const question = QUESTIONS.find(q => q.id === answer.questionId);
        if (question && question.category) {
            const cat = question.category; // e.g., "growth"
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
    });

    // 2. Sort categories
    const sortedCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

    // 3. Get top 3
    const topThemes = sortedCategories.slice(0, 3);

    // 4. Generate Insight
    const insight = generateInsightText(topThemes, answers.length);

    return {
        period: "All time",
        totalAnswers: answers.length,
        topThemes,
        insight,
        mood: 'reflective' // Default for now
    };
}
