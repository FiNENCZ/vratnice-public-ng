import { ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { OpravneniControllerService, OpravneniDto, OpravneniTypPristupuDto, PracovniPoziceDto, PracovniPoziceNodeDto, RoleDto, ZavodControllerService, ZavodDto } from 'build/openapi';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { TreeTable } from 'primeng/treetable';
import { BehaviorSubject, Observable, Subscription, catchError, map, of, switchMap } from 'rxjs';
import { RezimDetailuEnum } from 'src/app/shared/enums/rezim-detailu.enum';

import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { newOpravneniDto } from 'src/app/shared/functions/opravneni.dto.function';
import { DetailBaseClass } from 'src/app/shared/pages/base/detail-base.class';
import { UiService } from 'src/app/shared/services/ui.service';

@Component({
  selector: 'app-detail-sprava-opravneni',
  templateUrl: './detail-sprava-opravneni.page.html'
})

export class DetailSpravaOpravneniPage extends DetailBaseClass {

  activeIndex: number = 0;
  disabledPozice: boolean = true;
  detail?: OpravneniDto = newOpravneniDto();
  idZaznamu?: string;

  //TODO - nešlo nic nastavit tak jsem musel dát any - selectedPracovniPozice?: TreeNode[];
  selectedPracovniPozice?: any;

  constructor(
    confirmationService: ConfirmationService,
    translateService: TranslateService,
    elementRef: ElementRef,
    private readonly messageService: MessageService,
    private readonly uiService: UiService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly zavodControllerService: ZavodControllerService,
    private readonly opravneniControllerService: OpravneniControllerService,
  ) {
    super(confirmationService, translateService, elementRef);
  }

  nacitaniDatZavody: boolean = false;
  private readonly zavodyValuesSubject = new BehaviorSubject<ZavodDto[] | any>(null);
  subscriptionZavody?: Subscription;
  zavodyValuesObservable: Observable<ZavodDto[] | any> = this.zavodyValuesSubject.asObservable();
  private nactiZavody() {
    if (this.zavodyValuesSubject.getValue() == null && !this.nacitaniDatZavody) {
      if (this.nacitaniDatZavody) {
        this.subscriptionZavody?.unsubscribe();
      }
      this.nacitaniDatZavody = true;
      this.subscriptionZavody = this.zavodControllerService.listZavod(true, this.translateService.currentLang).pipe(
        map(response => {
          this.nacitaniDatZavody = false;
          this.zavodyValuesSubject.next(response);
          return response;
        }),
        catchError(
          error => {
            this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
            this.nacitaniDatZavody = false;
            return of(undefined);
          }
        )
      ).subscribe();
    }
  }

  private readonly pristupKZamestnancumValuesSubject = new BehaviorSubject<OpravneniTypPristupuDto[] | any>(undefined);
  nacitaniPristupKZamestnancum: boolean = true;
  pristupKZamestnancumValuesObservable: Observable<OpravneniTypPristupuDto[] | any> = new BehaviorSubject(undefined).pipe(
    switchMap(() => {
      if (this.pristupKZamestnancumValuesSubject.getValue() !== undefined) {
        return this.pristupKZamestnancumValuesSubject.asObservable();
      } else {
        this.nacitaniPristupKZamestnancum = true;
        return this.opravneniControllerService.listTypPristupuOpravneni(this.translateService.currentLang).pipe(
          map(response => {
            this.nacitaniPristupKZamestnancum = false;
            this.pristupKZamestnancumValuesSubject.next(response);
            return response;
          }),
          catchError(
            error => {
              this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
              this.nacitaniPristupKZamestnancum = false;
              return of(undefined);
            }
          )
        );
      }
    })
  ).pipe(
    map(response => {
      if (response && response.length > 0 && this.rezimDetailu == RezimDetailuEnum.Novy) {
        if (!this.detail?.typPristupuKZamestnancum) {
          this.detail!.typPristupuKZamestnancum = response[0];
          this.pristupKartaPracovniPozice();
          //Kvůli chybe - ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked.
          this.changeDetectorRef.detectChanges();
        }
      }
      return response;
    })
  );

  private pristupKartaPracovniPozice() {
    switch (this.detail?.typPristupuKZamestnancum?.id) {
      case 1:
        this.disabledPozice = true;
        break;
      case 2:
        this.disabledPozice = true;
        break;
      case 3:
        this.disabledPozice = false;
        break;
      case 4:
        this.disabledPozice = true;
        break;
      case 5:
        this.disabledPozice = true;
        break;
      default:
        this.disabledPozice = true;
        break;
    }
    if (this.disabledPozice && this.activeIndex == 2) {
      this.activeIndex = 0;
    }
  }

  nacitaniDatRole: boolean = false;
  private readonly roleValuesSubject = new BehaviorSubject<RoleDto[] | any>(null);
  subscriptionRole?: Subscription;
  roleValuesObservable: Observable<RoleDto[] | any> = this.roleValuesSubject.asObservable();
  private nactiRole() {
    if (this.roleValuesSubject.getValue() == null && !this.nacitaniDatRole) {
      if (this.nacitaniDatRole) {
        this.subscriptionRole?.unsubscribe();
      }
      this.nacitaniDatRole = true;
      this.subscriptionRole = this.opravneniControllerService.roleListOpravneni(this.translateService.currentLang).pipe(
        map(response => {
          this.nacitaniDatRole = false;
          this.roleValuesSubject.next(response);
          return response;
        }),
        catchError(
          error => {
            this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
            this.nacitaniDatRole = false;
            return of(undefined);
          }
        )
      ).subscribe();
    }
  }

  //nacitaniDatPracovniPozice: boolean = true;
  private readonly pracovniPoziceValuesSubject = new BehaviorSubject<TreeNode[] | any>(null);
  pracovniPoziceValuesObservable: Observable<TreeNode[] | any> = new BehaviorSubject(undefined).pipe(
    switchMap(() => {
      if (this.pracovniPoziceValuesSubject.getValue() !== null) {
        return this.pracovniPoziceValuesSubject.asObservable();
      } else {
        //this.nacitaniDatPracovniPozice = true;
        return this.opravneniControllerService.stromPracovniPoziceOpravneni(this.translateService.currentLang).pipe(
          map(response => {
            //let node: TreeNode = { data: { name: "Documents", size: "75kb", type: "Folder" } };
            var listNode = new Array();
            listNode = this.naplnTreeNodePracovniPozice(listNode, response);
            //listNode.push(node);
            //this.nacitaniDatPracovniPozice = false;
            this.pracovniPoziceValuesSubject.next(listNode);
            return listNode;
          }),
          catchError(
            error => {
              this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
              return of(undefined);
            }
          )
        );
      }
    })
  ).pipe(
    map(response => {
      if (this.rezimDetailu == RezimDetailuEnum.Editace) {
        //Zkusím dohledat pozice uložené na detailu v uložených pozicích a nastavit je jako vybrané
        this.selectedPracovniPozice = new Array();
        this.detail?.pracovniPozice?.forEach(ulozenaPracovniPozice => {
          let nodePozice = this.najdiVybranouPozici(response, ulozenaPracovniPozice.id!);
          if (nodePozice) {
            this.selectedPracovniPozice?.push(nodePozice);
          }
        });
      }
      return response;
    })
  );

  private najdiVybranouPozici(listTreeNode: TreeNode[], idPracovniPozice: string): TreeNode | null {
    for (let index = 0; index < listTreeNode.length; index++) {
      if (listTreeNode[index].data?.id == idPracovniPozice) {
        return listTreeNode[index];
      }
      if (listTreeNode[index].children) {
        let nodePozice = this.najdiVybranouPozici(listTreeNode[index].children!, idPracovniPozice!);
        if (nodePozice) {
          listTreeNode[index].partialSelected = true;
          listTreeNode[index].expanded = true;
          return nodePozice;
        }
      }
    }
    return null;
  }

  private naplnTreeNodePracovniPozice(listNode: TreeNode[], listPracovniPoziceNodeDto: PracovniPoziceNodeDto[]): TreeNode[] {
    listPracovniPoziceNodeDto.forEach(pracovniPoziceNodeDto => {
      let node: TreeNode = { data: pracovniPoziceNodeDto.pracovniPozice };
      if (pracovniPoziceNodeDto.podrizenePracovniPozice && pracovniPoziceNodeDto.podrizenePracovniPozice?.length > 0) {
        //Pokud má podřízení tak zdvojím řádek s tím že podřízené napojím na virtuální uzel - podřízení - nazev pozice
        listNode.push(node);
        node = { data: { nazev: "Podřízení - " + pracovniPoziceNodeDto.pracovniPozice?.nazev, fullText: pracovniPoziceNodeDto.pracovniPozice?.fullText }, expanded: true };
        var listNodePodrizeny = new Array();
        listNodePodrizeny = this.naplnTreeNodePracovniPozice(listNodePodrizeny, pracovniPoziceNodeDto.podrizenePracovniPozice);
        node.children = listNodePodrizeny;
      }
      listNode.push(node);
    });
    return listNode;
  }

  vyberPristupKZamestnancumOnChange(opravneniTypPristupuDto: OpravneniTypPristupuDto) {
    this.detail!.typPristupuKZamestnancum = opravneniTypPristupuDto;
    this.pristupKartaPracovniPozice();
  }

  smazatFiltr(hodnota: any, table: TreeTable) {
    //console.log(hodnota);
    hodnota.value = "";
    table?.filterGlobal('', 'contains')
  }

  showNovyDetail() {
    this.detail = undefined;
    this.novyDetail();
    this.displayDetail = true;
  }

  novyDetail() {
    this.formDetail?.form.markAsPristine();
    this.rezimDetailu = RezimDetailuEnum.Novy;
    this.detail = newOpravneniDto();
    this.selectedPracovniPozice = new Array();
    this.nactiRole();
    this.nactiZavody();
    this.activeIndex = 0;
  }

  kopieDetail() {
    this.formDetail?.form.markAsPristine();
    this.detail!.pracovniPozice = undefined;
    this.detail!.id = undefined;
    this.rezimDetailu = RezimDetailuEnum.Novy;
    this.nactiRole();
    this.nactiZavody();
    this.activeIndex = 0;
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

    if (this.selectedPracovniPozice && this.selectedPracovniPozice?.length > 0) {
      this.detail!.pracovniPozice = new Array();
      this.selectedPracovniPozice?.forEach((selectedPracovniPozice: TreeNode) => {
        if (selectedPracovniPozice.data.id) {
          this.detail!.pracovniPozice?.push(selectedPracovniPozice.data as PracovniPoziceDto);
        }
      });
    }

    this.opravneniControllerService.saveOpravneni(this.detail!, this.translateService.currentLang)
      .subscribe({
        next: (vysledek: OpravneniDto) => {
          this.uiService.stopSpinner();
          this.formDetail?.form.markAsPristine();
          this.refreshSeznamToken$?.next(undefined);
          this.loadDetail(vysledek, false);
        },
        error: (error) => {
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
    this.pristupKartaPracovniPozice();
  }


  showDetailDialog(opravneniDto: OpravneniDto) {
    this.loadDetail(opravneniDto, true);
    this.displayDetail = true;
  }

  private loadDetail(opravneniDto: OpravneniDto, nacitatDetail: boolean) {
    if (nacitatDetail) {
      this.detail = undefined;
      this.uiService.showSpinner();
      this.opravneniControllerService.detailOpravneni(opravneniDto.id!, this.translateService.currentLang).subscribe({
        next: (vysledek: OpravneniDto) => {
          this.uiService.stopSpinner();
          this.detail = vysledek;
          this.idZaznamu = this.detail?.id;
          this.pristupKartaPracovniPozice();
        },
        error: (error) => {
          this.uiService.stopSpinner();
          this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
        }
      })
    } else {
      this.detail = opravneniDto;
      this.idZaznamu = this.detail?.id;
      this.pristupKartaPracovniPozice();
    }
    this.rezimDetailu = RezimDetailuEnum.Detail;
    this.activeIndex = 0;
  }

  editaceDetail() {
    this.rezimDetailu = RezimDetailuEnum.Editace;
    this.nactiRole();
    this.nactiZavody();
    this.pristupKartaPracovniPozice();
  }
}
