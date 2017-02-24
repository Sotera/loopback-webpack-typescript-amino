import {Component, ViewEncapsulation, AfterViewInit} from '@angular/core';
import {PostalService, PublishTarget} from '../../../../_services/postal.service';
import {EtlFile, EtlFlow} from "../../../../../../node_modules/etl-typings/index";

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
        etlFiles.forEach((etlFile) => {
          etlFile.flows.forEach((etlFlow) => {
            me.flowExpanded[etlFlow.parentAminoId] = me.flowExpanded[etlFlow.parentAminoId] || [];
            etlFlow.expanded = me.flowExpanded[etlFlow.parentAminoId][etlFlow.id];
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

  toggleFlowExpanded(etlFlow: EtlFlow) {
    this.flowExpanded[etlFlow.parentAminoId] = this.flowExpanded[etlFlow.parentAminoId] || [];
    etlFlow.expanded
      = this.flowExpanded[etlFlow.parentAminoId][etlFlow.id]
      = !this.flowExpanded[etlFlow.parentAminoId][etlFlow.id];
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


