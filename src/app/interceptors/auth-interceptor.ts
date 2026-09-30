import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

   console.log('Interceptor:', req.url);
   console.log('JWT exists:', !!token);

  if (token) {

    req = req.clone({
      setHeaders: {
        'X-Client-Token': token,
        Authorization: `Bearer ${token}`
      }
    });

  }
  console.log('Authorization header added');

  return next(req);

};