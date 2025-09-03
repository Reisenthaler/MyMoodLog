import { Component, OnInit } from '@angular/core';
import { IonCard, IonCardContent, IonCardTitle, IonCardHeader } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core'; 

@Component({
  selector: 'app-mood-log-history-info',
  templateUrl: './mood-log-history-info.component.html',
  styleUrls: ['./mood-log-history-info.component.scss'],
  imports: [
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    TranslateModule
  ]  
})
export class MoodLogHistoryInfoComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
