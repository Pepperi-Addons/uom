import { AtdConfigComponent } from './index';
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
    exports:[AtdConfigComponent]
})
export class AtdConfigModule {
}
