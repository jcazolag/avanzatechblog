import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { csrftokenGuard } from '@guards/csrftoken.guard';
import { userGuard } from '@guards/user.guard';
import { notCsrfTokenGuard } from '@guards/not-csrf-token.guard';

export const routes: Routes = [
    {
        path: '',
        canActivate: [csrftokenGuard],
        loadComponent: () => import('@modules/layout/components/layout/layout.component'),
        children: [
            {
                path: '',
                loadComponent: () => import('@modules/blog/pages/list/list.component')
            },
            {
                path: 'register',
                canActivate: [userGuard],
                loadComponent: () => import('@modules/auth/pages/register/register.component')
            },
            {
                path: 'login',
                canActivate: [userGuard],
                loadComponent: () => import('@modules/auth/pages/login/login.component')
            },
            {
                path: 'post-create',
                canActivate: [authGuard],
                loadComponent: () => import('@modules/blog/pages/create-post/create-post.component')
            },
            {
                path: 'post/:post_id',
                loadComponent: () => import('@modules/blog/pages/detail/detail.component')
            }
        ]
    },
    {
        path: 'internal-server-error',
        canActivate: [notCsrfTokenGuard],
        loadComponent: () => import('@modules/layout/components/layout/layout.component'),
        children: [
            {
                path: '',
                loadComponent: () => import('@modules/layout/pages/server-error-page/server-error-page.component')
            }
        ],
    },
    {
        path: '**',
        loadComponent: () => import('@modules/layout/components/layout/layout.component'),
        children: [
            {
                path: '',
                loadComponent: () => import('@modules/layout/pages/not-found/not-found.component')
            }
        ],
    }
];
