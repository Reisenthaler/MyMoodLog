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
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { MoodItem } from 'src/app/models/mood-item.model';
import { MoodLogEntry } from 'src/app/models/mood-log-entry.model';
import { TranslateModule } from '@ngx-translate/core';
import { MoodLogGraphComponent } from 'src/app/components/mood-log-graph/mood-log-graph.component';
import { FormsModule } from '@angular/forms';

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
    TranslateModule,
    MoodLogGraphComponent,
  ],
})
export class MoodLogHistoryPage implements OnInit {
  history: MoodLogEntry[] = [];
  filteredHistory: MoodLogEntry[] = [];
  moodItems: MoodItem[] = [];

  selectedRange: '7' | '30' | 'all' = '7'; // default

  constructor(private storage: Storage) {}

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
}