import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { csrftokenGuard } from '@guards/csrftoken.guard';

export const routes: Routes = [
    {
        path: '',
        canActivate: [csrftokenGuard],
        loadComponent: () => import('@modules/layout/components/layout/layout.component'),
        children: [
            {
                path: 'register',
                canActivate: [authGuard],
                loadComponent: () => import('@modules/auth/pages/register/register.component')
            },
            {
                path: 'login',
                canActivate: [authGuard],
                loadComponent: () => import('@modules/auth/pages/login/login.component')
            }
        ]
    }
];
