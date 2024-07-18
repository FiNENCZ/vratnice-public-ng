import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AutoLogoutDialog } from '../dialog/auto-logout-dialog/auto-logout-dialog';

@Injectable({
  providedIn: 'root',
})
export class AutoLogoutDialogService {

  constructor(
    private readonly dialogService: DialogService
  ) { }

  showDialog(): DynamicDialogRef {
    return this.dialogService.open(AutoLogoutDialog, {});
  }

}
