import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet, ToastController } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './services/notification-service';
import { LoggerService } from './services/logger.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet!: IonRouterOutlet;

  private logger = this.loggerService.createLogger('AppComponent');
  private lastBackPress = 0;
  private exitDelay = 2000; // 2 seconds
  private toast: HTMLIonToastElement | null = null;

  constructor(
    private router: Router,
    private storage: Storage,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private loggerService: LoggerService,
    private toastController: ToastController
  ) {
    this.initStatusBar();

    this.logger.info('Constructor called, initializing app...');
    this.translateService.addLangs(['de']);
    this.translateService.setDefaultLang('de');
    this.translateService.use('de');

    this.initApp();
  }

  async initApp() {
    this.logger.info('initApp() called...');
    await this.storage.create();
    const onboardingCompleted = await this.storage.get('onboardingCompleted');
    this.logger.info('Onboarding completed?', onboardingCompleted);

    if (onboardingCompleted) {
      this.logger.info('Redirecting to /home');
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      this.logger.info('Redirecting to /onboarding');
      this.router.navigateByUrl('/onboarding', { replaceUrl: true });
    }
  }

  async ngOnInit() {
    this.logger.info('ngOnInit() called, initializing notification service...');
    await this.notificationService.init();

    App.addListener('resume', async () => {
      this.logger.info('App resumed event fired');

      const pending = await this.notificationService.getPendingNotification();
      this.logger.info('Pending mood log value:', pending);

      if (pending) {
        this.logger.info('Redirecting to /mood-log');
        this.router.navigateByUrl('/mood-log');
      } else {
        this.logger.info('No pending mood log found → staying on current screen');
      }
    });

    // Handle hardware back button with double press to exit
    App.addListener('backButton', async () => {
      if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.logger.info('Back button pressed → navigating back');
        this.routerOutlet.pop();
      } else {
        const currentTime = Date.now();

        if (currentTime - this.lastBackPress < this.exitDelay) {
          this.logger.info('Double back press detected → exiting app');
          if (this.toast) {
            await this.toast.dismiss();
            this.toast = null;
          }
          App.exitApp();
        } else {
          this.logger.info('First back press → showing exit hint');
          this.lastBackPress = currentTime;
          await this.showExitToast();
        }
      }
    });
  }

  private async showExitToast() {
    if (this.toast) {
      await this.toast.dismiss();
    }
    this.toast = document.createElement('ion-toast');
	  this.toast.message = this.translateService.instant('COMMON.PRESS_BACK_AGAIN_TO_EXIT');
    this.toast.duration = this.exitDelay;
    this.toast.position = 'bottom';
    document.body.appendChild(this.toast);
    await this.toast.present();
  }

  private async initStatusBar() {
    try {
      await StatusBar.show();
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setOverlaysWebView({ overlay: false });
      this.logger.info('StatusBar initialized');
    } catch (err) {
      this.logger.warn('StatusBar plugin not available', err);
    }
  }
}