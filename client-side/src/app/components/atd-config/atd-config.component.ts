import { AtdConfiguration, InventoryActions, InventoryAction } from './../../../../../shared/entities';
import { KeyValuePair, PepGuid } from '@pepperi-addons/ngx-lib';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AtdConfigService } from "./atd-config.service";
import { TranslateService } from "@ngx-translate/core";
import { PepSelectComponent } from '@pepperi-addons/ngx-lib/select';
import { Observable } from 'rxjs';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';

@Component({
    selector: 'atd-config-addon',
    templateUrl: './atd-config.component.html',
    styleUrls: ['./atd-config.component.scss']
})

export class AtdConfigComponent implements OnInit {

    TSAStringfields: {key:string, value:string}[] = [];
    TSANumberfields: {key:string, value:string}[] = [];
    TransactionTypes: {key:number, value:string}[] = [];
    Actions: {key:string, value:string}[] = [];
    AtdID: number;
    Configuration: AtdConfiguration;
    obs$: Observable<any>;
    isUomFieldValid: boolean = false;
    @Input() hostObject: any;
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        public pluginService: AtdConfigService,
        private translate: TranslateService,
        public routeParams: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private dialogService: PepDialogService
    ) {

    }


    ngOnInit() {
        console.log('host object is:', this.hostObject);
        this.pluginService.pluginUUID = this.routeParams.snapshot.params['addon_uuid'];

        // this.pluginService.pluginUUID = this.hostObject?.UUID;
        // this.AtdID = this.hostObject?.addonData.atd.InternalID;
        this.Actions = Object.keys(InventoryActions)?.map(key => {
            return {
                key: key,
                value: InventoryActions[key]
            }
        })  
        
        this.pluginService.getTransactionTypes().then(types => {
            this.TransactionTypes = types;
        });

    }

    loadAtdData() {
        console.log('inside load Atd data. AtdID:', this.AtdID);
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
            this.TSANumberfields.push({
                key: 'ItemInStockQuantity',
                value: 'ItemInStockQuantity'
            });
        });
        this.pluginService.getConfiguration(this.AtdID).then(config => {
            this.Configuration = config.length == 1  ? config[0] : {
                Key: this.AtdID.toString(),
                UOMFieldID: '',
                InventoryFieldID: 'ItemInStockQuantity',
                InventoryType: "Fix",
                ItemConfigFieldID: '',
                CaseQuantityType: "DoNothing",
                MinQuantityType: "DoNothing"
            }
            this.isUomFieldValid = this.Configuration.UOMFieldID != '';
        })
    }

    ngAfterViewInit(){
    }

    onValueChanged(element, $event) {
        switch(element) {
            case 'AtdId': {
                this.AtdID = $event;
                if (this.AtdID) {
                    this.loadAtdData();
                }
                else {
                    this.Configuration = undefined;
                    this.isUomFieldValid = false;
                }
                break;
            }
            case 'AllowedUoms': {
                this.Configuration.UOMFieldID = $event;
                this.isUomFieldValid = $event != ''
                break;
            }
            case 'Inventory': {
                this.Configuration.InventoryFieldID = $event;
                if($event == '') {
                    this.Configuration.InventoryType = 'DoNothing'
                    this.Configuration.CaseQuantityType = 'DoNothing';
                    this.Configuration.MinQuantityType = 'DoNothing';
                }
                break;
            }
            case 'InventoryAction': {
                this.Configuration.InventoryType = $event;
                break;
            }
            case 'ItemConfig': {
                this.Configuration.ItemConfigFieldID = $event;
                if($event == '') {
                    this.Configuration.CaseQuantityType = 'DoNothing';
                    this.Configuration.MinQuantityType = 'DoNothing';
                } 
                break;
            }
            case 'CaseAction': {
                this.Configuration.CaseQuantityType = $event;
                break;
            }
            case 'MinAction': {
                this.Configuration.MinQuantityType = $event;
                break;
            }
        }

    }

    async SaveConfig() {
        await this.pluginService.updateConfiguration(this.Configuration);
        const created = await this.pluginService.createTSAFields(this.AtdID);
        const title = this.translate.instant("Uom_saveConfig_Title");
        const content = this.translate.instant("Uom_saveConfig_Paragraph");
        const data = new PepDialogData({title: title, content: content, actionsType: 'close'});
        const config = this.dialogService.getDialogConfig({}, 'inline')
        this.dialogService.openDefaultDialog(data, config);
        this.AtdID = this.Configuration = undefined
        //this.emitClose();
    }

    emitClose() {
        this.hostEvents.emit({closeDialog:true});
    }

    Cancel() {
        this.pluginService.getConfiguration(this.AtdID).then(config => {
            this.Configuration = config.length == 1  ? config[0] : {
                Key: this.AtdID.toString(),
                UOMFieldID: '',
                InventoryFieldID: 'ItemInStockQuantity',
                InventoryType: 'Fix',
                ItemConfigFieldID: '',
                CaseQuantityType: "DoNothing",
                MinQuantityType: "DoNothing"
            }
        })
        this.emitClose();
    }
}
