import {Component, ViewEncapsulation, AfterViewInit} from '@angular/core';

@Component({
  selector: 'etl-flow-component',
  encapsulation: ViewEncapsulation.None,
  template: require('./etl-flow.html'),
  styles: [
    require('./etl-flow.scss')
  ]
})

export class EtlFlow implements AfterViewInit {
  displayFlows: EtlFlow[];
  detailStatus = false;

  constructor(){}

  ngAfterViewInit(): void {
    this.loadFlows();
  }

  loadFlows() {
    //get all flows
/*    this.etlService.getFlows().subscribe(
      (etlFlows: EtlFlow[]) => {
        this.displayFlows = etlFlows
      },
      err => {
        var e = err;
      });*/
  }

  // addStep(flow){
  //   alert('add Step to Flow' + flow.id);
  // }
  //
  // deleteStep(flowStep){
  //   this.etlService.deleteStep(flowStep).subscribe(
  //     err => {
  //       var e = err;
  //     }
  //   );
  //   this.loadFlows();
  // }
  //
  // processStep(flowId,etlStep){
  //   this.etlService.processStep(flowId, etlStep).subscribe(
  //     err => {
  //       var e = err;
  //     }
  //   );
  //   this.loadFlows();
  // }
  //
  // showDetail(): void{
  //   this.detailStatus = !this.detailStatus;
  // }
}



