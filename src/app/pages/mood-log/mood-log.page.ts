import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { MoodItem } from '../../models/mood-item.model';
import { CrisisPlan } from '../../models/crisis-plan.model';
import { Router } from '@angular/router';
import { MoodLogEntry } from 'src/app/models/mood-log-entry.model';
import { TranslateModule } from '@ngx-translate/core'; 
import { ButtonComponent } from 'src/app/components/button/button.component';

@Component({
  selector: 'app-mood-log',
  templateUrl: './mood-log.page.html',
  styleUrls: ['./mood-log.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    TranslateModule,
    ButtonComponent
  ],
})
export class MoodLogPage implements OnInit {
  moodItems: MoodItem[] = [];
  crisisPlans: CrisisPlan[] = [];
  selections: { [id: number]: number } = {};

  constructor(private storage: Storage, private router: Router) {}

  async ngOnInit() {
    await this.storage.create();
    const items = (await this.storage.get('mood_items')) as MoodItem[];
    this.moodItems = items.filter((i) => i.active);
    this.crisisPlans = (await this.storage.get('crisis_plans')) || [];
  }

  async save() {
    const triggeredPlans: CrisisPlan[] = [];

    for (const item of this.moodItems) {
      let intensity = this.selections[item.id];

      if (intensity && item.scalePlans) {
        let planId: number | null = null;

        // Try current intensity, then lower levels until we find a plan
        for (let level = intensity; level >= 0; level--) {
          if (item.scalePlans[level]) {
            planId = item.scalePlans[level];
            break; // stop at the first lower level with a plan
          }
        }

        if (planId) {
          const plan = this.crisisPlans.find((p) => p.id === planId);
          if (plan) {
            triggeredPlans.push(plan);
          }
        }
      }
    }

    // Get pending notification ID
    const pendingNotifId = await this.storage.get('pending_notification');

    // Build log entry
    const logEntry: MoodLogEntry = {
      id: Date.now(), // unique ID
      date: new Date().toISOString(),
      notificationId: pendingNotifId,
      selections: this.selections,
    };

    // Save to history
    const history = (await this.storage.get('mood_log_history')) || [];
    history.push(logEntry);
    await this.storage.set('mood_log_history', history);

    // Mark notification as completed
    const completed = (await this.storage.get('completed_notifications')) || [];
    if (pendingNotifId) {
      completed.push(pendingNotifId);
      await this.storage.set('completed_notifications', completed);
      await this.storage.set('pending_notification', null);
    }

    // Also save last log (optional, for quick access)
    await this.storage.set('last_mood_log', logEntry);

    // Clear pending flag
    await this.storage.set('pending_mood_log', false);

    // Navigate
    if (triggeredPlans.length > 0) {
      this.router.navigateByUrl('/crisis-plan-result', { state: { plans: triggeredPlans } });
    } else {
      this.router.navigateByUrl('/home');
    }
  } 
}