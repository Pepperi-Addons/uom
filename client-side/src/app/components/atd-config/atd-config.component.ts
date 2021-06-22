import { AtdConfiguration, InventoryAction } from './../../../../../shared/entities';
import { KeyValuePair, PepGuid } from '@pepperi-addons/ngx-lib';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AtdConfigService } from "./atd-config.service";
import { TranslateService } from "@ngx-translate/core";
import { PepSelectComponent } from '@pepperi-addons/ngx-lib/select';
import { Observable } from 'rxjs';

@Component({
    selector: 'atd-config-addon',
    templateUrl: './atd-config.component.html',
    styleUrls: ['./atd-config.component.scss'],
    // providers: [AtdConfigService]
})

export class AtdConfigComponent implements OnInit {

    TSAStringfields: {key:string, value:string}[] = [];
    TSANumberfields: {key:string, value:string}[] = [];
    Actions: {key:string, value:string}[] = [];
    AllowedUomsTSA: string = '';
    InventoryTSA: string = 'ItemInStockQuantity';
    InventoryAction: InventoryAction;
    AtdID: number;
    Configuration: AtdConfiguration;
    obs$: Observable<any>;
    @Input() hostObject: any;
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    @ViewChildren('pepSelect') pepSelect: Array<PepSelectComponent>;

    constructor(
        public pluginService: AtdConfigService,
        private translate: TranslateService,
        private cd: ChangeDetectorRef
    ) {

    }
    
    
    ngOnInit() {        
        console.log('host object is:', this.hostObject);
        this.pluginService.pluginUUID = this.hostObject?.UUID;
        this.AtdID = this.hostObject?.addonData.atd.InternalID;
        this.Actions = Object.keys(InventoryAction)?.map(key => {
            return {
                key: key,
                value: InventoryAction[key]
            }
        })
        this.pluginService.getAtdFields(this.AtdID).then(fields => {
            this.TSAStringfields = fields?.filter(field=> {
                //return string fileds that are not 5:Date, 6:DateAndTime, 19:LimitedDate, 20:Image, 24:Attachment, 48:GuidReferenceType
                return field.Type === "String" && [5,6,19,20,24,48].indexOf(field.UIType.ID) == -1 
            }).map(field => {
                return {
                    key: field.FieldID,
                    value: field.Label
                }
            });
            this.TSANumberfields = fields?.filter(field=> {
                //return Number fields that are not 9:Currency, 15:Percentage, 40:MapDataReal
                return (field.Type === "Integer" || field.Type === "Number") && [0,9,15,40].indexOf(field.UIType.ID) == -1
            }).map(field => {
                return {
                    key: field.FieldID,
                    value: field.Label
                }
            });
        });
        this.pluginService.getConfiguration(this.AtdID).then(config => {
            this.Configuration = config.length == 1  ? config[0] : {
                Key: this.AtdID.toString(),
                UOMFieldID: '',
                InventoryFieldID: '',
                InventoryType: 'Fix'
            }
        })

        
    }

    ngAfterViewInit(){
        // this.pepSelect.forEach(pep => {
        //     pep.select.overlayDir.backdropClick.subscribe( ev => {
        //         pep.select.close();
        //         this.cd.detectChanges();
        //     });
        //     pep.select.close();
        //     this.cd.detectChanges();
        // });
    }

    onValueChanged(element, $event) {
        switch(element) {
            case 'AllowedUoms': {
                this.Configuration.UOMFieldID = $event.value;
                break;
            }
            case 'Inventory': {
                this.Configuration.InventoryFieldID = $event.value;
                break;
            }
            case 'InventoryAction': {
                this.Configuration.InventoryType = $event.value;
                break;
            }
        }
        
        this.pepSelect.forEach(pep => {
            pep.select.close();
            this.cd.detectChanges();
        });
       

    }

    async SaveConfig() {
        await this.pluginService.updateConfiguration(this.Configuration);
        const created = await this.pluginService.createTSAFields(this.AtdID);
        this.emitClose();
    }
    
    emitClose() {
        this.hostEvents.emit({closeDialog:true});
    }
    
    Cancel() {
        this.pluginService.getConfiguration(this.AtdID).then(config => {
            this.Configuration = config.length == 1  ? config[0] : {
                Key: this.AtdID.toString(),
                UOMFieldID: '',
                InventoryFieldID: '',
                InventoryType: 'Fix',
            }
        })
        this.emitClose();
    }
}
