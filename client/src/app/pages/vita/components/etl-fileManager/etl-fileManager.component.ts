import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'etl-task1-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./etl-fileManager.html'),
  styles: [require('./etl-fileManager.scss')]
})

export class EtlFileManager {
  constructor() {
  }
}
