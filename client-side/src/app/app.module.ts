import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { PepUIModule } from './modules/pepperi.module';
import { MaterialModule } from './modules/material.module';
import { AddonModule } from './components/addon/addon.module';
import { AtdConfigModule } from './components/atd-config';
import { HttpClient } from '@angular/common/http';
import { PepAddonService, PepFileService, PepLoaderService } from '@pepperi-addons/ngx-lib';
import { PepAddonLoaderService } from '@pepperi-addons/ngx-remote-loader';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
// import {PepPageLayoutModule} from '@pepperi-addons/ngx-lib/'


export function createTranslateLoader(http: HttpClient, fileService: PepFileService, addonService: PepAddonService) {
    const translationsPath: string = fileService.getAssetsTranslationsPath();
    const translationsSuffix: string = fileService.getAssetsTranslationsSuffix();
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
        AppComponent,


    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        PepUIModule,
        MaterialModule,
        AddonModule,

        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient, PepFileService, PepAddonService]
            }
        })
        // AtdConfigModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}




