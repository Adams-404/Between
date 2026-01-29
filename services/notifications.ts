import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Service for managing local notifications
 * Sends a gentle daily reminder at the user's preferred time
 */

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        return finalStatus === 'granted';
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
}

/**
 * Schedule daily notification
 * @param time - Time in HH:MM format (24-hour)
 */
export async function scheduleDailyNotification(time: string): Promise<void> {
    try {
        // Cancel existing notifications first
        await cancelAllNotifications();

        // Parse time
        const [hours, minutes] = time.split(':').map(Number);

        // Schedule daily notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'A moment for reflection',
                body: "Today's question is waiting for you",
                data: {},
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                hour: hours,
                minute: minutes,
                repeats: true,
            },
        });

        console.log(`Daily notification scheduled for ${time}`);
    } catch (error) {
        console.error('Error scheduling notification:', error);
        throw error;
    }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Error canceling notifications:', error);
    }
}

/**
 * Get scheduled notifications count (for debugging)
 */
export async function getScheduledNotificationsCount(): Promise<number> {
    try {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        return notifications.length;
    } catch (error) {
        console.error('Error getting scheduled notifications:', error);
        return 0;
    }
}
