import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() label: string = 'Click me';
  @Input() color: 'default' | 'white' | 'black' | 'green' | 'red' | 'orange' = 'default';
  @Input() size: 'small' | 'medium' | 'wide' = 'medium';
  @Input() disabled: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  handleClick() {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}