import { Component, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ZavodControllerService, ZavodDto } from 'build/openapi';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RezimDetailuEnum } from 'src/app/shared/enums/rezim-detailu.enum';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { newZavodDto } from 'src/app/shared/functions/zavod.dto.function';
import { DetailBaseClass } from 'src/app/shared/pages/base/detail-base.class';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UiService } from 'src/app/shared/services/ui.service';

@Component({
  selector: 'app-detail-zavod',
  templateUrl: './detail-zavod.page.html'
  // styleUrls: ['./detail-zavod.page.css']
})

export class DetailZavodPage extends DetailBaseClass {
  detail?: ZavodDto = newZavodDto();
  idZaznamu?: string;

  constructor(
    confirmationService: ConfirmationService,
    translateService: TranslateService,
    elementRef: ElementRef,
    private readonly messageService: MessageService,
    private readonly uiService: UiService,
    private readonly authService: AuthService,
    private readonly zavodControllerService: ZavodControllerService
  ) { super(confirmationService, translateService, elementRef) }

  showNovyDetail() {
    this.novyDetail();
    this.idZaznamu = undefined;
    this.displayDetail = true;
  }

  novyDetail() {
    this.formDetail?.form.markAsPristine();
    this.rezimDetailu = RezimDetailuEnum.Novy;

    this.detail = newZavodDto();
  }

  ulozit(form: NgForm) {

    if (form.pending) {
      return;
    }
    if (form.invalid) {
      Object.keys(form.control.controls).forEach(field => {
        const control = form.control.get(field);
        //console.log("control",control);
        control?.markAsDirty({ onlySelf: true });
      });
      return;
    }

    this.uiService.showSpinner();

    this.zavodControllerService.saveZavod(this.detail!, this.translateService.currentLang)
      .subscribe({
        next: (vysledek: ZavodDto) => {
            this.uiService.stopSpinner();
            this.formDetail?.form.markAsPristine();
            this.refreshSeznamToken$?.next(undefined);
            this.loadDetail(vysledek, false);
        },
        error: error => {
          this.uiService.stopSpinner();
          this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
        }
      });
  }

  zrusitEditaceDetail() {
    this.formDetail?.form.markAsPristine();
    this.rezimDetailu = RezimDetailuEnum.Detail;
    this.detail!.id = this.idZaznamu;
    this.loadDetail(this.detail!, true);
  }

  showDetailDialog(zavodDto: ZavodDto) {
    this.loadDetail(zavodDto, true);
    this.displayDetail = true;
  }

  private loadDetail(zavodDto: ZavodDto, nacitatDetail: boolean) {
    if (nacitatDetail) {
      this.detail = undefined;
      this.uiService.showSpinner();
      this.zavodControllerService.detailZavod(zavodDto.id!, this.translateService.currentLang).subscribe({
        next: (vysledek: any) => {
          this.uiService.stopSpinner();
          this.detail = vysledek;
          this.idZaznamu = this.detail?.id;
        },
        error: error => {
          this.uiService.stopSpinner();
          this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
        }
      })
    } else {
      this.detail = zavodDto;
      this.idZaznamu = this.detail?.id;
    }
    this.rezimDetailu = RezimDetailuEnum.Detail;
  }

  editaceDetail() {
    this.rezimDetailu = RezimDetailuEnum.Editace;
  }
}
