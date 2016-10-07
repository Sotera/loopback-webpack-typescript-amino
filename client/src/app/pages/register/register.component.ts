import {Component, ViewEncapsulation} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {EmailValidator, EqualPasswordsValidator} from '../../theme/validators';
import {AuthenticationService} from "../../_services/authentication.service";
import {AppDescriptionService} from "../../_services/app-description.service";
import {AlertService} from "../../_services/alert.service";

@Component({
  selector: 'register',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./register.scss')],
  template: require('./register.html'),
})
export class Register {

  public form: FormGroup;
  public username: AbstractControl;
  public fullname: AbstractControl;
  public email: AbstractControl;
  public password: AbstractControl;
  public repeatPassword: AbstractControl;
  public passwords: FormGroup;

  public submitted: boolean = false;

  constructor(private fb: FormBuilder,
              private authenticationService: AuthenticationService,
              public appDescriptionService: AppDescriptionService,
              private alertService: AlertService) {
    this.form = fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'fullname': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
      'passwords': fb.group({
        'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
        'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
      }, {validator: EqualPasswordsValidator.validate('password', 'repeatPassword')})
    });

    this.username = this.form.controls['username'];
    this.fullname = this.form.controls['fullname'];
    this.email = this.form.controls['email'];
    this.passwords = <FormGroup> this.form.controls['passwords'];
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
  }

  public onSubmit(registrationUserInfo: RegistrationUserInfo): void {
    this.submitted = true;
    var loginUserInfo: LoginUserInfo = {
      username: registrationUserInfo.username,
      fullname: registrationUserInfo.fullname,
      email: registrationUserInfo.email,
      password: registrationUserInfo.passwords.password
    };
    if (this.form.valid) {
      this.authenticationService.register(loginUserInfo)
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
