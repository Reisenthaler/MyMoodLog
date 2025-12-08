import { Component, OnInit, OnDestroy } from '@angular/core';

import { IonList, IonItem, IonLabel, IonContent, Platform } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { CrisisPlan } from '../../models/crisis-plan.model';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AppHeaderComponent } from 'src/app/components/app-header/app-header.component';

@Component({
  selector: 'app-crisis-plan-result',
  templateUrl: './crisis-plan-result.page.html',
  styleUrls: ['./crisis-plan-result.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonLabel,
    IonContent,
    TranslateModule,
    AppHeaderComponent
],
})
export class CrisisPlanResultPage implements OnInit, OnDestroy {
  plans: CrisisPlan[] = [];
  private backButtonSub?: Subscription;

  constructor(private router: Router, private platform: Platform) {
    const nav = this.router.currentNavigation();
    if (nav?.extras.state && nav.extras.state['plans']) {
      this.plans = nav.extras.state['plans'];
    }
  }

  ngOnInit() {
    // 👇 Override Android hardware back button
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(
      9999, // high priority to override default
      () => {
        this.router.navigateByUrl('/home');
      }
    );
  }

  ngOnDestroy() {
    // Clean up subscription when leaving page
    this.backButtonSub?.unsubscribe();
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