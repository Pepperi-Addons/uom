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
    
    TSAfields: KeyValuePair<string>[] = [];
    AllowedUomsTSA: string = '';
    InventoryTSA: string = '';

    @Input() options: any;
    
    constructor(
        public pluginService: AtdConfigService,
        public routeParams: ActivatedRoute,
    ) {

        this.pluginService.pluginUUID = this.options?.UUID || this.routeParams?.snapshot?.params['addon_uuid'];
    }
    
    ngOnInit() {
        this.pluginService.getAtdFields(303772).then(fields => {
            this.TSAfields = fields.map(field => {
                return {
                    Key: field.FieldID,
                    Value: field.Label
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
        }
    }
}