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
  IonTextarea,
  IonReorderGroup,
  IonReorder,
  IonTitle,
  IonToolbar,
  IonContent,
  IonHeader,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, trash } from 'ionicons/icons';
import { IonicStorageModule, Storage } from '@ionic/storage-angular';
import { CrisisPlan } from '../../models/crisis-plan.model';
import { ItemReorderEventDetail } from '@ionic/angular';

@Component({
  selector: 'app-crisis-plan-list',
  templateUrl: './crisis-plan-list.component.html',
  styleUrls: ['./crisis-plan-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonInput,
    IonIcon,
    IonTextarea,
    IonTitle,
    IonToolbar,
    IonContent,
    IonHeader,
    IonReorderGroup,
    IonReorder,
  ],
})
export class CrisisPlanListComponent implements OnInit {
  private STORAGE_KEY = 'crisis_plans';

  crisisPlans: CrisisPlan[] = [];
  newTitle: string = '';

  constructor(private storage: Storage, private alertCtrl: AlertController) {
    addIcons({ add, create, trash });
  }

  async ngOnInit() {
    await this.storage.create();
    await this.loadPlans();
  }

  async loadPlans() {
    const saved = (await this.storage.get(this.STORAGE_KEY)) as CrisisPlan[];
    this.crisisPlans = saved || [];
  }

  async savePlans() {
    await this.storage.set(this.STORAGE_KEY, this.crisisPlans);
  }

  async addPlan() {
    const alert = await this.alertCtrl.create({
      header: 'New Crisis Plan',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Enter crisis plan title',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: async (data) => {
            if (data.title && data.title.trim()) {
              const newPlan: CrisisPlan = {
                id: Date.now(),
                title: data.title.trim(),
                steps: [],
              };
              this.crisisPlans.push(newPlan);
              await this.savePlans();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async editPlan(plan: CrisisPlan) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Title',
      inputs: [{ name: 'title', type: 'text', value: plan.title }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data) => {
            if (data.title.trim()) {
              plan.title = data.title.trim();
              await this.savePlans();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deletePlan(plan: CrisisPlan) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: `Do you really want to delete the crisis plan <b>${plan.title}</b>?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            this.crisisPlans = this.crisisPlans.filter((p) => p.id !== plan.id);
            await this.savePlans();
          },
        },
      ],
    });
    await alert.present();
  }

  async addStep(plan: CrisisPlan) {
    const alert = await this.alertCtrl.create({
      header: 'Add Step',
      inputs: [{ name: 'step', type: 'textarea', placeholder: 'Enter step' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (data) => {
            if (data.step.trim()) {
              plan.steps.push(data.step.trim());
              await this.savePlans();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async editStep(plan: CrisisPlan, index: number) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Step',
      inputs: [{ name: 'step', type: 'textarea', value: plan.steps[index] }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data) => {
            if (data.step.trim()) {
              plan.steps[index] = data.step.trim();
              await this.savePlans();
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteStep(plan: CrisisPlan, index: number) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Step?',
      message: `Do you really want to delete this step?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            plan.steps.splice(index, 1);
            await this.savePlans();
          },
        },
      ],
    });
    await alert.present();
  }

async reorderSteps(event: CustomEvent<ItemReorderEventDetail>, plan: CrisisPlan) {
  const from = event.detail.from;
  const to = event.detail.to;

  // Move the step in the array
  const movedItem = plan.steps.splice(from, 1)[0];
  plan.steps.splice(to, 0, movedItem);

  // Complete the reorder
  event.detail.complete();

  // Save updated order
  await this.savePlans();
}
}