import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import {ETLService} from "../../../../_services/etl.service";
import {EtlFlow, EtlStep} from "../../../../_models/flow.models";

@Component({
  selector: 'etl-flow-component',
  encapsulation: ViewEncapsulation.None,
  providers: [ETLService],
  template: require('./etl-flow.html'),
  styles: [require('./etl-flow.scss')]
})

export class EtlFlow implements AfterViewInit{
  displayFlows: EtlFlow[];

  constructor(private etlService: ETLService) {}

  ngAfterViewInit(): void {
    this.loadFlows();
  }

  loadFlows(){
    //get all flows
    this.etlService.getFlows().subscribe(
      (etlFlows: EtlFlow[]) => {this.displayFlows = etlFlows},
      err => {
        var e = err;
      });
  }

  addStep(flow){
    alert('add Step to Flow' + flow.id);
  }

  deleteStep(flowStep){
    this.etlService.deleteStep(flowStep).subscribe(
      err => {
        var e = err;
      }
    );
    this.loadFlows();
  }

  processStep(etlStep){
    this.etlService.processStep(etlStep).subscribe(
      err => {
        var e = err;
      }
    );
    this.loadFlows();
  }
}



