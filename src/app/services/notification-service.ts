import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import {
  LocalNotifications,
  LocalNotificationSchema,
  LocalNotificationActionPerformed,
} from '@capacitor/local-notifications';
import { App } from '@capacitor/app';
import { NotificationTracking } from '../models/notification-tracking.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private storageReady = false;
  private NOTIFICATION_SETTINGS_KEY = 'notification_settings';

  constructor(private storage: Storage, private router: Router) {}

  async init() {
    await this.storage.create();
    this.storageReady = true;

    await this.checkMissedNotifications(); // <-- Add this line

    this.initListeners();

    // Check for any pending mood-log
    const pending = await this.getPendingNotification();
    if (pending) {
      this.router.navigateByUrl('/mood-log');
    }
  }

  /**
   * Checks for missed notifications since the last app run and creates pending entries if needed.
   */
  private async checkMissedNotifications() {
    const settings = await this.storage.get(this.NOTIFICATION_SETTINGS_KEY);
    if (!settings || !Array.isArray(settings.times)) {
      return; // No notification times set
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check for missed notifications for today and the previous 2 days
    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - dayOffset);

      for (const time of settings.times) {
        const [hour, minute] = time.split(':').map((t: string) => parseInt(t, 10));
        const scheduled = new Date(checkDate);
        scheduled.setHours(hour, minute, 0, 0);

        // Only create pending if scheduled time is in the past
        if (scheduled.getTime() < now.getTime()) {
          const id = `${scheduled.getFullYear()}${(scheduled.getMonth()+1).toString().padStart(2,'0')}${scheduled.getDate().toString().padStart(2,'0')}_${hour.toString().padStart(2,'0')}${minute.toString().padStart(2,'0')}`;
          const tracking: NotificationTracking = await this.storage.get(`notification_${id}`);
          if (!tracking) {
            // Missed notification, create pending entry
            await this.storage.set(`notification_${id}`, {
              id,
              status: 'pending',
              timestamp: scheduled.getTime(),
            } as NotificationTracking);
          }
        }
      }
    }

    // Delete notification entries older than 3 days
    const threshold = today.getTime() - 3 * 24 * 60 * 60 * 1000;
    const keys = await this.storage.keys();
    for (const key of keys) {
      if (key.startsWith('notification_')) {
        const tracking: NotificationTracking = await this.storage.get(key);
        if (tracking && tracking.timestamp < threshold) {
          await this.storage.remove(key);
        }
      }
    }
  }

  private initListeners() {
    LocalNotifications.addListener(
      'localNotificationReceived',
      async (notification: LocalNotificationSchema) => {
        await this.markPending(notification);
      }
    );

    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (action: LocalNotificationActionPerformed) => {
        await this.markPending(action.notification);
        this.router.navigateByUrl('/mood-log');
      }
    );

    App.addListener('appUrlOpen', async (event) => {
      if (event.url.includes('notification')) {
        // Provide required fields for LocalNotificationSchema, use a numeric id
        await this.markPending({
          id: -1,
          title: 'Mood Log Reminder',
          body: 'Please fill out your mood log.',
          extra: {},
          schedule: undefined,
        });
        this.router.navigateByUrl('/mood-log');
      }
    });
  }

  private async markPending(notification: LocalNotificationSchema) {
    if (!this.storageReady) {
      await this.storage.create();
      this.storageReady = true;
    }
    const id = notification.extra?.notificationId || notification.id?.toString() || Date.now().toString();
    const tracking: NotificationTracking = {
      id,
      status: 'pending',
      timestamp: Date.now(),
    };
    await this.storage.set(`notification_${id}`, tracking);
  }

  async markCompleted() {
    const keys = await this.storage.keys();
    const now = Date.now();
    for (const key of keys) {
      if (key.startsWith('notification_')) {
        const tracking: NotificationTracking = await this.storage.get(key);
        if (tracking && tracking.status === 'pending') {
          tracking.status = 'completed';
          tracking.completedAt = now;
          await this.storage.set(key, tracking);
        }
      }
    }
  }

  async getPendingNotification(): Promise<NotificationTracking | null> {
    const keys = await this.storage.keys();
    for (const key of keys) {
      if (key.startsWith('notification_')) {
        const tracking: NotificationTracking = await this.storage.get(key);
        if (tracking.status === 'pending') {
          return tracking;
        }
      }
    }
    return null;
  }
}