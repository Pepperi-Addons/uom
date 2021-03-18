import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PepUIModule } from '../../modules/pepperi.module';
import { MaterialModule } from '../../modules/material.module';
import { AddonComponent } from './addon.component';
import { UomListComponent } from '../uom-list/uom-list.component';
import { AddUomDialogComponent } from '../../dialogs/add-uom-dialog/add-uom-dialog.component'
@NgModule({
    declarations: [
        AddonComponent,
        UomListComponent,
        AddUomDialogComponent
    ],
    imports: [
        CommonModule,
        PepUIModule,
        MaterialModule,

    ],
    providers: []
})
export class AddonModule {
}




