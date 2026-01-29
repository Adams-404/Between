import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Typography } from '../constants/Typography';

interface AnswerInputProps {
    initialValue?: string;
    onSubmit: (text: string) => Promise<void>;
    disabled?: boolean;
}

export function AnswerInput({ initialValue = '', onSubmit, disabled = false }: AnswerInputProps) {
    const { colors } = useTheme();
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
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.cardBackground,
                        color: colors.text,
                        borderColor: colors.border,
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

            {!disabled && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: hasText ? colors.primary : colors.muted,
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
        gap: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: Typography.fontSize.base,
        lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
        minHeight: 160,
        maxHeight: 400,
    },
    button: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.semibold,
    },
});
