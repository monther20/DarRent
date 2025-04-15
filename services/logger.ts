import { Platform } from 'react-native/types';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp?: Date;
}

class Logger {
  private static instance: Logger;
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled = process.env.ENABLE_LOGGING === 'true';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(options: LogOptions): string {
    const timestamp = options.timestamp || new Date();
    const formattedTime = timestamp.toISOString();
    const platform = Platform.OS;
    const data = options.data ? JSON.stringify(options.data) : '';

    return `[${formattedTime}] [${options.level.toUpperCase()}] [${platform}] ${options.message} ${data}`;
  }

  private log(options: LogOptions): void {
    if (!this.isEnabled) return;

    const message = this.formatMessage(options);

    switch (options.level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
        console.error(message);
        break;
    }
  }

  public debug(message: string, data?: unknown): void {
    this.log({ level: 'debug', message, data });
  }

  public info(message: string, data?: unknown): void {
    this.log({ level: 'info', message, data });
  }

  public warn(message: string, data?: unknown): void {
    this.log({ level: 'warn', message, data });
  }

  public error(message: string, data?: unknown): void {
    this.log({ level: 'error', message, data });
  }
}

export const logger = Logger.getInstance(); 