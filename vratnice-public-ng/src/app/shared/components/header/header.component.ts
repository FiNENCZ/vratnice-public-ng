import { DragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppUserDto, KonfiguraceDto, OznameniControllerService, OznameniDto, ZastupSimpleDto, ZavodDto } from 'build/openapi';
import * as packageJson_ from 'package.json';
import { MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { TieredMenu } from 'primeng/tieredmenu';
import { nadpisyMenu } from 'src/app/consts/nadpisy-menu.const';
import { polozkyMenu } from 'src/app/consts/polozky-menu.const';
import { errorTxtFunction } from '../../functions/error-txt.function';
import { IWebsocketMessageReceive } from '../../interfaces/websocket-message-receive.interface';
import { AuthService } from '../../services/auth.service';
import { KonfiguraceService } from '../../services/konfigurace.service';
import { OblibeneMenuService } from '../../services/oblibene-menu.service';
import { StyleService } from '../../services/style.service';
import { UiService } from '../../services/ui.service';
import { WebSocketAPI } from '../../services/wesocket.api';
import { Observable } from 'rxjs';
const packageJson = packageJson_;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ["header.component.css"]
})

export class HeaderComponent implements OnInit, OnDestroy, IWebsocketMessageReceive {
  @Input() nazevAplikace: string = "";
  @Input() verzeAplikace: string = "";
  polozkyMenu = polozkyMenu;
  nadpisyMenu = nadpisyMenu;
  OznameniDtoTypEnum = OznameniDto.TypEnum;
  pathName: string = window.location.pathname;
  asistTech: boolean = false;
  nastavenyJazyk: string;
  oznameni?: OznameniDto[];
  pocetNeprectenychOznameni: number = 0;
  private pocetOznameni: number = -1;
  // wsStatusEnum = WebSocketMessageDto.StatusEnum;
  userMenuItems: MenuItem[] = new Array();

  appDisplayName = packageJson.displayName;

  constructor(
    public readonly authService: AuthService,
    protected readonly oblibeneMenuService: OblibeneMenuService,
    private readonly dragDrop: DragDrop,
    private readonly styleService: StyleService,
    private readonly uiService: UiService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly primeNGConfig: PrimeNGConfig,
    private readonly konfiguraceService: KonfiguraceService,
    private readonly oznameniControllerService: OznameniControllerService,
    private readonly translateService: TranslateService,
    private readonly webSocketAPI: WebSocketAPI
  ) {
    this.nastavenyJazyk = this.translateService.currentLang;
    this.sestavUserMenu();
  }

  private sestavUserMenu() {
    this.userMenuItems = new Array();
    this.translateService.get(["HEADER.LOGOUT", "HEADER.PORTAL", "HEADER.ZMENA_HESLA", "HEADER.ZAM_NASTAVENI", "HEADER.ZMENIT_ZAVOD", "HEADER.ZASTUPY"]).subscribe((preklady: any) => {
      if (this.authService.getOstatniZavody() && this.authService.getOstatniZavody()!.length > 0) {
        var menuItemZmeniZavod: MenuItem = { label: preklady["HEADER.ZMENIT_ZAVOD"], icon: "fa-solid fa-industry" };
        menuItemZmeniZavod.items = new Array();
        this.authService.getOstatniZavody()?.forEach((zavod: ZavodDto) => {
          menuItemZmeniZavod.items?.push({ label: zavod.nazev, command: event => this.zmenaZavodu(zavod) });
        });
        this.userMenuItems.push(menuItemZmeniZavod);
        this.userMenuItems.push({ separator: true });
      }
      // if (!this.authService.getKmenovy()) {
      //   this.userMenuItems.push({ label: preklady["HEADER.ZMENA_HESLA"], icon: "fa-solid fa-key", routerLink: "/private/zmena-heslo" });
      // } else {

      if (this.authService.getZastupy() && this.authService.getZastupy()!.length > 0) {
        var menuItemZmeniZavod: MenuItem = { label: preklady["HEADER.ZASTUPY"], icon: "fa-solid fa-people-arrows" };
        menuItemZmeniZavod.items = new Array();
        this.authService.getZastupy()?.forEach(zastup => {
          menuItemZmeniZavod.items?.push({ label: zastup.nazev, command: event => this.zmenaZastup(zastup) });
        });
        this.userMenuItems.push(menuItemZmeniZavod);
        this.userMenuItems.push({ separator: true });
      }

      //this.userMenuItems.push({ label: preklady["HEADER.ZMENA_HESLA"], icon: "fa-solid fa-key", target: "_blank", url: "https://sso.diamo.cz:8445/realms/diamo/account/#/security/signingin" });
      this.userMenuItems.push({ label: preklady["HEADER.ZMENA_HESLA"], icon: "fa-solid fa-key", target: "_blank", url: this.konfiguraceService.getKonfiguraceData()?.zmenaHeslaUrl });
      // }

      if (this.konfiguraceService.getKonfiguraceData()?.portalUrl) {
        this.userMenuItems.push({ separator: true });
        this.userMenuItems.push({ label: preklady["HEADER.PORTAL"], icon: "fa-solid fa-signs-post", command: event => this.presmerovatPortal() });
      }

      this.userMenuItems.push({ separator: true });
      this.userMenuItems.push({ label: preklady["HEADER.LOGOUT"], icon: "fas fa-sign-out-alt", command: event => this.logout() });
    });
  }

  presmerovatPortal() {
    this.uiService.showSpinner();
    window.location.href = this.konfiguraceService.getKonfiguraceData()?.portalUrl!;
    // this.authControllerService.refreshTokenAuth(this.translateService.currentLang).subscribe({
    //   next: (vysledek: string) => {
    //     this.uiService.stopSpinner();
    //     //window.location.href = this.konfiguraceService.getKonfiguraceData()?.portalUrl + '/#/login-token;token=' + vysledek;
    //     window.location.href = this.konfiguraceService.getKonfiguraceData()?.portalUrl + '/#/login-token;token=' + vysledek;
    //   },
    //   error: (error) => {
    //     this.uiService.stopSpinner();
    //     this.messageService.add({ severity: 'error', summary: error.error.message ? error.error.message : errorTxtFunction(error.error) });
    //   }
    // })
  }

  getPrihlasenyUzivatel(): Observable<AppUserDto | null> {
    return this.authService.authority$;
  }

  logout() {
    this.uiService.showSpinner();
    this.authService.logout().subscribe({
      next: () => { this.uiService.stopSpinner(); },
      error: (error: any) => {
        if (error.status == 504) {
          this.messageService.add({ severity: 'error', summary: "Server neodpovídá. Zkuste to později." });
        } else {
          this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
        }
      }
    });
  }

  getKonfigurace(): Observable<KonfiguraceDto | null> {
    return this.konfiguraceService.konfigurace$;
  }

  profile() {
    this.router.navigate(['/private/profile']);
  }

  zmenaZavodu(zavodDto: ZavodDto) {
    this.uiService.showSpinner();
    this.authService.zmenaZavodu(zavodDto.id!).subscribe({
      next: () => {
        this.uiService.stopSpinner();
        document.defaultView?.location.reload();
      },
      error: (error: any) => {
        if (error.status == 504) {
          this.messageService.add({ severity: 'error', summary: "Server neodpovídá. Zkuste to později." });
        } else {
          this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
        }
      }
    });
  }


  zmenaZastup(zastupSimpleDto: ZastupSimpleDto) {
    this.uiService.showSpinner();
    this.authService.zmenaZastupu(zastupSimpleDto.idUzivatel!).subscribe({
      next: () => {
        this.uiService.stopSpinner();
        document.defaultView?.location.reload();
      },
      error: (error) => {
        if (error.status == 504) {
          this.messageService.add({ severity: 'error', summary: "Server neodpovídá. Zkuste to později." });
        } else {
          this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
        }
      }
    });
  }

  ngOnInit(): void {
    document.querySelector('.search-icon')?.addEventListener('click', event => {
      let searchWrapper = (event.target as any)?.parentElement?.parentElement;
      if (searchWrapper) {
        while (!searchWrapper.classList.contains("search-wrapper")) {
          searchWrapper = searchWrapper.parentElement;
        }
        searchWrapper.classList.add("active");
      }
    });
    document.querySelector('.search-wrapper .close')?.addEventListener('click', event => {
      let searchWrapper = (event.target as any)?.parentElement;
      if (searchWrapper) {
        searchWrapper.classList.remove("active");
      }
    });

    document.querySelectorAll('.close-sidebar-btn')?.forEach(element => {
      element.addEventListener('click', event => {
        let tlacitko = event.target as Element;
        while (tlacitko.nodeName.toUpperCase() != "BUTTON") {
          tlacitko = tlacitko.parentElement!;
        }
        var e = (tlacitko as Element).getAttribute("data-class");
        document.querySelector('.app-container')?.classList.toggle(e!);
        tlacitko.classList.contains("is-active") ? tlacitko.classList.remove("is-active") : tlacitko.classList.add("is-active");
      });
    });

    document.querySelectorAll('.mobile-toggle-nav')?.forEach(element => {
      element.addEventListener('click', event => {
        let tlacitko = event.target as Element;
        while (tlacitko.nodeName.toUpperCase() != "BUTTON") {
          tlacitko = tlacitko.parentElement!;
        }
        tlacitko.classList.toggle("is-active");
        document.querySelector('.app-container')?.classList.toggle("sidebar-mobile-open");
      });
    });

    document.querySelectorAll('.mobile-toggle-header-nav')?.forEach(element => {
      element.addEventListener('click', event => {
        let tlacitko = event.target as Element;
        while (tlacitko.nodeName.toUpperCase() != "BUTTON") {
          tlacitko = tlacitko.parentElement!;
        }
        tlacitko.classList.toggle("active");
        document.querySelector('.app-header__content')?.classList.toggle("header-mobile-open");
      });
    });

    if (this.authService.getBarvaPozadi() && !this.konfiguraceService.getKonfiguraceData()?.demo) {
      this.styleService.addStyle('barvyZavod',
        `
      .app-header.header-shadow,
      .app-header .app-header__content.header-mobile-open {
        background: linear-gradient(45deg, white, ` + this.authService.getBarvaPozadi() + `);
      }
    ` + (this.authService.getBarvaPismo() ?
          `
      .app-header .logout-timer,
      .app-header .header-dots .icon-wrapper-alt,
      .app-header .app-header-right .widget-content-wrapper .btn.dropdown-toggle.drop-down-two-lines,
      .app-header .app-header-right .widget-content-wrapper .btn.dropdown-toggle.drop-down-two-lines .text-secondary {
        color: ` + this.authService.getBarvaPismo() + ` !important;
      }
    `: ``)
      );
    }

    //Vytvořím connect na websocket
    if (this.authService.isLoggedIn()) {
      if (this.authService.getWebsocketDestination()) {
        this.webSocketAPI.disconnectAndConnect(this.authService.getWebsocketDestination()!, this);
        this.nacistSeznamOznameni();
      }
    } else {
      this.webSocketAPI.disconnect();
    }
  }

  aktualizaceOznameni(_this: HeaderComponent): void {
    _this.nacistSeznamOznameni();
    //_this.oznameni.push(webSocketMessageDto);
  }

  private nacistSeznamOznameni() {
    this.oznameniControllerService.listOznameni(this.translateService.currentLang).subscribe({
      next: (vysledek: OznameniDto[]) => {
        if (this.pocetOznameni != -1 && this.pocetOznameni < vysledek.length) {
          this.translateService.get('HEADER.NOVA_AVIZACE').subscribe((resVysledek: string) => {
            this.messageService.add({ severity: 'success', summary: resVysledek });
          });
        }
        this.pocetOznameni = vysledek.length;
        this.pocetNeprectenychOznameni = 0;
        this.oznameni = vysledek;
        this.oznameni.forEach(ozn => {
          if (!ozn.precteno) {
            this.pocetNeprectenychOznameni++;
          }
        });
      },
      error: (error: any) => {
        console.error("Chyba načtení seznamu oznámení", error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)));
        //this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
      }
    })
  }

  private precteneOznameni(oznameniDto: OznameniDto) {
    oznameniDto.precteno = true;
    this.oznameniControllerService.prectenoOznameni(oznameniDto.id!, this.translateService.currentLang).subscribe({
      error: (error: any) => {
        oznameniDto.precteno = false;
        console.error("Chyba nastavení přečteného oznámení", error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)));
        //this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
      }
    })
  }

  klikOznameni(oznameniDto: OznameniDto, event: any): boolean {
    event.stopPropagation();
    if (!oznameniDto.precteno) {
      this.precteneOznameni(oznameniDto);
    }
    if (oznameniDto.url) {
      return true;
    }
    return false;
  }

  odstranitOznameni(oznameniDto: OznameniDto, index: number, event: any) {
    event.stopPropagation();
    this.oznameniControllerService.odstranitOznameni(oznameniDto.id!, this.translateService.currentLang).subscribe({
      next: () => {
        this.oznameni?.splice(index, 1);
      },
      error: (error: any) => {
        console.error("Chyba nastavení odstranění oznámení", error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)));
        //this.messageService.add({ severity: 'error', summary: error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error)) });
      }
    });
    return false;
  }

  ngOnDestroy() {
    this.styleService.removeStyle('barvyZavod');
  }

  nastavJazyk(jazyk: string) {
    this.translateService.use(jazyk);
    this.translateService.get('primeng').subscribe(
      (res: any) => this.primeNGConfig.setTranslation(res)
    );
    this.nastavenyJazyk = jazyk;
    localStorage.setItem("nastaveny-jazyk", jazyk);
    this.sestavUserMenu();
    this.oblibeneMenuService.nactiOblibeneMenu();
  }

  dragDropMenuOblibene(tieredMenu: TieredMenu, odstranitOblibeneDiv: HTMLDivElement) {
    //console.log(tieredMenu, odstranitOblibeneDiv, tieredMenu.container.clientWidth, tieredMenu.container.offsetWidth, tieredMenu.container.style);
    odstranitOblibeneDiv.style.width = tieredMenu?.container?.clientWidth + "px";
    var nodeDivMenu = tieredMenu.container;
    var nodeMenu = nodeDivMenu?.firstChild?.firstChild as any;
    if (nodeMenu) {
      var dropList = this.dragDrop.createDropList(nodeMenu);
      var nodeList = nodeMenu?.children;
      var seznam: any[] = new Array();
      for (let index = 0; index < nodeList.length; index++) {
        const element = nodeList[index];
        var dragRef = this.dragDrop.createDrag(element);
        seznam.push(dragRef);
      }
      dropList.withItems(seznam);
      dropList.data = seznam;
      dropList.beforeStarted.subscribe((event: any) => {
        nodeDivMenu?.classList.add('cdk-drop-list-dragging');
        odstranitOblibeneDiv.style.visibility = "visible";
      });

      dropList.dropped.subscribe((event: any) => {
        nodeDivMenu?.classList.remove('cdk-drop-list-dragging');
        odstranitOblibeneDiv.style.visibility = "hidden";
        //console.log(event);
        if (event.previousIndex != event.currentIndex) {
          var oblibeneMenuItems = this.oblibeneMenuService.oblibeneMenuItems();
          //console.log(oblibeneMenuItems[event.previousIndex], oblibeneMenuItems[event.currentIndex]);
          moveItemInArray(oblibeneMenuItems, event.previousIndex, event.currentIndex);
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
          this.oblibeneMenuService.vytvoritAUlozitEnumFromMenuItems();
          //console.log(oblibeneMenuItems);
          tieredMenu.toggle(event);
          tieredMenu.toggle(event);
        }
      });


      var dropListOdstraneni = this.dragDrop.createDropList(odstranitOblibeneDiv);
      dropListOdstraneni.dropped.subscribe((event: any) => {
        nodeDivMenu?.classList.remove('cdk-drop-list-dragging');
        (event.previousContainer.element as any).classList.remove('cdk-drop-list-dragging');
        odstranitOblibeneDiv.style.visibility = "hidden";
        dropList.disabled = false;
        //console.log(event);
        //console.log(event.item.getRootElement().firstElementChild?.getAttribute("data-automationid"));
        const hledaneId = event.item.getRootElement().firstElementChild?.getAttribute("data-automationid");
        var odstraneno = false;
        for (var indexHlavni = 0; indexHlavni < this.oblibeneMenuService.oblibeneMenuItems().length; indexHlavni++) {
          const polozkaMenu = this.oblibeneMenuService.oblibeneMenuItems()[indexHlavni];
          if (polozkaMenu.automationId == hledaneId) {
            //Odstranění
            //console.log("odstranit", polozkaMenu, index);
            this.oblibeneMenuService.oblibeneMenuItems().splice(indexHlavni, 1);
            //event.item.dispose();
            //console.log(event.previousContainer.data);
            event.previousContainer.data.splice(indexHlavni, 1);
            //console.log(event.previousContainer.data);
            event.previousContainer.withItems(event.previousContainer.data);
            odstraneno = true;
            break;
          }
          if (polozkaMenu.items && polozkaMenu.items.length > 0) {
            for (let index = 0; index < polozkaMenu.items.length; index++) {
              const polozkaSubmenu = polozkaMenu.items[index];
              if (polozkaSubmenu.automationId == hledaneId) {
                //Odstranění
                //console.log("odstranit", polozkaSubmenu, index);
                polozkaMenu.items.splice(index, 1);
                event.previousContainer.data.splice(index, 1);
                //console.log(event.previousContainer.data);
                event.previousContainer.withItems(event.previousContainer.data);

                //Pokud jsou odstraněny všechny položky pokusím se odstranit i hlavní nadpis
                if (polozkaMenu.items.length == 0) {
                  this.oblibeneMenuService.oblibeneMenuItems().splice(indexHlavni, 1);
                  dropList.data.splice(indexHlavni, 1);
                  dropList.withItems(dropList.data);
                }
                odstraneno = true;
                break;
              }
            }
          }
          if (odstraneno) break;
        }
        this.oblibeneMenuService.vytvoritAUlozitEnumFromMenuItems();
        tieredMenu.toggle(event);
        tieredMenu.toggle(event);
        // if (event.previousIndex != event.currentIndex) {
        //   let oblibeneMenuItems = this.oblibeneMenuService.oblibeneMenuItems();
        //   //console.log(oblibeneMenuItems[event.previousIndex], oblibeneMenuItems[event.currentIndex]);
        //   moveItemInArray(oblibeneMenuItems, event.previousIndex, event.currentIndex);
        //   this.oblibeneMenuService.vytvoritAUlozitEnumFromMenuItems();
        // }
      });
      dropList.connectedTo([dropListOdstraneni]);


      //Podmenu - ty jeste moc dobre nejdou
      nodeMenu.querySelectorAll('p-tieredmenusub ul').forEach((dalsiMenu: any) => {
        var dropListDalsiMenu = this.dragDrop.createDropList(dalsiMenu);
        var nodeListDalsiMenu = dalsiMenu?.children;
        //console.log(nodeList);
        var seznamDalsiMenu: any[] = new Array();
        for (let index = 0; index < nodeListDalsiMenu.length; index++) {
          const element = nodeListDalsiMenu[index];
          var dragRef = this.dragDrop.createDrag(element);
          dragRef.beforeStarted.subscribe((event: any) => {
            dropList.disabled = true;
          });
          seznamDalsiMenu.push(dragRef);
        }
        dropListDalsiMenu.withItems(seznamDalsiMenu);
        dropListDalsiMenu.data = seznamDalsiMenu;
        dropListDalsiMenu.beforeStarted.subscribe((event: any) => {
          dalsiMenu.classList.add('cdk-drop-list-dragging');
          odstranitOblibeneDiv.style.visibility = "visible";
        });

        dropListDalsiMenu.dropped.subscribe((event: any) => {
          dalsiMenu.classList.remove('cdk-drop-list-dragging');
          odstranitOblibeneDiv.style.visibility = "hidden";
          //console.log(event);
          dropList.disabled = false;
          //console.log(dropListDalsiMenu, (dropListDalsiMenu.element as any).parentElement, (dropListDalsiMenu.element as any).parentElement.parentElement, (dropListDalsiMenu.element as any).parentElement.parentElement.firstChild);
          //console.log((dropListDalsiMenu.element as any).parentElement.parentElement.firstChild.attributes["data-automationid"].value);

          if (event.previousIndex != event.currentIndex) {
            let oblibeneMenuItems = this.oblibeneMenuService.oblibeneMenuItems();
            for (let index = 0; index < oblibeneMenuItems.length; index++) {
              const oblibeneMenuItem = oblibeneMenuItems[index];
              if (oblibeneMenuItem.automationId == (dropListDalsiMenu.element as any).parentElement.parentElement.firstChild.attributes["data-automationid"].value) {
                //console.log(oblibeneMenuItem);
                if (oblibeneMenuItem.items) {
                  moveItemInArray(oblibeneMenuItem.items!, event.previousIndex, event.currentIndex);
                  moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
                  this.oblibeneMenuService.vytvoritAUlozitEnumFromMenuItems();
                  tieredMenu.toggle(event);
                  tieredMenu.toggle(event);
                }
                break;
              }
            }
          }
        });
        dropListDalsiMenu.connectedTo([dropListOdstraneni]);
      });





    }


  }




  // odkazLogoClick() {
  //   //Přesměrování a refresh
  //   this.router.navigateByUrl(this.odkazLogoStranka ? this.odkazLogoStranka.replace("#","") : '/').then(() => {
  //     document.defaultView.location.reload();
  //   });
  // }

}

