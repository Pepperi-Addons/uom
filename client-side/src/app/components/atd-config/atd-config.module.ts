// import { atdConfigScheme } from './../../../../../server-side/metadata';
// import { RouterModule, ActivatedRoute } from '@angular/router';
// import { PepTopBarModule } from '@pepperi-addons/ngx-lib/top-bar';
import { PepUIModule } from './../../modules/pepperi.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './../../modules/material.module';
// import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';
// import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { PepHttpService, PepFileService, PepNgxLibModule, PepAddonService, PepCustomizationService } from '@pepperi-addons/ngx-lib';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { AtdConfigComponent } from './index';
import {PepAddonLoaderService} from '@pepperi-addons/ngx-remote-loader'
import { PepDialogModule, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import {InstallationComponent} from './../installation/installation.component'

export function createTranslateLoader(http: HttpClient, fileService: PepFileService, addonService: PepAddonService) {
    const translationsPath: string = fileService.getAssetsTranslationsPath();
    const translationsSuffix: string = fileService.getAssetsTranslationsSuffix();
    // const addonurl = fileService.getAssetsPath()
    // const addonStaticFolder = addonService.getAddonPath("1238582e-9b32-4d21-9567-4e17379f41bb");// .getAddonStaticFolder();
    // debugger;
    // const addonStaticFolder = addonService.getAddonPath("1238582e-9b32-4d21-9567-4e17379f41bb"); //here is the problem
    //how can i doi that not hard coded?
    // const addonStaticFolder = 'https://cdn.pepperi.com/Addon/Public/1238582e-9b32-4d21-9567-4e17379f41bb/1.2.88/'
    const addonStaticFolder = addonService.getAddonStaticFolder();

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
                deps: [HttpClient, PepFileService, PepAddonService]
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
