import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalNavbarComponent } from './principal-navbar';
//import { PrincipalNavbar } from './principal-navbar';

describe('PrincipalNavbar', () => {
  let component: PrincipalNavbarComponent;
  let fixture: ComponentFixture<PrincipalNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
