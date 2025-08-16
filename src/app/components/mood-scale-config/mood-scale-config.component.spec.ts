import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MoodScaleConfigComponent } from './mood-scale-config.component';

describe('MoodScaleConfigComponent', () => {
  let component: MoodScaleConfigComponent;
  let fixture: ComponentFixture<MoodScaleConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MoodScaleConfigComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoodScaleConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
