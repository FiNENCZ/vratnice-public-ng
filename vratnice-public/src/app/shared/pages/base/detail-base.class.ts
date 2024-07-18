import { BehaviorSubject } from 'rxjs';
import { NgForm } from '@angular/forms';
import { RezimDetailuEnum } from '../../enums/rezim-detailu.enum';
import { Input, ViewChild, Component, ElementRef } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  template: ""
})
export class DetailBaseClass {
  @Input() refreshSeznamToken$: BehaviorSubject<undefined> | undefined = undefined;
  @ViewChild('formDetail') public formDetail: NgForm | undefined;
  protected rozsirujiciForm?: NgForm;

  zobrazovatDotazZavreni: boolean = true;
  displayDetail: boolean = false;
  rezimDetailu: RezimDetailuEnum = RezimDetailuEnum.Detail;
  RezimDetailuEnum = RezimDetailuEnum;

  constructor(
    protected readonly confirmationService: ConfirmationService,
    protected readonly translateService: TranslateService,
    protected readonly elementRef: ElementRef
  ) { }

  visibleChange() {
    //p-datepicker p-component
    if (!this.displayDetail) {
      this.displayDetail = true;
      //Pokud je z okna otevřeno další okno zavřu pouze to nové - hlídám počet podřízených .p-dialog - při počtu víc jak 1 nezavřu okno
      const pocetOken = this.elementRef?.nativeElement.querySelectorAll('.p-dialog').length;
      //Test zda je otevřeno nějaké okno kalendáře - pokud ano nedovolím zavřít detail
      if (!document.querySelector('.p-datepicker.p-component') && !(pocetOken > 1)) {
        this.zavritDetail();
      }
    }
  }

  predZavrenimDetailu() {

  }

  poZavreniDetailu() {

  }

  zavritDetail() {
    this.predZavrenimDetailu();
    if (((this.formDetail && this.formDetail.dirty) || (this.rozsirujiciForm && this.rozsirujiciForm.dirty)) && this.zobrazovatDotazZavreni) {
      this.translateService.get('DETAIL.DOTAZ_ZAVRENI').subscribe((resDotaz: string) => {
        this.confirmationService.confirm({
          message: resDotaz,
          accept: () => {
            this.displayDetail = false;
            this.rezimDetailu = RezimDetailuEnum.Detail;
            this.formDetail?.form.markAsPristine();
            this.rozsirujiciForm?.form.markAsPristine();
            this.poZavreniDetailu();
          },
          reject: () => {
            this.displayDetail = true;
          }
        });
      });
    } else {
      this.displayDetail = false;
      this.rezimDetailu = RezimDetailuEnum.Detail;
      this.formDetail?.form.markAsPristine();
      this.poZavreniDetailu();
    }
  }
}
