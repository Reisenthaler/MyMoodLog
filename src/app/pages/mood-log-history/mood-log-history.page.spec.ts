import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoodLogHistoryPage } from './mood-log-history.page';

describe('MoodLogHistoryPage', () => {
  let component: MoodLogHistoryPage;
  let fixture: ComponentFixture<MoodLogHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MoodLogHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
