import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ejemplares } from './ejemplares';

describe('Ejemplares', () => {
  let component: Ejemplares;
  let fixture: ComponentFixture<Ejemplares>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ejemplares]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ejemplares);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
