import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { MoodItem } from 'src/app/models/mood-item.model';
import { MoodLogEntry } from 'src/app/models/mood-log-entry.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MoodLogGraphComponent } from 'src/app/components/mood-log-graph/mood-log-graph.component';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-mood-log-history',
  templateUrl: './mood-log-history.page.html',
  styleUrls: ['./mood-log-history.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonButton,
    IonIcon,
    TranslateModule,
    MoodLogGraphComponent,
  ],
})
export class MoodLogHistoryPage implements OnInit {
  history: MoodLogEntry[] = [];
  filteredHistory: MoodLogEntry[] = [];
  moodItems: MoodItem[] = [];

  selectedRange: '7' | '30' | 'all' = '7'; // default

  constructor(
    private storage: Storage,
    private alertController: AlertController,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    await this.storage.create();

    // Load mood logs
    this.history = (await this.storage.get('mood_log_history')) || [];

    // Sort newest first
    this.history.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Load mood items (names)
    this.moodItems = (await this.storage.get('mood_items')) || [];

    // Apply initial filter
    this.filterHistory();
  }

  filterHistory() {
    if (this.selectedRange === 'all') {
      this.filteredHistory = this.history;
      return;
    }

    const days = parseInt(this.selectedRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    this.filteredHistory = this.history.filter(
      (entry) => new Date(entry.date).getTime() >= cutoff.getTime()
    );
  }

  getMoodName(key: string | number | unknown): string {
    const strKey = String(key);

    const mood = this.moodItems.find((m) => m.id.toString() === strKey);
    
    return mood ? mood.name : strKey;
  }
  async confirmDelete(log: MoodLogEntry) {
    const alert = await this.alertController.create({
      header: this.translate.instant('MOOD_LOG_HISTORY.CONFIRM_DELETE.HEADER'),
      message: this.translate.instant('MOOD_LOG_HISTORY.CONFIRM_DELETE.MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('MOOD_LOG_HISTORY.CONFIRM_DELETE.CANCEL'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('MOOD_LOG_HISTORY.CONFIRM_DELETE.DELETE'),
          role: 'destructive',
          handler: () => {
            this.deleteLog(log);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteLog(log: MoodLogEntry) {
    // Remove from history
    this.history = this.history.filter(entry => entry !== log);
    // Save updated history
    await this.storage.set('mood_log_history', this.history);
    // Re-apply filter
    this.filterHistory();
  }
}