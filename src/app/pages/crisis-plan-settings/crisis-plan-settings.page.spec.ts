import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrisisPlanSettingsPage } from './crisis-plan-settings.page';

describe('CrisisPlanSettingsPage', () => {
  let component: CrisisPlanSettingsPage;
  let fixture: ComponentFixture<CrisisPlanSettingsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrisisPlanSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
