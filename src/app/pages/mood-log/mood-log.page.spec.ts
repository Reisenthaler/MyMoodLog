import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MoodLogPage } from './mood-log.page';

describe('MoodLogPage', () => {
  let component: MoodLogPage;
  let fixture: ComponentFixture<MoodLogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MoodLogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
