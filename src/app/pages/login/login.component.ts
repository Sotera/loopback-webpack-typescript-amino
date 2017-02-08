import {Component} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {Router} from "@angular/router";
import {AuthenticationService} from "../../_services/authentication.service";
import {AlertService} from "../../_services/alert.service";
import {AppDescriptionService} from "../../_services/app-description.service";

import 'style-loader!./login.scss';

@Component({
  selector: 'login',
  templateUrl: './login.html',
})
export class Login {

  public form: FormGroup;
  public username: AbstractControl;
  public password: AbstractControl;
  public submitted: boolean = false;

  constructor(private fb: FormBuilder,
              private router: Router,
              private authenticationService: AuthenticationService,
              public appDescriptionService: AppDescriptionService,
              private alertService: AlertService) {
    this.form = fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
    });

    this.username = this.form.controls['username'];
    this.password = this.form.controls['password'];
  }

  public get appName(): string {
    return this.appDescriptionService.appName;
  }

  ngAfterViewInit() {
    this.authenticationService.logout();
  }

  public onSubmit(loginUserInfo: LoginFormSubmission): void {
    this.submitted = true;
    if (this.form.valid) {
      this.authenticationService.login(loginUserInfo)
        .subscribe(
          (loginResponse: LoginResponse) => {
            if (loginResponse.status) {
              if (loginResponse.status === 'error') {
                this.alertService.error('Login failed');
              } else if (loginResponse.status === 'OK') {
                this.alertService.success(`User '${loginResponse.userInfo.username}' logged in`);
                this.authenticationService.loginResponse = loginResponse;
                setTimeout(() => {
                  this.router.navigate(['/pages']);
                }, 1000);
              }
            }
          },
          error => {
            this.alertService.error(error);
            this.submitted = false;
          });
    }
  }
}

