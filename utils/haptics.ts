import * as Haptics from 'expo-haptics';

/**
 * Triggers a very soft haptic feedback for subtle interactions
 * Perfect for navigation, toggles, and gentle confirmations
 */
export const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
};

/**
 * Triggers a light haptic feedback for standard interactions
 * Good for button presses and UI interactions
 */
export const triggerLightHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Triggers a medium haptic feedback for more prominent interactions
 * Good for important actions or confirmations
 */
export const triggerMediumHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Triggers a success notification haptic
 * Perfect for completion of tasks or successful saves
 */
export const triggerSuccessHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Triggers a warning notification haptic
 * Good for alerts or cautionary actions
 */
export const triggerWarningHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/**
 * Triggers an error notification haptic
 * For error states or failed actions
 */
export const triggerErrorHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};
