import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrisisPlanResultPage } from './crisis-plan-result.page';

describe('CrisisPlanResultPage', () => {
  let component: CrisisPlanResultPage;
  let fixture: ComponentFixture<CrisisPlanResultPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrisisPlanResultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
