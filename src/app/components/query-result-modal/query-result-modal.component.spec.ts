import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryResultModalComponent } from './query-result-modal.component';

describe('QueryResultModalComponent', () => {
  let component: QueryResultModalComponent;
  let fixture: ComponentFixture<QueryResultModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QueryResultModalComponent]
    });
    fixture = TestBed.createComponent(QueryResultModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
