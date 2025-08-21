import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoodTrackingSettingsPage } from './mood-tracking-settings.page';

describe('MoodTrackingSettingsPage', () => {
  let component: MoodTrackingSettingsPage;
  let fixture: ComponentFixture<MoodTrackingSettingsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MoodTrackingSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
