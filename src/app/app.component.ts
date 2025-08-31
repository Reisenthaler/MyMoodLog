import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './services/notification-service'; // 👈 new service

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private storage: Storage,
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {
    this.initStatusBar();

    // Setup translations
    this.translateService.addLangs(['de']);
    this.translateService.setDefaultLang('de');
    this.translateService.use('de');
    // If you want auto-detect:
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
    // Initialize notification handling
    await this.notificationService.init();

    // Also check when app resumes from background
    App.addListener('resume', async () => {
      const pending = await this.storage.get('pending_mood_log');
      if (pending) {
        console.log('App resumed with pending mood log → redirecting...');
        this.router.navigateByUrl('/mood-log');
      }
    });
  }

  private async initStatusBar() {
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
}