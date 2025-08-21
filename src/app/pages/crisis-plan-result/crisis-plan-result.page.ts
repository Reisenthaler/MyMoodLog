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
  
  formatUserText(text: string): string 
  {
    if (!text) return '';

    // Regex for emails
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/g;

    // Regex for phone numbers (simple version, matches digits, spaces, +, -)
    const phoneRegex = /(\+?\d[\d\s\-]{5,}\d)/g;

    return text
      // Replace emails with mailto links
      .replace(emailRegex, `<a href="mailto:$1">$1</a>`)
      // Replace phone numbers with tel links
      .replace(phoneRegex, `<a href="tel:$1">$1</a>`)
      // Preserve line breaks
      .replace(/\n/g, '<br>');
  }
}