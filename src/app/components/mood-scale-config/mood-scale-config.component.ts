import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  ModalController,
} from '@ionic/angular/standalone';
import { MoodItem } from '../../models/mood-item.model';
import { CrisisPlan } from '../../models/crisis-plan.model';

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
    IonSelect,
    IonSelectOption,
    IonButton,
  ],
})
export class MoodScaleConfigComponent {
  @Input() item!: MoodItem;
  @Input() crisisPlans: CrisisPlan[] = [];

  constructor(private modalCtrl: ModalController) {}

  save() {
    this.modalCtrl.dismiss(this.item);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }
}