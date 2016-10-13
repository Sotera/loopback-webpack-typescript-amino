import {Component, ViewEncapsulation} from '@angular/core';
import {UserDescriptionService} from "../../../../../../_services/user-description.service";
import {FormGroup, AbstractControl, FormBuilder, Validators} from "@angular/forms";
import {EmailValidator} from "../../../../../../theme/validators/email.validator";

@Component({
  selector: 'user-profile-form',
  encapsulation: ViewEncapsulation.None,
  template: require('./userProfileForm.html'),
})
export class UserProfileForm {
  constructor(
    private formBuilder: FormBuilder,
    private userDescriptionService: UserDescriptionService
  ) {
    this.formGroup = formBuilder.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
      ,'fullname': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'phone': ['', Validators.compose([Validators.minLength(4)])],
      'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
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

  ngOnInit() {
    this.formGroup.setValue(this.userDescriptionService.userInfo);
  }

  onSubmit(userInfo: BaseUserInfo) {
    alert(JSON.stringify(userInfo));
    this.submitted = true;
  }
}
