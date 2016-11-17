import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import {ETLService} from "../../../../_services/etl.service";
import {EtlFile} from "../../../../_models/flow.models";

@Component({
  selector: 'etl-activity-component',
  encapsulation: ViewEncapsulation.None,
  providers: [ETLService],
  template: require('./etl-activity.html'),
  styles: [
    require('./etl-activity.scss')
    // ,require('../../../../../../../node_modules/bootstrap/dist/css/bootstrap.min.css')
  ]
})

export class EtlActivity implements AfterViewInit{
  displayFiles: EtlFile[];
  detailStatus= false;

  constructor(private etlService: ETLService) {}

  ngAfterViewInit(): void {
    this.loadFiles();
  }

  loadFiles(){
    //get all files
    this.etlService.getFiles().subscribe(
      (etlFiles: EtlFile[]) => {this.displayFiles = etlFiles},
      err => {
        var e = err;
      });
  }

  showDetail(): void{
    this.detailStatus = !this.detailStatus;
  }

  deleteFile(fileId){
    this.etlService.deleteFile(fileId).subscribe(
      err => {
        var e = err;
      }
    );
    this.loadFiles();
  }

  processFile(etlTask){
    this.etlService.processFile(etlTask).subscribe(
      err => {
        var e = err;
      }
    );
    this.loadFiles();
  }


}


