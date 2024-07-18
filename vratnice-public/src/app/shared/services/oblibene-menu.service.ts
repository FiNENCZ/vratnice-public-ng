import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UzivatelskeNastaveniControllerService } from 'build/openapi';
import { MenuItem } from 'primeng/api';
import { nadpisyMenu } from 'src/app/consts/nadpisy-menu.const';
import { polozkyMenu } from 'src/app/consts/polozky-menu.const';
import { PolozkaMenuEnum } from '../../enums/polozka-menu.enum';
import { AuthService } from './auth.service';
import { NadpisMenuEnum } from '../../enums/nadpis-menu.enum';

@Injectable({
  providedIn: 'root',
})
export class OblibeneMenuService {

  private readonly nastaveniId = "oblibene-menu";
  private oblibeneMenuEnums: PolozkaMenuEnum[] = new Array();
  private menuItems: MenuItem[] = new Array();

  constructor(
    private readonly uzivatelskeNastaveniControllerService: UzivatelskeNastaveniControllerService,
    private readonly authService: AuthService,
    private readonly translateService: TranslateService
  ) {
    //console.log("OblibeneMenuService.constructor");
    this.nactiOblibeneMenu();
  }

  oblibeneMenuItems(): MenuItem[] {
    return this.menuItems;
  }

  naplneneOblibeneMenuItems(): boolean {
    return this.menuItems.length > 0;
  }

  obsahujeOblibeneMenu(polozkaMenuEnum: PolozkaMenuEnum): boolean {
    return this.oblibeneMenuEnums?.includes(polozkaMenuEnum);
  }

  pridatOblibene(polozkaMenuEnum: PolozkaMenuEnum) {
    //console.log("polozkaMenuEnum", polozkaMenuEnum);
    //Zjistím zda v menu je už zařazen nadpis a pokusím se vložit novou položku za nalezenou
    var nalezenyIndex = -1;
    if (polozkyMenu[polozkaMenuEnum].nadpisMenuEnum) {
      var posleniNalezenyIndex = -1;
      do {
        nalezenyIndex = posleniNalezenyIndex;
        posleniNalezenyIndex = this.oblibeneMenuEnums.findIndex((polozkaMenuEnumOblibene, index) => {
          if (index <= nalezenyIndex) return false;
          return (polozkyMenu[polozkaMenuEnumOblibene].nadpisMenuEnum && polozkyMenu[polozkaMenuEnumOblibene].nadpisMenuEnum == polozkyMenu[polozkaMenuEnum].nadpisMenuEnum);
        });
      } while (posleniNalezenyIndex != -1);
    }
    //console.log("nalezenyIndex", nalezenyIndex);
    if (nalezenyIndex == -1) {
      this.oblibeneMenuEnums.push(polozkaMenuEnum);
    } else {
      this.oblibeneMenuEnums.splice(nalezenyIndex + 1, 0, polozkaMenuEnum);
    }
    //console.log("oblibeneMenuEnums", this.oblibeneMenuEnums);
    this.ulozOblibeneMenu();
    this.sestavOblibeneMenu();
  }

  odebratOblibene(polozkaMenuEnum: PolozkaMenuEnum) {
    //console.log("polozkaMenuEnum", polozkaMenuEnum);
    let indexMenu = this.oblibeneMenuEnums.indexOf(polozkaMenuEnum);
    if (indexMenu != -1) {
      this.oblibeneMenuEnums.splice(indexMenu, 1);
    }
    // this.oblibeneMenu.push(polozkaMenuEnum);
    //console.log("oblibeneMenuEnums", this.oblibeneMenuEnums);
    this.ulozOblibeneMenu();
    this.sestavOblibeneMenu();
  }

  private ulozOblibeneMenu() {
    let oblibeneMenuString = JSON.stringify(this.oblibeneMenuEnums);
    this.uzivatelskeNastaveniControllerService.saveUzivatelskeNastaveni(this.nastaveniId, oblibeneMenuString, this.translateService.currentLang).subscribe({
      error: () => {

      }
    });
  }

  nactiOblibeneMenu() {
    if (this.authService.isLoggedIn()) {
      this.uzivatelskeNastaveniControllerService.detailUzivatelskeNastaveni(this.nastaveniId, this.translateService.currentLang).subscribe({
        next: (nastaveni: any) => {
          this.oblibeneMenuEnums = nastaveni;
          if (!this.oblibeneMenuEnums)
            this.oblibeneMenuEnums = new Array();
          this.sestavOblibeneMenu();
        },
        error: () => {

        }
      });
    }
  }

  private sestavOblibeneMenu() {
    this.menuItems = new Array();
    if (!this.oblibeneMenuEnums || this.oblibeneMenuEnums.length == 0) return;
    var posledniNadpisEnum: NadpisMenuEnum | undefined = undefined;
    var nadpisOblibeneMenu: MenuItem;
    //Překladové texty pro menu
    var prekladoveTexty: string[] = new Array();
    this.oblibeneMenuEnums.forEach(oblibeneMenuEnum => {
      prekladoveTexty.push(polozkyMenu[oblibeneMenuEnum].menuText);
      if (polozkyMenu[oblibeneMenuEnum].nadpisMenuEnum) {
        prekladoveTexty.push(nadpisyMenu[polozkyMenu[oblibeneMenuEnum].nadpisMenuEnum!].menuText);
      }
    });

    this.translateService.get(prekladoveTexty).subscribe((preklady: any) => {
      this.oblibeneMenuEnums.forEach(oblibeneMenuEnum => {
        if (this.authService.maUzivatelRole(polozkyMenu[oblibeneMenuEnum].roles)) {
          if (polozkyMenu[oblibeneMenuEnum].nadpisMenuEnum) {
            if (polozkyMenu[oblibeneMenuEnum].nadpisMenuEnum != posledniNadpisEnum) {
              nadpisOblibeneMenu = { label: preklady[nadpisyMenu[polozkyMenu[oblibeneMenuEnum].nadpisMenuEnum!].menuText], icon: nadpisyMenu[polozkyMenu[oblibeneMenuEnum].nadpisMenuEnum!].menuIcon, automationId: polozkyMenu[oblibeneMenuEnum].nadpisMenuEnum };
              nadpisOblibeneMenu.items = new Array();
              nadpisOblibeneMenu.items.push({ label: preklady[polozkyMenu[oblibeneMenuEnum].menuText], icon: polozkyMenu[oblibeneMenuEnum].menuIcon, routerLink: polozkyMenu[oblibeneMenuEnum].routerLink, automationId: oblibeneMenuEnum });
              this.menuItems.push(nadpisOblibeneMenu);
              posledniNadpisEnum = polozkyMenu[oblibeneMenuEnum].nadpisMenuEnum;
            } else {
              nadpisOblibeneMenu.items?.push({ label: preklady[polozkyMenu[oblibeneMenuEnum].menuText], icon: polozkyMenu[oblibeneMenuEnum].menuIcon, routerLink: polozkyMenu[oblibeneMenuEnum].routerLink, automationId: oblibeneMenuEnum });
            }
          } else {
            this.menuItems.push({ label: preklady[polozkyMenu[oblibeneMenuEnum].menuText], icon: polozkyMenu[oblibeneMenuEnum].menuIcon, routerLink: polozkyMenu[oblibeneMenuEnum].routerLink, automationId: oblibeneMenuEnum });
          }
        }
      });
    });
  }

  vytvoritAUlozitEnumFromMenuItems() {
    const values = Object.values(PolozkaMenuEnum);
    //console.log(this.menuItems, this.oblibeneMenuEnums);
    this.oblibeneMenuEnums = new Array();
    this.menuItems.forEach(menuItem => {
      if (values.includes(menuItem.automationId)) {
        this.oblibeneMenuEnums.push(menuItem.automationId);
      }
      menuItem.items?.forEach(menuItemItem => {
        if (values.includes(menuItemItem.automationId)) {
          this.oblibeneMenuEnums.push(menuItemItem.automationId);
        }
      });
    });
    //console.log(this.oblibeneMenuEnums);
    this.ulozOblibeneMenu();
  }
}
