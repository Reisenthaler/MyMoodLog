import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import {
  LocalNotifications,
  LocalNotificationSchema,
} from '@capacitor/local-notifications';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonButton,
  ],
})
export class NotificationSettingsComponent implements OnInit {
  private STORAGE_KEY = 'notification_settings';

  notificationsPerDay: number = 1;
  times: string[] = ['09:00']; // default one time

  constructor(private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
    await this.loadSettings();
  }

  async loadSettings() {
    const saved = await this.storage.get(this.STORAGE_KEY);
    if (saved) {
      this.notificationsPerDay = saved.notificationsPerDay;
      this.times = saved.times;
    }
  }

  async saveSettings() {
    await this.storage.set(this.STORAGE_KEY, {
      notificationsPerDay: this.notificationsPerDay,
      times: this.times,
    });

    await this.scheduleNotifications();
  }

  async scheduleNotifications() {
    // Request permission
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // 1. Get all pending notifications
    const pending = await LocalNotifications.getPending();

    // 2. Cancel them if any exist
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }

    // 3. Schedule new ones
    const notifications: LocalNotificationSchema[] = this.times.map(
      (time, index) => {
        const [hour, minute] = time.split(':').map((t) => parseInt(t, 10));
        const at = new Date();
        at.setHours(hour, minute, 0, 0);

        return {
          id: index + 1,
          title: 'Mood Log Reminder',
          body: 'Please fill out your mood log.',
          schedule: {
            repeats: true,
            every: 'day',
            at,
          },
        };
      }
    );

    await LocalNotifications.schedule({ notifications });
    console.log('Scheduled notifications:', notifications);
  }

  updateTimes() {
    // Adjust times array length when user changes notificationsPerDay
    if (this.times.length > this.notificationsPerDay) {
      this.times = this.times.slice(0, this.notificationsPerDay);
    } else {
      while (this.times.length < this.notificationsPerDay) {
        this.times.push('09:00');
      }
    }
  }
}