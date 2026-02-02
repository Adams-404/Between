import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { Typography } from '../constants/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = '@has_seen_onboarding';

interface OnboardingSlide {
    id: string;
    title: string;
    description: string;
    image: any;
}

const slides: OnboardingSlide[] = [
    {
        id: '1',
        title: 'Daily Reflection',
        description: 'Answer one thoughtful question each day and build a meaningful journal of your thoughts and feelings.',
        image: require('../assets/images/onboarding_slide_1.png'),
    },
    {
        id: '2',
        title: 'Stay Consistent',
        description: 'Set daily reminders to never miss a moment of reflection. Build a lasting habit of self-awareness.',
        image: require('../assets/images/onboarding_slide_2.png'),
    },
    {
        id: '3',
        title: 'Track Your Growth',
        description: 'Look back on your journey, see your progress, and discover patterns in your personal growth over time.',
        image: require('../assets/images/onboarding_slide_3.png'),
    },
];

export default function OnboardingScreen() {
    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        triggerHaptic();
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        } else {
            handleGetStarted();
        }
    };

    const handleSkip = async () => {
        triggerHaptic();
        await handleGetStarted();
    };

    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={[styles.slide, { width }]}>
            <View style={styles.imageContainer}>
                <Image
                    source={item.image}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {item.title}
                </Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {item.description}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
            {/* Skip Button */}
            {currentIndex < slides.length - 1 && (
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                >
                    <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                        Skip
                    </Text>
                </TouchableOpacity>
            )}

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                keyExtractor={(item) => item.id}
                scrollEnabled={true}
            />

            {/* Bottom Section */}
            <View style={styles.bottomContainer}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: index === currentIndex ? colors.primary : colors.border,
                                    width: index === currentIndex ? 24 : 8,
                                }
                            ]}
                        />
                    ))}
                </View>

                {/* Next/Get Started Button */}
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    skipText: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.medium,
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    image: {
        width: width * 0.7,
        height: width * 0.7,
        maxWidth: 350,
        maxHeight: 350,
    },
    textContainer: {
        paddingBottom: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.bold,
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: Typography.fontSize.lg,
        textAlign: 'center',
        lineHeight: Typography.fontSize.lg * 1.6,
        paddingHorizontal: 20,
    },
    bottomContainer: {
        paddingHorizontal: 40,
        paddingBottom: 40,
        gap: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    button: {
        paddingVertical: 18,
        borderRadius: 16,
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
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
    },
});
