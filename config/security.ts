import * as SecureStore from 'expo-secure-store';

class SecurityConfig {
  private static instance: SecurityConfig;
  private encryptionKey: string;

  private constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
  }

  public static getInstance(): SecurityConfig {
    if (!SecurityConfig.instance) {
      SecurityConfig.instance = new SecurityConfig();
    }
    return SecurityConfig.instance;
  }

  public async storeSecureData(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error storing secure data:', error);
      throw error;
    }
  }

  public async getSecureData(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  public async removeSecureData(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing secure data:', error);
      throw error;
    }
  }

  public getEncryptionKey(): string {
    return this.encryptionKey;
  }
}

export const securityConfig = SecurityConfig.getInstance(); 