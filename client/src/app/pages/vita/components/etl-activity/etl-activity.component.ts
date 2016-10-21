import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'etl-activity-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./etl-activity.html'),
  styles: [require('./etl-activity.scss')]
})

export class EtlActivity {
  public etlActivityInfo:string = '<p>Hello ETLActivity</p>';
  constructor() {
  }
}
