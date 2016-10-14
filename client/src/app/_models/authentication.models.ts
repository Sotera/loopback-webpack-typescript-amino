export class UserInfoImpl implements UserInfo {
  constructor(public json: string) {
    var userInfo = JSON.parse(json);
    this.username = userInfo.username || '';
    this.fullname = userInfo.fullname || '';
    this.email = userInfo.email || '';
    this.phone = userInfo.phone || '';
    this.id = userInfo.id || '';
  }

  public username: string;
  public fullname: string;
  public email: string;
  public phone: string;
  public id: string;
}
export class UserRegistrationInfo extends UserInfoImpl {
  public password: string;

  constructor(rfs: RegistrationFormSubmission) {
    super(JSON.stringify({
      username: rfs.username,
      fullname: rfs.fullname,
      email: rfs.email,
      phone: rfs.phone
    }));
    this.password = rfs.passwords.password;
  }
}

