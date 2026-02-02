import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const ONBOARDING_KEY = '@has_seen_onboarding';

export default function Index() {
    const { colors } = useTheme();

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);

            // Small delay for smoother transition
            setTimeout(() => {
                if (hasSeenOnboarding) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/onboarding');
                }
            }, 500);
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            // Default to showing onboarding on error
            router.replace('/onboarding');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}
