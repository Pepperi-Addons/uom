import { Component, OnInit, Input,  ComponentRef, ViewChild, ChangeDetectorRef, ElementRef, Output, EventEmitter } from '@angular/core';
import { AddonService } from '../addon/addon.service';

import {  } from '@pepperi-addons/ngx-lib/top-bar'
import { PepListComponent, PepListViewType } from '@pepperi-addons/ngx-lib/list';
import { ObjectsData, ObjectsDataRow, ObjectSingleData, PepGuid, PepRowData, UIControl } from '@pepperi-addons/ngx-lib/';
import { TranslateService } from '@ngx-translate/core';

import { GridDataView, DataViewFieldTypes } from '@pepperi-addons/papi-sdk'
import { PepMenuItem } from '@pepperi-addons/ngx-lib/menu';
import { UomListService } from './uom-list.service';
import { ActivatedRoute } from '@angular/router';


export interface PepperiListService {
  getDataView(translates): GridDataView;
  getList(): Promise<any[]>;
  getActions(): {
    Key: string;
    Title: string;
    Filter: (obj: any) => boolean;
    Action: (obj: any) => void;
  }[];
  rightButtons?(): {
    Title: string;
    Icon: string;
    Action: () => void;
  }[];
}

@Component({
    selector: 'uom-list',
    templateUrl: './uom-list.component.html',
    styleUrls: ['./uom-list.component.scss'],
    providers: [ AddonService ]
  })
export class UomListComponent implements OnInit {

    @ViewChild(PepListComponent) pepperiListComp: PepListComponent;

    @Output() notifyAddButtonClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() actionClicked: EventEmitter<{ApiName:string,SelectedItem?:any}> = new EventEmitter<{ApiName:string,SelectedItem?:any}>();

    list: any[]
    listActions: Array<PepMenuItem> = []
    currentList = {ListType: '', ListCustomizationParams: '', ListTabName: '',  ListFilterStr: ''};

    totalRows = 0;
    searchString = '';
    updateAvailable = false;
    @Input() apiEndpoint = '';

    constructor(
        public pluginService: AddonService,
        public cd: ChangeDetectorRef,
        public routeParams: ActivatedRoute,
        public translate: TranslateService,
        private service: UomListService
    ) {

        let userLang = 'en';
        translate.setDefaultLang(userLang);
        userLang = translate.getBrowserLang().split('-')[0]; // use navigator lang if available
        translate.use(userLang);
        this.service.uomService = this.pluginService;
        this.pluginService.pluginUUID = this.routeParams.snapshot.params['addon_uuid'];

    }

    ngOnInit(): void {
        this.loadlist()
    }

    onListChange(event) {

    }

    onListSortingChange(event) {
    }

    onCustomizeFieldClick(event) {
        // debugger;
    }

    selectedRowsChanged(selectedRowsCount) {
        const selectData = this.pepperiListComp.getSelectedItemsData(true);
        let rowData: ObjectsDataRow;
        if (selectData && selectData.rows && selectData.rows[0] !== '' && selectData.rows.length == 1) {
        const uid = selectData.rows[0];
        rowData = this.pepperiListComp.getItemDataByID(uid);
        }

        this.listActions = selectedRowsCount > 0 ? this.getListActions(rowData) : null;
    }

    getListActions(rowData = null): Array<PepMenuItem> {
        let obj = rowData ? this.list.find(item => item.UUID === rowData.UID) : undefined;
        return this.service.getActions().filter(action => action.Filter(obj)).map(action => {
        return new PepMenuItem({key: action.Key, text: action.Title});
        })
    }

    getValue(object: any, apiName: string): string {
        if (!apiName) {
            return '';
        }

        if (typeof object !== 'object') {
            return '';
        }

        // support regular APINames & dot anotation
        if (apiName in object && object[apiName]) {
            return object[apiName].toString();
        }

        // support nested object & arrays
        const arr = apiName.split('.');
        return this.getValue(object[arr[0]], arr.slice(1).join('.'));
    } 

    async loadlist() {
        this.translate.get([
            'Uom_Table_Title', 
            'Uom_Table_KeyTitle', 
            'Uom_Table_NameTitle',
            'Uom_Table_MultiplierTitle',
            'Uom_Table_BaseUomTitle'
        ]).subscribe(async (translates) => {
            const dataView = this.service.getDataView(translates);
            this.list = await this.service.getList();
            const rows: PepRowData[] = this.list.map(x => {
            const res = new PepRowData();
            res.Fields = dataView.Fields.map((field, i) => {
                return {
                    ApiName: field.FieldID,
                    Title: field.Title,
                    XAlignment: 1,
                    FormattedValue: this.getValue(x, field.FieldID),
                    Value:  this.getValue(x, field.FieldID),
                    ColumnWidth: dataView.Columns[i].Width,
                    AdditionalValue: '',
                    OptionalValues: [],
                    FieldType: DataViewFieldTypes[field.Type]
                }
            })
            return res;
            });

            const uiControl = this.pluginService.pepperiDataConverter.getUiControl(rows[0]);
            const l = this.pluginService.pepperiDataConverter.convertListData(rows);
            
            this.pepperiListComp.initListData(uiControl, l.length, l, 'table', '', true);
        });
    }

    onActionClicked(event) {
        const selectData = this.pepperiListComp.getSelectedItemsData(true);
        if (selectData.rows.length == 1) {

        const uid = selectData.rows[0];
        const rowData = this.pepperiListComp.getItemDataByID( uid );
        const obj = rowData ? this.list.find(item => item.UUID === rowData.UID) : undefined;
        this.actionClicked.emit({ApiName:event.source.key, SelectedItem:obj});
        //this.service.getActions().find(action => action.Key === event.source.key).Action(obj);
        }
    }

    public searchChanged(searchString: string) {
        this.searchString = searchString;
    }

    addButtonClicked() {
        this.actionClicked.emit({ApiName:'Add'});
        //this.notifyAddButtonClicked.emit();
    }
}
