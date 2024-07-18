import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UzivatelskeNastaveniControllerService } from 'build/openapi';
import { ConfirmationService, FilterService, MenuItem } from 'primeng/api';
import { DomHandler } from 'primeng/dom';
import { Table } from 'primeng/table';
import { catchError, Observable, of } from 'rxjs';
import { DefiniceColDto } from '../../dto/definice-col.dto';
import { NastaveniTabulkyDto } from '../../dto/nastaveni-tabulky.dto';
import { SeznamTlacitkoDto } from '../../dto/seznam-tlacitko.dto';
import { SeznamTypFiltruEnum } from '../../enums/seznam-typ-filtru.enum';
import { SeznamTypeColumnEnum } from '../../enums/seznam-type-column.enum';

@Component({
  selector: 'app-seznam-component',
  templateUrl: './seznam.component.html'
})

export class SeznamComponent implements OnInit {
  @Input() textNacitaniSeznam: string = "SEZNAM.NACITAM_DATA";
  @Input() seznamDataObservable$?: Observable<any[] | undefined>;
  @Input() rows?: number;
  @Input() multiSortMeta?: any[];
  @Input() cols?: DefiniceColDto[];
  @Input() selectedColumns?: any[];
  @Input() klicNastaveni?: string;
  @Input() sloupecDetail: boolean = true;
  @Input() sloupecDetailFrozen: boolean = false;
  @Input() sloupecExpandable: boolean = false;
  @Input() sloupecReordable: boolean = false;
  @Input() expandRowTemplate: TemplateRef<any> | null = null;
  @Input() colTemplates?: TemplateRef<any>[];
  @Input() filtrTemplates?: TemplateRef<any>[];
  @Input() tlacitka?: SeznamTlacitkoDto[];
  @Input() sloupecCheckbox: boolean = false;
  @Input() summaryRow: boolean = false;
  @Input() summaryTemplate: TemplateRef<any> | null = null;
  @Input() seznamSelectionMode?: 'single' | 'multiple' | null = null;
  @Input() radekHover: boolean = true;
  @Input() filterHlavicka: any;
  @Input() userDataKey: string = "id";
  @Input() podminkaRadekFunction?: Function;
  @Input() pohybSeznam: boolean = false;
  @Input() globalFilterFields?: string[];
  @Input() nacitatUzivatelskeNastaveniInit: boolean = true;
  @Input() exportExcelPovolen: boolean = true;
  @Input() vyberSloupcu: boolean = true;
  @Input() nadpisSeznam?: string;

  podminkaRadek(rowData: any): string | null {
    if (this.podminkaRadekFunction) {
      return this.podminkaRadekFunction(rowData);
    } else
      return null;
  }

  SeznamTypFiltruEnum = SeznamTypFiltruEnum;
  SeznamTypeColumnEnum = SeznamTypeColumnEnum;

  selectedRows?: any[];
  expandedRows: {} = {};

  nacitaniUzivNastaveni = false;

  @ViewChild('dt') public table?: Table;

  private posledniNastaveniTabulky?: String;
  nastaveniTabulkyDto?: NastaveniTabulkyDto;
  items?: MenuItem[];

  @Output() vychoziNastavenitabulkyEmitter = new EventEmitter<Table>();
  @Output() showDetailDialogEmitter = new EventEmitter<any>();
  @Output() checkboxChangeEmitter = new EventEmitter<any>();
  @Output() reorderChangeEmitter = new EventEmitter<any>();
  @Output() onSelectEmitter = new EventEmitter<any>();
  @Output() exportExcelEmitter = new EventEmitter<any>();

  constructor(
    private readonly confirmationService: ConfirmationService,
    private readonly translateService: TranslateService,
    private readonly uzivatelskeNastaveniControllerService: UzivatelskeNastaveniControllerService,
    private filterService: FilterService
  ) {
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.translateService.get('SEZNAM.VYCHOZI_NASTAVENI').subscribe((resVychoziNastaveni: string) => {
        if (this.items) {
          (this.items as any)[0].label = resVychoziNastaveni;
        }
      });
    });
  }

  showDetailDialog(event: any, detailDto: any, rowIndex: number) {
    //console.log("showDetailDialog");
    //event.stopPropagation();
    detailDto.tableRowIndex = rowIndex;
    this.showDetailDialogEmitter.emit(detailDto);
    if (this.seznamSelectionMode == "single" && this.pohybSeznam) {
      this.setSelectedRows([detailDto]);
    }
  }

  setRowsMultisortMeta(rows?: number, multiSortMeta?: any[]) {
    this.rows = rows;
    this.multiSortMeta = multiSortMeta;
  }

  smazatFiltr(hodnota: any) {
    //console.log(hodnota);
    hodnota.value = "";
    this.table?.filterGlobal('', 'contains')
    //console.log(hodnota);
  }

  onZmenaSortTabulka(table: Table) {
    this.saveNastaveniTabulka(table, this.cols, this.klicNastaveni!, this.nastaveniTabulkyDto, true).subscribe();
  }

  onZmenaTabulka(table: Table) {
    this.saveNastaveniTabulka(table, this.cols, this.klicNastaveni!, this.nastaveniTabulkyDto, false).subscribe();
  }

  onChangeColumns(table: Table) {
    setTimeout(() => {
      this.saveNastaveniTabulka(table, this.cols, this.klicNastaveni!, this.nastaveniTabulkyDto, false).subscribe();
    }, 200);
  }

  onCheckbox(udalost: any) {
    this.checkboxChangeEmitter.emit({ udalost: udalost, selectedRows: this.selectedRows });
  }

  onReorder(udalost: any, seznamData: any) {
    this.reorderChangeEmitter.emit({ udalost: udalost, seznamData: seznamData });
  }

  onSelect(udalost: any) {
    this.onSelectEmitter.emit({ udalost: udalost });
  }

  clearSelectedRows() {
    this.selectedRows = new Array();
  }

  addNewCol(col: DefiniceColDto) {
    this.cols?.push(col);
  }

  removeLastCol() {
    this.cols?.pop();
  }

  removeCol(col: DefiniceColDto) {
    const index = this.cols!.indexOf(col, 0);
    if (index > -1) {
      this.cols?.splice(index, 1);
    }
  }

  addNewSelectedColumn(col: DefiniceColDto) {
    this.selectedColumns?.push(col);
  }

  removeLastSelectedColumn() {
    this.selectedColumns?.pop();
  }

  removeSelectedColumn(col: DefiniceColDto) {
    const index = this.selectedColumns!.indexOf(col, 0);
    if (index > -1) {
      this.selectedColumns?.splice(index, 1);
    }
  }

  setExpanded(id: any, expanded: boolean) {
    (this.expandedRows as any)[id] = expanded;
  }

  getTableData(): any[] | undefined {
    return this.table?.value;
  }

  getTable(): any {
    return this.table;
  }

  getSelectedRows(): any[] | undefined {
    return this.selectedRows;
  }

  setSelectedRows(selectedRows: any[]) {
    //console.log("setSelectedRows", selectedRows);
    this.selectedRows = selectedRows;
  }

  nasledujiciRadek(): any {
    if (this.seznamSelectionMode == "single") {
      //console.log(this.getTable());
      //console.log(this.getTable().value);
      //console.log(this.getTable().filteredValue);
      var index;
      if (this.getTable().filteredValue) {
        index = (this.getTable().filteredValue as Object[]).indexOf(this.getTable().selection?.at(0));
      } else {
        index = (this.getTable().value as Object[]).indexOf(this.getTable().selection?.at(0));
      }
      //console.log(index);
      //console.log(this.getTable().first);
      //console.log(this.getTable().rows);

      if ((this.getTable().first + this.getTable().rows) <= (index + 1)) {
        //console.log("menší");
        do {
          this.getTable().first = this.getTable().first + this.getTable().rows;
        } while ((this.getTable().first + this.getTable().rows) <= (index + 1));
      } else if (this.getTable().first > (index + 1)) {
        //console.log("větší");
        do {
          this.getTable().first = this.getTable().first - this.getTable().rows;
        } while (this.getTable().first > (index + 1))
      }
      //console.log((this.getTable().value as Object[]).indexOf(this.getTable().selection));
      //console.log(this.getTable().selection);
      //console.log(this.getSelectedRows());
      if (this.getTable().filteredValue) {
        if (index < (this.getTable().filteredValue.length - 1))
          this.setSelectedRows([this.getTable().filteredValue[index + 1]]);
      } else {
        if (index < (this.getTable().value.length - 1))
          this.setSelectedRows([this.getTable().value[index + 1]]);
      }
      //console.log(this.getSelectedRows());
      //console.log(this.getSelectedRows()?.at(0));
      return this.getSelectedRows()?.at(0);
      //console.log(this.getTable().selection);
      //console.log(this.getTable().selection(this.getTable().value[0]));
    }
  }

  predchazejiciRadek(): any {
    //console.log(this.seznamSelectionMode);
    if (this.seznamSelectionMode == "single") {
      //console.log(this.getTable());
      //console.log(this.getTable().value);
      var index;
      if (this.getTable().filteredValue) {
        index = (this.getTable().filteredValue as Object[]).indexOf(this.getTable().selection?.at(0));
        if (index == -1) index = this.getTable().filteredValue.length;
      } else {
        index = (this.getTable().value as Object[]).indexOf(this.getTable().selection?.at(0));
        if (index == -1) index = this.getTable().value.length;
      }
      //console.log(index);

      //console.log(this.getTable().first);
      //console.log(this.getTable().rows);

      if ((this.getTable().first + this.getTable().rows) <= (index - 1)) {
        //console.log("menší");
        do {
          this.getTable().first = this.getTable().first + this.getTable().rows;
        } while ((this.getTable().first + this.getTable().rows) <= (index - 1));
      } else if (this.getTable().first > (index - 1) && index > 0) {
        //console.log("větší");
        do {
          this.getTable().first = this.getTable().first - this.getTable().rows;
        } while (this.getTable().first > (index - 1))
      }
      //console.log((this.getTable().value as Object[]).indexOf(this.getTable().selection));
      //console.log(this.getTable().selection);
      //console.log(this.getSelectedRows());
      if (this.getTable().filteredValue) {
        if (index > 0)
          this.setSelectedRows([this.getTable().filteredValue[index - 1]]);
      } else {
        if (index > 0)
          this.setSelectedRows([this.getTable().value[index - 1]]);
      }
      //console.log(this.getSelectedRows());
      return this.getSelectedRows()?.at(0);
      //console.log(this.getTable().selection);
      //console.log(this.getTable().selection(this.getTable().value[0]));
    }
  }

  setSelectedPage() {
    if (this.seznamSelectionMode == "single") {
      var index;
      if (this.getTable().filteredValue) {
        index = (this.getTable().filteredValue as any[]).map(e => e[this.userDataKey]).indexOf(this.getTable().selection?.at(0)[this.userDataKey]);
        if (index == -1) index = this.getTable().filteredValue.length;
      } else {
        index = (this.getTable().value as any[]).map(e => e[this.userDataKey]).indexOf(this.getTable().selection?.at(0)[this.userDataKey]);
        if (index == -1) index = this.getTable().value.length;
      }
      //console.log(index);
      //console.log(this.getTable().first);
      //console.log(this.getTable().rows);

      if ((this.getTable().first + this.getTable().rows) <= (index)) {
        //console.log("menší");
        do {
          this.getTable().first = this.getTable().first + this.getTable().rows;
        } while ((this.getTable().first + this.getTable().rows) <= (index));
      } else if (this.getTable().first > (index) && index > 0) {
        //console.log("větší");
        do {
          this.getTable().first = this.getTable().first - this.getTable().rows;
        } while (this.getTable().first > (index))
      }
    }
  }

  setSelectedPoObnoveni(novySeznam: any[]) {
    if (this.getTable()) {
      if (this.getTable().selection?.at(0)) {
        var value = novySeznam.find((element) => element.id == this.getTable().selection.at(0).id)
        this.setSelectedRows([value]);
      }
    }
  }

  exportExcel(seznamData: any[]) {
    this.exportExcelEmitter.emit(seznamData);
  }

  ngOnInit(): void {
    // if (!this.klicNastaveni)
    //  throw ("Chyba, pro app-seznam-component není nastaveno klicNastaveni");

    this.filterService.register('isInContains', (value: any, filter: any): boolean => {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }

      if (value === undefined || value === null || value.length === 0) {
        return false;
      }
      var pocetNalezeni = 0;
      value.forEach((hodnotaData: any) => {
        filter.forEach((hodnotaFiltru: any) => {
          if (JSON.stringify(hodnotaData) == JSON.stringify(hodnotaFiltru)) {
            pocetNalezeni++;
            return;
          }
        });
      });
      return pocetNalezeni == filter.length;
    });

    if (this.nacitatUzivatelskeNastaveniInit) {
      this.nacitaniUzivatelskehoNastaveni();
    }

    this.translateService.get('SEZNAM.VYCHOZI_NASTAVENI').subscribe((resVychoziNastaveni: string) => {
      this.items = [
        {
          label: resVychoziNastaveni,
          command: e => {
            this.translateService.get('SEZNAM.DOTAZ_VYCHOZI_NASTAVENI').subscribe((resDotazVychoziNastaveni: string) => {
              this.confirmationService.confirm({
                message: resDotazVychoziNastaveni,
                accept: () => {
                  this.uzivatelskeNastaveniControllerService.deleteUzivatelskeNastaveni(this.klicNastaveni!, this.translateService.currentLang).subscribe({
                    next: () => {
                      this.nastaveniTabulkyDto = undefined;
                      this.vychoziNastavenitabulkyEmitter.emit(this.table);
                    },
                    error: (error) => {
                    }
                  })
                }
              });
            });
          }
        }
      ];
    });

  }

  nacitaniUzivatelskehoNastaveni() {
    if (!this.klicNastaveni) return;
    var that = this;
    this.nacitaniUzivNastaveni = true;
    this.uzivatelskeNastaveniControllerService.detailUzivatelskeNastaveni(this.klicNastaveni!, this.translateService.currentLang).subscribe({
      next: (nastaveni: string) => {
        let nastaveniTabulkyDto = (nastaveni as NastaveniTabulkyDto);
        this.posledniNastaveniTabulky = JSON.stringify(nastaveniTabulkyDto);
        this.nastaveniTabulkyDto = nastaveniTabulkyDto;
        if (nastaveniTabulkyDto?.rows) {
          this.rows = nastaveniTabulkyDto.rows;
        }
        if (nastaveniTabulkyDto?.sloupce) {
          var noveSloupce: DefiniceColDto[] | undefined = new Array();
          //console.log("nastaveniTabulkyDto.definiceSloupcu", nastaveniTabulkyDto.definiceSloupcu);
          if (nastaveniTabulkyDto.definiceSloupcu) {
            // Vyberu pouze nové sloupce, které jsou navíc v nové definici
            //console.log("mam default");
            noveSloupce = this.cols?.filter(col => {
              if (!col.defaultVisible) {
                return false;
              }
              return !nastaveniTabulkyDto?.definiceSloupcu?.some(definiceSloupce => definiceSloupce.field === col.field);
            });
          } else {
            // Vyberu sloupce, které jsou navíc oproti zobrazeným
            //console.log("nemam default");
            noveSloupce = this.cols?.filter(col => {
              if (!col.defaultVisible) {
                return false;
              }
              return !nastaveniTabulkyDto?.sloupce?.some(sloupec => sloupec.field === col.field);
            });
          }
          //console.log("noveSloupce", noveSloupce);
          //console.log("noveSloupce.length", noveSloupce.length);
          //console.log("nastaveniTabulkyDto.sloupce", nastaveniTabulkyDto.sloupce);
          this.selectedColumns = nastaveniTabulkyDto.sloupce;
          this.selectedColumns.forEach(selectColumn => {
            //console.log("selectColumn.field", selectColumn.field);
            this.cols?.some(col => {
              //console.log("col.field", col.field);
              //console.log("col", col);
              if (selectColumn.field === col.field) {
                selectColumn.typeColumn = col.typeColumn;
                selectColumn.typFiltru = col.typFiltru;
                selectColumn.frozenColumn = col.frozenColumn;
                selectColumn.idColTemplates = col.idColTemplates;
                selectColumn.idFiltrTemplates = col.idFiltrTemplates;
                selectColumn.filtrField = col.filtrField;
                selectColumn.sortableOff = col.sortableOff;
                selectColumn.resizableOff = col.resizableOff;
                selectColumn.sortField = col.sortField;
                selectColumn.styleField = col.styleField;
                selectColumn.headerTitle = col.headerTitle;
                return true;
              }
              return false;
            });
          });

          //console.log("this.selectedColumns", this.selectedColumns);
          //console.log("this.cols", this.cols);
          this.selectedColumns = this.selectedColumns.concat(noveSloupce);
          // Ze sloupců odstraním potenciálně vymazané sloupce - dle definice cols
          this.selectedColumns = this.selectedColumns.filter(selectedColumn => {
            return this.cols?.some(col => col.field === selectedColumn.field);
          });

          // Nastavím správné sloupce do výběru
          // Vyfiltruju sloupce které jsou v definici navíc oproti seznamu
          var zbyvajiciSloupce = this.cols?.filter(col => {
            return !this.selectedColumns?.some(selectedColumn => selectedColumn.field === col.field);
          });
          this.cols = this.selectedColumns;
          this.cols = this.cols.concat(zbyvajiciSloupce!);
        }
        if (nastaveniTabulkyDto?.multiSortMeta) {
          this.multiSortMeta = new Array();
          nastaveniTabulkyDto.multiSortMeta.forEach(sortMeta => {
            that.multiSortMeta?.push(sortMeta);
          });
          //nastaveniTabulkyDto.multiSortMeta.;
        }
        this.nacitaniUzivNastaveni = false;
      },
      error: (error) => {
        this.nacitaniUzivNastaveni = false;
      }
    });
  }

  private saveNastaveniTabulka(table: Table, cols: DefiniceColDto[] | undefined, klic: string, nastaveniTabulkyDto: NastaveniTabulkyDto | undefined, zmenaSort: boolean): Observable<void | null> {
    if (!this.klicNastaveni) return of(undefined);
    //console.log("nastaveniTabulkyDto", nastaveniTabulkyDto);
    //console.log("zmenaSort", zmenaSort);
    let state: NastaveniTabulkyDto = new NastaveniTabulkyDto();
    if (nastaveniTabulkyDto) {
      state = nastaveniTabulkyDto;
    }
    //Nastavím aktuální výchozí rozložení sloupců - abych poznal případný doplněný sloupec
    state.definiceSloupcu = cols;

    //console.log("table.multiSortMeta", table.multiSortMeta);
    //console.log("state.multiSortMeta", state.multiSortMeta);

    //Skončím pokud je zmenaSort a zároveň se nemění multiSortMeta
    if (zmenaSort && state.multiSortMeta == table.multiSortMeta) {
      return of(null);
    }

    //console.log("ukládám nastavení");

    if (!zmenaSort && table.paginator) {
      //Odstraněno ukládání first
      //state.first = table.first;
      state.rows = table.rows;
    }
    //console.log("table", table);
    //console.log("state", state);
    //console.log("table.multiSortMeta", table.multiSortMeta);
    if (table.multiSortMeta) {
      state.multiSortMeta = new Array();
      table.multiSortMeta.forEach(sortMeta => {
        state.multiSortMeta?.push(sortMeta);
      });
    }
    if (!zmenaSort && table.resizableColumns) {
      let headers = DomHandler.find(table.containerViewChild?.nativeElement, '.p-datatable-thead > tr:first-child > th');
      //console.log("table", table);
      //console.log("headers", headers);
      let sloupce = [];
      //console.log("headerPoradi", headerPoradi);
      for (let index = 0; index < table.columns!.length; index++) {
        const column = table.columns![index];
        let sirka: string;
        for (let indexHeader = 0; indexHeader < headers.length; indexHeader++) {
          if (headers[indexHeader].attributes['seznam-header-id']?.value === column.field) {
            sirka = DomHandler.getOuterWidth(headers[indexHeader]);
            break;
          }
        }
        const sloupec = { field: column.field, header: column.header, width: sirka! + 'px' };
        sloupce.push(sloupec);
        //console.log("sloupec", sloupec);
      }
      state.sloupce = sloupce;
      //console.log("state.sloupce", state.sloupce);
    }

    let nastaveniTabulky = JSON.stringify(state);
    if (this.posledniNastaveniTabulky != nastaveniTabulky) {
      this.posledniNastaveniTabulky = nastaveniTabulky;
      return this.uzivatelskeNastaveniControllerService.saveUzivatelskeNastaveni(klic, nastaveniTabulky, this.translateService.currentLang).pipe(
        catchError(
          error => {
            return of(undefined);
          }
        )
      );
    } else {
      return of(null);
    }
  }

}
