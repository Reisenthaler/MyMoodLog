import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MoodLogHistoryInfoComponent } from './mood-log-history-info.component';

describe('MoodLogHistoryInfoComponent', () => {
  let component: MoodLogHistoryInfoComponent;
  let fixture: ComponentFixture<MoodLogHistoryInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MoodLogHistoryInfoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MoodLogHistoryInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
