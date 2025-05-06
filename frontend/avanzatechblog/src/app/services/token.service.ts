import { Injectable } from '@angular/core';
import { getCookie, setCookie, removeCookie } from 'typescript-cookie';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  saveToken(tokenName: string, token: string){
    setCookie(tokenName, token, {expires: 365, path: '/'});
  }

  getToken(tokenName: string){
    const token = getCookie(tokenName);
    return token;
  }

  removeToken(tokenName: string){
    removeCookie(tokenName);
  }
}
