// main.ts
import localeCs from '@angular/common/locales/cs';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';

import * as packageJson_ from 'package.json';
const packageJson = packageJson_;

import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "https://91d076238ffedeb405c8293cc5a58882@sentry01.diamo.cz/43",

  sendClientReports: true,
  tracesSampleRate: 0.2,
});

Sentry.setTag("verze", packageJson.version);


registerLocaleData(localeCs);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));