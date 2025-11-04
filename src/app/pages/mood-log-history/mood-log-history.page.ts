import { Component, OnInit,  } from '@angular/core';
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
  IonButtons,
  IonIcon,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { MoodItem } from 'src/app/models/mood-item.model';
import { MoodLogEntry } from 'src/app/models/mood-log-entry.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MoodLogGraphComponent } from 'src/app/components/mood-log-graph/mood-log-graph.component';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

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
    IonButtons,
    IonIcon,
    IonDatetimeButton,
    IonModal,
    TranslateModule,
    MoodLogGraphComponent,
    IonDatetime,
    IonDatetimeButton
  ],
})
export class MoodLogHistoryPage implements OnInit {
  history: MoodLogEntry[] = [];
  filteredHistory: MoodLogEntry[] = [];
  moodItems: MoodItem[] = [];

  selectedRange: '7' | '30' | 'all' = '7'; // default

  // New properties
  currentStart: string = '';
  currentEnd: string = '';
  customStart!: string;
  customEnd!: string;
  isCustomRangeModalOpen = false;

  constructor(
    private storage: Storage,
    private alertController: AlertController,
    private translate: TranslateService,
    private router: Router,       
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

    // Set default period: last 7 days
    this.setCurrentRangeToNow();
    // Apply initial filter
    this.filterHistory();
  }

  openCustomRangeModal() {
    this.customStart = this.currentStart;
    this.customEnd = this.currentEnd;
    this.isCustomRangeModalOpen = true;
  }

  private toLocalISO(date: Date): string {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISO = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, -1);
    return localISO;
  }

  applyCustomRange() {
    if (!this.customStart || !this.customEnd) return;

    const start =this.customStart;
    const end = this.customEnd;

    if (start > end) {
      alert('Start date must be before end date');
      return;
    }

    this.currentStart = start;
    this.currentEnd = end;

    this.isCustomRangeModalOpen = false;
    this.filterHistory();
  }

  private setCurrentRangeToNow() {
    const days =
      this.selectedRange === 'all' ? 0 : parseInt(this.selectedRange, 10);

    const end = new Date();
    const start = new Date();

    if (days > 0) {
      start.setDate(end.getDate() - days);
    } else {
      // "all" selected
      const firstEntry =
        this.history.length > 0 ? this.history[this.history.length - 1] : undefined;
      if (firstEntry) {
        start.setTime(new Date(firstEntry.date).getTime());
      }
    }

    this.currentStart = this.toLocalISO(start);
    this.currentEnd = this.toLocalISO(end);
  }

  // Called when user changes between 7 / 30 / all
  onRangeChange() {
    if (this.selectedRange === 'all') {
      this.filteredHistory = this.history;
      if (this.history.length) {
        this.currentStart = this.toLocalISO(
          new Date(this.history[this.history.length - 1].date)
        );
        this.currentEnd = this.toLocalISO(new Date(this.history[0].date));
      } else {
        const now = new Date();
        this.currentStart = this.toLocalISO(now);
        this.currentEnd = this.toLocalISO(now);
      }
      return;
    }

    const days = parseInt(this.selectedRange, 10);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    this.currentStart = this.toLocalISO(start);
    this.currentEnd = this.toLocalISO(end);

    this.filterHistory();
  }

  changeRange(direction: 'prev' | 'next') {
    if (this.selectedRange === 'all') return;

    const days = parseInt(this.selectedRange, 10);
    const delta = direction === 'prev' ? -days : days;

    const start = new Date(this.currentStart);
    const end = new Date(this.currentEnd);

    start.setDate(start.getDate() + delta);
    end.setDate(end.getDate() + delta);

    this.currentStart = this.toLocalISO(start);
    this.currentEnd = this.toLocalISO(end);

    this.filterHistory();
  }

  filterHistory() {
    const startTime = new Date(this.currentStart).getTime();
    const endTime = new Date(this.currentEnd).getTime();
    this.filteredHistory = this.history.filter((entry) => {
      const entryTime = new Date(entry.date).getTime();
      return entryTime >= startTime && entryTime <= endTime;
    });
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
          handler: () => this.deleteLog(log),
        },
      ],
    });

    await alert.present();
  }

  async deleteLog(log: MoodLogEntry) {
    this.history = this.history.filter((entry) => entry !== log);
    await this.storage.set('mood_log_history', this.history);
    this.filterHistory();
  }

  goToExport() {
    this.router.navigate(['/export-history']);
  }
}