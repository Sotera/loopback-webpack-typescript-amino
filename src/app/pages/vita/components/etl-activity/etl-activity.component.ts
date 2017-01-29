import {Component, ViewEncapsulation, AfterViewInit} from '@angular/core';
import {PostalService, PublishTarget} from "../../../../_services/postal.service";
import {EtlFile} from "../../../../../../common/modelClasses/etl-file";

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


