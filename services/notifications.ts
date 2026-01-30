
/**
 * Service for managing local notifications
 * STUB implementation for Expo Go compatibility
 * 
 * Note: Actual expo-notifications functionality is removed to prevent crashes in Expo Go (SDK 53+).
 * This file provides a safe interface that does nothing.
 */

export async function requestPermissions(): Promise<boolean> {
    console.log('[Notifications] Stub: Request permissions skipped');
    return false;
}

export async function scheduleDailyNotification(time: string): Promise<void> {
    console.log(`[Notifications] Stub: Schedule notification for ${time} skipped`);
}

export async function cancelAllNotifications(): Promise<void> {
    console.log('[Notifications] Stub: Cancel notifications skipped');
}

export async function getScheduledNotificationsCount(): Promise<number> {
    return 0;
}
