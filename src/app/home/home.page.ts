import { Component } from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonFooter
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';
addIcons({
  informationCircleOutline,
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    TranslateModule,
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonFooter,
],
})
export class HomePage {
  showCrisisPlanInfo = false;
  showMoodLogInfo = false;
  showNotificationInfo = false;
  showMoodLogHistoryInfo = false;

  constructor(private router: Router) {}

  goTo(path: string) {
    this.router.navigateByUrl('/' + path);
  }

  openCrisisPlanInfo(event: Event) {
    event.stopPropagation();
    this.showCrisisPlanInfo = true;
  }

  openMoodLogInfo(event: Event) {
    event.stopPropagation();
    this.showMoodLogInfo = true;
  }

  openNotificationInfo(event: Event) {
    event.stopPropagation();
    this.showNotificationInfo = true;
  }

  openMoodLogHistoryInfo(event: Event) {
    event.stopPropagation();
    this.showMoodLogHistoryInfo = true;
  }

  closeInfo() {
    this.showCrisisPlanInfo = false;
    this.showMoodLogInfo = false;
    this.showNotificationInfo = false;
    this.showMoodLogHistoryInfo = false;
  }
}