import { Table } from 'primeng/table';
import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { DefiniceColDto } from '../../dto/definice-col.dto';

@Component({
  template: ""
})
export class SeznamBaseClass {

    readonly refreshToken$ = new BehaviorSubject(undefined);

    public rows: number | undefined;
    cols: DefiniceColDto[] | undefined;
    public selectedColumns: any[] | undefined;
    multiSortMeta: any[] | undefined;

    vychoziNastaveniSloupcu() {
        throw ("Chyba, funkce vychoziNastaveniSloupcu() musí být přepsána na potomkovi seznamu");
    }

    vychoziNastaveniTabulky(table: Table | null) {
        this.rows = 10;
        this.vychoziNastaveniSloupcu();
        this.selectedColumns = this.cols?.filter(col => col.defaultVisible === true);
        this.multiSortMeta = undefined;
        if (table) {
            table.rows = this.rows;
            table.multiSortMeta = this.multiSortMeta!;
            //Změna šířek přidává nový style s nastavením pro jednotlivé sloupce - toto ho po resetu odstrani
            table.destroyStyleElement();
        }
    }

    ngOnInit(): void {
        this.vychoziNastaveniTabulky(null);
    }
}
