import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CrisisPlanListComponent } from './crisis-plan-list.component';

describe('CrisisPlanListComponent', () => {
  let component: CrisisPlanListComponent;
  let fixture: ComponentFixture<CrisisPlanListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CrisisPlanListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CrisisPlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
