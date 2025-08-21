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
  IonContent,
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import {
  LocalNotifications,
  LocalNotificationSchema,
} from '@capacitor/local-notifications';
import { ButtonComponent } from '../button/button.component'; // 👈 import custom button
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons';

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
    ButtonComponent, 
    IonContent,
  ],
})
export class NotificationSettingsComponent implements OnInit {
  private STORAGE_KEY = 'notification_settings';

  notificationsPerDay: number = 1;
  times: string[] = ['09:00']; // default one time

  constructor(private storage: Storage) {
    addIcons({ save }); // 👈 register save icon
  }

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
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const notifications: LocalNotificationSchema[] = this.times.map(
      (time, index) => {
        const [hour, minute] = time.split(':').map((t) => parseInt(t, 10));
        const at = new Date();
        at.setHours(hour, minute, 0, 0);

        return {
          id: parseInt(today.replace(/-/g, '') + (index + 1)),
          title: 'Mood Log Reminder',
          body: 'Please fill out your mood log.',
          schedule: {
            repeats: true,
            every: 'day',
            at,
          },
          extra: { notificationId: today + '_' + (index + 1) },
        };
      }
    );

    await LocalNotifications.schedule({ notifications });
    console.log('Scheduled notifications:', notifications);
  }

  updateTimes() {
    if (this.times.length > this.notificationsPerDay) {
      this.times = this.times.slice(0, this.notificationsPerDay);
    } else {
      while (this.times.length < this.notificationsPerDay) {
        this.times.push('09:00');
      }
    }
  }
}