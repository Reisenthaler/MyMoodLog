import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import {
  LocalNotifications,
  LocalNotificationSchema,
  LocalNotificationActionPerformed,
} from '@capacitor/local-notifications';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private storage: Storage, private translateService: TranslateService) {
    this.initStatusBar();
    this.initNotificationListeners();

    // Setup translations
    this.translateService.addLangs(['de']);
    this.translateService.setDefaultLang('de');
    this.translateService.use('de');
    // const browserLang = this.translateService.getBrowserLang() ?? 'en';
  //  this.translateService.use(browserLang.match(/en|de/) ? browserLang : 'en');

    this.initApp();
  }

  async initApp() {
    await this.storage.create();
    const onboardingCompleted = await this.storage.get('onboardingCompleted');

    if (onboardingCompleted) {
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      this.router.navigateByUrl('/onboarding', { replaceUrl: true });
    }
  }


  async ngOnInit() {
    await this.storage.create();
    // Check on cold start if a mood log is pending
    await this.checkPendingMoodLog();

    // Also check when app resumes from background
    App.addListener('resume', async () => {
      await this.checkPendingMoodLog();
    });
  }

  async initStatusBar() {
    try {
      // Show the status bar
      await StatusBar.show();

      // Set style (light or dark depending on your toolbar color)
      await StatusBar.setStyle({ style: Style.Light }); // or Style.Dark

      // Prevent overlap by disabling overlay
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (err) {
      console.warn('StatusBar plugin not available in browser', err);
    }
  }

  initNotificationListeners() {
    // Fired when a notification is delivered (but not tapped yet)
    LocalNotifications.addListener(
      'localNotificationReceived',
      async (notification: LocalNotificationSchema) => {
        console.log('Notification received:', notification);
        await this.storage.set('pending_mood_log', true);
        await this.storage.set(
          'pending_notification',
          notification.extra?.notificationId || notification.id
        );
      }
    );

    // Fired when user taps a notification (foreground or background)
    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (action: LocalNotificationActionPerformed) => {
        const notifId =
          action.notification.extra?.notificationId ||
          action.notification.id;

        await this.storage.create();
        const completed =
          (await this.storage.get('completed_notifications')) || [];

        if (completed.includes(notifId)) {
          console.log('Notification already completed:', notifId);
          this.router.navigateByUrl('/home');
          return;
        }

        // Mark as pending and redirect
        await this.storage.set('pending_notification', notifId);
        await this.storage.set('pending_mood_log', true);
        this.router.navigateByUrl('/mood-log');
      }
    );

    // Fired when app is opened from a notification (cold start via deep link)
    App.addListener('appUrlOpen', async (event) => {
      if (event.url.includes('notification')) {
        console.log('App opened from notification URL:', event.url);
        await this.storage.set('pending_mood_log', true);
        this.router.navigateByUrl('/mood-log');
      }
    });
  }

  private async checkPendingMoodLog() {
    const pending = await this.storage.get('pending_mood_log');
    if (pending) {
      console.log('Pending mood log found, redirecting...');
      this.router.navigateByUrl('/mood-log');
    }
  }
}