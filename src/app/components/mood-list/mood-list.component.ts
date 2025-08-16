import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  IonIcon,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, trash } from 'ionicons/icons';
import { Storage } from '@ionic/storage-angular';
import { MoodItem } from '../../models/mood-item.model';

@Component({
  selector: 'app-mood-list',
  templateUrl: './mood-list.component.html',
  styleUrls: ['./mood-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonList, IonItem, IonLabel, IonButton, IonInput, IonIcon],
})
export class MoodListComponent implements OnInit {
  private STORAGE_KEY = 'mood_items';

  items: MoodItem[] = [];

  newItemName: string = '';

  // Default items (cannot be removed or renamed)
  defaultItems: MoodItem[] = [
    { id: 1, name: 'Suizidgedanken', active: false, isDefault: true },
    { id: 2, name: 'Anspannung', active: false, isDefault: true },
    { id: 3, name: 'Antrieb', active: false, isDefault: true },
    { id: 4, name: 'Gedankenkreisen', active: false, isDefault: true },
  ];

  constructor(private storage: Storage, private alertCtrl: AlertController) {
    addIcons({ add, create, trash });
  }

  async ngOnInit() {
    await this.storage.create();
    await this.loadItems();
  }

  async loadItems() {
    const saved = (await this.storage.get(this.STORAGE_KEY)) as MoodItem[];

    if (saved) {
      // 1. Default-Items laden
      const defaults = this.defaultItems.map(def => {
        // Prüfen, ob es einen gespeicherten Zustand für dieses Default-Item gibt
        const savedItem = saved.find(s => s.isDefault && s.name === def.name);
        return savedItem ? { ...def, active: savedItem.active } : def;
      });

      // 2. Custom-Items laden
      const custom = saved.filter(i => !i.isDefault);

      // 3. Zusammenführen
      this.items = [...defaults, ...custom];
    } else {
      // Wenn noch nichts gespeichert ist → Defaults initial speichern
      this.items = [...this.defaultItems];
      await this.saveItems();
    }
  }

  async saveItems() {
    await this.storage.set(this.STORAGE_KEY, this.items);
  }

  toggleItem(item: MoodItem) {
    item.active = !item.active;
    this.saveItems();
  }

  async addItem() {
    if (!this.newItemName.trim()) return;
    const newItem: MoodItem = {
      id: Date.now(),
      name: this.newItemName.trim(),
      active: false,
      isDefault: false,
    };
    this.items.push(newItem);
    this.newItemName = '';
    await this.saveItems();
  }

  async editItem(item: MoodItem) {
    if (item.isDefault) return; // cannot edit defaults
    const newName = prompt('Neuer Name:', item.name);
    if (newName && newName.trim()) {
      item.name = newName.trim();
      await this.saveItems();
    }
  }

  async removeItem(item: MoodItem) {
    if (item.isDefault) return; // Defaults dürfen nicht gelöscht werden

    const alert = await this.alertCtrl.create({
      header: 'Löschen bestätigen',
      message: `Möchten Sie "${item.name}" wirklich löschen?`,
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
        },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: async () => {
            this.items = this.items.filter((i) => i.id !== item.id);
            await this.saveItems();
          },
        },
      ],
    });

    await alert.present();
  }
}