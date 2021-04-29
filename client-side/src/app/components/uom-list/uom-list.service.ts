import { GridDataView } from '@pepperi-addons/papi-sdk';
import { TranslateService } from '@ngx-translate/core';
import { EventEmitter, Injectable, Output } from "@angular/core";
import { PepperiListService } from "./uom-list.component";
import { AddonService } from '../addon/addon.service';
import { Uom } from '../../../../../shared/entities';
import { PepGuid } from '@pepperi-addons/ngx-lib';


@Injectable({ providedIn: 'root' })
export class UomListService implements PepperiListService {
    
    @Output() actionClicked: EventEmitter<{ApiName:string,SelectedItem?:any}> = new EventEmitter<{ApiName:string,SelectedItem?:any}>();
    uomService: AddonService;

    constructor(
        private translate: TranslateService
        ) { }

    getActions() {
        return [
            {
              Key: 'Edit',
              Title: this.translate.instant('Uom_Table_EditAction'),
              Filter: (obj) => true,
              Action: (obj) => { 
                this.actionClicked.emit({ApiName:'Edit', SelectedItem:obj});
              }
            },
            {
              Key: 'Delete',
              Title: this.translate.instant('Uom_Table_DeleteAction'),
              Filter: (obj) => true,
              Action: (obj) => { 
                this.actionClicked.emit({ApiName:'Delete', SelectedItem:obj});
              }
            },
          ]
    }

    getDataView(translates: any): GridDataView {
        return {
            Context: {
                Name: '',
                Profile: { InternalID: 0 },
                ScreenSize: 'Landscape'
            },
            Type: 'Grid',
            Title: translates ? translates['Uom_Table_Title'] : '',
            Fields: [
                {
                    FieldID: 'Key',
                    Type: 'TextBox',
                    Title: translates ? translates['Uom_Table_KeyTitle'] : '',
                    Mandatory: false,
                    ReadOnly: true
                },
                {
                    FieldID: 'Title',
                    Type: 'TextBox',
                    Title: translates ? translates['Uom_Table_NameTitle'] : '',
                    Mandatory: false,
                    ReadOnly: true
                },
                {
                    FieldID: 'Multiplier',
                    Type: 'TextBox',
                    Title: translates ? translates['Uom_Table_MultiplierTitle'] : '',
                    Mandatory: false,
                    ReadOnly: true
                },
            ],
            Columns: [
                {
                    Width: 10
                },
                {
                    Width: 10
                },
                {
                    Width: 10
                }
            ],
            FrozenColumnsCount: 0,
            MinimumColumnWidth: 0
        }
    }
    
    async getList(): Promise<Uom[]> {
        return new Promise((resolve, reject)=> {
            this.uomService.getUoms().then(list => {
                if(Array.isArray(list)) {
                    resolve(list.map(item=> {
                        return {
                            UUID: PepGuid.newGuid(),
                            ...item
                        }
                    }));
                }
                else {
                    resolve([]);
                }
            })
        });
    }
}