import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthControllerService } from 'build/openapi';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { errorTxtFunction } from '../../functions/error-txt.function';


@Component({
  templateUrl: './auto-logout-dialog.html',
  styleUrls: ['./auto-logout-dialog.scss']
})

export class AutoLogoutDialog {

  constructor(
    readonly authService: AuthService,
    private readonly dynamicDialogRef: DynamicDialogRef,
    private readonly uiService: UiService,
    private readonly translateService: TranslateService,
    private readonly authControllerService: AuthControllerService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly dynamicDialogConfig: DynamicDialogConfig
  ) {
    this.translateService.get('AUTO_LOGOUT.NADPIS').subscribe((nadpis: string) => {
      dynamicDialogConfig.baseZIndex = 10000;
      dynamicDialogConfig.modal = true;
      dynamicDialogConfig.styleClass = 'logout-dialog';
      dynamicDialogConfig.draggable = false;
      dynamicDialogConfig.position = "top";
      dynamicDialogConfig.header = nadpis;
    });
  }

  odhlasit() {
    this.uiService.showSpinner();
    this.authService.logout().subscribe({
      next: () => { 
        this.dynamicDialogRef.close(false);
        this.uiService.stopSpinner();
       },
      error: (error) => {
        if (error.status == 504) {
          this.messageService.add({ severity: 'error', summary: "Server neodpovídá. Zkuste to později." });
        } else {
          this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
        }
      }
    });
    // this.authService.logout().subscribe({
    //   next: () => {
    //     this.dynamicDialogRef.close(false);
    //     //console.log("zaviram okno");
    //     this.router.navigate(['neaktivita', { timer: true }]).then(() => {
    //       this.uiService.stopSpinner();
    //       document.defaultView?.location.reload();
    //     });
    //   },
    //   error: (error) => {
    //     this.uiService.stopSpinner();
    //     this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
    //   }
    // })
  }

  zustatPrihlasen() {
    this.uiService.showSpinner();
    this.authControllerService.authenticateAuth(this.translateService.currentLang).subscribe({
      next: () => {
        this.dynamicDialogRef.close(true);
        this.uiService.stopSpinner();
      },
      error: (error) => {
        this.uiService.stopSpinner();
        this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
      }
    })
  }

}
