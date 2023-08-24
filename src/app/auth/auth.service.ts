import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './user.model';

export interface AuthResponseData {
  kind?: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //user = new Subject<User>();
  // the subject allows us subscribe and get new information whenever new data is emitted
  user = new BehaviorSubject<User>(null);
  // allows us to call next, to emit a vlue and we can subscribe to it to be informed about new values
  // behavior subject give subscibers immediate access to the previously emitted value
  private tokenExpirationTimer: any;
  constructor(private http: HttpClient, private router: Router) {}

  signUp(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDvh9oW4ug8i-zuRBrm7tF3pW-3qx3x4xE',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((res) => {
          this.handleAuthentication(
            res.email,
            res.localId,
            res.idToken,
            +res.expiresIn
          );
        })
      );
  }

  signIn(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDvh9oW4ug8i-zuRBrm7tF3pW-3qx3x4xE',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        tap((res) => {
          this.handleAuthentication(
            res.email,
            res.localId,
            res.idToken,
            +res.expiresIn
          );
        })
      );
  }

  autoSignIn() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    // check if thhe user has a valid token
    // in our user model we created a getter to determine validity
    if (loadedUser.token) {
      // here we can access this user, our subject, call next and forward the loaded user
      // as our new authenticated user
      this.user.next(loadedUser);

      // Our expiration duration is the token expiration date minuues the current times stamp
      // the difference gives us the difference in millisec and thatss the duration we have
      // until the token expires.
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogOut(expirationDuration);
    }
  }

  logOut() {
    // In the end, we just use our user subject and
    // we call next and we pass null, to set our user to null.
    this.user.next(null); // forwards a null user
    // That's our initial state and that's now the state again and
    // this will make sure that our entire application treats the user
    // as unauthenticated

    this.router.navigate(['auth']); // navigates back to login page
    localStorage.removeItem('userData'); //clears user data in storage

    // checks if we have an active timer
    if (this.tokenExpirationTimer) {
      // clears the timeout
      clearTimeout(this.tokenExpirationTimer);
    }

    // sets token expiration timer back to null manually
    this.tokenExpirationTimer = null;
  }

  // expirationDuration: amount of milliseconds we have until the token is invalid
  autoLogOut(expirationDuration: number) {
    // we need to set a timer when the token is sstored
    // or when we first get a token

    this.tokenExpirationTimer = setTimeout(() => {
      this.logOut();
    }, expirationDuration);

    //Now where do we need to call that?
    //Basically whenever we emit a new user to our application, so whenever we use our user subject
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    // expiredIn holds a number, the number of seconds until the ID token expires
    // Date().getTime() - milliseconds
    // +expiresIn * 1000 - converts expiresIn to milliseconds
    // expiresIn  - # of seconds in which the ID token expires
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);

    this.user.next(user); // emits info for currently logged in user
    this.autoLogOut(expiresIn * 1000); // starts auto logout countdown (converts sec to milliseconds)
    localStorage.setItem('userData', JSON.stringify(user)); // sets user data in the local storage
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occured';

    // might not be in the format that matches the switch statement
    // conditional to prevent if not nested in the way used in the
    // switchh statement
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }

    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists';
        break;
      case 'OPERATION_NOT_ALLOWED':
        errorMessage = 'Password sign-in is disabled for this project.';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMessage =
          ' We have blocked all requests from this device due to unusual activity. Try again later.';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = `There is no user record corresponding to this identifier. The user may have been deleted.`;
        break;
      case 'INVALID_PASSWORD':
        errorMessage =
          'The password is invalid or the user does not have a password';
        break;
      case 'USER_DISABLED':
        errorMessage =
          'The user account has been disabled by an administrator.';
        break;
    }

    return throwError(errorMessage);
  }
}

//We can work with cookies or with local storage, which is an API exposed
//by the browser to store simple key-value pairs
//and we will use local storage here to store that token.
