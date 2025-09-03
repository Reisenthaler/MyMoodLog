import { Component, OnInit } from '@angular/core';
import { IonCard, IonCardContent, IonCardTitle, IonCardHeader } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core'; 

@Component({
  selector: 'app-notification-info',
  templateUrl: './notification-info.component.html',
  styleUrls: ['./notification-info.component.scss'],
  imports: [
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    TranslateModule
  ]  
})
export class NotificationInfoComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
