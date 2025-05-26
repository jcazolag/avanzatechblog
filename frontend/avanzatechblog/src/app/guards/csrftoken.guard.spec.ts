import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { isObservable, firstValueFrom, throwError, of } from 'rxjs';

import { csrftokenGuard } from './csrftoken.guard';
import { CsrftokenService } from '@services/csrftoken.service';

describe('csrftokenGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => csrftokenGuard(...guardParameters));

  let mockCsrftokenService: jasmine.SpyObj<CsrftokenService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockCsrftokenService = jasmine.createSpyObj('CsrftokenService', [
      'getToken',
      'fetchCsrfToken',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        { provide: CsrftokenService, useValue: mockCsrftokenService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow activation if token already exists', async () => {
    mockCsrftokenService.getToken.and.returnValue('existing-token');

    const result = await Promise.resolve(executeGuard({} as any, {} as any));
    const finalResult = isObservable(result)
      ? await firstValueFrom(result)
      : result;
    expect(finalResult).toBeTrue();
    expect(mockCsrftokenService.fetchCsrfToken).not.toHaveBeenCalled();
  });

  it('should fetch token and allow activation if token not present', async () => {
    mockCsrftokenService.getToken.and.returnValue(null);
    mockCsrftokenService.fetchCsrfToken.and.returnValue(of({message: 'new-token'}));

    const result = await Promise.resolve(executeGuard({} as any, {} as any));
    const finalResult = isObservable(result)
      ? await firstValueFrom(result)
      : result;
    expect(finalResult).toBeTrue();
    expect(mockCsrftokenService.fetchCsrfToken).toHaveBeenCalled();
  });

  it('should redirect and deny activation if fetching token fails', async () => {
    mockCsrftokenService.getToken.and.returnValue(null);
    mockCsrftokenService.fetchCsrfToken.and.returnValue(
      throwError(() => new Error('network error'))
    );

    const result = await Promise.resolve(executeGuard({} as any, {} as any));
    const finalResult = isObservable(result)
      ? await firstValueFrom(result)
      : result;
    expect(finalResult).toBeFalse();
    expect(mockCsrftokenService.fetchCsrfToken).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/internal-server-error']);
  });
});
