import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontPreference } from '../constants/Typography';

/**
 * Storage service for managing answers and settings
 * All data is stored locally using AsyncStorage
 */

export interface Answer {
    id: string;
    questionId: number;
    date: string;        // YYYY-MM-DD format
    answerText: string;
    createdAt: number;   // Timestamp
    isFavorite?: boolean;
}

export interface Settings {
    theme: 'light' | 'dark' | 'auto';
    notificationEnabled: boolean;
    notificationTime: string; // HH:MM format
    fontPreference?: FontPreference;
}

const KEYS = {
    ANSWERS: '@daily_questions:answers',
    SETTINGS: '@daily_questions:settings',
};

// Default settings
const DEFAULT_SETTINGS: Settings = {
    theme: 'auto',
    notificationEnabled: false,
    notificationTime: '09:00',
    fontPreference: 'apple', // Default to Apple SF Pro font
};

/**
 * Save an answer for a specific date
 */
export async function saveAnswer(answer: Answer): Promise<void> {
    try {
        const answers = await getAllAnswers();
        // Remove any existing answer for this date (shouldn't happen, but just in case)
        const filtered = answers.filter(a => a.date !== answer.date);
        filtered.push(answer);
        await AsyncStorage.setItem(KEYS.ANSWERS, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error saving answer:', error);
        throw error;
    }
}

/**
 * Toggle favorite status of an answer
 */
export async function toggleFavorite(answerId: string): Promise<Answer | null> {
    try {
        const answers = await getAllAnswers();
        const answerIndex = answers.findIndex(a => a.id === answerId);

        if (answerIndex === -1) return null;

        // Toggle status
        answers[answerIndex].isFavorite = !answers[answerIndex].isFavorite;

        await AsyncStorage.setItem(KEYS.ANSWERS, JSON.stringify(answers));
        return answers[answerIndex];
    } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
    }
}

/**
 * Get answer for a specific date
 */
export async function getAnswerForDate(date: string): Promise<Answer | null> {
    try {
        const answers = await getAllAnswers();
        return answers.find(a => a.date === date) || null;
    } catch (error) {
        console.error('Error getting answer for date:', error);
        return null;
    }
}

/**
 * Get all answers, sorted by date (newest first)
 */
export async function getAllAnswers(): Promise<Answer[]> {
    try {
        const data = await AsyncStorage.getItem(KEYS.ANSWERS);
        if (!data) return [];
        const answers: Answer[] = JSON.parse(data);
        // Sort by date descending
        return answers.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
        console.error('Error getting all answers:', error);
        return [];
    }
}

/**
 * Delete an answer
 */
export async function deleteAnswer(answerId: string): Promise<void> {
    try {
        const answers = await getAllAnswers();
        const filtered = answers.filter(a => a.id !== answerId);
        await AsyncStorage.setItem(KEYS.ANSWERS, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting answer:', error);
        throw error;
    }
}

/**
 * Get settings
 */
export async function getSettings(): Promise<Settings> {
    try {
        const data = await AsyncStorage.getItem(KEYS.SETTINGS);
        if (!data) return DEFAULT_SETTINGS;
        return JSON.parse(data);
    } catch (error) {
        console.error('Error getting settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Save settings
 */
export async function saveSettings(settings: Settings): Promise<void> {
    try {
        await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
    }
}

/**
 * Clear all data (for testing or reset)
 */
export async function clearAllData(): Promise<void> {
    try {
        await AsyncStorage.multiRemove([KEYS.ANSWERS, KEYS.SETTINGS]);
    } catch (error) {
        console.error('Error clearing data:', error);
        throw error;
    }
}
