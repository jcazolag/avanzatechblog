import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { notCsrfTokenGuard } from './not-csrf-token.guard';

describe('notCsrfTokenGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => notCsrfTokenGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
