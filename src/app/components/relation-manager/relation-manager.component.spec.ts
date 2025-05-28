import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationManagerComponent } from './relation-manager.component';

describe('RelationManagerComponent', () => {
  let component: RelationManagerComponent;
  let fixture: ComponentFixture<RelationManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelationManagerComponent]
    });
    fixture = TestBed.createComponent(RelationManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
