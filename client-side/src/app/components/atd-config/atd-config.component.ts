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
    items = [{key : 'uninstall', text: 'uninstall'}];
    @Input() selectedItem: PepMenuItem
    @Input() disabled = false;
    text = "";
    @Output() menuClick: EventEmitter<void> = new EventEmitter<void>();
    @Output()  menuItemClick: EventEmitter<IPepMenuItemClickEvent> = new EventEmitter<IPepMenuItemClickEvent>();

    constructor(
        public pluginService: AtdConfigService,
        private translate: TranslateService,
        private cd: ChangeDetectorRef,
        private dialogService: PepDialogService
    ) {
        this.isInstalled = false;
        this.alreadyChecked = false;
    }
    onInstallation($event){
        console.log("in installation component on installation event");
        this.isInstalled = true;
        this.alreadyChecked = true;
        this.ngOnInit();
    }
    onMenuClicked($event){
        this.menuClick.emit();
    }
    onMenuItemClicked($event: IPepMenuItemClickEvent){
        this.dialogService.openDefaultDialog(new PepDialogData({
            title: 'Uninstall',
            actionsType: 'custom',
            content: 'Are you sure you want to uninstall the UOM fields from this transaction?',
            actionButtons: [
                {
                title: this.translate.instant('cancel'),
                className: 'regular',
                callback: () => {
                    console.log("cancel CALLBACK from uninstall !!!!!!!!!!!!!!!!!!!!!!!")
                    return;
                }
            },
            {
                title: this.translate.instant('ok'),
                className: 'strong',
                callback: () => {
                    console.log("ok CALLBACK from uninstall !!!!!!!!!!!!!!!!!!!!!!!")
                    this.uninstall($event);
                }
            }
            ]
        }))
    }
    uninstall($event){
        this.selectedItem = $event.source;
        console.log("on menuItemClick event!!!!")
        console.log("uninstall here is ATD -> ", this.AtdID);
        this.pluginService.removeTSAFields(this.AtdID).then(() => {
            this.isInstalled = false;
            console.log("after remove TSAFields");
            this.alreadyChecked = true;
            this.menuItemClick.emit($event);
            this.ngOnInit();
        })     
    }
    ngOnInit() {
        this.pluginService.pluginUUID = this.hostObject.options.uuid;
        console.log('here is uuid from hotsObj options', this.pluginService.pluginUUID)
        console.log('Onint of atd-config start...');
        console.log("isInstalled = ", this.isInstalled)
        this.configID = this.hostObject.objectList[0];
        console.log("there is host obj ->>>>>>>>>>>>>", this.hostObject);
        console.log("here is options ->>>>>>>", this.hostObject.options);
        console.log("here is uuid", this.hostObject.options.uuid)
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
                // this.pluginService.pluginUUID = this.hostObject.options.uuid; //work just local
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
        console.log('host object is:', this.hostObject);
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
                // PriceField: '',
                InventoryType: "Color",
                ItemConfigFieldID: '',
                CaseQuantityType: "Color",
                MinQuantityType: "Color"
            }         
        })
    }
    onValueChanged(element, $event) {
        console.log("in onValueChanged function");
        switch(element) {
            case 'AllowedUoms': {
                console.log("Case AllowedUoms");
                this.Configuration.UOMFieldID = $event;
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
    // Cancel() {
    //     this.pluginService.getConfiguration(this.AtdID).then(config => {
    //         this.Configuration = config.length == 1  ? config[0] : {
    //             Key: this.AtdID.toString(),
    //             UOMFieldID: '',
    //             InventoryFieldID: 'ItemInStockQuantity',
    //             InventoryType: 'Color',
    //             ItemConfigFieldID: '',
    //             CaseQuantityType: "Color",
    //             MinQuantityType: "Color"
    //         }
    //     })
    //     this.emitClose();
    // }
}
