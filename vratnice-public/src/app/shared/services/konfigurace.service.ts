import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KonfiguraceControllerService, KonfiguraceDto } from 'build/openapi';
import { PrimeNGConfig } from 'primeng/api';
import { BehaviorSubject, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as packageJson_ from 'package.json';
const packageJson = packageJson_;

@Injectable({
  providedIn: 'root'
})
export class KonfiguraceService {

  private readonly konfiguraceSubject = new BehaviorSubject<KonfiguraceDto | null>(null);
  readonly konfigurace$ = this.konfiguraceSubject.asObservable();

  //Čas pro znovuzavolání konfigurace - při změně verze se provede přenačtení stránky
  private timerSubscription: Subscription | undefined;
  private vychoziCas: number = 60 * 60; //1 hodina
  //private vychoziCas: number = 5 * 60;
  private posledniIndexHtml?: string;


  constructor(
    private readonly konfiguraceControllerService: KonfiguraceControllerService,
    private readonly primeNGConfig: PrimeNGConfig,
    private readonly httpClient: HttpClient,
    private readonly translateService: TranslateService
  ) {
  }

  getKonfigurace(): Observable<KonfiguraceDto | null> {
    return this.konfiguraceControllerService.detailKonfigurace()
      .pipe(
        map(response => {
          this.resetTimer();
          var nastavenyJazyk = localStorage.getItem("nastaveny-jazyk");
          if (!nastavenyJazyk) nastavenyJazyk = "cs";
          this.translateService.use(nastavenyJazyk);
          this.translateService.get('primeng').subscribe(
            res => this.primeNGConfig.setTranslation(res)
          );
          if (response.colorScheme) {
            this.loadStyle("styles_" + response.colorScheme.toLowerCase() + ".css");
          } else {
            this.loadStyle("styles_green.css");
          }
          return this.handleKonfiguraceResponse(response)
        }),
        catchError(_ => {
          this.loadStyle("styles_green.css");
          return of(null);
        })
      );
  }

  isKonfigurace() {
    return this.konfiguraceSubject.getValue() !== null;
  }

  getKonfiguraceData(): KonfiguraceDto | null {
    return this.konfiguraceSubject.getValue();
  }

  private handleKonfiguraceResponse(response: KonfiguraceDto): KonfiguraceDto | null {
    if (response) {
      this.konfiguraceSubject.next(response);
      return response;
    } else {
      this.konfiguraceSubject.next(null);
      return null;
    }
  }

  private loadStyle(styleName: string) {
    const head = document.querySelector('head')
    let themeLink = document.getElementById('style-scheme')
    if (themeLink) {
      themeLink.setAttribute("href", styleName + "?v=" + packageJson.version);
    } else {
      const linkNode = document.createElement("link");
      linkNode.setAttribute("id", "style-scheme");
      linkNode.setAttribute("rel", "stylesheet");
      linkNode.setAttribute("href", styleName + "?v=" + packageJson.version);
      head?.appendChild(linkNode);
    }
  }

  private resetTimer() {
    var casovac = timer(this.vychoziCas * 1000);
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = casovac.subscribe(
      () => {
        this.onTimeOut();
      }
    );
    if (!this.posledniIndexHtml) {
      var pathName: string = window.location.pathname;
      this.httpClient.get(pathName + 'index.html?' + new Date().toISOString(), { responseType: 'text' }).subscribe({
        next: (vysledek: any) => {
          this.posledniIndexHtml = vysledek;
        },
        error: (error) => {
        }
      });
    }
  }

  private onTimeOut() {
    //console.log("Timeout", new Date());
    //Zjistím znovu index.html - pokud se změnil tak je asi nová verze a přenačtu stránku
    this.timerSubscription?.unsubscribe();
    var pathName: string = window.location.pathname;
    this.httpClient.get(pathName + 'index.html?' + new Date().toISOString(), { responseType: 'text' }).subscribe({
      next: (vysledek: any) => {
        // console.log("index.html?", new Date(), vysledek);
        if (vysledek == this.posledniIndexHtml) {
          // console.log("stejná stánka");
          this.resetTimer();
        } else {
          // console.log("rozdílná stánka");
          //Znovunačtení stránky
          document.defaultView?.location.reload();
        }
      },
      error: (error) => {
        this.resetTimer();
      }
    });
  }
}
