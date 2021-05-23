import { AtdConfigComponent } from './index';
import { CommonModule } from '@angular/common';
import { Injectable, NgModule } from '@angular/core';
import { PepUIModule } from '../../modules/pepperi.module';
import { MaterialModule } from '../../modules/material.module';

import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { PepAddonService, PepFileService } from '@pepperi-addons/ngx-lib';

// export function createTranslateLoader(http: HttpClient) {
//    return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
// }

@Injectable({providedIn: 'root'})
export class HttpClientTrans extends HttpClient {
  constructor(handler: HttpBackend) {
    super(handler);
  }
}

export function createSubAddonTranslateLoader(http: HttpClientTrans, fileService: PepFileService) {
    const addonStaticFolder = getAddonStaticFolder();
    const translationsPath: string = fileService.getAssetsTranslationsPath();
    const translationsSuffix: string = fileService.getAssetsTranslationsSuffix();

    return new MultiTranslateHttpLoader(http, [
        {
            prefix:
                addonStaticFolder.length > 0
                    ? addonStaticFolder + '/' + translationsPath 
                    : translationsPath,
            suffix: translationsSuffix,
        },
        {
            prefix:
                addonStaticFolder.length > 0
                    ? addonStaticFolder + "/assets/i18n/" 
                    : "/assets/i18n/",
            suffix: ".json",
        },
    ]);
    //return new TranslateHttpLoader(http, '/assets/i18n/', '.json')
}

function getAddonStaticFolder() {
    const scripts = document.getElementsByTagName("script");
    const srcArray = scripts[scripts.length-1].src.split('/');
    srcArray.pop();
    return srcArray.join('/');
}

@NgModule({
    declarations: [
        AtdConfigComponent
    ],
    imports: [
        CommonModule,
        PepUIModule,
        MaterialModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createSubAddonTranslateLoader,
                deps: [HttpClientTrans, PepFileService]
            }
        })
    ],
    exports:[AtdConfigComponent]
})


export class AtdConfigModule {
    constructor(
        translate: TranslateService
    ) {

      let userLang = 'en';
      translate.setDefaultLang(userLang);
      userLang = translate.getBrowserLang().split('-')[0]; // use navigator lang if available

      if (location.href.indexOf('userLang=en') > -1) {
          userLang = 'en';
      }

      // the lang to use, if the lang isn't available, it will use the current loader to get them
      translate.use(userLang).subscribe((res: any) => {
          // In here you can put the code you want. At this point the lang will be loaded
      });
  }
}
