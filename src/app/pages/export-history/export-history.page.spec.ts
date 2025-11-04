import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportHistoryPage } from './export-history.page';

describe('ExportHistoryPage', () => {
  let component: ExportHistoryPage;
  let fixture: ComponentFixture<ExportHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
