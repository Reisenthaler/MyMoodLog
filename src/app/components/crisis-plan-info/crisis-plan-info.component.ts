import { Component, OnInit } from '@angular/core';
import { IonCard, IonCardContent, IonCardTitle, IonCardHeader } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core'; 

@Component({
  selector: 'app-crisis-plan-info',
  templateUrl: './crisis-plan-info.component.html',
  styleUrls: ['./crisis-plan-info.component.scss'],
  imports: [
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    TranslateModule
  ]
})
export class CrisisPlanInfoComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
