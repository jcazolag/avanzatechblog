import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';

import { userGuard } from './user.guard';

describe('userGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => userGuard(...guardParameters));

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });

    localStorage.clear();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true if user is not in localStorage', () => {
    const result = executeGuard({} as any, {} as any);
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should return false and navigate if user is in localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }));

    const result = executeGuard({} as any, {} as any);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/']);
  });
});
