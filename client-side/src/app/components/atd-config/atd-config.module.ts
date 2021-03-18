import { AtdConfigComponent } from './atd-config.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PepUIModule } from '../../modules/pepperi.module';
import { MaterialModule } from '../../modules/material.module';

@NgModule({
    declarations: [
        AtdConfigComponent
    ],
    imports: [
        CommonModule,
        PepUIModule,
        MaterialModule,
    ],
    providers: []
})
export class AtdConfigModule {
}
