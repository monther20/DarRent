import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './notifications';

const DAILY_DIGEST_TASK = 'DAILY_DIGEST_TASK';
const WEEKLY_DIGEST_TASK = 'WEEKLY_DIGEST_TASK';

// Define the background task for daily digest
TaskManager.defineTask(DAILY_DIGEST_TASK, async () => {
  try {
    // Check if email digest preference is set to daily
    const preferences = notificationService.getPreferences();
    if (preferences.emailDigestFrequency === 'daily') {
      console.log('Running daily email digest task');
      await notificationService.sendEmailDigest();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Error running daily digest task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Define the background task for weekly digest
TaskManager.defineTask(WEEKLY_DIGEST_TASK, async () => {
  try {
    // Check if email digest preference is set to weekly
    const preferences = notificationService.getPreferences();
    if (preferences.emailDigestFrequency === 'weekly') {
      console.log('Running weekly email digest task');
      await notificationService.sendEmailDigest();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Error running weekly digest task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function registerBackgroundTasks() {
  try {
    // Register daily digest task (runs every day at 9:00 AM)
    await BackgroundFetch.registerTaskAsync(DAILY_DIGEST_TASK, {
      minimumInterval: 60 * 60 * 24, // 24 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });

    // Register weekly digest task (runs every week)
    await BackgroundFetch.registerTaskAsync(WEEKLY_DIGEST_TASK, {
      minimumInterval: 60 * 60 * 24 * 7, // 7 days
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('Background tasks registered successfully');
  } catch (error) {
    console.error('Error registering background tasks:', error);
  }
}

/**
 * Function to trigger email digest manually for testing
 */
export async function triggerEmailDigestForTesting() {
  try {
    await notificationService.sendEmailDigest();
    console.log('Email digest sent for testing');
    return true;
  } catch (error) {
    console.error('Error sending email digest for testing:', error);
    return false;
  }
}

export default {
  registerBackgroundTasks,
  triggerEmailDigestForTesting,
}; 