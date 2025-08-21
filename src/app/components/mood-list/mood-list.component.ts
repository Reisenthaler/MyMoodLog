import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  ModalController,
  AlertController,
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { MoodItem } from '../../models/mood-item.model';
import { CrisisPlan } from '../../models/crisis-plan.model';
import { MoodScaleConfigComponent } from '../mood-scale-config/mood-scale-config.component';
import { addIcons } from 'ionicons';
import { trash, create, add } from 'ionicons/icons';
import { CustomTextPopupComponent } from '../popups/custom-text-popup/custom-text-popup.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-mood-list',
  templateUrl: './mood-list.component.html',
  styleUrls: ['./mood-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonLabel,
    ButtonComponent, // 👈 use custom button
    CustomTextPopupComponent,
  ],
})
export class MoodListComponent implements OnInit {
  @ViewChild('addPopup') addPopup!: CustomTextPopupComponent;
  private STORAGE_KEY = 'mood_items';
  items: MoodItem[] = [];
  crisisPlans: CrisisPlan[] = [];

  constructor(
    private storage: Storage,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    addIcons({ trash, create, add });
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
        scalePlans: item.scalePlans || {},
      }));
    } else {
      this.items = [
        {
          id: 1,
          name: 'Suicidal Thoughts',
          active: false,
          isDefault: true,
          scalePlans: {},
        },
        {
          id: 2,
          name: 'Tension',
          active: false,
          isDefault: true,
          scalePlans: {},
        },
        {
          id: 3,
          name: 'Drive',
          active: false,
          isDefault: true,
          scalePlans: {},
        },
        {
          id: 4,
          name: 'Racing Thoughts',
          active: false,
          isDefault: true,
          scalePlans: {},
        },
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

  async editItem(item: MoodItem) {
    const modal = await this.modalCtrl.create({
      component: MoodScaleConfigComponent,
      componentProps: {
        item: { ...item },
        crisisPlans: this.crisisPlans,
      },
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data) {
      const index = this.items.findIndex((i) => i.id === item.id);
      if (index > -1) {
        this.items[index] = data;
        await this.saveItems();
      }
    }
  }

  async removeItem(item: MoodItem) {
    if (item.isDefault) return;

    const alert = await this.alertCtrl.create({
      header: 'Löschen bestätigen',
      message: `Möchten Sie "${item.name}" wirklich löschen?`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
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

  openAddPopup() {
    this.addPopup.open();
  }

  async handleAddItem(name: string) {
    if (!name) return;

    const newItem: MoodItem = {
      id: Date.now(),
      name,
      active: false,
      isDefault: false,
      scalePlans: {},
    };

    this.items.push(newItem);
    await this.saveItems();
  }
}