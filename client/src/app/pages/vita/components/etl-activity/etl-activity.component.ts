import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import {ETLFlowService} from "../../../../_services/etlFlow.service";
import {EtlFile, EtlFlow, EtlStep, EtlResource} from "../../../../_models/flow.models";

@Component({
  selector: 'etl-activity-component',
  encapsulation: ViewEncapsulation.None,
  providers: [ETLFlowService],
  template: require('./etl-activity.html'),
  styles: [require('./etl-activity.scss')]
})

export class EtlActivity implements AfterViewInit{
  displayFlows: EtlFlow[];

  constructor(private etlFlowService: ETLFlowService) {

  }

  ngAfterViewInit(): void {
    this.loadFlows();
  }

  loadFlows(){
    //get all flows
    this.etlFlowService.getAll().subscribe(
      (etlFlows: EtlFlow[]) => {this.displayFlows = etlFlows},
      err => {
        var e = err;
      });
  }


}


