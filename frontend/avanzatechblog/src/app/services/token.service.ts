import { Injectable } from '@angular/core';
import { CookieWrapper } from '@utils/cookieWrapper';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  saveToken(tokenName: string, token: string): void{
    CookieWrapper.setCookie(tokenName, token, {expires: 365, path: '/'});
  }

  getToken(tokenName: string): string | undefined{
    return CookieWrapper.getCookie(tokenName);
  }

  removeToken(tokenName: string): void{
    CookieWrapper.removeCookie(tokenName);
  }
}
