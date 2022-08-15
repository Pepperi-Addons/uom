import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

import { PepHttpService, PepAddonService, PepCustomizationService } from '@pepperi-addons/ngx-lib';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { PepMenuModule } from '@pepperi-addons/ngx-lib/menu';
import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';

import { AtdConfigComponent } from '.';
import { AtdConfigService } from './atd-config.service';
import { InstallationComponent } from '../installation/installation.component'

@NgModule({
    declarations: [
        AtdConfigComponent,
        InstallationComponent,
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        PepSelectModule,
        PepButtonModule,
        PepMenuModule,
        TranslateModule.forChild(),
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
