import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export type NotificationType = 
  | 'payment_reminder' 
  | 'payment_received'
  | 'lease_update'
  | 'lease_expiry'
  | 'maintenance_update'
  | 'maintenance_scheduled'
  | 'application'
  | 'message'
  | 'rent_accepted'
  | 'rent_rejected';

export interface NotificationPreferences {
  payments: boolean;
  lease: boolean;
  maintenance: boolean;
  applications: boolean;
  messages: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
  quietHoursStart: number; // 0-23 hour
  quietHoursEnd: number; // 0-23 hour
  quietHoursEnabled: boolean;
  emailDigestFrequency: 'immediate' | 'daily' | 'weekly';
}

export interface NotificationChannelPreferences {
  [key: string]: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private preferences: NotificationPreferences = {
    payments: true,
    lease: true,
    maintenance: true,
    applications: true,
    messages: true,
    push: true,
    email: true,
    sms: false,
    quietHoursStart: 22, // 10 PM
    quietHoursEnd: 8, // 8 AM
    quietHoursEnabled: false,
    emailDigestFrequency: 'immediate',
  };

  private channelPreferences: NotificationChannelPreferences = {
    payments: { push: true, email: true, sms: false },
    lease: { push: true, email: true, sms: true },
    maintenance: { push: true, email: true, sms: false },
    applications: { push: true, email: true, sms: false },
    messages: { push: true, email: false, sms: false },
  };

  private pushToken: string | null = null;
  private deviceId: string | null = null;
  private phoneNumber: string | null = null;
  private emailAddress: string | null = null;

  private constructor() {
    this.loadPreferences();
    this.initializeDeviceInfo();
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
        this.preferences = { ...this.preferences, ...JSON.parse(storedPrefs) };
      }

      const storedChannelPrefs = await AsyncStorage.getItem('notification_channel_preferences');
      if (storedChannelPrefs) {
        this.channelPreferences = { ...this.channelPreferences, ...JSON.parse(storedChannelPrefs) };
      }

      this.phoneNumber = await AsyncStorage.getItem('user_phone_number');
      this.emailAddress = await AsyncStorage.getItem('user_email');
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  private async initializeDeviceInfo() {
    try {
      this.deviceId = await AsyncStorage.getItem('device_id');
      if (!this.deviceId) {
        // Generate a random device ID if not stored
        this.deviceId = `${Device.modelName}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await AsyncStorage.setItem('device_id', this.deviceId);
      }
    } catch (error) {
      console.error('Error initializing device info:', error);
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

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      this.pushToken = tokenData.data;

      // Register token with backend (mock for now)
      console.log('Push token:', this.pushToken);
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    return finalStatus === 'granted';
  }

  public async updatePreference(key: keyof NotificationPreferences, value: any) {
    this.preferences[key] = value;
    try {
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  public async updateChannelPreference(
    category: string,
    channel: 'push' | 'email' | 'sms',
    value: boolean
  ) {
    if (!this.channelPreferences[category]) {
      this.channelPreferences[category] = { push: true, email: true, sms: false };
    }
    
    this.channelPreferences[category][channel] = value;
    
    try {
      await AsyncStorage.setItem(
        'notification_channel_preferences',
        JSON.stringify(this.channelPreferences)
      );
    } catch (error) {
      console.error('Error saving notification channel preferences:', error);
    }
  }

  public async setPhoneNumber(phoneNumber: string | null) {
    this.phoneNumber = phoneNumber;
    if (phoneNumber) {
      await AsyncStorage.setItem('user_phone_number', phoneNumber);
    } else {
      await AsyncStorage.removeItem('user_phone_number');
    }
  }

  public async setEmailAddress(email: string | null) {
    this.emailAddress = email;
    if (email) {
      await AsyncStorage.setItem('user_email', email);
    } else {
      await AsyncStorage.removeItem('user_email');
    }
  }

  private isQuietHours(): boolean {
    if (!this.preferences.quietHoursEnabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    
    const start = this.preferences.quietHoursStart;
    const end = this.preferences.quietHoursEnd;
    
    // Handle cases where quiet hours span across midnight
    if (start > end) {
      return currentHour >= start || currentHour < end;
    } else {
      return currentHour >= start && currentHour < end;
    }
  }

  private getNotificationCategory(type: NotificationType): string {
    const mapping: Record<NotificationType, string> = {
      payment_reminder: 'payments',
      payment_received: 'payments',
      lease_update: 'lease',
      lease_expiry: 'lease',
      maintenance_update: 'maintenance',
      maintenance_scheduled: 'maintenance',
      application: 'applications',
      message: 'messages',
      rent_accepted: 'applications',
      rent_rejected: 'applications',
    };
    
    return mapping[type] || 'general';
  }

  private async shouldSendNotification(
    type: NotificationType,
    channel: 'push' | 'email' | 'sms'
  ): Promise<boolean> {
    const category = this.getNotificationCategory(type);
    
    // Check if category is enabled
    if (!this.preferences[category as keyof NotificationPreferences]) {
      return false;
    }
    
    // Check if channel is enabled for this category
    if (
      this.channelPreferences[category] && 
      !this.channelPreferences[category][channel]
    ) {
      return false;
    }
    
    // Check if the channel itself is enabled
    if (!this.preferences[channel]) {
      return false;
    }
    
    // For push notifications, check quiet hours
    if (channel === 'push' && this.isQuietHours()) {
      return false;
    }
    
    // For SMS, check if phone number is available
    if (channel === 'sms' && !this.phoneNumber) {
      return false;
    }
    
    // For email, check if email is available
    if (channel === 'email' && !this.emailAddress) {
      return false;
    }
    
    return true;
  }

  public async sendNotification(
    type: NotificationType,
    title: string,
    body: string,
    data: any = {}
  ) {
    try {
      // Try to send push notification
      if (await this.shouldSendNotification(type, 'push')) {
        await this.sendPushNotification(title, body, { ...data, type });
      }
      
      // Try to send email notification
      if (await this.shouldSendNotification(type, 'email')) {
        if (this.preferences.emailDigestFrequency === 'immediate') {
          await this.sendEmailNotification(title, body, { ...data, type });
        } else {
          // Queue for digest
          await this.queueForEmailDigest(type, title, body, data);
        }
      }
      
      // Try to send SMS notification
      if (await this.shouldSendNotification(type, 'sms')) {
        await this.sendSmsNotification(body, { ...data, type });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private async sendPushNotification(title: string, body: string, data: any = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Immediate delivery
    });
  }

  private async sendEmailNotification(title: string, body: string, data: any = {}) {
    if (!this.emailAddress) return;

    // Mock API call to send email
    console.log(`Sending email to ${this.emailAddress}:`, { title, body, data });

    // In a real implementation, would call an API endpoint that handles email sending
  }

  private async sendSmsNotification(body: string, data: any = {}) {
    if (!this.phoneNumber) return;

    // Mock API call to send SMS
    console.log(`Sending SMS to ${this.phoneNumber}:`, { body, data });

    // In a real implementation, would call an API endpoint that handles SMS sending
  }

  private async queueForEmailDigest(
    type: NotificationType,
    title: string,
    body: string,
    data: any = {}
  ) {
    try {
      // Get current email digest queue
      const digestQueueString = await AsyncStorage.getItem('email_digest_queue');
      let digestQueue = digestQueueString ? JSON.parse(digestQueueString) : [];

      // Add new notification to queue
      digestQueue.push({
        type,
        title,
        body,
        data,
        timestamp: new Date().toISOString(),
      });

      // Store updated queue
      await AsyncStorage.setItem('email_digest_queue', JSON.stringify(digestQueue));
    } catch (error) {
      console.error('Error queuing for email digest:', error);
    }
  }

  public async sendEmailDigest() {
    if (!this.emailAddress) return;

    try {
      const digestQueueString = await AsyncStorage.getItem('email_digest_queue');
      if (!digestQueueString) return;

      const digestQueue = JSON.parse(digestQueueString);
      if (digestQueue.length === 0) return;

      // Mock API call to send email digest
      console.log(`Sending email digest to ${this.emailAddress}:`, { 
        notifications: digestQueue 
      });

      // Clear the digest queue after sending
      await AsyncStorage.setItem('email_digest_queue', JSON.stringify([]));
    } catch (error) {
      console.error('Error sending email digest:', error);
    }
  }

  // Schedule-specific methods
  public async schedulePaymentReminder(amount: number, dueDate: Date, type: 'rent' | 'utility') {
    const trigger = new Date(dueDate);
    trigger.setDate(trigger.getDate() - 5); // 5 days before due date

    await this.sendNotification(
      'payment_reminder',
      `${type === 'rent' ? 'Rent' : 'Utility'} Payment Reminder`,
      `Your ${type} payment of ${amount} JOD is due in 5 days`,
      { amount, dueDate, paymentType: type }
    );
  }

  public async sendMaintenanceUpdate(requestId: string, status: string, details: string) {
    await this.sendNotification(
      'maintenance_update',
      'Maintenance Update',
      `Request #${requestId}: ${status}`,
      { requestId, status, details }
    );
  }

  public async sendApplicationUpdate(applicationId: string, status: string, propertyName: string) {
    await this.sendNotification(
      'application',
      'Application Status Update',
      `Your application for ${propertyName} is ${status}`,
      { applicationId, status, propertyName }
    );
  }

  public async sendLeaseReminder(propertyName: string, expiryDate: Date, daysRemaining: number) {
    await this.sendNotification(
      'lease_expiry',
      'Lease Expiry Reminder',
      `Your lease for ${propertyName} expires in ${daysRemaining} days`,
      { propertyName, expiryDate, daysRemaining }
    );
  }

  public async sendMessageNotification(senderId: string, senderName: string, message: string) {
    await this.sendNotification(
      'message',
      `New message from ${senderName}`,
      message,
      { senderId, senderName }
    );
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  public getChannelPreferences(): NotificationChannelPreferences {
    return JSON.parse(JSON.stringify(this.channelPreferences));
  }
}

export const notificationService = NotificationService.getInstance();

export default notificationService;
