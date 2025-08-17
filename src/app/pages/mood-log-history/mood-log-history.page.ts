import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-mood-log-history',
  templateUrl: './mood-log-history.page.html',
  styleUrls: ['./mood-log-history.page.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class MoodLogHistoryPage implements OnInit {
  history: any[] = [];

  constructor(private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
    this.history = (await this.storage.get('mood_log_history')) || [];
    // Sort newest first
    this.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}