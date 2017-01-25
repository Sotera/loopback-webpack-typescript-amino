import {Component, ViewEncapsulation, AfterViewInit} from '@angular/core';
import {ETLService} from "../../../../_services/etl.service";
import {EtlFile} from "../../../../_models/flow.models";
import {PostalService, PublishTarget} from "../../../../_services/postal.service";

@Component({
  selector: 'etl-activity-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./etl-activity.html'),
  styles: [
    require('./etl-activity.scss')
  ]
})

export class EtlActivity implements AfterViewInit {
  displayFiles: EtlFile[];
  detailStatus = false;

  constructor(private postalService: PostalService) {
    let me = this;
    me.postalService.subscribe('EtlFile', 'AllFiles', (etlFiles) => {
      me.displayFiles = etlFiles;
    });
  }

  ngAfterViewInit(): void {
    this.loadFiles();
  }

  loadFiles() {
    this.postalService.publish('EtlFile', 'GetAllFiles', {}, PublishTarget.server);
  }

  showDetail(): void {
    this.detailStatus = !this.detailStatus;
  }

  deleteFile(id) {
    this.postalService.publish('EtlFile', 'Delete', {id}, PublishTarget.server);
  }

  processFile(etlTask) {
    this.postalService.publish('EtlTask', 'AddTask', etlTask, PublishTarget.server);
  }
}


