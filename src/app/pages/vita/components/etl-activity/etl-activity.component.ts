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
  private flowExpanded: boolean[][] = [];
  detailStatus = false;

  constructor(private postalService: PostalService) {
    let me = this;
    me.postalService.subscribe('EtlFile', 'AllFiles', (etlFiles: EtlFile[]) => {
      try {
        etlFiles.forEach(etlFile => {
          etlFile.flows.forEach(flow => {
            this.flowExpanded[flow.etlFileId] = this.flowExpanded[flow.etlFileId] || [];
            flow.expanded = this.flowExpanded[flow.etlFileId][flow.id];
          });
        });
        me.displayFiles = etlFiles;
      } catch (err) {
        alert(JSON.stringify(err));
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadFiles();
  }

  toggleFlowExpanded(flow) {
    this.flowExpanded[flow.etlFileId] = this.flowExpanded[flow.etlFileId] || [];
    flow.expanded
      = this.flowExpanded[flow.etlFileId][flow.id]
      = !this.flowExpanded[flow.etlFileId][flow.id];
  }

  testPostalSignal() {
    this.postalService.publish('TestSignal', 'ProdFirmamentVita', {}, PublishTarget.server);
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


