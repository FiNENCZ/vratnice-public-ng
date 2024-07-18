import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KonfiguraceDto } from 'build/openapi';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { defaultSuccessLoginPage, defaultSuccessLoginPageQueryParams, specialSuccessLoginPage, specialSuccessLoginPageQueryParams, specialSuccessLoginPageRoles } from 'src/app/consts/app.const';
import { AuthService } from 'src/app/shared/services/auth.service';
import { KonfiguraceService } from 'src/app/shared/services/konfigurace.service';
import { OblibeneMenuService } from 'src/app/shared/services/oblibene-menu.service';
import { StyleService } from 'src/app/shared/services/style.service';
import { UiService } from 'src/app/shared/services/ui.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: [],
})

export class LoginPage implements OnInit, OnDestroy {
  @Input() celyNazevAplikace: string = "";
  @Input() odkazZapomenuteHeslo: boolean = false;

  aktualniRok: number = new Date().getFullYear();
  pathName: string = window.location.pathname;

  constructor(
    private readonly authService: AuthService,
    private readonly uiService: UiService,
    private readonly oblibeneMenuService: OblibeneMenuService,
    private readonly messageService: MessageService,
    private readonly styleService: StyleService,
    private readonly konfiguraceService: KonfiguraceService,
    private readonly route: Router) {
  }

  login({ username, heslo }: { username: string, heslo: string }, formValid: boolean) {

    this.uiService.showSpinner();

    // this.authService.login(username, heslo)
    //   .subscribe({
    //     next: (authenticated) => {
    //       //await this.uiService.stopSpinner();
    //       //console.log(authenticated);
    //       if (authenticated.vysledek) {
    //         //Pokud je uložena stránka pro přesměrování tak se vrátím na ni
    //         let strankaPresmerovani = sessionStorage.getItem("presmerovani-url");
    //         if (strankaPresmerovani) {
    //           sessionStorage.removeItem("presmerovani-url");
    //           this.route.navigateByUrl(strankaPresmerovani).then(vysledek => this.uiService.stopSpinner());
    //         } else {
    //           if (this.authService.maUzivatelRole(specialSuccessLoginPageRoles)) {
    //             this.route.navigate([specialSuccessLoginPage], specialSuccessLoginPageQueryParams).then(vysledek => this.uiService.stopSpinner());
    //           } else {
    //             this.route.navigate([defaultSuccessLoginPage], defaultSuccessLoginPageQueryParams).then(vysledek => this.uiService.stopSpinner());
    //           }
    //         }
    //         this.oblibeneMenuService.nactiOblibeneMenu();
    //         //this.route.navigate(['/home'], {}).then(vysledek => this.uiService.stopSpinner());
    //       } else {
    //         this.uiService.stopSpinner();
    //         this.showLoginFailedToast(authenticated.text!);
    //       }
    //     },
    //     error: _ => {
    //       this.uiService.stopSpinner();
    //       this.showLoginFailedToast("Přihlášení se nepodařilo");
    //     }
    //   });
  }

  private showLoginFailedToast(chyba: string) {
    this.messageService.add({ severity: 'error', summary: "Chyba přihlášení", detail: chyba });
  }

  getKonfigurace(): Observable<KonfiguraceDto | null> {
    return this.konfiguraceService.konfigurace$;
  }

  ngOnInit() {
    this.styleService.addStyle('main', this.styleLogin());
  }

  ngOnDestroy() {
    this.styleService.removeStyle('main');
  }


  private styleLogin(): string {
    return `html,
    body {
    /*   height: 100%; */
      height: 90%;
    }

    body {
      display: -ms-flexbox;
      display: -webkit-box;
      display: flex;
      -ms-flex-align: center;
      -ms-flex-pack: center;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: center;
      justify-content: center;
      padding-left: 0px;
      padding-right: 0px;
      padding-top: 40px;
      padding-bottom: 40px;
      /*background-color: #f5f5f5;*/
      line-height: 1.5;
    }

    .page-wrapper {
      width: 100%;
      margin: auto;
    }

    .form-signin {
      width: 100%;
      max-width: 360px;
      padding: 15px;
      margin: 0 auto;
    }

    .form-signin .checkbox {
      font-weight: 400;
    }

    .form-signin .form-control {
      position: relative;
      box-sizing: border-box;
      height: auto;
      padding: 10px;
      font-size: 1rem;
    }

    .form-signin .form-control:focus {
      z-index: 2;
    }

    .form-signin input[type="text"] {
      margin-bottom: -1px;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    }

    .form-signin input[type="password"] {
      margin-bottom: 10px;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    body .ui-toast {
      width: 25em;
    }

    @media all and (min-width: 992px) {
      div.col-lg-12 {
        -ms-flex: 0 0 auto;
      }
    }

    /*
    .btn-primary {
      background-color: #2362a2;
      border-color: #2362a2;
    }

    .btn-primary.disabled, .btn-primary:disabled {
      background-color: #2362a2;
      border-color: #2362a2;
    }

    .btn-primary:hover {
      background-color: #254e80;
      border-color: #254e80;
    }

    .btn-primary:not(:disabled):not(.disabled).active,
    .btn-primary:not(:disabled):not(.disabled):active,
    .show>.btn-primary.dropdown-toggle {
      background-color: #2362a2;
      border-color: #2362a2;
    }

    .btn-primary.focus, .btn-primary:focus {
      background-color: #2362a2;
      border-color: #2362a2;
    }
    */


    .form-label-group {
      position: relative;
      margin-bottom: 0;
      margin-top: 0;
      /*margin-bottom: 1rem;*/
    }

    .form-signin .form-label-group input {
      height: 3.125rem;
      padding: .75rem;
    }

    .form-signin .form-label-group input:focus ~ label {
      font-size: 1rem;
      opacity: 0.5;
      height: 3.125rem;
      padding: .75rem;
    }

    .form-label-group label {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      width: 100%;
      margin-bottom: 0;
      line-height: 1.5;
      color: #495057;
      pointer-events: none;
      cursor: text; /* Match the input under the label */
      border: 1px solid transparent;
      border-radius: .25rem;
      transition: all .1s ease-in-out;
    }

    .form-label-group input::-webkit-input-placeholder {
      color: transparent;
    }

    .form-label-group input::-moz-placeholder {
      color: transparent;
    }

    .form-label-group input:-ms-input-placeholder {
      color: transparent;
    }

    .form-label-group input::-ms-input-placeholder {
      color: transparent;
    }

    .form-label-group input::placeholder {
      color: transparent;
    }

    .form-label-group input:not(:-moz-placeholder-shown) {
      padding-top: 1.25rem;
      padding-bottom: .25rem;
    }

    .form-label-group input:not(:-ms-input-placeholder) {
      padding-top: 1.25rem;
      padding-bottom: .25rem;
    }

    .form-label-group input:not(:placeholder-shown) {
      padding-top: 1.25rem;
      padding-bottom: .25rem;
    }

    .form-signin .form-label-group input:not(:-moz-placeholder-shown) ~ label {
      padding-top: .25rem;
      padding-bottom: .25rem;
      font-size: 12px;
      color: #777;
      opacity: 1;
    }

    .form-signin .form-label-group input:not(:-ms-input-placeholder) ~ label {
      padding-top: .25rem;
      padding-bottom: .25rem;
      font-size: 12px;
      color: #777;
      opacity: 1;
    }

    .form-signin .form-label-group input:not(:placeholder-shown) ~ label {
      padding-top: .25rem;
      padding-bottom: .25rem;
      font-size: 12px;
      color: #777;
      opacity: 1;
    }

    .form-signin .form-label-group input:-webkit-autofill ~ label {
      padding-top: .25rem;
      padding-bottom: .25rem;
      font-size: 12px;
      color: #777;
      opacity: 1;
    }

    /* Fallback for Edge
    -------------------------------------------------- */
    @supports (-ms-ime-align: auto) {
      .form-label-group {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-direction: column-reverse;
        flex-direction: column-reverse;
      }

      .form-label-group label {
        position: static;
      }

      .form-label-group input::-ms-input-placeholder {
        color: #777;
      }
    }

    `;
  }

}
