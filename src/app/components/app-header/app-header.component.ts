import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { App as CapacitorApp } from '@capacitor/app';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IonicModule, TranslateModule],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  /** Title text or translation key to display in the header. */
  @Input() title: string | null = null;

  /** Show a back button on the left side. If no `(back)` handler is provided, router.back() is used. */
  @Input() showBack = false;

  /** Toolbar color (defaults to app color) */
  @Input() color = 'mymoodlogcolor';

  /** Emitted when user taps the back button. */
  @Output() back = new EventEmitter<void>();

  constructor(private location: Location) {}

  private backListener: any = null;

  ngOnInit(): void {
    // Listen to native hardware back button (Android / Capacitor hosts).
    try {
      this.backListener = CapacitorApp.addListener('backButton', () => {
        if (this.showBack) {
          this.onBack();
        }
      });
    } catch (e) {
      // If Capacitor App plugin is not available (web), ignore.
    }
  }

  ngOnDestroy(): void {
    try {
      if (this.backListener && typeof this.backListener.remove === 'function') {
        this.backListener.remove();
      }
    } catch (e) {
      // ignore
    }
  }

  onBack(): void {
    if (this.back.observers.length) {
      this.back.emit();
    } else {
      this.location.back();
    }
  }
}
