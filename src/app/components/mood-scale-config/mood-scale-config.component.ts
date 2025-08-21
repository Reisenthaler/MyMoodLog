import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  ModalController,
} from '@ionic/angular/standalone';
import { MoodItem } from '../../models/mood-item.model';
import { CrisisPlan } from '../../models/crisis-plan.model';
import { ButtonComponent } from '../button/button.component';
import { addIcons } from 'ionicons';
import { save, close } from 'ionicons/icons';

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
    ButtonComponent, // 👈 use custom button
  ],
})
export class MoodScaleConfigComponent {
  @Input() item!: MoodItem;
  @Input() crisisPlans: CrisisPlan[] = [];

  constructor(private modalCtrl: ModalController) {
    addIcons({ save, close }); // register icons
  }

  save() {
    this.modalCtrl.dismiss(this.item);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }
}