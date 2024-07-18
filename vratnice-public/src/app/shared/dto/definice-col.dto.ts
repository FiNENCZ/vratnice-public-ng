import { SeznamTypFiltruEnum } from "../enums/seznam-typ-filtru.enum";
import { SeznamTypeColumnEnum } from "../enums/seznam-type-column.enum";

export interface DefiniceColDto {
  field: string;
  header: string;
  headerTitle?: string;
  width: string;
  defaultVisible: boolean;
  typeColumn?: SeznamTypeColumnEnum;
  idColTemplates?: number;
  sortableOff?: boolean;
  resizableOff?: boolean;
  reorderableOff?: boolean;

  typFiltru?: SeznamTypFiltruEnum;
  idFiltrTemplates?: number;
  filtrField?: string;
  sortField?: string;
  styleField?: string;
  frozenColumn?: boolean;
}
