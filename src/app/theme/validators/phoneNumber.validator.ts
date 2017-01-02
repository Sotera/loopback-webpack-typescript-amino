import {AbstractControl} from '@angular/forms';

export class PhoneNumberValidator {
  public static validate(c:AbstractControl) {
    if(!c.value.length){
      return true;
    }
    let PHONENUMBER_REGEX = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

    return PHONENUMBER_REGEX.test(c.value);
/*    ? null : {
      validatePhoneNumber: {
        valid: false
      }
    };*/
  }
}
