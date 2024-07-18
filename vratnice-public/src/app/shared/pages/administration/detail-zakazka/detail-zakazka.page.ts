import { Component, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ZakazkaControllerService, ZakazkaDto, ZavodControllerService, ZavodDto } from 'build/openapi';
import moment from 'moment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import { RezimDetailuEnum } from 'src/app/shared/enums/rezim-detailu.enum';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { newZakazkaDto } from 'src/app/shared/functions/zakazka.dto.function';
import { DetailBaseClass } from 'src/app/shared/pages/base/detail-base.class';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UiService } from 'src/app/shared/services/ui.service';

@Component({
  selector: 'app-detail-zakazka',
  templateUrl: './detail-zakazka.page.html'
  // styleUrls: ['./detail-zakazka.page.css']
})

export class DetailZakazkaPage extends DetailBaseClass {
  detail?: ZakazkaDto = newZakazkaDto();
  idZaznamu?: string;

  constructor(
    confirmationService: ConfirmationService,
    translateService: TranslateService,
    elementRef: ElementRef,
    private readonly messageService: MessageService,
    private readonly uiService: UiService,
    private readonly authService: AuthService,
    private readonly zakazkaControllerService: ZakazkaControllerService,
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

    this.detail = newZakazkaDto();
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

    this.zakazkaControllerService.saveZakazka(this.detail!, this.translateService.currentLang)
      .subscribe({
        next: (vysledek: ZakazkaDto) => {
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

  showDetailDialog(zakazkaDto: ZakazkaDto) {
    this.loadDetail(zakazkaDto, true);
    this.displayDetail = true;
  }

  private loadDetail(zakazkaDto: ZakazkaDto, nacitatDetail: boolean) {
    if (nacitatDetail) {
      this.detail = undefined;
      this.uiService.showSpinner();
      this.zakazkaControllerService.detailZakazka(zakazkaDto.id!, this.translateService.currentLang).subscribe({
        next: (vysledek: any) => {
          this.uiService.stopSpinner();
          this.detail = vysledek;
          this.nastavDatumy();
          this.idZaznamu = this.detail?.id;
        },
        error: error => {
          this.uiService.stopSpinner();
          this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
        }
      })
    } else {
      this.detail = zakazkaDto;
      this.nastavDatumy();
      this.idZaznamu = this.detail?.id;
    }
    this.rezimDetailu = RezimDetailuEnum.Detail;
  }

  editaceDetail() {
    this.rezimDetailu = RezimDetailuEnum.Editace;
  }

  private readonly zavodValuesSubject = new BehaviorSubject<ZavodDto[] | any>(undefined);
  nacitaniZavodu: boolean = true;
  zavodValuesObservable: Observable<ZavodDto[] | any> = new BehaviorSubject(undefined).pipe(
    switchMap(() => {
      if (this.zavodValuesSubject.getValue() !== undefined) {
        return this.zavodValuesSubject.asObservable();
      } else {
        this.nacitaniZavodu = true;
        return this.zavodControllerService.listZavod(true, this.translateService.currentLang).pipe(
          map(response => {
            this.nacitaniZavodu = false;
            this.zavodValuesSubject.next(response);
            return response;
          })
        );
      }
    })
  );

  private nastavDatumy() {
    if (this.detail?.platnostOd)
      this.detail!.platnostOd = moment(this.detail.platnostOd).toDate();
    if (this.detail?.platnostDo)
      this.detail!.platnostDo = moment(this.detail.platnostDo).toDate();
  }
}
