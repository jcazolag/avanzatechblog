import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { of, throwError, firstValueFrom, isObservable } from 'rxjs';

import { notCsrfTokenGuard } from './not-csrf-token.guard';
import { CsrftokenService } from '@services/csrftoken.service';

describe('notCsrfTokenGuard', () => {
  let csrfServiceSpy: jasmine.SpyObj<CsrftokenService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => notCsrfTokenGuard(...guardParameters));

  beforeEach(() => {
    csrfServiceSpy = jasmine.createSpyObj('CsrftokenService', [
      'getToken',
      'fetchCsrfToken',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: CsrftokenService, useValue: csrfServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return false and navigate to / if token already exists (synchronous)', () => {
    csrfServiceSpy.getToken.and.returnValue('token');

    const result = executeGuard({} as any, {} as any);
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/']);
  });

  it('should fetch token and return false if fetch succeeds (async)', async () => {
    csrfServiceSpy.getToken.and.returnValue(null);
    csrfServiceSpy.fetchCsrfToken.and.returnValue(of({message: 'newToken'}));

    const result = await Promise.resolve(executeGuard({} as any, {} as any));
        const finalResult = isObservable(result)
          ? await firstValueFrom(result)
          : result;
    expect(finalResult).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledOnceWith(['/']);
  });

  it('should return true if fetch fails (async)', async () => {
    csrfServiceSpy.getToken.and.returnValue(null);
    csrfServiceSpy.fetchCsrfToken.and.returnValue(
      throwError(() => new Error('network error'))
    );

    const result = await Promise.resolve(executeGuard({} as any, {} as any));
    const finalResult = isObservable(result)
      ? await firstValueFrom(result)
      : result;
    expect(finalResult).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
