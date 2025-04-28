import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export type NotificationType = 'payment' | 'lease' | 'maintenance' | 'application' | 'message';

export interface NotificationPreferences {
  payments: boolean;
  lease: boolean;
  maintenance: boolean;
  applications: boolean;
  messages: boolean;
  email: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private preferences: NotificationPreferences = {
    payments: true,
    lease: true,
    maintenance: true,
    applications: true,
    messages: true,
    email: true,
  };

  private constructor() {
    this.loadPreferences();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async loadPreferences() {
    try {
      const storedPrefs = await AsyncStorage.getItem('notification_preferences');
      if (storedPrefs) {
        this.preferences = JSON.parse(storedPrefs);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  public async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Device.osName === 'Android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    return true;
  }

  public async updatePreference(key: keyof NotificationPreferences, value: boolean) {
    this.preferences[key] = value;
    try {
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  public async schedulePaymentReminder(amount: number, dueDate: Date, type: 'rent' | 'utility') {
    if (!this.preferences.payments) return;

    const trigger = new Date(dueDate);
    trigger.setDate(trigger.getDate() - 5); // 5 days before due date

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${type === 'rent' ? 'Rent' : 'Utility'} Payment Reminder`,
        body: `Your ${type} payment of ${amount} JOD is due in 5 days`,
        data: { type: 'payment', amount, dueDate },
      },
      trigger: {
        seconds: Math.floor((trigger.getTime() - Date.now()) / 1000),
        repeats: false,
      },
    });
  }

  public async sendMaintenanceUpdate(requestId: string, status: string, details: string) {
    if (!this.preferences.maintenance) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Maintenance Update',
        body: `Request #${requestId}: ${status}`,
        data: { type: 'maintenance', requestId, status, details },
      },
      trigger: null,
    });
  }

  public async sendApplicationUpdate(applicationId: string, status: string, propertyName: string) {
    if (!this.preferences.applications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Application Status Update',
        body: `Your application for ${propertyName} is ${status}`,
        data: { type: 'application', applicationId, status },
      },
      trigger: null,
    });
  }

  public async sendLeaseReminder(propertyName: string, expiryDate: Date, daysRemaining: number) {
    if (!this.preferences.lease) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lease Expiry Reminder',
        body: `Your lease for ${propertyName} expires in ${daysRemaining} days`,
        data: { type: 'lease', propertyName, expiryDate },
      },
      trigger: null,
    });
  }

  public async sendMessageNotification(senderId: string, senderName: string, message: string) {
    if (!this.preferences.messages) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `New message from ${senderName}`,
        body: message,
        data: { type: 'message', senderId },
      },
      trigger: null,
    });
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }
}

export const notificationService = NotificationService.getInstance();

export default notificationService;
