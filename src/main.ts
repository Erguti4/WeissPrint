import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { CardSearchComponent } from './app/components/card-search/card-search.component';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(CardSearchComponent, {
  providers: [provideHttpClient()]
});
