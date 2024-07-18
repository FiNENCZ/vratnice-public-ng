import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppUserDto } from 'build/openapi';
import { map } from 'rxjs';
import { defaultSuccessLoginPage, defaultSuccessLoginPageQueryParams, specialSuccessLoginPage, specialSuccessLoginPageQueryParams, specialSuccessLoginPageRoles } from 'src/app/consts/app.const';
import { errorTxtFunction } from 'src/app/shared/functions/error-txt.function';
import { AuthService } from 'src/app/shared/services/auth.service';
import { KonfiguraceService } from 'src/app/shared/services/konfigurace.service';
import { OblibeneMenuService } from 'src/app/shared/services/oblibene-menu.service';
import { StyleService } from 'src/app/shared/services/style.service';
import { UiService } from 'src/app/shared/services/ui.service';

@Component({
  selector: 'app-login-sso-complete',
  templateUrl: './login-sso-complete.page.html'
})

export class LoginSsoCompletePage implements OnInit, OnDestroy {
  status?: "success" | "error" | "incomplete";
  textChyby?: string;

  constructor(
    private readonly konfiguraceService: KonfiguraceService,
    private readonly translateService: TranslateService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly uiService: UiService,
    private readonly oblibeneMenuService: OblibeneMenuService,
    private readonly authService: AuthService,
    private readonly styleService: StyleService
  ) {
    this.route.queryParams.subscribe(params => {
      //console.log(params);
      if (params['err'] == 2) {
        this.status = 'incomplete';
        this.textChyby = params['text'];
      } else if (params['err']) {
        this.status = 'error';
        this.textChyby = params['text'];
      } else {
        this.status = 'success';
        uiService.showSpinner();
        this.authService.isAuthenticated().subscribe({
          next: (vysledek: AppUserDto | null) => {
            if (vysledek) {
              let strankaPresmerovani = sessionStorage.getItem("presmerovani-url");
              if (strankaPresmerovani) {
                sessionStorage.removeItem("presmerovani-url");
                this.router.navigateByUrl(strankaPresmerovani).then(vysledek => this.uiService.stopSpinner());
              } else {
                if (this.authService.maUzivatelRole(specialSuccessLoginPageRoles)) {
                  this.router.navigate([specialSuccessLoginPage], specialSuccessLoginPageQueryParams).then(vysledek => this.uiService.stopSpinner());
                } else {
                  this.router.navigate([defaultSuccessLoginPage], defaultSuccessLoginPageQueryParams).then(vysledek => this.uiService.stopSpinner());
                }
              }
              this.oblibeneMenuService.nactiOblibeneMenu();
            } else {
              this.uiService.stopSpinner();
              this.status = 'error';
              this.textChyby = "Přihlášení se nepodařilo";      
            }
          },
          error: error => {
            this.uiService.stopSpinner();
            this.status = 'error';
            this.textChyby = error.error?.message ? error.error.message : (error.error ? errorTxtFunction(error.error) : errorTxtFunction(error));    
          }
        });
      }
    });
  }

  ngOnInit() {
    if (!this.konfiguraceService.isKonfigurace()) {
      this.konfiguraceService.getKonfigurace().subscribe();
    }
    this.styleService.addStyle('main', this.style());
    var nastavenyJazyk = localStorage.getItem("nastaveny-jazyk");
    if (!nastavenyJazyk) nastavenyJazyk = "cs";
    this.translateService.use(nastavenyJazyk);
  }

  ngOnDestroy() {
    this.styleService.removeStyle('main');
  }

  private style(): string {
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
      font-size: 16px;
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
    `;
  }

}
