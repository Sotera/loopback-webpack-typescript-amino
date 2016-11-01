import { Component, ViewEncapsulation, Injectable } from '@angular/core';
import {EtlFileApi as EtlService} from '/client/app/lb-services';
import {HTTP_PROVIDERS} from 'angular/http';

@Component({
  selector: 'etl-activity-component',
  providers: [
      EtlService,
      HTTP_PROVIDERS
  ],
  // encapsulation: ViewEncapsulation.None,
  template: require('./etl-activity.html'),
  styles: [require('./etl-activity.scss')]
})

export class EtlActivity {
  public etlActivityInfo:string = '<p>Hello ETLActivity</p>';

  xyz = 'mike';

  constructor(protected etl: EtlService) {
    // let self = this;
    // this.getData();

    // Example 3
    this.etl.EtlService.count().subscribe((response: any) => {
      let lastRow = response.count;
      //
      // let data = this.etl.EtlService
      // // Example 4
      // .find({
      //   offset: 0,
      //   limit: 100
      // })
      // .subscribe(function(response: any) {
      //   // Process response
      // });
    });
  }
}
