import { QUESTIONS, Question } from '../data/questions';

/**
 * Service for selecting daily questions
 * Uses deterministic selection based on date
 */

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
    const today = new Date();
    return formatDateString(today);
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object
 */
export function parseDateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Get a deterministic question for a given date
 * Uses a simple hash of the date to select from the question pool
 * This ensures the same question appears for the same date across all devices
 */
export function getQuestionForDate(dateString: string): Question {
    // Simple hash function for the date string
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        const char = dateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Use absolute value and modulo to get index
    const index = Math.abs(hash) % QUESTIONS.length;
    return QUESTIONS[index];
}

/**
 * Get today's question
 */
export function getTodayQuestion(): Question {
    return getQuestionForDate(getTodayDateString());
}

/**
 * Get a range of dates for history view
 */
export function getDateRange(startDate: Date, endDate: Date): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        dates.push(formatDateString(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

/**
 * Get dates for the past N days (including today)
 */
export function getPastDates(days: number): string[] {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(formatDateString(date));
    }

    return dates;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(dateString: string): string {
    const date = parseDateString(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === formatDateString(today)) {
        return 'Today';
    } else if (dateString === formatDateString(yesterday)) {
        return 'Yesterday';
    } else {
        // Format as "Monday, Jan 15"
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });
    }
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string): boolean {
    return dateString === getTodayDateString();
}

/**
 * Check if a date is in the past
 */
export function isPast(dateString: string): boolean {
    return dateString < getTodayDateString();
}
