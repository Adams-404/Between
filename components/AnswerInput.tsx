import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../hooks/useTheme';
import { Typography } from '../constants/Typography';

interface AnswerInputProps {
    initialValue?: string;
    onSubmit: (text: string) => Promise<void>;
    disabled?: boolean;
}

export function AnswerInput({ initialValue = '', onSubmit, disabled = false }: AnswerInputProps) {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';
    const [text, setText] = useState(initialValue);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim()) return;

        try {
            setIsSaving(true);
            await onSubmit(text);
        } catch (error) {
            console.error('Error submitting answer:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const hasText = text.trim().length > 0;

    return (
        <View style={styles.container}>
            <View
                style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}
            >
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colors.text,
                        },
                    ]}
                    value={text}
                    onChangeText={setText}
                    placeholder="Take your time. Write as much or as little as you like."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    textAlignVertical="top"
                    editable={!disabled && !isSaving}
                />
            </View>

            {!disabled && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: hasText ? colors.primary : colors.muted,
                            opacity: hasText ? 1 : 0.6,
                        },
                    ]}
                    onPress={handleSubmit}
                    disabled={!hasText || isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {initialValue ? 'Update Answer' : 'Save Answer'}
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    inputContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    input: {
        padding: 24,
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.fontSize.base * 1.6,
        minHeight: 180,
        maxHeight: 400,
        backgroundColor: 'transparent',
    },
    button: {
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.bold,
        letterSpacing: 0.5,
    },
});
