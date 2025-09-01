import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpCrisisSituationsPage } from './help-crisis-situations.page';

describe('HelpCrisisSituationsPage', () => {
  let component: HelpCrisisSituationsPage;
  let fixture: ComponentFixture<HelpCrisisSituationsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpCrisisSituationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
