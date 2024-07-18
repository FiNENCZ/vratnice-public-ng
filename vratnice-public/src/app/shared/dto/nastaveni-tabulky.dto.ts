import { SortMeta } from 'primeng/api';

export class NastaveniTabulkyDto {
  //Paginator
  first?: number;
  rows?: number;

  //Sorting
  // sortField: string;
  // sortOrder: number;

  //Multisort
  multiSortMeta?: SortMeta[];

  //Sloupců
  sloupce?: any[];

  //Sloupců
  definiceSloupcu?: any[];

  //columnWidths: string;
  //tableWidth: any;

  //Řazení sloupců
  //columnOrder: any[];

}
