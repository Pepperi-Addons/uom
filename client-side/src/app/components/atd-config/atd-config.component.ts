import { AddonService } from './../addon/addon.service';
import { atdConfigScheme } from './../../../../../server-side/metadata';
import { AtdConfiguration, InventoryActions, InventoryAction } from './../../../../../shared/entities';
import { KeyValuePair, PepGuid } from '@pepperi-addons/ngx-lib';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AtdConfigService } from "./atd-config.service";
import { TranslateService } from "@ngx-translate/core";
import { PepSelectComponent } from '@pepperi-addons/ngx-lib/select';
import { Observable } from 'rxjs';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { ContentObserver } from '@angular/cdk/observers';
import { IPepMenuItemClickEvent, PepMenuItem } from '@pepperi-addons/ngx-lib/menu';


@Component({
    selector: 'atd-config-addon',
    templateUrl: './atd-config.component.html',
    styleUrls: ['./atd-config.component.scss']
})

export class AtdConfigComponent implements OnInit {
    TSAStringfields: {key:string, value:string}[] = [];
    TSANumberfields: {key:string, value:string}[] = [];
    // TransactionTypes: {key:number, value:string}[] = [];
    Actions: {key:string, value:string}[] = [];
    AtdID: number;
    Configuration: AtdConfiguration;
    obs$: Observable<any>;
    @Input() hostObject: any;
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    configID: string;
    isInstalled: boolean;
    alreadyChecked: boolean;
    items = [{key : 'uninstall', text: 'text'}];
    @Input() selectedItem: PepMenuItem
    @Input() disabled = false;
    text = "text";
    @Output() menuClick: EventEmitter<void> = new EventEmitter<void>();
    @Output()  menuItemClick: EventEmitter<IPepMenuItemClickEvent> = new EventEmitter<IPepMenuItemClickEvent>();

    constructor(
        public pluginService: AtdConfigService,
        private translate: TranslateService,
        // public routeParams: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private dialogService: PepDialogService
    ) {
        // this.try = 5;
        this.isInstalled = false;
        this.alreadyChecked = false;

    }
    onInstallation($event){
        console.log("in atd-config before setting isInstalled, isInstalled = ", this.isInstalled);
        this.isInstalled = true;
        console.log("in atd-config component on install event, isInstalled = ", this.isInstalled);
    }
    onMenuClicked($event){
        this.menuClick.emit();
    }
    onMenuItemClicked($event: IPepMenuItemClickEvent){
        this.selectedItem = $event.source;
        console.log("on menuItemClick event!!!!");
        this.pluginService.removeTSAFields(this.AtdID).then(() => {
            this.isInstalled = false;
            this.alreadyChecked = false;
            this.menuItemClick.emit($event);
        })
        
    }


    ngOnInit() {
        console.log('Onint of atd-config start...');
        console.log("isInstalled = ", this.isInstalled)
        this.configID = this.hostObject.objectList[0];
        console.log('config id :               ', this.configID);
        this.pluginService.getTypeInternalID(this.configID).then((atdId) => {
            this.AtdID = atdId;
            console.log('here is atdId', this.AtdID)
        }).then(() => {
           this.pluginService.isInstalled(this.AtdID).then((installed) => {
               console.log("inside ngOnInit in atd-config TSA already installed ? ", installed);
               this.isInstalled = installed;
               this.alreadyChecked = true;
               if(this.isInstalled){
                this.pluginService.pluginUUID = '1238582e-9b32-4d21-9567-4e17379f41bb';
                this.Actions = Object.keys(InventoryActions)?.map(key => {
                    return {
                        key: key,
                        value: InventoryActions[key]
                    }
                })
                this.loadAtdData();
               }
           })
        });
        // const AtdUUID = this.hostObject.objectList[0];
        console.log('host object is:', this.hostObject);
        this.pluginService.pluginUUID = '1238582e-9b32-4d21-9567-4e17379f41bb';
        // this.pluginService.pluginUUID = this.routeParams.snapshot.params['addon_uuid'];
        // this.pluginService.pluginUUID = this.hostObject?.UUID;
        // this.AtdID = this.hostObject?.addonData.atd.InternalID;
        // action table of key and value (0,'Fix')...
        // console.log(this.TransactionTypes)
        // this.Actions = Object.keys(InventoryActions)?.map(key => {
        //     return {
        //         key: key,
        //         value: InventoryActions[key]
        //     }
        // })
        // if(this.isInstalled){
        //     console.log("going to call load Atd Data !!!!!!!!!!!!!")
        //     this.loadAtdData();  
        // }
        
        // this.pluginService.getTransactionTypes().then(types => {
        //     this.TransactionTypes = types;
        //     console.log('there is the transaction types ', types)
        // });
        // this.AtdID = Number(this.TransactionTypes.filter((type) => {
        //     return type.value === 'UOM'
        // })[0].value);
        // this.AtdID = this.TransactionTypes.filter((type) => {
        //     return type.value === AtdUUID;
        // })[0].key;
        // console.log(this.AtdID)
        // this.loadAtdData();
    }

    loadAtdData() {

        // console.log('this is the transaction types: ', this.TransactionTypes)
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
                // PriceField: '',
                InventoryType: "Color",
                ItemConfigFieldID: '',
                CaseQuantityType: "Color",
                MinQuantityType: "Color"
            }         
        })
    }

    ngAfterViewInit(){
        //this.loadAtdData();
        // this.isUomFieldValid = true; // ?
    }

    onValueChanged(element, $event) {
        console.log("in onValueChanged function");
        switch(element) {
            // case 'AtdId': {
            //     this.AtdID = $event;
            //     if (this.AtdID) {
            //         this.loadAtdData();
            //         this.isUomFieldValid = true;
            //     }
                // else {
                //     this.Configuration = undefined;
                //     this.isUomFieldValid = false;
                // }
            //     break;
            // }
            case 'AllowedUoms': {
                console.log("Case AllowedUoms");
                // this.loadAtdData();
                // this.isUomFieldValid = true;
                this.Configuration.UOMFieldID = $event;
                // this.isUomFieldValid = $event != ''
                break;
            }
            case 'Inventory': {
                console.log("Case Inventory");
                this.Configuration.InventoryFieldID = $event;
                console.log('here is the inv id:       ', $event);
                if($event == '') {
                    this.Configuration.InventoryType = 'DoNothing'
                   
                }
                break;
            }
            // case 'Price': {
            //     console.log("Case Price");
            //     this.Configuration.PriceField = $event;
            //     console.log('here is the price field:       ', $event);
            //     // if($event == '') {
            //     //     this.Configuration.PriceField = ''
                   
            //     // }
            //     break;
            // }
            case 'InventoryAction': {
                console.log("Case Inventory Action");
                this.Configuration.InventoryType = $event;
                break;
            }
            case 'ItemConfig': {
                console.log("Case ItemConfig");
                this.Configuration.ItemConfigFieldID = $event;
                if($event == '') {
                    this.Configuration.CaseQuantityType = 'DoNothing';
                    this.Configuration.MinQuantityType = 'DoNothing';
                    
                } 
                break;
            }
            case 'CaseAction': {
                console.log("Case Case Action");
                this.Configuration.CaseQuantityType = $event;
                break;
            }
            case 'MinAction': {
                console.log("Case Min Action");
                this.Configuration.MinQuantityType = $event;
                break;
            }
        }

    }

    async SaveConfig() {
        await this.pluginService.updateConfiguration(this.Configuration);
        // const created = await this.pluginService.createTSAFields(this.AtdID);
        const title = this.translate.instant("Uom_saveConfig_Title");
        const content = this.translate.instant("Uom_saveConfig_Paragraph");
        const data = new PepDialogData({title: title, content: content, actionsType: 'close'});
        const config = this.dialogService.getDialogConfig({}, 'inline')
        this.dialogService.openDefaultDialog(data, config).afterClosed().subscribe(() => {
            this.emitClose();
        });
        this.AtdID = this.Configuration = undefined
    }

    emitClose() {
        this.hostEvents.emit({action:'close-dialog'});
    }

    Cancel() {
        this.pluginService.getConfiguration(this.AtdID).then(config => {
            this.Configuration = config.length == 1  ? config[0] : {
                Key: this.AtdID.toString(),
                UOMFieldID: '',
                InventoryFieldID: 'ItemInStockQuantity',
                // PriceField: '',
                InventoryType: 'Color',
                ItemConfigFieldID: '',
                CaseQuantityType: "Color",
                MinQuantityType: "Color"
            }
        })
        this.emitClose();
    }
}
