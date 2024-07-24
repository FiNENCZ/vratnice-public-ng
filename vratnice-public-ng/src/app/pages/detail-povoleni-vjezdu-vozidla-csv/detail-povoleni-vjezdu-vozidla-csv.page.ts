import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PovoleniVjezduVozidlaControllerService, PovoleniVjezduVozidlaDto, ZavodControllerService } from 'build/openapi';
import { ConfirmationService, MessageService } from 'primeng/api';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { DetailBaseClass } from 'src/app/shared/pages/base/detail-base.class';
import { DialogModule } from 'primeng/dialog';
import { AppComponent } from 'src/app/app.component';
import { CommonModule } from '@angular/common';
import { getErrorMessage } from 'src/app/functions/get-error-message.function';


@Component({
  selector: 'app-detail-povoleni-vjezdu-vozidla-csv',
  standalone: true,
  imports: [DialogModule, TranslateModule, AppComponent, CommonModule],
  providers: [ConfirmationService, TranslateService],
  templateUrl: './detail-povoleni-vjezdu-vozidla-csv.page.html',
  styleUrls: ['./detail-povoleni-vjezdu-vozidla-csv.page.css']
})
export class DetailPovoleniVjezduVozidlaCsvPage extends DetailBaseClass {
  @ViewChild('inputImportCSV') inputImportCSV?: ElementRef;

  povoleniVjezduVozidel: PovoleniVjezduVozidlaDto[] = [];

  constructor(
    confirmationService: ConfirmationService,
    translateService: TranslateService,
    elementRef: ElementRef,
    private readonly messageService: MessageService,
    //private readonly uiService: UiService,
    //private readonly authService: AuthService,
    private readonly povoleniVjezduVozidlaControllerService: PovoleniVjezduVozidlaControllerService,
    private readonly zavodControllerService: ZavodControllerService,
  ) {
    super(confirmationService, translateService, elementRef);
  }


  showNovyDetail() {
    this.novyDetail();
    this.displayDetail = true;
  }

  novyDetail() {
  }

 

  private isObjectEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }



  onCsvSelected(event: any): void {
    //this.uiService.showSpinner();
    const file: File = event.target.files[0];
    if (file) {
      this.povoleniVjezduVozidlaControllerService.povoleniCsvPovoleniVjezduVozidla(file, this.translateService.currentLang)
      .subscribe(
          response => {
            //this.uiService.stopSpinner();
            this.messageService.add({ severity: 'success', detail: this.translateService.instant('POVOLENI_VJEZDU_VOZIDLA.ZADOSTI_PODANY'), closable: false });
            this.refreshSeznamToken$?.next(undefined);
          },
          error => {
            //this.uiService.stopSpinner();
            this.messageService.add({ severity: 'error', detail: getErrorMessage(error), closable: false });
          }
      );
    }

    if (this.inputImportCSV) {
      this.inputImportCSV.nativeElement.value = '';
    }

    
  }


  importCSV(){
    document.getElementById("inputImportCSV")?.click();
  }
}
