import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonContent,
  IonToolbar,
  IonFooter,
  ToastController,
  IonHeader,
  IonTitle,
  IonDatetimeButton,
  IonModal
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import {
  LocalNotifications,
  LocalNotificationSchema,
} from '@capacitor/local-notifications';
import { ButtonComponent } from '../button/button.component';
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { Device } from '@capacitor/device';
import { AppHeaderComponent } from '../app-header/app-header.component';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    ButtonComponent,
    IonContent,
    IonFooter,
    IonToolbar,
    TranslateModule,
    IonHeader,
    IonTitle,
    IonDatetimeButton,
    IonModal,
    AppHeaderComponent
],
})
export class NotificationSettingsComponent implements OnInit {
  private STORAGE_KEY = 'notification_settings';

  notificationsPerDay: number = 1;
  times: string[] = ['09:00']; // default one time

  constructor(private storage: Storage, private toastCtrl: ToastController, private translateService: TranslateService) {
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
    try {
      let perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        perm = await LocalNotifications.requestPermissions();
        if (perm.display !== 'granted') {
          this.showToast(
            this.translateService.instant('NOTIFICATION_SETTINGS.PERMISSION_DENIED'),
            'danger');
          return;
        }
      }

      // Cancel all existing notifications
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        });
      }

      // Build daily notifications
      const notifications: LocalNotificationSchema[] = this.times.map(
        (time, index) => {
          const [hour, minute] = time.split(':').map((t) => parseInt(t, 10));

          return {
            id: index + 1,
            title: this.translateService.instant('NOTIFICATION_SETTINGS.NOTIFICATION_TITLE'),
            body: this.translateService.instant('NOTIFICATION_SETTINGS.NOTIFICATION_BODY'),
            schedule: {
              repeats: true,
              on: { hour, minute, second: 0 },
            },
            extra: { notificationId: `daily_${index + 1}` },
          };
        }
      );

      await LocalNotifications.schedule({ notifications });

      // Show OEM-specific autostart instructions
      const instructionsShown = await this.checkAutostartRequirement();

      // Only show success toast if no instructions were shown
      if (!instructionsShown) {
        this.showToast(
          this.translateService.instant('NOTIFICATION_SETTINGS.TOAST_SAVE_SUCCESS'),
          'success'
        );
      }
    } catch (err) {
      console.error('Error scheduling notification:', err);
      this.showToast(
        this.translateService.instant('NOTIFICATION_SETTINGS.TOAST_SAVE_ERROR'),
        'danger'
      );
    }
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

  // check OEM and show instructions
  async checkAutostartRequirement(): Promise<boolean> {
    const info = await Device.getInfo();
    const manufacturer = (info.manufacturer || '').toLowerCase();

    if (manufacturer.includes('xiaomi')) {
      this.showToast(
        this.translateService.instant('NOTIFICATION_SETTINGS.AUTOSTART.XIAOMI'),
        'warning'
      );
      return true;
    } else if (manufacturer.includes('huawei')) {
      this.showToast(
        this.translateService.instant('NOTIFICATION_SETTINGS.AUTOSTART.HUAWEI'),
        'warning'
      );
      return true;
    } else if (manufacturer.includes('oppo') || manufacturer.includes('vivo')) {
      this.showToast(
        this.translateService.instant('NOTIFICATION_SETTINGS.AUTOSTART.OPPO_VIVO'),
        'warning'
      );
      return true;
    }

    return false; // no instructions needed
  }

  async showToast(toastMessage: string, color: 'primary' | 'success' | 'warning' | 'danger' | 'dark' = 'dark') {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 5000, // auto dismiss after 5s
      position: 'bottom', // 'top' | 'middle' | 'bottom'
      color: color,
    });
    await toast.present();
  }
}