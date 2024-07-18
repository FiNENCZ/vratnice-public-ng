import { Component, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UzivatelControllerService, UzivatelDto, ZavodControllerService, ZavodDto } from 'build/openapi';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import { RezimDetailuEnum } from 'src/app/shared/enums/rezim-detailu.enum';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { newUzivatelDto } from 'src/app/shared/functions/uzivatel.dto.function';
import { DetailBaseClass } from 'src/app/shared/pages/base/detail-base.class';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UiService } from 'src/app/shared/services/ui.service';

@Component({
  selector: 'app-detail-uzivatel',
  templateUrl: './detail-uzivatel.page.html'
  // styleUrls: ['./detail-uzivatel.page.css']
})

export class DetailUzivatelPage extends DetailBaseClass {
  detail?: UzivatelDto = newUzivatelDto();
  idZaznamu?: string;

  constructor(
    confirmationService: ConfirmationService,
    translateService: TranslateService,
    elementRef: ElementRef,
    private readonly messageService: MessageService,
    private readonly uiService: UiService,
    private readonly authService: AuthService,
    private readonly zavodControllerService: ZavodControllerService,
    private readonly uzivatelControllerService: UzivatelControllerService
  ) { super(confirmationService, translateService, elementRef) }

  nacitaniDatZavody: boolean = true;
  private readonly zavodyValuesSubject = new BehaviorSubject<ZavodDto[] | any>(null);
  zavodyValuesObservable: Observable<ZavodDto[] | any> = new BehaviorSubject(undefined).pipe(
    switchMap(() => {
      if (this.zavodyValuesSubject.getValue() !== null) {
        return this.zavodyValuesSubject.asObservable();
      } else {
        this.nacitaniDatZavody = true;
        return this.zavodControllerService.listZavod(true, this.detail?.zavod?.id, this.translateService.currentLang).pipe(
          map(response => {
            this.nacitaniDatZavody = false;
            this.zavodyValuesSubject.next(response);
            return response;
          })
        );
      }
    })
  );

  showNovyDetail() {
    this.novyDetail();
    this.idZaznamu = undefined;
    this.displayDetail = true;
  }

  novyDetail() {
    this.formDetail?.form.markAsPristine();
    this.rezimDetailu = RezimDetailuEnum.Novy;

    this.detail = newUzivatelDto();
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

    this.uzivatelControllerService.saveUzivatel(this.detail!, this.translateService.currentLang)
      .subscribe({
        next: (vysledek: UzivatelDto) => {
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

  showDetailDialog(uzivatelDto: UzivatelDto) {
    this.loadDetail(uzivatelDto, true);
    this.displayDetail = true;
  }

  private loadDetail(uzivatelDto: UzivatelDto, nacitatDetail: boolean) {
    if (nacitatDetail) {
      this.detail = undefined;
      this.uiService.showSpinner();
      this.uzivatelControllerService.detailUzivatel(uzivatelDto.id!, this.translateService.currentLang).subscribe({
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
      this.detail = uzivatelDto;
      this.idZaznamu = this.detail?.id;
    }
    this.rezimDetailu = RezimDetailuEnum.Detail;
  }

  editaceDetail() {
    this.rezimDetailu = RezimDetailuEnum.Editace;
  }
}
