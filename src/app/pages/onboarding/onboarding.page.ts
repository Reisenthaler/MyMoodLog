import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { IonContent, IonToolbar, IonFooter,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText
 } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';

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
    TranslateModule,
    ButtonComponent,
    AppHeaderComponent,
  ]
})
export class OnboardingPage {
  constructor(private router: Router, private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
  }

  async finishOnboarding() {
    await this.storage.set('onboardingCompleted', true);
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}