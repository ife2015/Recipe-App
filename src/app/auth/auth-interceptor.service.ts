import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { exhaustMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  // How do we add the token now to this request?
  // Firebase we add the token as query parameter in the URL
  // Other APIs use the header in the request

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.authService.user.pipe(
      take(1),
      exhaustMap((user) => {
        // user.token
        if (!user) {
          return next.handle(req);
        }
        const modifiedRequest = req.clone({
          params: new HttpParams().set('auth', user.token),
        });
        return next.handle(modifiedRequest);
      })
    );
  }
}

// So our request fails before it even gets sent
// and that is actually stemming from our auth interceptor because there, we are using that logic for every
// outgoing request, including our sign-up and login requests.
// Now when that happens, what we try to do is we subscribe to the user service
// and we get null as a user. Since itss what we initialized our user with in
// auth service

// Take is also imported from rxjs/operator and take is
// called as a function and you simply pass a number to it and I pass one here
// and what this tells RxJS is that I only want to take one value from that observable and thereafter,
// it should automatically unsubscribe.

// We're in sunscribe of an observable and here we create another obsverable.
// We can't return an http observable from inside a subscribe
// we have to insteaad return on the top level. To solve we can pipe these 2 observables
// using exhaustMap

// Instead we start of with the user observable and once thats done,
// this will be replaced in the observable chain with the inner http observable
// we return inside of that function we pass to exhaustMap.
