import {Component, ViewEncapsulation} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from "@angular/forms";
import {AlertService} from "../../../../../../_services/alert.service";
import {ETLService} from "../../../../../../_services/etl.service";

@Component({
  selector: 'etl-flow-form',
  providers: [ETLService],
  encapsulation: ViewEncapsulation.None,
  template: require('./etlFlowForm.html'),
})
export class EtlFlowForm {
  constructor(private formBuilder: FormBuilder,
              private etlService: ETLService,
              private alertService: AlertService) {

    this.formGroup = formBuilder.group({
      'id': [],
      'name': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
    });
    this.name = this.formGroup.controls['name'];
    this.id = this.formGroup.controls['id'];
  }

  public formGroup: FormGroup;
  public name: AbstractControl;
  public id: AbstractControl;

  private submitted: boolean = false;

  // onSubmit(flowInfo: FlowInfo) {
  //   this.submitted = true;
  //   if (this.formGroup.valid) {
  //     this.etlService.updateFlow(flowInfo)
  //       .subscribe(
  //         (updateUserInfoResponse: UpdateUserInfoResponse) => {
  //           if (updateUserInfoResponse.status) {
  //             if (updateUserInfoResponse.status === 'error') {
  //               this.alertService.error(updateUserInfoResponse.error.message);
  //             } else if (updateUserInfoResponse.status === 'OK') {
  //               this.alertService.success(`User '${updateUserInfoResponse.userInfo.username}' updated`);
  //               this.authenticationService.updateUserInfoResponse = updateUserInfoResponse;
  //             }
  //           }
  //         },
  //         err => {
  //           this.alertService.error(err.message);
  //           this.submitted = false;
  //         });
  //   }
  // }
}
