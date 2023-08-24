import { Injectable } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  // need authservice to determine is a user is authenticated or not
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean {
    // we don't subscribe here but return it instead
    // nbcecause this is already an observable, its a subject
    // and therefore also an observable, but still needs to return
    // a boolean value
    return this.authService.user.pipe(
      // Here we have an ongoing subscription, this user subject can emit
      // data mroe than once which can lead to strange side effects,
      // so  we user take 1 to enssure that we use the latest user value
      // and then unsubscribe for this guard execution
      take(1),
      map((user) => {
        // returns true or false if a user is authenticated or not
        // convertss anything that is not null or undefined to  true
        const isAuth = !!user;
        if (isAuth) {
          return true;
        }

        // we can instead return a urL treem which can be created with the router
        // which you still need to inject therefore but there call "createURLTree"
        // to redirect the user to the login page, if they want to an endpoint to be
        // accessed
        return this.router.createUrlTree(['/auth']);
      })
      // previous approach
      // tap((isAuth) => {
      //   // nothing wrong with this, but could lead to some edge cases
      //   // like race conditions with multiple redirects
      //   // that interfere with each other
      //   if (!isAuth) {
      //     this.router.navigate(['/auth']);
      //   }
      // })
    );
  }
}

//URL Tree
// This is a relatively new feature and it was added basically
// for this exact use case for authentication, it was added so that
// you can redirect users when the URL they're trying to visit is blocked. So for
