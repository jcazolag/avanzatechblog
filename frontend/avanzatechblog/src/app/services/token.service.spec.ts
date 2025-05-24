import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';
import { CookieWrapper } from '@utils/cookieWrapper';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  afterEach(() => {
    service = new TokenService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#saveToken', () => {
    it('should call setCookie with correct parameters', () => {
      const spy = spyOn(CookieWrapper, 'setCookie');
      const tokenName = 'testToken';
      const tokenValue = '123456';

      service.saveToken(tokenName, tokenValue);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('#getToken', () => {
    it('should return the token value from getCookie', () => {
      const tokenName = 'testToken';
      const tokenValue = '123456';
      spyOn(CookieWrapper, 'getCookie').and.returnValue(tokenValue);

      const result = service.getToken(tokenName);

      expect(result).toBe(tokenValue);
      expect(CookieWrapper.getCookie).toHaveBeenCalled();
    });

    it('should return undefined if getCookie returns undefined', () => {
      const tokenName = 'nonExistentToken';
      spyOn(CookieWrapper, 'getCookie').and.returnValue(undefined);

      const result = service.getToken(tokenName);

      expect(result).toBeUndefined();
      expect(CookieWrapper.getCookie).toHaveBeenCalled();
    });
  });

  describe('#removeToken', () => {
    it('should call removeCookie with correct parameters', () => {
      spyOn(CookieWrapper, 'removeCookie');
      const tokenName = 'testToken';

      service.removeToken(tokenName);

      expect(CookieWrapper.removeCookie).toHaveBeenCalledWith(tokenName);
    });
  });
});
