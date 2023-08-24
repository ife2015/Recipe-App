import { createComponent } from '@angular/compiler/src/core';
import {
  Component,
  ComponentFactoryResolver,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  @ViewChild(PlaceholderDirective, { static: false })
  alertHost: PlaceholderDirective; // add as a typethen view child locatess the first ocurence of it in the Dom

  private closeSub: Subscription;
  constructor(
    private authService: AuthService,
    private route: Router,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {}

  onSubmit(form: NgForm) {
    let authObs: Observable<AuthResponseData>;

    if (!form.valid) {
      return;
    }
    const { email, password } = form.value;

    this.isLoading = true;
    if (this.isLoginMode) {
      authObs = this.signIn(email, password);
    } else {
      authObs = this.signUp(email, password);
    }

    authObs.subscribe(
      (responseData) => {
        console.log(responseData);
        this.isLoading = false;
        this.route.navigate(['/recipes']);
      },
      (error) => {
        this.isLoading = false;
        this.error = error;
        this.showErrorAlert(error);
      }
    );

    form.reset();
  }

  private signUp(email: string, password: string) {
    return this.authService.signUp(email, password);
  }

  private signIn(email: string, password: string) {
    return this.authService.signIn(email, password);
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onHandleError() {
    this.error = null;
  }

  private showErrorAlert(errorMessage: string) {
    // accesses the alert component via factory
    const alertCmpFactory =
      this.componentFactoryResolver.resolveComponentFactory(AlertComponent); // this is an object that know how to create the aler component

    // created with the help of a created directive in placeholder folder
    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear(); // clears whatever was previously there in the componet

    const componentRef = hostViewContainerRef.createComponent(alertCmpFactory); // creates the alert component,

    // the component instance should access properties in our alert  component
    componentRef.instance.message = errorMessage;
    this.closeSub = componentRef.instance.closeModal.subscribe(() => {
      this.closeSub.unsubscribe();
      hostViewContainerRef.clear();
    });
  }

  ngOnDestroy(): void {
    // if we have an active subscription we can unssubscribe
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }
}
