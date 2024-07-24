import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PovoleniVjezduVozidlaControllerService, PovoleniVjezduVozidlaDto, RzTypVozidlaDto, ZavodControllerService } from 'build/openapi';
import { ConfirmationService, MessageService } from 'primeng/api';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { DetailBaseClass } from 'src/app/shared/pages/base/detail-base.class';
import { DialogModule } from 'primeng/dialog';



@Component({
  selector: 'app-detail-povoleni-vjezdu-vozidla-typ-rz-csv',
  standalone: true,
  imports: [DialogModule, TranslateModule],
  providers: [ConfirmationService, TranslateService],
  templateUrl: './detail-povoleni-vjezdu-vozidla-typ-rz-csv.page.html',
  styleUrls: ['./detail-povoleni-vjezdu-vozidla-typ-rz-csv.page.css']
})
export class DetailPovoleniVjezduVozidlaTypRzCsvPage extends DetailBaseClass {
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

  sendTypRzVozidla(rzTypVozidlaDto: RzTypVozidlaDto) {
    this.rzTypVozidla.emit(rzTypVozidlaDto);
  }

 

  private isObjectEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  }



  onCsvSelected(event: any): void {
    //this.uiService.showSpinner();
    const file: File = event.target.files[0];
    if (file) {
      this.povoleniVjezduVozidlaControllerService.rzTypVozidlaCsvPovoleniVjezduVozidla(file)
      .subscribe(
          response => {
            //this.uiService.stopSpinner();
            this.messageService.add({ severity: 'success', detail: 'RZ a typy vozidla byly úspěšně přidány', closable: false });
            this.sendTypRzVozidla(response);
          },
          error => {
            //this.uiService.stopSpinner();
            console.log(error);
            this.messageService.add({ severity: 'error', detail: this.extractErrorMessage(error), closable: false });
          }
      );
    }

    if (this.inputImportCSV) {
      this.inputImportCSV.nativeElement.value = '';
    }

    
  }

  private getErrorMessage(error: any): string{
    const keys = Object.keys(error.error);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const value = error.error[firstKey];
      return value
    } else if (error.error && error.error.message) {
      const message = error.error.message;
  
      // Definujte regulární výraz pro extrakci chybové zprávy mezi \" a \"\""
      const regex = /"([^"]*)""/;
  
      // Použijte regulární výraz pro extrakci zprávy
      const match = message.match(regex);
      if (match && match.length > 1) {
        return match[1];
      }
    } 

    return "Vznikla nezmapovaná chyba na serveru. Akci opakujte později."
    

  }

  extractErrorMessage(errorResponse: any): string {
    // Nejprve ověřte, zda pole `error` a `message` existují
    if (errorResponse.error && errorResponse.error.message) {
      const message = errorResponse.error.message;
  
      // Definujte regulární výraz pro extrakci chybové zprávy mezi \" a \"\""
      const regex = /"([^"]*)""/;
  
      // Použijte regulární výraz pro extrakci zprávy
      const match = message.match(regex);
      if (match && match.length > 1) {
        return match[1];
      }
    }
  
    return 'Neznámá chyba';
  }
  


  importCSV(){
    document.getElementById("inputImportCSV")?.click();
  }

}
