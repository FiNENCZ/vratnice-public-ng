import { ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { UzivatelControllerService, UzivatelDto, ZastupControllerService, ZastupDto } from 'build/openapi';
import moment from 'moment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import { RezimDetailuEnum } from 'src/app/shared/enums/rezim-detailu.enum';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { newZastupDto } from 'src/app/shared/functions/zastup.dto.function';
import { DetailBaseClass } from 'src/app/shared/pages/base/detail-base.class';
import { UiService } from 'src/app/shared/services/ui.service';

@Component({
  selector: 'app-detail-zastup',
  templateUrl: './detail-zastup.page.html'
})

export class DetailZastupPage extends DetailBaseClass {
  idZaznamu?: string;
  detail?: ZastupDto = newZastupDto();

  constructor(
    confirmationService: ConfirmationService,
    translateService: TranslateService,
    elementRef: ElementRef,
    private readonly messageService: MessageService,
    private readonly uiService: UiService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly zastupControllerService: ZastupControllerService,
    private readonly uzivatelControllerService: UzivatelControllerService
  ) { super(confirmationService, translateService, elementRef) }

  private readonly uzivatelValuesSubject = new BehaviorSubject<UzivatelDto[] | any>(undefined);
  protected nacitaniDatUzivatelu: boolean = true;
  private nacitaniSeznamuUzivatelu = false;
  protected uzivatelValuesObservable: Observable<UzivatelDto[] | any> = new BehaviorSubject(undefined).pipe(
    switchMap(() => {
      if (this.uzivatelValuesSubject.getValue() !== undefined || this.nacitaniSeznamuUzivatelu) {
        return this.uzivatelValuesSubject.asObservable();
      } else {
        this.nacitaniDatUzivatelu = true;
        this.nacitaniSeznamuUzivatelu = true;
        return this.uzivatelControllerService.listDleOpravneniCelyPodnikUzivatel(["ROLE_SPRAVA_ZASTUPU"], this.translateService.currentLang).pipe(
          map(response => {
            this.nacitaniDatUzivatelu = false;
            this.nacitaniSeznamuUzivatelu = false;
            this.uzivatelValuesSubject.next(response);
            return response;
          })
        );
      }
    })
  ).pipe(
    map(response => {
      if (response && response.length > 0 && this.rezimDetailu == RezimDetailuEnum.Novy) {
        if (!this.detail?.uzivatel) {
          this.detail!.uzivatel = response[0];
        }
        if (!this.detail?.uzivatelZastupce) {
          this.detail!.uzivatelZastupce = response[0];
        }
        //Kvůli chybe - ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked.
        this.changeDetectorRef.detectChanges();
      }
      return response;
    })
  );

  showNovyDetail() {
    this.novyDetail();
    this.idZaznamu = undefined;
    this.displayDetail = true;
  }

  protected nastavPlatnost(zmenaPlatnostOd: boolean) {
    if (!this.detail?.platnostOd && !this.detail?.platnostDo) {
      return;
    } else if (this.detail?.platnostOd && !this.detail?.platnostDo) {
      this.detail.platnostDo = this.detail?.platnostOd;
    } else if (!this.detail?.platnostOd && this.detail?.platnostDo) {
      this.detail.platnostOd = this.detail?.platnostDo;
    } else if (this.detail!.platnostOd > this.detail!.platnostDo) {
      if (zmenaPlatnostOd) {
        this.detail.platnostDo = this.detail?.platnostOd;
      } else {
        this.detail.platnostOd = this.detail?.platnostDo;
      }
    }
  }

  protected novyDetail() {
    this.formDetail?.form.markAsPristine();
    this.rezimDetailu = RezimDetailuEnum.Novy;
    this.detail = newZastupDto();
  }

  protected ulozit(form: NgForm) {

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

    this.zastupControllerService.saveZastup(this.detail!, this.translateService.currentLang)
      .subscribe({
        next: (vysledek: ZastupDto) => {
          this.uiService.stopSpinner();
          this.formDetail?.form.markAsPristine();
          this.refreshSeznamToken$?.next(undefined);
          this.loadDetail(vysledek, false);
        },
        error: (error) => {
          this.uiService.stopSpinner();
          this.messageService.add({ severity: 'error', summary: error.error.message ? error.error.message : errorTxtFunction(error.error) });
        }
      });
  }

  protected zrusitEditaceDetail() {
    this.formDetail?.form.markAsPristine();
    this.rezimDetailu = RezimDetailuEnum.Detail;
    this.detail!.guid = this.idZaznamu;
    this.loadDetail(this.detail!, true);
  }

  showDetailDialog(zastupDto: ZastupDto) {
    this.loadDetail(zastupDto, true);
    this.displayDetail = true;
  }

  private loadDetail(zastupDto: ZastupDto, nacitatDetail: boolean) {
    if (nacitatDetail) {
      this.detail = undefined;
      this.uiService.showSpinner();
      this.zastupControllerService.detailZastup(zastupDto.guid!, this.translateService.currentLang).subscribe({
        next: (vysledek: ZastupDto) => {
          this.uiService.stopSpinner();
          this.detail = vysledek;
          this.idZaznamu = this.detail?.guid;
          this.nastavDatumy();
        },
        error: (error) => {
          this.uiService.stopSpinner();
          this.messageService.add({ severity: 'error', summary: error.error.message ? error.error.message : errorTxtFunction(error.error) });
        }
      })
    } else {
      this.detail = zastupDto;
      this.idZaznamu = this.detail?.guid;
      this.nastavDatumy();
    }
    this.rezimDetailu = RezimDetailuEnum.Detail;
  }

  private nastavDatumy() {
    if (this.detail?.platnostOd)
      this.detail!.platnostOd = moment(this.detail.platnostOd).toDate();
    if (this.detail?.platnostDo)
      this.detail!.platnostDo = moment(this.detail.platnostDo).toDate();
  }

  protected editaceDetail() {
    this.rezimDetailu = RezimDetailuEnum.Editace;
  }
}
