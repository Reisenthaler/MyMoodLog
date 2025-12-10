import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { add, trash, create } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() label: string = 'Click me';
  @Input() color: 'default' | 'white' | 'black' | 'green' | 'red' | 'orange' = 'default';


constructor() {
  addIcons({ add, trash, create });
}
  // 👇 size now includes icon + iconWithText
  @Input() size: 'small' | 'medium' | 'wide' | 'wide-small' | 'icon' | 'iconWithText' = 'medium';

  @Input() disabled: boolean = false;

  // 👇 icon name (only used if size is icon or iconWithText)
  @Input() icon: string = '';

  @Output() clicked = new EventEmitter<void>();

  handleClick() {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}