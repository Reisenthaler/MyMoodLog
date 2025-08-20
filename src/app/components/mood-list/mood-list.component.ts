import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  ModalController,
  AlertController,
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { MoodItem } from '../../models/mood-item.model';
import { CrisisPlan } from '../../models/crisis-plan.model';
import { MoodScaleConfigComponent } from '../mood-scale-config/mood-scale-config.component';
import { addIcons } from 'ionicons';
import { trash, create } from 'ionicons/icons';

@Component({
  selector: 'app-mood-list',
  templateUrl: './mood-list.component.html',
  styleUrls: ['./mood-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel, IonButton, IonIcon],
})
export class MoodListComponent implements OnInit {
  private STORAGE_KEY = 'mood_items';
  items: MoodItem[] = [];
  crisisPlans: CrisisPlan[] = [];

  constructor(private storage: Storage, private alertCtrl: AlertController, private modalCtrl: ModalController) {
      addIcons({ trash, create });
  }

  async ngOnInit() {
    await this.storage.create();
    await this.loadItems();
    await this.loadCrisisPlans();
  }

  async loadItems() {
    const saved = (await this.storage.get(this.STORAGE_KEY)) as MoodItem[];
    if (saved) {
      this.items = saved.map((item) => ({
        ...item,
        scalePlans: item.scalePlans || {}, // ensure defined
      }));
    } else {
      this.items = [
        { id: 1, name: 'Suicidal Thoughts', active: false, isDefault: true, scalePlans: {} },
        { id: 2, name: 'Tension', active: false, isDefault: true, scalePlans: {} },
        { id: 3, name: 'Drive', active: false, isDefault: true, scalePlans: {} },
        { id: 4, name: 'Racing Thoughts', active: false, isDefault: true, scalePlans: {} },
      ];
      await this.saveItems();
    }
  }

  async loadCrisisPlans() {
    this.crisisPlans = (await this.storage.get('crisis_plans')) || [];
  }

  async saveItems() {
    await this.storage.set(this.STORAGE_KEY, this.items);
  }

  toggleItem(item: MoodItem) {
    item.active = !item.active;
    this.saveItems();
  }

  async addItem() {
  const alert = await this.alertCtrl.create({
    header: 'Add New Mood Item',
    inputs: [
      {
        name: 'name',
        type: 'text',
        placeholder: 'Enter item name',
      },
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Add',
        handler: async (data) => {
          if (data.name && data.name.trim().length > 0) {
            const newItem: MoodItem = {
              id: Date.now(), // unique ID
              name: data.name.trim(),
              active: false,
              isDefault: false,
              scalePlans: {},
            };
            this.items.push(newItem);
            await this.saveItems();
          }
        },
      },
    ],
  });

  await alert.present();
}

  async editItem(item: MoodItem) {
    const modal = await this.modalCtrl.create({
      component: MoodScaleConfigComponent,
      componentProps: {
        item: { ...item }, // pass a copy
        crisisPlans: this.crisisPlans,
      },
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      // update the item with new scalePlans
      const index = this.items.findIndex((i) => i.id === item.id);
      if (index > -1) {
        this.items[index] = data;
        await this.saveItems();
      }
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