// main.ts
import localeCs from '@angular/common/locales/cs';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';


registerLocaleData(localeCs);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));