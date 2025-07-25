import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // Skip adding token for auth endpoints
  const isAuthEndpoint =
    req.url.includes('/auth/') ||
    req.url.includes('/login') ||
    req.url.includes('/register');

  if (token && !isAuthEndpoint) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });

    console.log(
      'Interceptor - Added Authorization header:',
      authReq.headers.get('Authorization')
    );
    return next(authReq);
  }

  return next(req);
};
