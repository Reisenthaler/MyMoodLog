import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CrisisPlanInfoComponent } from '../components/crisis-plan-info/crisis-plan-info.component';
import { MoodLogInfoComponent } from '../components/mood-log-info/mood-log-info.component';
import { NotificationInfoComponent } from '../components/notification-info/notification-info.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
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
    CommonModule,
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
    CrisisPlanInfoComponent,
    MoodLogInfoComponent,
    NotificationInfoComponent,
    ButtonComponent,
  ],
})
export class HomePage {
  showCrisisPlanInfo = false;
  showMoodLogInfo = false;
  showNotificationInfo = false;

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

  closeInfo() {
    this.showCrisisPlanInfo = false;
    this.showMoodLogInfo = false;
    this.showNotificationInfo = false;
  }
}