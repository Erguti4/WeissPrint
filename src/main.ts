import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component'; // Asegúrate de importar AppComponent
import { provideHttpClient } from '@angular/common/http';
import { appConfig } from './app/app.config'; // Importa appConfig

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));