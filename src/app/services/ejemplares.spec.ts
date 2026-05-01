import { TestBed } from '@angular/core/testing';


import { EjemplaresService } from './ejemplares';

describe('Ejemplares', () => {
  let service: EjemplaresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EjemplaresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
