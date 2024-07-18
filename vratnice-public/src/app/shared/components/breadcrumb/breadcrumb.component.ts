import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { OblibeneMenuService } from '../../services/oblibene-menu.service';
import { PolozkaMenuEnum } from 'src/app/enums/polozka-menu.enum';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: []
})

export class BreadcrumbComponent {
  @Input() zobrazitSkrytFiltry: boolean = false;
  @Input() skryteFiltry: boolean = false;
  @Input() zobrazitVlastniTlacitko: boolean = false;
  @Input() vlastniTlacitkoTitle: string = "";
  @Output() skrytFiltryEmitter = new EventEmitter<boolean>();
  @Output() vlastniTlacitkoEmitter = new EventEmitter<undefined>();
  @Input() polozkaMenuEnum?: PolozkaMenuEnum;
  @Input() zobrazitVarovani: boolean = false;
  @Input() textVarovani?: string;

  constructor(
    protected readonly oblibeneMenuService: OblibeneMenuService,
    readonly breadcrumbService: BreadcrumbService
  ) {
  }

  skrytMenu() {
    this.skryteFiltry = !this.skryteFiltry;
    this.skrytFiltryEmitter.emit(this.skryteFiltry);
  }

  vlastniTlacitkoClick() {
    this.vlastniTlacitkoEmitter.emit();
  }

}
