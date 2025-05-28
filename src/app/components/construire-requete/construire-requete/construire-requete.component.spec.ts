import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstruireRequeteComponent } from './construire-requete.component';

describe('ConstruireRequeteComponent', () => {
  let component: ConstruireRequeteComponent;
  let fixture: ComponentFixture<ConstruireRequeteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConstruireRequeteComponent]
    });
    fixture = TestBed.createComponent(ConstruireRequeteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
