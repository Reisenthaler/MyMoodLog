import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent, 
  IonItemDivider,
  IonListHeader,
  IonLabel,
} from '@ionic/angular/standalone';
import { MoodListComponent } from '../components/mood-list/mood-list.component';
import { CrisisPlanListComponent } from '../components/crisis-plan-list/crisis-plan-list.component'; // ✅ import

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
    IonItemDivider,
    IonListHeader,
    IonLabel,
    MoodListComponent,
    CrisisPlanListComponent,
  ],
})
export class HomePage {}