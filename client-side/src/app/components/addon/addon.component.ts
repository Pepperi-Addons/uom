import { UomListComponent } from './../uom-list/uom-list.component';
import { Uom } from './../../../../../shared/entities';
import { AddUomDialogComponent } from './../../dialogs/add-uom-dialog/add-uom-dialog.component';
import {
    Component,
    EventEmitter,
    Input,
    Output,
    OnInit,
    ViewEncapsulation,
    Compiler,
    ViewChild,
    OnDestroy,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Router, ActivatedRoute } from "@angular/router";
import { KeyValuePair, PepLayoutService, PepScreenSizeType } from '@pepperi-addons/ngx-lib';
import { AddonService } from './addon.service';
import { PepDialogActionButton } from "@pepperi-addons/ngx-lib/dialog";


@Component({
  selector: 'addon-addon',
  templateUrl: './addon.component.html',
  styleUrls: ['./addon.component.scss'],
  providers: [AddonService]
})
export class AddonComponent implements OnInit {
    screenSize: PepScreenSizeType;
    @ViewChild(UomListComponent, { static: false }) uomListComp: UomListComponent;


    constructor(
        public pluginService: AddonService,
        private translate: TranslateService,
        public routeParams: ActivatedRoute,
        public router: Router,
        public compiler: Compiler,
        public layoutService: PepLayoutService,
    ) {

        // Parameters sent from url
        this.pluginService.pluginUUID = this.routeParams.snapshot.params['addon_uuid'];
        let userLang = "en";
        translate.setDefaultLang(userLang);
        userLang = translate.getBrowserLang().split("-")[0]; // use navigator lang if available
        translate.use(userLang);
        this.layoutService.onResize$.subscribe(size => {
            this.screenSize = size;
        });

    }

    ngOnInit(): void {
        
    }

    onActionClicked(event) {
        const self = this;
            switch (event.ApiName) {
                case "Add": {
                    self.openConfigDialog(event.ApiName, event.SelectedItem);
                    break;
                }
                case "Edit": {
                    self.openConfigDialog(event.ApiName, event.SelectedItem);
                    break;
                }
                case "Delete": {
                    self.deleteConfigDialog(event.SelectedItem);
                    break;
                }
                default: {
                    alert("not supported");
                }
            }
    }

  
    openConfigDialog(operation, selectedObj = undefined) {
        debugger;
        const self = this;
        const dialogTitle = operation == 'Add' ? this.translate.instant('Uom_ConfigModalTitle_Add') : this.translate.instant('Uom_ConfigModalTitle_Edit');
        self.pluginService.openDialog(
            dialogTitle,
            AddUomDialogComponent,
            [],
            {
                title: dialogTitle,
                data: {
                    selectedUom: selectedObj,
                }
            },
            (data) => {
                // callback from dialog with input data
                if (data) {
                    this.pluginService.doesUomExist(data.Key).then(exist => {
                        if(operation != 'Add' || exist == false) {
                            this.modalCallback(data);
                        }
                        else {
                            const title = this.translate.instant("Uom_duplicateKey_Title");
                            const content = this.translate.instant("Uom_duplicateKey_Paragraph");
                            this.pluginService.openTextDialog(title, content, undefined, 'close');
                        }
                    })
                }
            }
        );
    }

    modalCallback(data) {
        const uomObj: Uom = {
            Key: data.Key,
            Title: data.Title,
            Multiplier: data.Multiplier
        }
        debugger;
        this.pluginService.updateUoms(uomObj).then((() => {
            this.uomListComp ? this.uomListComp.loadlist() : null;
        }));
    }

    deleteConfigDialog(selectedObj) {
        const self = this;
        const actionButton = [
            new PepDialogActionButton(
                this.translate.instant("Uom_Cancel"),
                "",
                () => {
                }), 
            new PepDialogActionButton(
                this.translate.instant("Uom_Confirm"),
                "pepperi-button md strong caution",
                () => {
                    this.deleteUomConfig(selectedObj);
                })];
        const title = this.translate.instant("Uom_DeleteModal_Title");
        const content = this.translate.instant("Uom_DeleteModal_Paragraph");
        this.pluginService.openTextDialog(title, content, actionButton, 'custom');
    }

    deleteUomConfig(selectedObj) {
        if (selectedObj) {
            selectedObj.Hidden = true;
            this.pluginService.updateUoms(selectedObj).then((()=> {
                this.uomListComp ? this.uomListComp.loadlist() : null;
            }));
        }
    }


    selectedRowsChanged(event) {
        
    }

}
