import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonLabel, 
  IonItem, 
  IonList,
  IonCard,
  IonCardContent,
  IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core'; 
import { addIcons } from 'ionicons';
import { call, helpCircle, informationCircle } from 'ionicons/icons';
addIcons({
  call,
  helpCircle,
  informationCircle
});

@Component({
  selector: 'app-help-crisis-situations',
  templateUrl: './help-crisis-situations.page.html',
  styleUrls: ['./help-crisis-situations.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule, 
    IonLabel, 
    IonItem,
    IonList,
    IonCard,
    IonCardContent,
    IonIcon,
    TranslateModule
  ]
})
export class HelpCrisisSituationsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  formatUserText(text: string): string {
    if (!text) return '';

    // Regex for emails
    const emailRegex =
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/g;

    // Regex for ph one numbers (simple version, matches digits, spaces, +, -)
    const phoneRegex = /(\+?\d[\d\s\-]{1,}\d)/g;
    
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
