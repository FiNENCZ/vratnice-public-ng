import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { saveUrlPresmerovaniLoginFunction } from '../functions/url-presmerovani-login.function';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  //private authOk = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

    // console.log(req);
    // if (this.authOk) return next.handle(req);
    // this.authOk = true;
    // return this.authService.login("ahoj", "nazdar").pipe(
    //   switchMap(() => {
    //     console.log("vysledek");        
    //     return next.handle(req);
    //   })
    // );

    // this.authService.login("ahoj", "nazdar").subscribe(

    // )
    //return next.handle(req);
    //console.log(req);

    return next.handle(req).pipe(tap(
      (data: any) => {
        if (data instanceof HttpResponse) {
          var pathName = window.location.origin + window.location.pathname;
          const regex = new RegExp(pathName, "g");
          if (data.url?.search(regex) == -1) {
            return;
          }
          //console.log("reset časovač!");
          //this.authService.resetTimer();
        }
      },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status !== 401) {
            return;
          }
          //Otestuju zda se nevolalo /api/authenticate - to má vracet unauthorized (401) jinak další test a přesměrování na vypršení  přihlášení
          const regex = /api\/authenticate$/g;
          if (req.url.search(regex) != -1) {
            return;
          }

          //Zjistím zda jsem přihlášen nebo jen přistupuju k metodě kam nemám
          // this.authService.isAuthenticated().subscribe(
          //   (appUserDto: AppUserDto) => {
          //     console.log("appUserDto", appUserDto);
          //     if (!appUserDto) {
          //       this.authService.deleteLoginUser();
          //       this.router.navigate(['neaktivita']);
          //     }
          //   }
          // );

          //Zjistím zda jsem přihlášen
          if (!this.authService.isLoggedIn()) {
            return;
          }
          this.authService.deleteLoginUser();

          //Uložení poslední stránky do session nastavení prohlížeče pro opětovné přesměrování po přihlášení
          saveUrlPresmerovaniLoginFunction();

          //Přesměrování a refresh page          
          this.router.navigate(['neaktivita']).then(() => {
            document.defaultView?.location.reload();
          });
        }
      }));
  }

}
