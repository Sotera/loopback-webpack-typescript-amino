import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'user-profile',
  encapsulation: ViewEncapsulation.None,
  styles: [],
  template: require('./user-profile.html'),
})
export class UserProfile {

  public defaultPicture = 'assets/img/theme/no-photo.png';
  public profile:any = {
    picture: 'assets/img/app/profile/Nasta.png'
  };
  public uploaderOptions:any = {
    // url: 'http://website.com/upload'
  };

  constructor() {
  }

  ngOnInit() {
  }
}
