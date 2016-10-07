import {Component, ViewEncapsulation, OnInit} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {Router} from "@angular/router";
import {AuthenticationService} from "../../_services/authentication.service";
import {AlertService} from "../../_services/alert.service";
import {AppDescriptionService} from "../../_services/app-description.service";

@Component({
  selector: 'login',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./login.scss')],
  template: require('./login.html'),
})
export class Login implements OnInit {
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

  ngOnInit(): void {
    this.authenticationService.logout();
  }

  public onSubmit(loginUserInfo: LoginUserInfo): void {
    this.submitted = true;
    if (this.form.valid) {
      this.authenticationService.login(loginUserInfo)
        .subscribe(
          loginResponse => {
            var l = loginResponse;
            //this.router.navigate(['/']);
          },
          error => {
            this.alertService.error(error);
            this.submitted = false;
          });
    }
  }
}
