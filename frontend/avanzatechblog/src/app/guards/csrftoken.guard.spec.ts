import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { csrftokenGuard } from './csrftoken.guard';

describe('csrftokenGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => csrftokenGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
