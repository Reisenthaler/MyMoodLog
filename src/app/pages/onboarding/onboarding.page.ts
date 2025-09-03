import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { IonContent } from '@ionic/angular/standalone';
import { MoodLogInfoComponent } from 'src/app/components/mood-log-info/mood-log-info.component';
import { CrisisPlanInfoComponent } from 'src/app/components/crisis-plan-info/crisis-plan-info.component';
import { NotificationInfoComponent } from 'src/app/components/notification-info/notification-info.component';
import { MoodLogHistoryInfoComponent } from 'src/app/components/mood-log-history-info/mood-log-history-info.component';
import { TranslateModule } from '@ngx-translate/core'; 
import { ButtonComponent } from 'src/app/components/button/button.component';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  imports: [
    IonContent,
    MoodLogInfoComponent,
    CrisisPlanInfoComponent,
    NotificationInfoComponent,
    MoodLogHistoryInfoComponent,
    TranslateModule,
    ButtonComponent
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