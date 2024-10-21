import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PovoleniVjezduVozidlaControllerService, PovoleniVjezduVozidlaDto, RzTypVozidlaDto, ZavodControllerService } from 'build/openapi';
import { ConfirmationService, MessageService } from 'primeng/api';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { DetailBaseClass } from 'src/app/shared/pages/base/detail-base.class';
import { DialogModule } from 'primeng/dialog';
import { AppComponent } from 'src/app/app.component';
import { CommonModule } from '@angular/common';
import { getErrorMessage } from 'src/app/functions/get-error-message.function';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { UiService } from 'src/app/shared/services/ui.service';
import { LoadingService } from 'src/app/servis/loading.service';



@Component({
  selector: 'app-detail-zpracovani-osobnich-udaju',
  standalone: true,
  imports: [DialogModule, TranslateModule, AppComponent, CommonModule],
  providers: [ConfirmationService, TranslateService],
  templateUrl: './detail-zpracovani-osobnich-udaju.page.html',
  styleUrls: ['./detail-zpracovani-osobnich-udaju.page.css']
})
export class DetailZpracovaniOsobnichUdaju extends DetailBaseClass {
  @ViewChild('inputImportCSV') inputImportCSV?: ElementRef;

  @Output() rzTypVozidla = new EventEmitter<RzTypVozidlaDto>();

  povoleniVjezduVozidel: PovoleniVjezduVozidlaDto[] = [];

  constructor(
    confirmationService: ConfirmationService,
    translateService: TranslateService,
    elementRef: ElementRef,
    private readonly messageService: MessageService,
    //private readonly uiService: UiService,
    //private readonly authService: AuthService,
    private readonly loadingService: LoadingService,
    private readonly povoleniVjezduVozidlaControllerService: PovoleniVjezduVozidlaControllerService,
    private readonly zavodControllerService: ZavodControllerService,
    private readonly recaptchaService: ReCaptchaV3Service,
    
  ) {
    super(confirmationService, translateService, elementRef);
  }


  showNovyDetail() {
    this.novyDetail();
    this.displayDetail = true;
  }

  novyDetail() {
  }

  sendTypRzVozidla(rzTypVozidlaDto: RzTypVozidlaDto) {
    this.rzTypVozidla.emit(rzTypVozidlaDto);
  }

 

  private isObjectEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }



  onCsvSelected(event: any): void {
    this.loadingService.show() ;
    const file: File = event.target.files[0];
    if (file) {
      this.recaptchaService.execute('save').subscribe((token) => {
        this.povoleniVjezduVozidlaControllerService.rzTypVozidlaCsvPovoleniVjezduVozidla(token!, file, this.translateService.currentLang)
        .subscribe(
            response => {
              this.loadingService.hide() ;
              this.messageService.add({ severity: 'success', detail: this.translateService.instant('POVOLENI_VJEZDU_VOZIDLA.VOZIDLA_NACTENA'), closable: false });
              this.sendTypRzVozidla(response);
            },
            error => {
              this.loadingService.hide() ;
              console.error(error);
              this.messageService.add({ severity: 'error', detail: getErrorMessage(error), closable: false });
            }
        );
      });
    }

    console.log(this.translateService.currentLang);

    if (this.inputImportCSV) {
      this.inputImportCSV.nativeElement.value = '';
    }

    
  }

  importCSV(){
    document.getElementById("inputImportCSV")?.click();
  }

}
