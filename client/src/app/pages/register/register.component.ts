import {Component, ViewEncapsulation} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {EmailValidator, EqualPasswordsValidator} from '../../theme/validators';
import {AuthenticationService} from "../../_services/authentication.service";
import {AppDescriptionService} from "../../_services/app-description.service";
import {AlertService} from "../../_services/alert.service";
import {Router} from "@angular/router";
import {UserRegistrationInfo} from "../../_models/authentication.models";
import {PhoneNumberValidator} from "../../theme/validators/phoneNumber.validator";

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
  public phone: AbstractControl;
  public password: AbstractControl;
  public repeatPassword: AbstractControl;
  public passwords: FormGroup;

  public submitted: boolean = false;

  constructor(private fb: FormBuilder,
              private authenticationService: AuthenticationService,
              private router: Router,
              public appDescriptionService: AppDescriptionService,
              private alertService: AlertService) {
    this.form = fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'fullname': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
      'phone': ['', Validators.compose([PhoneNumberValidator.validate])],
      'passwords': fb.group({
        'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
        'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
      }, {validator: EqualPasswordsValidator.validate('password', 'repeatPassword')})
    });

    this.username = this.form.controls['username'];
    this.fullname = this.form.controls['fullname'];
    this.email = this.form.controls['email'];
    this.phone = this.form.controls['phone'];
    this.passwords = <FormGroup> this.form.controls['passwords'];
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
  }

  public get appName(): string {
    return this.appDescriptionService.appName;
  }

  public onSubmit(submissionData: RegistrationFormSubmission): void {
    this.submitted = true;
    if (this.form.valid) {
      this.authenticationService.register(new UserRegistrationInfo(submissionData))
        .subscribe(
          (registrationResponse: RegistrationResponse) => {
            if (registrationResponse.status) {
              if (registrationResponse.status === 'error') {
                this.alertService.error(registrationResponse.error.message);
              } else if (registrationResponse.status === 'OK') {
                this.alertService.success(`User '${registrationResponse.newUser.username}' created`);
                setTimeout(()=> {
                  this.router.navigate(['/']);
                }, 1000);
              }
            }
          },
          err => {
            this.alertService.error(error.message);
            this.submitted = false;
          });
    }
  }
}
