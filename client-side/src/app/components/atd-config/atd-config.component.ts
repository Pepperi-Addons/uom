import { InventoryAction } from './../../../../../shared/entities';
import { KeyValuePair } from '@pepperi-addons/ngx-lib';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AtdConfigService } from "./atd-config.service";
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
    InventoryAction: InventoryAction = InventoryAction.DoNothing;

    @Input() options: any;
    @ViewChild('pepSelect') pepSelect: PepSelectComponent;

    constructor(
        public pluginService: AtdConfigService,
        private cd: ChangeDetectorRef

        // public routeParams: ActivatedRoute,
    ) {

        this.pluginService.pluginUUID = this.options?.UUID;// || this.routeParams?.snapshot?.params['addon_uuid'];
        console.log(JSON.stringify(this.options));
    }

    ngOnInit() {
        this.Actions = Object.keys(InventoryAction)?.map(key => {
            return {
                key: key,
                value: InventoryAction[key]
            }
        })
        this.pluginService.getAtdFields(153438).then(fields => {
            debugger;
            this.TSAfields = fields?.map(field => {
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

    elementClicked(event) {
        this.pepSelect.select.overlayDir.backdropClick.subscribe( ev => {
            this.pepSelect.select.close();
            this.cd.detectChanges();
        });
          this.pepSelect.select.close();
          this.cd.detectChanges();
    }
}
