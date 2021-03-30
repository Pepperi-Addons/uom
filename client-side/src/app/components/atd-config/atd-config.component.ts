import { InventoryAction } from './../../../../../shared/entities';
import { KeyValuePair } from '@pepperi-addons/ngx-lib';
import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AtdConfigService } from "./atd-config.service";

@Component({
    selector: 'atd-config-addon',
    templateUrl: './atd-config.component.html',
    styleUrls: ['./atd-config.component.scss'],
    providers: [AtdConfigService]
})

export class AtdConfigComponent implements OnInit {
    
    TSAfields: {key:string, value:string}[] = [];
    Actions: {key:string, value:string}[] = [];
    AllowedUomsTSA: string = '';
    InventoryTSA: string = 'ItemInStockQuantity';
    InventoryAction: InventoryAction = InventoryAction.DoNothing;

    @Input() options: any;
    
    constructor(
        public pluginService: AtdConfigService,
        public routeParams: ActivatedRoute,
    ) {

        this.pluginService.pluginUUID = this.options?.UUID || this.routeParams?.snapshot?.params['addon_uuid'];
        console.log(JSON.stringify(this.options));
    }
    
    ngOnInit() {        
        this.Actions = Object.keys(InventoryAction).map(key => {
            return {
                key: key,
                value: InventoryAction[key]
            }
        })
        this.pluginService.getAtdFields(153438).then(fields => {
            debugger;
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
            case 'Inventory': {
                this.InventoryAction = $event.value;
                break;
            }
        }
    }
}