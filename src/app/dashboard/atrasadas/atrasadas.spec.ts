import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Atrasadas } from './atrasadas';

describe('Atrasadas', () => {
  let component: Atrasadas;
  let fixture: ComponentFixture<Atrasadas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Atrasadas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Atrasadas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
