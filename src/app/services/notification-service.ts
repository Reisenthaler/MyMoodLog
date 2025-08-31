import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import {
  LocalNotifications,
  LocalNotificationSchema,
  LocalNotificationActionPerformed,
} from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private storageReady = false;

  constructor(private storage: Storage, private router: Router) {}

  async init() {
    await this.storage.create();
    this.storageReady = true;

    this.initListeners();

    // Check if something was pending from a cold start
    const pending = await this.storage.get('pending_mood_log');
    if (pending) {
      this.router.navigateByUrl('/mood-log');
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
        await this.storage.set('pending_mood_log', true);
        this.router.navigateByUrl('/mood-log');
      }
    });
  }

  private async markPending(notification: LocalNotificationSchema) {
    if (!this.storageReady) {
      // fallback: wait until storage is ready
      await this.storage.create();
      this.storageReady = true;
    }

    await this.storage.set('pending_mood_log', true);
    await this.storage.set(
      'pending_notification',
      notification.extra?.notificationId || notification.id
    );
  }
}