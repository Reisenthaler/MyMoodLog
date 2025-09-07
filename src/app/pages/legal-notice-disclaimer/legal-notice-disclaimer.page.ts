import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonText, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle 
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core'; 

@Component({
  selector: 'app-legal-notice-disclaimer',
  templateUrl: './legal-notice-disclaimer.page.html',
  styleUrls: ['./legal-notice-disclaimer.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonText, 
    IonCard, 
    IonCardContent, 
    IonCardHeader, 
    IonCardTitle, 
    CommonModule, 
    FormsModule, 
    TranslateModule
  ]
})
export class LegalNoticeDisclaimerPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
