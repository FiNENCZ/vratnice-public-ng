import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IkonaDialogEnum } from '../../enums/ikona-dialog.enum';


@Component({
  templateUrl: './info.dialog.html'
})

export class InfoDialog {

  IkonaDialogEnum = IkonaDialogEnum;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    //console.log(this.config);
    config.baseZIndex = 10000;
    config.modal = true;
  }

  zavrit(){
    this.ref.close();
  }

  // ngOnInit() {
  //   console.log(this.config);
  // }

}
