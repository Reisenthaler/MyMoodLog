import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  ModalController,
  IonTextarea,
  IonContent,
  IonFooter,
  IonToolbar,
} from '@ionic/angular/standalone';
import { MoodItem } from '../../models/mood-item.model';
import { CrisisPlan } from '../../models/crisis-plan.model';
import { ButtonComponent } from '../button/button.component';
import { TranslateModule } from '@ngx-translate/core'; 
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-mood-scale-config',
  templateUrl: './mood-scale-config.component.html',
  styleUrls: ['./mood-scale-config.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonTextarea,
    IonContent,
    IonFooter,
    IonToolbar,
    ButtonComponent, // 👈 use custom button
    TranslateModule
  ],
})
export class MoodScaleConfigComponent {
  @Input() item!: MoodItem;
  @Input() crisisPlans: CrisisPlan[] = [];

  constructor(private actionSheetCtrl: ActionSheetController,
              private modalCtrl: ModalController) {}

  async openPlanMenu(level: number) {
    const buttons: any[] = this.crisisPlans.map((plan) => ({
      text: plan.title,
      handler: () => {
        this.item.scalePlans[level] = plan.id;
      },
    }));

    // "None" option with grey style
    buttons.unshift({
      text: 'None',
      cssClass: 'action-sheet-none', // custom class
      handler: () => {
        this.item.scalePlans[level] = null;
      },
    } as any); // cast to any to bypass TS error

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Select plan for level ${level}`,
      buttons,
    });

    await actionSheet.present();
  }

  getPlanTitle(planId: number | null): string {
    if (planId == null) {
      return 'None';
    }
    const plan = this.crisisPlans.find((p) => p.id === planId);
    return plan ? plan.title : 'None';
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel'); // dismiss without data
  }

  save() {
    this.modalCtrl.dismiss(this.item, 'save'); // return data
  }
}