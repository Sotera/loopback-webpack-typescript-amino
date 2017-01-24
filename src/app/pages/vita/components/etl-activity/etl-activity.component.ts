import {Component, ViewEncapsulation, AfterViewInit} from '@angular/core';
import {ETLService} from "../../../../_services/etl.service";
import {EtlFile} from "../../../../_models/flow.models";
import {PostalService, PublishTarget} from "../../../../_services/postal.service";

@Component({
  selector: 'etl-activity-component',
  encapsulation: ViewEncapsulation.None,
  //providers: [ETLService, PostalService],
  template: require('./etl-activity.html'),
  styles: [
    require('./etl-activity.scss')
    // ,require('../../../../../../../node_modules/bootstrap/dist/css/bootstrap.min.css')
  ]
})

export class EtlActivity implements AfterViewInit {
  displayFiles: EtlFile[];
  detailStatus = false;

  constructor(private etlService: ETLService,
              private postalService: PostalService) {
  }

  ngAfterViewInit(): void {
    let me = this;
    me.loadFiles();
    me.postalService.subscribe('EtlFile', 'AllFiles', (data, env) => {
      me.displayFiles = data;
    });
  }

/*  luvFiles() {
  }*/

  loadFiles() {
    this.postalService.publish('EtlFile', 'GetAllFiles', {}, PublishTarget.server);
  }

  showDetail(): void {
    this.detailStatus = !this.detailStatus;
  }

  deleteFile(fileId) {
    this.etlService.deleteFile(fileId).subscribe(
      err => {
        var e = err;
      }
    );
    this.loadFiles();
  }

  processFile(etlTask) {
    this.postalService.publish('EtlTask', 'AddTask', etlTask, PublishTarget.server);
  }
}


