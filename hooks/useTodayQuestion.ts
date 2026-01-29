import { useState, useEffect } from 'react';
import { Question } from '../data/questions';
import { getTodayQuestion, getTodayDateString } from '../services/questions';
import { getAnswerForDate, Answer } from '../services/storage';

/**
 * Hook for managing today's question and answer
 */

export function useTodayQuestion() {
    const [question, setQuestion] = useState<Question | null>(null);
    const [answer, setAnswer] = useState<Answer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        loadTodayQuestion();
    }, []);

    async function loadTodayQuestion() {
        try {
            console.log('[useTodayQuestion] Starting to load...');
            setIsLoading(true);

            // Get today's question
            const todayQuestion = getTodayQuestion();
            console.log('[useTodayQuestion] Got question:', todayQuestion?.id);
            setQuestion(todayQuestion);

            // Check if already answered
            const todayDate = getTodayDateString();
            console.log('[useTodayQuestion] Today date:', todayDate);
            const existingAnswer = await getAnswerForDate(todayDate);
            console.log('[useTodayQuestion] Existing answer:', existingAnswer ? 'Yes' : 'No');

            if (existingAnswer) {
                setAnswer(existingAnswer);
                setIsAnswered(true);
            } else {
                setAnswer(null);
                setIsAnswered(false);
            }
            console.log('[useTodayQuestion] Loading complete');
        } catch (error) {
            console.error('[useTodayQuestion] Error loading today question:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function refresh() {
        loadTodayQuestion();
    }

    return {
        question,
        answer,
        isLoading,
        isAnswered,
        refresh,
    };
}
