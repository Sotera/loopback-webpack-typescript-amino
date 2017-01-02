import {Component, ViewEncapsulation} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from "@angular/forms";
import {EmailValidator} from "../../../../../../theme/validators/email.validator";
import {PhoneNumberValidator} from "../../../../../../theme/validators/phoneNumber.validator";
import {AuthenticationService} from "../../../../../../_services/authentication.service";
import {AlertService} from "../../../../../../_services/alert.service";

@Component({
  selector: 'user-profile-form',
  encapsulation: ViewEncapsulation.None,
  template: require('./userProfileForm.html'),
})
export class UserProfileForm {
  constructor(private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private alertService: AlertService) {
    var userInfo = this.authenticationService.userInfo;
    this.formGroup = formBuilder.group({
      'id': [userInfo.id],
      'username': [userInfo.username, Validators.compose([Validators.required, Validators.minLength(4)])],
      'fullname': [userInfo.fullname, Validators.compose([Validators.required, Validators.minLength(4)])],
      'phone': [userInfo.phone],
      //'phone': [userInfo.phone, Validators.compose([PhoneNumberValidator.validate])],
      'email': [userInfo.email, Validators.compose([Validators.required, EmailValidator.validate])],
    });
    this.username = this.formGroup.controls['username'];
    this.fullname = this.formGroup.controls['fullname'];
    this.phone = this.formGroup.controls['phone'];
    this.email = this.formGroup.controls['email'];
  }

  public formGroup: FormGroup;
  public username: AbstractControl;
  public fullname: AbstractControl;
  public phone: AbstractControl;
  public email: AbstractControl;

  private submitted: boolean = false;

  onSubmit(userInfo: UserInfo) {
    this.submitted = true;
    if (this.formGroup.valid) {
      this.authenticationService.updateUserInfo(userInfo)
        .subscribe(
          (updateUserInfoResponse: UpdateUserInfoResponse) => {
            if (updateUserInfoResponse.status) {
              if (updateUserInfoResponse.status === 'error') {
                this.alertService.error(updateUserInfoResponse.error.message);
              } else if (updateUserInfoResponse.status === 'OK') {
                this.alertService.success(`User '${updateUserInfoResponse.userInfo.username}' updated`);
                this.authenticationService.updateUserInfoResponse = updateUserInfoResponse;
              }
            }
          },
          err => {
            this.alertService.error(err.message);
            this.submitted = false;
          });
    }
  }
}
