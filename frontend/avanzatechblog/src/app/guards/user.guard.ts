import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const userGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const user = localStorage.getItem('user');

  if(user){
    router.navigate(['/']);
    return false;
  }

  return true;
};
