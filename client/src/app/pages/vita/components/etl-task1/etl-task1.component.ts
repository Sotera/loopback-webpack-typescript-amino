import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'etl-task1-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./etl-task1.html'),
  styles: [require('./etl-task1.scss')]
})

export class EtlTask1 {
  public etlTask1Info:string = '<p>Hello CKEditor</p>';
  constructor() {
  }
}
