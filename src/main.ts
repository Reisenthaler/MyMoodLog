import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { Storage } from '@ionic/storage-angular';

// ✅ HttpClient
import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

// ✅ ngx-translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { importProvidersFrom } from '@angular/core';
import { Observable } from 'rxjs';

// Import ngx-echarts provider
import { provideEchartsCore } from 'ngx-echarts';

// Import ECharts core and required parts
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// ✅ Register everything
echarts.use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

// ✅ Custom loader implementation
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

// ✅ Factory function
export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';

// Register the icon(s)
addIcons({
  'trash-outline': trashOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    Storage,

    // ✅ Provide HttpClient
    provideHttpClient(),

    // ✅ Import TranslateModule globally
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    
    provideEchartsCore({ echarts }),
    ],
});