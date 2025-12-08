import { Component, OnInit, viewChild, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonContent,
  ModalController,
  AlertController,
  IonHeader,
  IonFooter,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { MoodItem } from 'src/app/models/mood-item.model';
import { CustomTextPopupComponent } from 'src/app/components/popups/custom-text-popup/custom-text-popup.component';
import { MoodScaleConfigComponent } from 'src/app/components/mood-scale-config/mood-scale-config.component';
import { CrisisPlan } from 'src/app/models/crisis-plan.model';
import { TranslateModule } from '@ngx-translate/core';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from 'src/app/services/logger.service';

@Component({
  selector: 'app-mood-tracking-settings',
  templateUrl: './mood-tracking-settings.page.html',
  styleUrls: ['./mood-tracking-settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonTitle,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
      IonContent,
    ButtonComponent,
    CustomTextPopupComponent,
    TranslateModule,
    AppHeaderComponent,
  ],})
export class MoodTrackingSettingsPage implements OnInit {
  @ViewChild('addPopup') addPopup!: CustomTextPopupComponent;
  private STORAGE_KEY = 'mood_items';
  moodItems: MoodItem[] = [];
  crisisPlans: CrisisPlan[] = [];
  private logger = this.loggerService.createLogger('MoodTrackingSettings');

  constructor(
    private storage: Storage,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private translateService: TranslateService,
    private toastCtrl: ToastController,
    private loggerService: LoggerService // Inject LoggerService
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.loadItems();
    await this.loadCrisisPlans();
  }

  async loadItems() {
    const saved = (await this.storage.get(this.STORAGE_KEY)) as MoodItem[];
    if (saved) {
      this.moodItems = saved.map((item) => ({
        ...item,
        scalePlans: item.scalePlans || {},
      }));
    } else {
      this.moodItems = [
        {
          id: 1,
          name: this.translateService.instant('MOOD_TRACKING_SETTINGS.DEFAULT_ITEMS.SUICIDAL_THOUGHTS'),
          active: false,
          isDefault: true,
          scalePlans: {},
        },
        {
          id: 2,
          name: this.translateService.instant('MOOD_TRACKING_SETTINGS.DEFAULT_ITEMS.TENSION'),
          active: false,
          isDefault: true,
          scalePlans: {},
        },
        {
          id: 3,
          name: this.translateService.instant('MOOD_TRACKING_SETTINGS.DEFAULT_ITEMS.DRIVE'),
          active: false,
          isDefault: true,
          scalePlans: {},
        },
        {
          id: 4,
          name: this.translateService.instant('MOOD_TRACKING_SETTINGS.DEFAULT_ITEMS.RACING_THOUGHTS'),
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
    await this.storage.set(this.STORAGE_KEY, this.moodItems);
  }

  toggleItem(item: MoodItem) {
    item.active = !item.active;
    this.saveItems();
  }

  async editItem(item: MoodItem) {
    const modal = await this.modalCtrl.create({
      component: MoodScaleConfigComponent,
      componentProps: {
        item: JSON.parse(JSON.stringify(item)), // deep clone
        crisisPlans: this.crisisPlans,
      },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save' && data) {
      const index = this.moodItems.findIndex((i) => i.id === item.id);
      if (index > -1) {
        this.moodItems[index] = data;
        try {
          await this.saveItems();
          await this.logger.info('Mood item edited successfully', data);
          const toast = await this.toastCtrl.create({
            message: this.translateService.instant('MOOD_TRACKING_SETTINGS.ALERT.EDIT_SUCCESS'),
            duration: 2000,
            color: 'success',
          });
          await toast.present();
        } catch (error) {
          await this.logger.error('Failed to edit mood item', error, data);
          const toast = await this.toastCtrl.create({
            message: this.translateService.instant('MOOD_TRACKING_SETTINGS.ALERT.EDIT_ERROR') || 'Fehler beim Speichern!',
            duration: 2000,
            color: 'danger',
          });
          await toast.present();
        }
      }
    } else {
      // Do nothing, user cancelled
      await this.logger.info('Edit cancelled', item);
    }
  }

  async removeItem(item: MoodItem) {
    if (item.isDefault) return;

    const alert = await this.alertCtrl.create({
      header: this.translateService.instant('MOOD_TRACKING_SETTINGS.ALERT.CONFIRM_DELETE_TITLE'),
      message: this.translateService.instant('MOOD_TRACKING_SETTINGS.ALERT.CONFIRM_DELETE_MESSAGE', { name: item.name }),
      buttons: [
        { text: this.translateService.instant('MOOD_TRACKING_SETTINGS.ALERT.CANCEL'), role: 'cancel' },
        {
          text: this.translateService.instant('MOOD_TRACKING_SETTINGS.ALERT.DELETE'),
          role: 'destructive',
          handler: async () => {
            this.moodItems = this.moodItems.filter((i) => i.id !== item.id);
            try {
              await this.saveItems();
              await this.logger.info('Mood item deleted successfully', item);
              const toast = await this.toastCtrl.create({
                message: this.translateService.instant('MOOD_TRACKING_SETTINGS.ALERT.DELETE_SUCCESS'),
                duration: 2000,
                color: 'success',
              });
              await toast.present();
            } catch (error) {
              await this.logger.error('Failed to delete mood item', error, item);
              const toast = await this.toastCtrl.create({
                message: this.translateService.instant('MOOD_TRACKING_SETTINGS.ALERT.DELETE_ERROR') || 'Fehler beim Löschen!',
                duration: 2000,
                color: 'danger',
              });
              await toast.present();
            }
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
      active: true,
      isDefault: false,
      scalePlans: {},
    };

    this.moodItems.push(newItem);
    await this.saveItems();
  }
}