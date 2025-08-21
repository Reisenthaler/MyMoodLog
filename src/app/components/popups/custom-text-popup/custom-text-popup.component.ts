import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../button/button.component';
  
@Component({
  selector: 'app-custom-text-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './custom-text-popup.component.html',
  styleUrls: ['./custom-text-popup.component.scss'],
})
export class CustomTextPopupComponent {
  @Input() heading: string = 'Enter Text';
  @Input() placeholder: string = 'Type here...';
  @Input() saveLabel: string = 'Save';
  @Input() cancelLabel: string = 'Cancel';
  @Input() multiline: boolean = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<string>();

  isOpen = false;
  userInput: string = '';

  @ViewChild('inputElement') inputField!: ElementRef;

  open(initialValue: string = '') {
    this.userInput = initialValue;
    this.isOpen = true;

    setTimeout(() => {
      if (this.inputField?.nativeElement) {
        this.inputField.nativeElement.focus();
        if (!this.multiline) {
          this.inputField.nativeElement.select();
        }
      }
    }, 50);
  }

  close() {
    this.isOpen = false;
    this.closed.emit();
  }

  submit() {
    this.saved.emit(this.userInput.trim());
    this.close();
  }

  scrollInputIntoView(input: HTMLInputElement | HTMLTextAreaElement) {
    setTimeout(() => {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }
}