import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonFooter,
  IonToolbar,
  IonContent,
  IonTextarea,
  IonDatetime,
  ToastController,
  IonDatetimeButton,
  IonModal,
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { MoodItem } from '../../models/mood-item.model';
import { CrisisPlan } from '../../models/crisis-plan.model';
import { Router } from '@angular/router';
import { MoodLogEntry } from 'src/app/models/mood-log-entry.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { LoggerService } from 'src/app/services/logger.service';
import { NotificationService } from 'src/app/services/notification-service';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';

@Component({
  selector: 'app-mood-log',
  templateUrl: './mood-log.page.html',
  styleUrls: ['./mood-log.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonFooter,
    IonToolbar,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    TranslateModule,
    ButtonComponent,
    IonTextarea,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    AppHeaderComponent
],
})
export class MoodLogPage implements OnInit {
  moodItems: MoodItem[] = [];
  crisisPlans: CrisisPlan[] = [];
  selections: { [id: number]: number } = {};
  comment: string = '';

  logDateTime: string = this.getLocalISOString();
  maxDateIso: string = this.getLocalISOString();

  private logger = new LoggerService().createLogger('MoodLogPage');

  constructor(
    private storage: Storage,
    private router: Router,
    private toastCtrl: ToastController,
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const items = (await this.storage.get('mood_items')) as MoodItem[];
    this.moodItems = items.filter((i) => i.active);
    this.crisisPlans = (await this.storage.get('crisis_plans')) || [];
  }

  async save() {
    try {
      // Validation: check if at least one mood is selected
      const hasSelections = Object.values(this.selections).some(
        (value) => value !== null && value !== undefined
      );

      if (!hasSelections) {
        const toast = await this.toastCtrl.create({
          message: this.translateService.instant('MOOD_LOG.NO_SELECTION_ERROR') ||
            'Please select at least one mood before saving.',
          duration: 2500,
          color: 'danger',
        });
        await toast.present();
        return; // Stop the save process
      }

      const triggeredPlans: CrisisPlan[] = [];
      const addedPlanIds = new Set<number>();

      for (const item of this.moodItems) {
        const intensity = this.selections[item.id];

        if (intensity != null && item.scalePlans) {
          const planId = item.scalePlans[intensity] ?? null;

          if (planId && !addedPlanIds.has(planId)) {
            const plan = this.crisisPlans.find((p) => p.id === planId);
            if (plan) {
              triggeredPlans.push(plan);
              addedPlanIds.add(planId); // to prevent duplicates
            }
          }
        }
      }

      // Get pending notification ID
      const pendingNotifId = await this.storage.get('pending_notification');

      // Build log entry
      const logEntry: MoodLogEntry = {
        id: Date.now(), // unique ID
        date: this.logDateTime,
        notificationId: pendingNotifId,
        selections: this.selections,
        comment: this.comment || undefined,
      };

      // Save to history
      const history = (await this.storage.get('mood_log_history')) || [];
      history.push(logEntry);
      await this.storage.set('mood_log_history', history);

      // Mark all pending notifications as completed
      await this.notificationService.markCompleted();

      // Also save last log (optional, for quick access)
      await this.storage.set('last_mood_log', logEntry);

      // Clear pending flag
      await this.storage.set('pending_mood_log', false);

      // Reset comment after save
      this.comment = '';

      // Log success
      await this.logger.info('Mood log entry saved successfully', logEntry);

      // Show success toast with translation
      const toast = await this.toastCtrl.create({
        message: this.translateService.instant('MOOD_LOG.SAVE_SUCCESS'),
        duration: 2000,
        color: 'success',
      });
      toast.present();

      // Navigate
      if (triggeredPlans.length > 0) {
        this.router.navigateByUrl('/crisis-plan-result', { state: { plans: triggeredPlans } });
      } else {
        this.router.navigateByUrl('/home');
      }
    } catch (error) {
      // Log error
      await this.logger.error('Fehler beim Speichern des Stimmungseintrags', error);

      // Show error toast with translation
      const toast = await this.toastCtrl.create({
        message: this.translateService.instant('MOOD_LOG.SAVE_ERROR'),
        duration: 2500,
        color: 'danger',
      });
      toast.present();
    }
  }

  getLocalISOString(date: Date = new Date()): string {
    const tzOffset = date.getTimezoneOffset() * 60000; // ms offset from UTC
    const localISOTime = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, -1); // remove 'Z' at the end to indicate local time
    return localISOTime;
  }
}