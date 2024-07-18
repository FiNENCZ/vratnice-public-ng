import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InfoDialog } from '../dialog/info-dialog/info.dialog';
import { IkonaDialogEnum } from '../enums/ikona-dialog.enum';

@Injectable({
  providedIn: 'root',
})
export class InfoDialogService {

  constructor(
    private readonly dialogService: DialogService
  ) { }

  showInfoDialog(hlavicka: string, text: string, ikona: IkonaDialogEnum): DynamicDialogRef {
    return this.dialogService.open(InfoDialog, {
      data: {
        ikona: ikona,
        text: text
      },
      header: hlavicka
    });
  }

}
