import { InventoryAction } from './../../../../../shared/entities';
import { KeyValuePair } from '@pepperi-addons/ngx-lib';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AtdConfigService } from "./atd-config.service";
import { TranslateService } from "@ngx-translate/core";
import { PepSelectComponent } from '@pepperi-addons/ngx-lib/select';

@Component({
    selector: 'atd-config-addon',
    templateUrl: './atd-config.component.html',
    styleUrls: ['./atd-config.component.scss'],
    // providers: [AtdConfigService]
})

export class AtdConfigComponent implements OnInit {

    TSAfields: {key:string, value:string}[] = [];
    Actions: {key:string, value:string}[] = [];
    AllowedUomsTSA: string = '';
    InventoryTSA: string = 'ItemInStockQuantity';
    InventoryAction: InventoryAction;

    @Input() options: any;
    @ViewChildren('pepSelect') pepSelect: Array<PepSelectComponent>;

    constructor(
        public pluginService: AtdConfigService,
        public routeParams: ActivatedRoute,
        private translate: TranslateService,
        private cd: ChangeDetectorRef
    ) {

        this.pluginService.pluginUUID = this.options?.UUID || this.routeParams?.snapshot?.params['addon_uuid'];
        console.log('options are:', JSON.stringify(this.options));
    }

    
    ngOnInit() {        
        this.translate.get([
            'Uom_AtdConfig_InventoryAction_DoNothingOption', 
            'Uom_AtdConfig_InventoryAction_CorrectOption', 
            'Uom_AtdConfig_InventoryAction_ColorOption'
        ]).subscribe((translates) => {
            this.Actions = Object.keys(InventoryAction).map(key => {
                return {
                    key: key,
                    value: translates[InventoryAction[key]]
                }
            })
        });
        this.pluginService.getAtdFields(153438).then(fields => {
            this.TSAfields = fields.map(field => {
                return {
                    key: field.FieldID,
                    value: field.Label
                }
            });
        });
    }

    onValueChanged(element, $event) {
        switch(element) {
            case 'AllowedUoms': {
                this.AllowedUomsTSA = $event.value;
                break;
            }
            case 'Inventory': {
                this.InventoryTSA = $event.value;
                break;
            }
            case 'InventoryAction': {
                this.InventoryAction = $event.value;
                break;
            }
        }

        this.pepSelect.forEach(pep => {
            pep.select.overlayDir.backdropClick.subscribe( ev => {
                pep.select.close();
                this.cd.detectChanges();
            });
            pep.select.close();
            this.cd.detectChanges();
        })

    }
}
