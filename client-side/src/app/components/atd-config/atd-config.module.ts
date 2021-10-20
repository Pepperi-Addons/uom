import { PepUIModule } from './../../modules/pepperi.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './../../modules/material.module';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { PepHttpService, PepFileService, PepAddonService, PepCustomizationService } from '@pepperi-addons/ngx-lib';
import { AtdConfigComponent } from './index';
import { PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import {InstallationComponent} from './../installation/installation.component'
import { AtdConfigService } from './atd-config.service';

@NgModule({
    declarations: [
        AtdConfigComponent,
        InstallationComponent,
        
    ],
    imports: [
        CommonModule,
        MaterialModule,
        HttpClientModule,
        PepUIModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (http: HttpClient, fileService: PepFileService, addonService: PepAddonService) => 
                    PepAddonService.createDefaultMultiTranslateLoader(http, fileService, addonService, "1238582e-9b32-4d21-9567-4e17379f41bb"),
                deps: [HttpClient, PepFileService, PepAddonService],
            }, isolate: false
        }),
    ],
    exports:[AtdConfigComponent],
    providers: [
        TranslateStore,
        PepHttpService,
        PepAddonService,
        PepCustomizationService,
        PepDialogService,
        AtdConfigService
    ]
})
export class AtdConfigModule {
    constructor(
        translate: TranslateService,
        private addonService: PepAddonService,
    ) {
        this.addonService.setDefaultTranslateLang(translate);
    }
}
