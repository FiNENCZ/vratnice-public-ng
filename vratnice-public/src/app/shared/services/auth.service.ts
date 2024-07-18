import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as Sentry from "@sentry/angular";
import { AppUserDto, AuthControllerService, GrantedAuthority, UzivatelDto } from 'build/openapi';
import * as moment_ from 'moment';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable, Subscription, of, timer } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { VysledekHttpDto } from '../dto/vysledek-http.dto';
import { getCookie } from '../functions/getCookie.function';
import { AutoLogoutDialogService } from './auto-logout-dialog.service';
import { saveUrlPresmerovaniLoginFunction } from '../functions/url-presmerovani-login.function';
import { authCookieName } from 'src/app/consts/app.const';
const moment = moment_;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authCookieName = authCookieName;

  private readonly authoritySubject = new BehaviorSubject<AppUserDto | null>(null);
  readonly authority$ = this.authoritySubject.asObservable();

  public casExpirace: number = 0;
  private timerSubscription: Subscription | undefined;
  private autoLogoutDialogZobrazen: boolean = false;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authControllerService: AuthControllerService,
    private readonly autoLogoutDialogService: AutoLogoutDialogService,
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService,
    private router: Router) {
  }

  isAuthenticated(): Observable<AppUserDto | null> {
    //var pathName: string = window.location.pathname;
    //if (!pathName.endsWith("/")) pathName = pathName + "/"
    //return this.httpClient.get(pathName + 'api/authenticate', { responseType: 'json' })


    return this.authControllerService.authenticateAuth(this.translateService.currentLang)
      .pipe(
        map(response => {
          //console.log("isAuthenticated", response);
          var uzivatel = response as AppUserDto;
          Sentry.setUser({ id: uzivatel.idUzivatel, username: uzivatel.name, ip_address: "{{auto}}", segment: uzivatel.zavod?.nazev });
          this.resetTimer();
          return this.handleAuthResponse(uzivatel)
        }),
        //catchError(_ => of(true))
        catchError(_ => of(null))
      );
  }

  isLoggedIn() {
    return this.authoritySubject.getValue() !== null;
  }

  deleteLoginUser() {
    this.authoritySubject.next(null);
  }

  // login(username: string, password: string): Observable<VysledekHttpDto> {
  // return this.authControllerService.loginAuth(username, password, this.translateService.currentLang)
  //   .pipe(
  //     map(response => {
  //       var uzivatel = response as AppUserDto;
  //       Sentry.setUser({ id: uzivatel.idUzivatel, username: uzivatel.name, ip_address: "{{auto}}", segment: uzivatel.zavod?.nazev });
  //       this.resetTimer();
  //       return <VysledekHttpDto>{ vysledek: (this.handleAuthResponse(uzivatel) != null) };
  //     }),
  //     catchError(_error => {
  //       var textChyba = "Přihlášení se nepodařilo";
  //       if (_error as HttpErrorResponse) {
  //         if (_error.status == 401) {
  //           textChyba = "Kombinace zadaného jména a hesla neexistuje";
  //         } else {
  //           textChyba = _error.error.message ? _error.error.message : _error.message;
  //         }
  //       }
  //       return of(<VysledekHttpDto>{ vysledek: false, text: textChyba });
  //     })
  //   );
  // }

  // loginToken(token: string): Observable<VysledekHttpDto> {
  //   return this.authControllerService.loginTokenAuth(token, this.translateService.currentLang)
  //     .pipe(
  //       map(response => {
  //         var uzivatel = response as AppUserDto;
  //         Sentry.setUser({ id: uzivatel.idUzivatel, username: uzivatel.name, ip_address: "{{auto}}", segment: uzivatel.zavod?.nazev });
  //         this.resetTimer();
  //         return <VysledekHttpDto>{ vysledek: (this.handleAuthResponse(uzivatel) != null) };
  //       }),
  //       catchError(_error => {
  //         var textChyba = "Přihlášení se nepodařilo";
  //         if (_error as HttpErrorResponse) {
  //           if (_error.status == 401) {
  //             textChyba = "Kombinace zadaného jména a hesla neexistuje";
  //           } else {
  //             textChyba = _error.error.message ? _error.error.message : _error.message;
  //           }
  //         }
  //         return of(<VysledekHttpDto>{ vysledek: false, text: textChyba });
  //       })
  //     );
  // }

  logout(): Observable<void> {
    return this.logoutOnly()
      .pipe(
        tap(() => {
          this.authoritySubject.next(null);
          this.router.navigate(['/login-sso']);
          this.timerSubscription?.unsubscribe();
        })
      );
  }

  private logoutOnly(): Observable<void> {
    var pathName: string = window.location.pathname;
    return this.httpClient.get<void>(pathName + 'api/logout');
  }

  zmenaZavodu(idZavodu: string): Observable<VysledekHttpDto> {
    return this.authControllerService.zmenaZavoduAuth(idZavodu, this.translateService.currentLang)
      .pipe(
        map(response => {
          var uzivatel = response as AppUserDto;
          this.resetTimer();
          return <VysledekHttpDto>{ vysledek: (this.handleAuthResponse(uzivatel) != null) };
        }),
        catchError(_error => {
          var textChyba = "Změna zavodu se nepodařila";
          if (_error as HttpErrorResponse) {
            textChyba = _error.error.message ? _error.error.message : _error.message;
          }
          return of(<VysledekHttpDto>{ vysledek: false, text: textChyba });
        })
      );
  }

  zmenaZastupu(idZastupu: string): Observable<VysledekHttpDto> {
    return this.authControllerService.zmenaZastupuAuth(idZastupu, this.translateService.currentLang)
      .pipe(
        map(response => {
          var uzivatel = response as AppUserDto;
          this.resetTimer();
          return <VysledekHttpDto>{ vysledek: (this.handleAuthResponse(uzivatel) != null) };
        }),
        catchError(_error => {
          var textChyba = "Změna zástupu se nepodařila";
          if (_error as HttpErrorResponse) {
            textChyba = _error.error.message ? _error.error.message : _error.message;
          }
          return of(<VysledekHttpDto>{ vysledek: false, text: textChyba });
        })
      );
  }

  getIdUzivatel() {
    return this.authoritySubject.getValue()?.idUzivatel;
  }

  getWebsocketDestination() {
    return this.authoritySubject.getValue()?.webSocketOznameni;
  }

  getRoles() {
    return this.authoritySubject.getValue()?.authorities;
  }

  getBarvaPozadi() {
    return this.authoritySubject.getValue()?.zavod?.barvaPozadi;
  }

  getBarvaPismo() {
    return this.authoritySubject.getValue()?.zavod?.barvaPisma;
  }

  getUzivatelDto() {
    return this.authoritySubject.getValue()?.uzivatelDto;
  }

  getPruznaPracovniDoba() {
    return this.authoritySubject.getValue()?.pruznaPracDoba;
  }

  getOstatniZavody() {
    return this.authoritySubject.getValue()?.ostatniZavody;
  }

  getZavod() {
    return this.authoritySubject.getValue()?.zavod;
  }

  getZastupy() {
    return this.authoritySubject.getValue()?.zastupy;
  }

  maUzivatelRole(roles: string[]): boolean {
    return this.obsahujeRoli(this.getRoles(), roles);
  }

  obsahujeRoli(authorities: GrantedAuthority[] | undefined, roles: string[]): boolean {
    var nalezeno: boolean = false;
    authorities?.forEach(authority => {
      roles?.forEach(role => {
        if (authority.authority == role) {
          nalezeno = true;
          return;
        }
      });
      if (nalezeno) return;
    });
    return nalezeno;
  }

  private handleAuthResponse(response: AppUserDto): AppUserDto | null {
    if (response) {
      this.authoritySubject.next(response);
      return response;
    } else {
      this.authoritySubject.next(null);
      return null;
    }
  }

  getCasExpirace() {
    return this.casExpirace / 1000;
  }

  private getExpirationTime(): number {
    let expiration = 0;
    let expirationCookie = getCookie(this.authCookieName);
    if (expirationCookie) {
      expiration = Number.parseInt(expirationCookie);
      //Odečítám 2s kvůli zpoždění mezi serverem a klientem - když zůstalo původní zavolal jsem prodlouzení ale server uz odpověděl unauthorized
      expiration -= 2000;
    }
    return expiration;
  }

  resetTimer() {
    var casovac = timer(0, 1000);
    this.timerSubscription?.unsubscribe();
    this.autoLogoutDialogZobrazen = false;
    this.timerSubscription = casovac.subscribe(
      () => {
        //console.log("cislo", cislo, new Date());
        this.onTimeOut();
      }
    );
  }

  private onTimeOut() {
    let expiration = this.getExpirationTime();
    this.casExpirace = expiration - (new Date().setMilliseconds(0));

    //console.log("timeout", this.casExpirace);

    // 15 vteřin před koncem vyskočí okno s informací o odhlášení
    if (!this.autoLogoutDialogZobrazen && this.casExpirace <= 15000) {
      this.autoLogoutDialogZobrazen = true;
      let autoLogoutDialog = this.autoLogoutDialogService.showDialog();
      autoLogoutDialog.onClose.subscribe((zustatPrihlasen: boolean) => {
        if (zustatPrihlasen) {
          //this.resetTimer();
          this.autoLogoutDialogZobrazen = false;
        }
      });
    }
    // Pokud čas vyprší měl bych se přesměrovat na jinou stránku a vypnout timer
    if (this.casExpirace <= 0) {
      this.timerSubscription?.unsubscribe();
      this.casExpirace = 0;
      // this.logoutOnly().subscribe({
      //   error: (error) => {
      //     this.messageService.add({ severity: 'error', summary: error?.error?.message ? error?.error?.message : error?.message });
      //   }
      // });
      //this.deleteLoginUser();
      //Uložení poslední stránky do session nastavení prohlížeče pro opětovné přesměrování po přihlášení
      saveUrlPresmerovaniLoginFunction();
      this.router.navigate(['neaktivita', { timer: true }]).then(() => {
        document.defaultView?.location.reload();
      });
    }
  }

  isExpired() {
    let expiration = this.getExpirationTime();
    if (expiration <= 0) {
      return true;
    }

    if ((expiration - new Date().getTime()) <= 0) {
      return true;
    }
    // console.log(expiration);
    // console.log(new Date(expiration));
    // console.log(new Date().getTime());

    //Spustím časovač
    this.resetTimer();

    return false;
  }
}
