import { PolozkaMenuEnum } from "../../enums/polozka-menu.enum";
import { NadpisMenuEnum } from "../../enums/nadpis-menu.enum";

export interface PolozkaMenu {
  polozkaMenuEnum: PolozkaMenuEnum;
  nadpisMenuEnum?: NadpisMenuEnum;
  path: string;
  routerLink: string;
  menuIcon: string;
  menuText: string;
  menuClass?: any;
  queryParams?: any;
  roles: string[];
  roles2?: string[];
}

