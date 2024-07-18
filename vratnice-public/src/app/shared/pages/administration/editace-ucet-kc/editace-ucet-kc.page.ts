import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { KonfiguraceControllerService, UcetKcDto } from 'build/openapi';
import { MessageService } from 'primeng/api';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { UiService } from 'src/app/shared/services/ui.service';


@Component({
  selector: 'app-editace-ucet-kc',
  templateUrl: './editace-ucet-kc.page.html'
})

export class EditaceUcetKcPage {

  protected displayDetail: boolean = false;
  protected ucetKcDto?: UcetKcDto;

  constructor(
    private readonly uiService: UiService,
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    private readonly konfiguraceControllerService: KonfiguraceControllerService
  ) { }

  showDetail() {
    this.displayDetail = true;
    this.loadDetail();
  }

  private loadDetail() {
    this.ucetKcDto = undefined;
    this.uiService.showSpinner();
    this.konfiguraceControllerService.kcUzivateleDetailKonfigurace(this.translateService.currentLang).subscribe({
      next: (vysledek: UcetKcDto) => {
        this.uiService.stopSpinner();
        this.ucetKcDto = vysledek;
      },
      error: (error) => {
        this.uiService.stopSpinner();
        this.messageService.add({ severity: 'error', summary: error.error.message ? error.error.message : errorTxtFunction(error.error) });
      }
    })
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

    this.konfiguraceControllerService.kcUzivateleSaveKonfigurace(this.ucetKcDto!, this.translateService.currentLang)
      .subscribe({
        next: () => {
          this.uiService.stopSpinner();
          form?.form.markAsPristine();
          this.ucetKcDto = undefined;
          this.displayDetail = false;
        },
        error: (error) => {
          this.uiService.stopSpinner();
          this.messageService.add({ severity: 'error', summary: error.error.message ? error.error.message : errorTxtFunction(error.error) });
        }
      });
  }


}
