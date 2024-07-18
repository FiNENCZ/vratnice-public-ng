import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KonfiguraceService } from 'src/app/shared/services/konfigurace.service';
import { StyleService } from 'src/app/shared/services/style.service';

@Component({
  selector: 'app-nedostupne-api',
  templateUrl: './nedostupne-api.page.html',
  styleUrls: ['./nedostupne-api.page.css']
})

export class NedostupneApiPage implements OnInit, OnDestroy {

  constructor(
    private readonly styleService: StyleService,
    private readonly translateService: TranslateService,
    private readonly konfiguraceService: KonfiguraceService
  ) {
  }

  ngOnInit() {
    if (!this.konfiguraceService.isKonfigurace()) {
      this.konfiguraceService.getKonfigurace().subscribe();
    }
    this.styleService.addStyle('main', this.styleNedostupneApi());
    var nastavenyJazyk = localStorage.getItem("nastaveny-jazyk");
    if (!nastavenyJazyk) nastavenyJazyk = "cs";
    this.translateService.use(nastavenyJazyk);
  }

  ngOnDestroy() {
    this.styleService.removeStyle('main');
  }

  private styleNedostupneApi(): string {
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
