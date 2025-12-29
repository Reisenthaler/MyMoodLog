import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { IonContent, IonToolbar, IonFooter,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonNote,
  IonItem,
  IonLabel,
  IonList,
 } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';
import { AppVersionService } from 'src/app/services/app-version.service';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  imports: [
    IonContent,
    IonToolbar,
    IonFooter,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    IonNote,
    IonItem,
    IonLabel,
    IonList,
    TranslateModule,
    ButtonComponent,
    AppHeaderComponent,
    RouterLink,
  ]
})
export class OnboardingPage {

  appInfo?: {
    version: string;
    build: string;
    buildDate: string;
    commit: string;
  };

  constructor(private router: Router, private storage: Storage, private appVersionService: AppVersionService) {}

  async ngOnInit() {
    await this.storage.create();
  }

  async ionViewWillEnter() {
    this.appInfo = await this.appVersionService.getVersionInfo();
  }

  async finishOnboarding() {
    await this.storage.set('onboardingCompleted', true);
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  async openFaq() {
    await Browser.open({
      url: 'https://www.wander-yogi.at/faq-mymoodlog/'
    });
  }
}