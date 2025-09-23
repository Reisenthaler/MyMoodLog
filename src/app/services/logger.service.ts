// src/app/services/logger.service.ts
import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
   FILE_PATH: string = 'MyMoodLog.log';
  private async appendToFile(message: string) {
    try {
      await Filesystem.appendFile({
        path: this.FILE_PATH,
        data: message + '\n',
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
    } catch (err: any) {
      if (err.message?.includes('File does not exist')) {
        // First time → create file
        await Filesystem.writeFile({
          path: this.FILE_PATH,
          data: message + '\n',
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
      } else {
        console.error('[Logger] Failed to write log:', err);
      }
    }
  }

  private formatMessage(tag: string, level: string, message: any, optional: any[]) {
    const ts = new Date().toISOString();
    return `${ts} [MYML-${tag}] ${level.toUpperCase()} ${message} ${optional.map(o => JSON.stringify(o)).join(' ')}`;
  }

  createLogger(tag: string) {
    return {
      log: async (message: any, ...optional: any[]) => {
        console.log(`[MYML-${tag}]`, message, ...optional);
        await this.appendToFile(this.formatMessage(tag, 'log', message, optional));
      },
      info: async (message: any, ...optional: any[]) => {
        console.info(`[MYML-${tag}]`, message, ...optional);
        await this.appendToFile(this.formatMessage(tag, 'info', message, optional));
      },
      warn: async (message: any, ...optional: any[]) => {
        console.warn(`[MYML-${tag}]`, message, ...optional);
        await this.appendToFile(this.formatMessage(tag, 'warn', message, optional));
      },
      error: async (message: any, ...optional: any[]) => {
        console.error(`[MYML-${tag}]`, message, ...optional);
        await this.appendToFile(this.formatMessage(tag, 'error', message, optional));
      },
    };
  }
}