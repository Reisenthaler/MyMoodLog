import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CrisisPlan } from '../../models/crisis-plan.model';

@Component({
  selector: 'app-crisis-plan-result',
  templateUrl: './crisis-plan-result.page.html',
  styleUrls: ['./crisis-plan-result.page.scss'],
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class CrisisPlanResultPage implements OnInit {
  plans: CrisisPlan[] = [];

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state && nav.extras.state['plans']) {
      this.plans = nav.extras.state['plans'];
    }
  }

  ngOnInit() {}
}