import { APP_INITIALIZER, ApplicationConfig, DEFAULT_CURRENCY_CODE, ErrorHandler, LOCALE_ID, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router, withHashLocation, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpBackend, provideHttpClient, withFetch } from '@angular/common/http';
import * as packageJson_ from '../../package.json';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module} from "ng-recaptcha";

import * as Sentry from "@sentry/angular";

const packageJson = packageJson_;
 
export function HttpLoaderFactory(http: HttpBackend) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: "./app/i18n/", suffix: ".json?v=" + packageJson.version },
    //{ prefix: "./app/shared/i18n/", suffix: ".json?v=" + packageJson.version },
  ]);
}
 

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes,withHashLocation()),
    provideAnimations(),
    provideHttpClient(withFetch()),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpBackend]
        },

        
        //defaultLanguage: 'cs'
      }),
      ConfirmationService,
      RecaptchaV3Module
    ),
    {provide: RECAPTCHA_V3_SITE_KEY, useValue: "6LdxRCEqAAAAAPod-t3GRdvUAJ8QbhYvAdIr6cgO"},
    MessageService,
    { provide: LOCALE_ID, useValue: 'cs-CZ' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'CZK' },
    { provide: ErrorHandler, useValue: Sentry.createErrorHandler({ showDialog: true }) },
    { provide: Sentry.TraceService, deps: [Router] },
    { provide: APP_INITIALIZER, useFactory: () => () => { }, deps: [Sentry.TraceService], multi: true },
  
  ]

};
