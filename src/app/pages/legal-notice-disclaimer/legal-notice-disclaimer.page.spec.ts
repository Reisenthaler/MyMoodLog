import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalNoticeDisclaimerPage } from './legal-notice-disclaimer.page';

describe('LegalNoticeDisclaimerPage', () => {
  let component: LegalNoticeDisclaimerPage;
  let fixture: ComponentFixture<LegalNoticeDisclaimerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LegalNoticeDisclaimerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
