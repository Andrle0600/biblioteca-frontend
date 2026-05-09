import { TestBed } from '@angular/core/testing';
import { AdminGuard } from './admin-guard';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: AuthService, useValue: {} },
        { provide: Router, useValue: {} }
      ]
    });
    guard = TestBed.inject(AdminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
