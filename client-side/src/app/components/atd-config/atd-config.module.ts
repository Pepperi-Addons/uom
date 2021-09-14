import { PepUIModule } from './../../modules/pepperi.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './../../modules/material.module';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { PepHttpService, PepFileService, PepNgxLibModule, PepAddonService, PepCustomizationService } from '@pepperi-addons/ngx-lib';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { AtdConfigComponent } from './index';
import {PepAddonLoaderService} from '@pepperi-addons/ngx-remote-loader'
import { PepDialogModule, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { AtdParentComponent } from '../atd-parent/atd-parent.component';
import { InstallationComponent } from '../installation/installation.component';

export function createTranslateLoader(http: HttpClient, fileService: PepFileService, addonService: PepAddonLoaderService) {
    const translationsPath: string = fileService.getAssetsTranslationsPath();
    const translationsSuffix: string = fileService.getAssetsTranslationsSuffix();
    // const addonStaticFolder = addonService.getAddonStaticFolder();
    const addonStaticFolder = addonService.getAddonPath("1238582e-9b32-4d21-9567-4e17379f41bb"); 

    return new MultiTranslateHttpLoader(http, [
        {
            prefix:
                addonStaticFolder.length > 0
                    ? addonStaticFolder + translationsPath
                    : translationsPath,
            suffix: translationsSuffix,
        },
        {
            prefix:
                addonStaticFolder.length > 0
                    ? addonStaticFolder + "assets/i18n/"
                    : "/assets/i18n/",
            suffix: ".json",
        },
    ]);
}
@NgModule({
    declarations: [
        AtdConfigComponent,
        AtdParentComponent,
        InstallationComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        HttpClientModule,
        // PepSelectModule,
        // PepButtonModule,
        // PepTopBarModule,
        // PepDialogModule,
        PepUIModule,

        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient, PepFileService, PepAddonLoaderService]
            }
        })
    ],
    exports:[AtdConfigComponent],
    providers: [
        TranslateStore,
        PepHttpService,
        PepAddonService,
        PepCustomizationService,
        PepDialogService
    ]
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
