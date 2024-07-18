import { JsonPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PracovniPoziceLogControllerService, PracovniPoziceLogDto } from 'build/openapi';
import { MessageService } from 'primeng/api';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { PolozkaMenuEnum } from 'src/app/enums/polozka-menu.enum';
import { SeznamComponent } from 'src/app/shared/components/seznam-component/seznam.component';
import { BreadcrumbDto } from 'src/app/shared/dto/breadcrumb.dto';
import { BreadcrumbTypVlozeniEnum } from 'src/app/shared/enums/breadcrumb-typ-vlozeni.enum';
import { IkonaDialogEnum } from 'src/app/shared/enums/ikona-dialog.enum';
import { SeznamTypeColumnEnum } from 'src/app/shared/enums/seznam-type-column.enum';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { SeznamBaseClass } from 'src/app/shared/pages/base/seznam-base.class';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { InfoDialogService } from 'src/app/shared/services/info-dialog.service';

@Component({
  selector: 'app-org-struktura-logovani',
  templateUrl: './org-struktura-logovani.page.html',
  providers: [JsonPipe]
})

export class OrgStrukturaLogovaniPage extends SeznamBaseClass implements OnInit {
  @ViewChild('formDetail') public formDetail?: NgForm;
  @ViewChild(SeznamComponent) seznamComponent?: SeznamComponent;

  PolozkaMenuEnum = PolozkaMenuEnum;

  orgStrukturaLogovani$?: Observable<PracovniPoziceLogDto[] | undefined>;
  private orgStrukturaLogovaniPom$?: Observable<PracovniPoziceLogDto[] | undefined>;

  constructor(
    breadcrumbService: BreadcrumbService,
    private readonly jsonPipe: JsonPipe,
    private readonly translateService: TranslateService,
    private readonly messageService: MessageService,
    private readonly changeRef: ChangeDetectorRef,
    private readonly infoDialogService: InfoDialogService,
    private readonly pracovniPoziceLogControllerService: PracovniPoziceLogControllerService
  ) {
    super();
    breadcrumbService.pridejDoBreadcrumb(BreadcrumbTypVlozeniEnum.PrvniUroven, new BreadcrumbDto("ORG_STRUKTURA_LOGOVANI.NAZEV_SEZNAM", true, window.location.hash));

    this.obnovitSeznam();
  }

  vychoziNastaveniSloupcu() {
    this.cols = [
      { field: 'casVolani', header: 'ORG_STRUKTURA_LOGOVANI.CAS_VOLANI', typeColumn: SeznamTypeColumnEnum.DatumCasVteriny, width: '150px', defaultVisible: true },
      { field: 'casZpracovani', header: 'ORG_STRUKTURA_LOGOVANI.CAS_ZPRACOVANI', typeColumn: SeznamTypeColumnEnum.DatumCasVteriny, width: '150px', defaultVisible: true },
      { field: 'ok', header: 'ORG_STRUKTURA_LOGOVANI.OK', width: '65px', defaultVisible: true },
      { field: 'pocetZaznamu', header: 'ORG_STRUKTURA_LOGOVANI.POCET_ZAZNAMU', width: '120px', defaultVisible: true },
      { field: 'chyba', header: 'ORG_STRUKTURA_LOGOVANI.CHYBA', width: '400px', defaultVisible: true },
      { field: 'jsonLog', header: '', width: '50px', styleField: 'text-center', idColTemplates: 0, defaultVisible: true },
    ];
  }

  private obnovitSeznam() {
    // if (this.posledniIdFiltrKategorizace == this.filtrKategorizaceLokalita?.kategorizace?.id && this.posledniIdFiltrLokalita == this.filtrKategorizaceLokalita?.lokalita?.id  && this.posledniFiltrBezPlanu == this.filtrBezPlanu) {
    //   return;
    // }
    // this.posledniIdFiltrKategorizace = this.filtrKategorizaceLokalita?.kategorizace?.id;
    // this.posledniIdFiltrLokalita = this.filtrKategorizaceLokalita?.lokalita?.id;
    // this.posledniFiltrBezPlanu = this.filtrBezPlanu;

    this.prenacistSeznam();
  }

  private prenacistSeznam() {
    this.orgStrukturaLogovani$ = undefined;
    setTimeout(() => {
      this.refreshToken$.next(undefined);
      this.orgStrukturaLogovani$ = this.orgStrukturaLogovaniPom$;
      //Kvůli chybe - ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked.
      this.changeRef.detectChanges();
    }, 10);
  }

  showDetailJson(pracovniPoziceLogDto: PracovniPoziceLogDto) {
    this.translateService.get('ORG_STRUKTURA_LOGOVANI.JSON_LOG').subscribe((resHeader: string) => {      
      try {
        this.infoDialogService.showInfoDialog(resHeader, this.jsonPipe.transform(JSON.parse(pracovniPoziceLogDto.jsonLog!)), IkonaDialogEnum.Info);
      } catch (error) {
        this.infoDialogService.showInfoDialog(resHeader, pracovniPoziceLogDto.jsonLog!, IkonaDialogEnum.Info);  
      }     
      //this.infoDialogService.showInfoDialog(resHeader, this.jsonPipe.transform(JSON.parse(pracovniPoziceLogDto.jsonLog!)) + "\n\n" + pracovniPoziceLogDto.jsonLog!, IkonaDialogEnum.Info);
    });

  }

  ngOnInit(): void {
    super.ngOnInit();

    this.orgStrukturaLogovaniPom$ = this.refreshToken$.pipe(
      switchMap(() => {

        if (this.formDetail?.pending) {
          return of(undefined);
        }

        if (this.formDetail?.invalid) {
          Object.keys(this.formDetail?.control.controls).forEach(field => {
            const control = this.formDetail?.control.get(field);
            control?.markAsDirty({ onlySelf: true });
          });
          return of(undefined);
        }

        return this.pracovniPoziceLogControllerService.listPracovniPoziceLog(this.translateService.currentLang).pipe(
          map((value: PracovniPoziceLogDto[]) => {
            return value;
          }),
          catchError(
            error => {
              this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
              return of(undefined);
            }
          )
        );
      })
    );
  }
}
