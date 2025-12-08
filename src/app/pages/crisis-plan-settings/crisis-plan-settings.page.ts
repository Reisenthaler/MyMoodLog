import { Component, OnInit, viewChild, ViewChild } from '@angular/core';
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
  IonFooter,
  AlertController,
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, create, trash } from 'ionicons/icons';
import { Storage } from '@ionic/storage-angular';
import { CrisisPlan } from '../../models/crisis-plan.model';
import { ItemReorderEventDetail } from '@ionic/angular';
import { CustomTextPopupComponent } from 'src/app/components/popups/custom-text-popup/custom-text-popup.component';
import { ButtonComponent } from 'src/app/components/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';

@Component({
  selector: 'app-crisis-plan-settings',
  templateUrl: './crisis-plan-settings.page.html',
  styleUrls: ['./crisis-plan-settings.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonFooter,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonReorder,
    IonReorderGroup,
    FormsModule,
    ButtonComponent,
    CustomTextPopupComponent,
    TranslateModule,
    AppHeaderComponent
] })
export class CrisisPlanSettingsPage implements OnInit {
private STORAGE_KEY = 'crisis_plans';

  crisisPlans: CrisisPlan[] = [];

  private editingPlan: CrisisPlan | null = null;
  private editingStepIndex: number | null = null;

  stepPopupHeading = 'Add Step';
  stepPopupSaveLabel = 'Add';

  @ViewChild('addPlanPopup') addPlanPopup!: CustomTextPopupComponent;
  @ViewChild('editPlanPopup') editPlanPopup!: CustomTextPopupComponent;
  @ViewChild('stepPopup') stepPopup!: CustomTextPopupComponent;

  constructor(private storage: Storage, private alertCtrl: AlertController, private translateService: TranslateService) {
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
    this.stepPopupHeading = this.translateService.instant('CRISIS_PLAN_SETTINGS.POPUP.ADD_STEP_HEADING');
    this.stepPopupSaveLabel = this.translateService.instant('CRISIS_PLAN_SETTINGS.POPUP.ADD');
    this.stepPopup.open();
  }

  openEditStep(plan: CrisisPlan, index: number) {
    this.editingPlan = plan;
    this.editingStepIndex = index;
    this.stepPopupHeading = this.translateService.instant('CRISIS_PLAN_SETTINGS.POPUP.EDIT_STEP_HEADING');
    this.stepPopupSaveLabel = this.translateService.instant('CRISIS_PLAN_SETTINGS.POPUP.SAVE');
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
      header: this.translateService.instant('CRISIS_PLAN_SETTINGS.ALERT.CONFIRM_DELETE_TITLE'),
      message: this.translateService.instant('CRISIS_PLAN_SETTINGS.ALERT.CONFIRM_DELETE_MESSAGE', { title: plan.title }),
      buttons: [
        { text: this.translateService.instant('CRISIS_PLAN_SETTINGS.ALERT.CANCEL'), role: 'cancel' },
        {
          text: this.translateService.instant('CRISIS_PLAN_SETTINGS.ALERT.DELETE'),
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
      header: this.translateService.instant('CRISIS_PLAN_SETTINGS.ALERT.DELETE_STEP_TITLE'),
      message: this.translateService.instant('CRISIS_PLAN_SETTINGS.ALERT.DELETE_STEP_MESSAGE'),
      buttons: [
        { text: this.translateService.instant('CRISIS_PLAN_SETTINGS.ALERT.CANCEL'), role: 'cancel' },
        {
          text: this.translateService.instant('CRISIS_PLAN_SETTINGS.ALERT.DELETE'),
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

  formatUserText(text: string): string {
    if (!text) return '';

    // Regex for emails
    const emailRegex =
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/g;

    // Regex for ph one numbers (simple version, matches digits, spaces, +, -)
    const phoneRegex = /(\+?\d[\d\s\-]{5,}\d)/g;

    // Regex for URLs (http, https, www)
    const urlRegex =
      /\b((https?:\/\/|www\.)[^\s<]+)/gi;

    return text
      // Replace emails with mailto links
      .replace(emailRegex, `<a href="mailto:$1">$1</a>`)
      // Replace phone numbers with tel links
      .replace(phoneRegex, `<a href="tel:$1">$1</a>`)
      // Replace URLs with clickable links
      .replace(urlRegex, (match) => {
        const url = match.startsWith('http')
          ? match
          : `https://${match}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a>`;
      })
      // Preserve line breaks
      .replace(/\n/g, '<br>');
  }
}