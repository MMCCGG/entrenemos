import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './shared/app.config';
import { App } from './shared/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
