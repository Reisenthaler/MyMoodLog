import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
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
import { Storage } from '@ionic/storage-angular';
import { CrisisPlan } from '../../models/crisis-plan.model';
import { ItemReorderEventDetail } from '@ionic/angular';
import { CustomTextPopupComponent } from '../popups/custom-text-popup/custom-text-popup.component';
import { ButtonComponent } from '../button/button.component';

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
    IonTitle,
    IonToolbar,
    IonContent,
    IonHeader,
    IonReorderGroup,
    IonReorder,
    CustomTextPopupComponent,
    ButtonComponent, // 👈 use custom button
  ],
})
export class CrisisPlanListComponent implements OnInit {
  private STORAGE_KEY = 'crisis_plans';

  crisisPlans: CrisisPlan[] = [];

  private editingPlan: CrisisPlan | null = null;
  private editingStepIndex: number | null = null;

  stepPopupHeading = 'Add Step';
  stepPopupSaveLabel = 'Add';

  @ViewChild('addPlanPopup') addPlanPopup!: CustomTextPopupComponent;
  @ViewChild('editPlanPopup') editPlanPopup!: CustomTextPopupComponent;
  @ViewChild('stepPopup') stepPopup!: CustomTextPopupComponent;

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

  openAddPlan() {
    this.addPlanPopup.open();
  }

  async handleAddPlan(title: string) {
    if (title.trim()) {
      const newPlan: CrisisPlan = {
        id: Date.now(),
        title: title.trim(),
        steps: [],
      };
      this.crisisPlans.push(newPlan);
      await this.savePlans();
    }
  }

  openEditPlan(plan: CrisisPlan) {
    this.editingPlan = plan;
    this.editPlanPopup.open(plan.title);
  }

  async handleEditPlan(title: string) {
    if (this.editingPlan && title.trim()) {
      this.editingPlan.title = title.trim();
      await this.savePlans();
    }
    this.editingPlan = null;
  }

  openAddStep(plan: CrisisPlan) {
    this.editingPlan = plan;
    this.editingStepIndex = null;
    this.stepPopupHeading = 'Add Step';
    this.stepPopupSaveLabel = 'Add';
    this.stepPopup.open();
  }

  openEditStep(plan: CrisisPlan, index: number) {
    this.editingPlan = plan;
    this.editingStepIndex = index;
    this.stepPopupHeading = 'Edit Step';
    this.stepPopupSaveLabel = 'Save';
    this.stepPopup.open(plan.steps[index]);
  }

  async handleStepSave(stepText: string) {
    if (this.editingPlan && stepText.trim()) {
      if (this.editingStepIndex === null) {
        this.editingPlan.steps.push(stepText.trim());
      } else {
        this.editingPlan.steps[this.editingStepIndex] = stepText.trim();
      }
      await this.savePlans();
    }
    this.editingPlan = null;
    this.editingStepIndex = null;
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

  async reorderSteps(
    event: CustomEvent<ItemReorderEventDetail>,
    plan: CrisisPlan
  ) {
    const from = event.detail.from;
    const to = event.detail.to;

    const movedItem = plan.steps.splice(from, 1)[0];
    plan.steps.splice(to, 0, movedItem);

    event.detail.complete();
    await this.savePlans();
  }
}