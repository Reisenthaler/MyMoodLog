import { Component } from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonButtons,
  IonMenuButton,
  IonFooter
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CrisisPlanInfoComponent } from '../components/crisis-plan-info/crisis-plan-info.component';
import { MoodLogInfoComponent } from '../components/mood-log-info/mood-log-info.component';
import { NotificationInfoComponent } from '../components/notification-info/notification-info.component';
import { MoodLogHistoryInfoComponent } from '../components/mood-log-history-info/mood-log-history-info.component';
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
    IonList,
    IonItem,
    IonLabel,
    TranslateModule,
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonButtons,
    IonMenuButton,
    IonFooter,
    CrisisPlanInfoComponent,
    MoodLogInfoComponent,
    NotificationInfoComponent,
    MoodLogHistoryInfoComponent
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