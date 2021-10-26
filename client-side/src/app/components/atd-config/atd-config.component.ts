import { AtdConfiguration, InventoryActions} from './../../../../../shared/entities';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import { AtdConfigService } from "./atd-config.service";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from 'rxjs';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';
import { IPepMenuItemClickEvent, PepMenuItem } from '@pepperi-addons/ngx-lib/menu';
@Component({
    selector: 'atd-config-addon',
    templateUrl: './atd-config.component.html',
    styleUrls: ['./atd-config.component.scss']
})
export class AtdConfigComponent implements OnInit {
    TSAStringfields: {key:string, value:string}[] = [];
    TSANumberfields: {key:string, value:string}[] = [];
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
        this.isInstalled = true;
        this.alreadyChecked = true;
        this.ngOnInit();
    }
    onMenuClicked($event){
        this.menuClick.emit();
    }
    onMenuItemClicked($event: IPepMenuItemClickEvent){
        this.dialogService.openDefaultDialog(new PepDialogData({
            title: this.translate.instant('Uninstall') ,
            actionsType: 'custom',
            content: this.translate.instant("confirmation_message"),
            actionButtons: [
                {
                title: this.translate.instant('Cancel'),
                className: 'regular',
                callback: () => {
                    return;
                }
            },
            {
                title: this.translate.instant('OK'),
                className: 'strong',
                callback: () => {
                    this.uninstall($event);
                }
            }
            ]
        }))
    }
    async uninstall($event){
        this.selectedItem = $event.source;
        await this.pluginService.removeATDAndTSA(this.AtdID);
        this.isInstalled = false;
        this.alreadyChecked = true;
        this.menuItemClick.emit($event);
        this.ngOnInit();
             
    }
    async ngOnInit() {
        this.pluginService.pluginUUID = "1238582e-9b32-4d21-9567-4e17379f41bb";
        this.configID = this.hostObject.objectList[0];
        const atdIdAndIsInstalled = await this.pluginService.getAtdID(this.configID);
        this.AtdID = atdIdAndIsInstalled.atdID;
        this.isInstalled = atdIdAndIsInstalled.isInstalled;
        this.alreadyChecked = true;
        if(this.isInstalled)
        {
            this.Actions = Object.keys(InventoryActions)?.map(key => {
                return {
                    key: key,
                    value: InventoryActions[key]
                }
            })
            this.loadAtdData();
        }
    }
    loadAtdData() {
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
                InventoryType: "Color",
                ItemConfigFieldID: '',
                CaseQuantityType: "Color",
                MinQuantityType: "Color"
            }         
        })
    }
    onValueChanged(element, $event) {
        switch(element) {
            case 'AllowedUoms': {
                this.Configuration.UOMFieldID = $event;
                break;
            }
            case 'Inventory': {
                this.Configuration.InventoryFieldID = $event;
                if($event == '') {
                    this.Configuration.InventoryType = 'DoNothing' 
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
        console.log("configuration  on SaveConfig " , this.Configuration)
        await this.pluginService.updateConfiguration(this.Configuration);
        const title = this.translate.instant("Uom_saveConfig_Title");
        const content = this.translate.instant("Uom_saveConfig_Paragraph");
        const data = new PepDialogData({title: title, content: content, actionsType: 'close'});
        const config = this.dialogService.getDialogConfig({}, 'inline')
        this.dialogService.openDefaultDialog(data, config).afterClosed().subscribe(() => {
            this.emitClose();
        });
    }
    emitClose() {
        this.hostEvents.emit({action:'close-dialog'});
    }
}
