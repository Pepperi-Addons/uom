import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepDialogModule } from '@pepperi-addons/ngx-lib/dialog';
import { PepListModule } from '@pepperi-addons/ngx-lib/list';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { PepTopBarModule } from '@pepperi-addons/ngx-lib/top-bar';

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
        PepListModule,
        PepDialogModule,
        PepTextboxModule,
        PepTopBarModule,
        MatDialogModule,
        PepButtonModule,
        TranslateModule
    ],
    providers: []
})
export class AddonModule {
}




