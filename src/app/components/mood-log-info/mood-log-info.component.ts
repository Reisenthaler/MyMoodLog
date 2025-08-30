import { Component, OnInit } from '@angular/core';
import { IonCard, IonCardContent, IonCardTitle, IonCardHeader } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core'; 

@Component({
  selector: 'app-mood-log-info',
  templateUrl: './mood-log-info.component.html',
  styleUrls: ['./mood-log-info.component.scss'],
  imports: [
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    TranslateModule
  ]
})
export class MoodLogInfoComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
