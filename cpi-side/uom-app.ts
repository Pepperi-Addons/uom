// import { config } from 'process';

import '@pepperi-addons/cpi-node'
import { AtdConfiguration,
        Uom,
        UomItemConfiguration,
        UNIT_QTY_FIRST_TSA,
        UNIT_QTY_SECOND_TSA,
        UOM_KEY_FIRST_TSA,
        UOM_KEY_SECOND_TSA } from './../shared/entities';
import { DataObject, EventData, UIObject, TransactionLines } from '@pepperi-addons/cpi-node';
import config from '../addon.config.json';
import { QuantityCalculator } from './quantity-calculator';
import { UIField } from '@pepperi-addons/cpi-node/build/cpi-side/app/entities';

enum ItemAction{
    Increment,
    Decrement,
    Set
}

export interface QuantityResult{
    curr:number;
    total:number
}



/** The Real UQ Field - Holds the quantity in Baseline */
const UNIT_QUANTITY = 'UnitsQuantity';
/** A list of Order Center Data Views */   //what exactly datat view is?
const OC_DATA_VIEWS = [ 'OrderCenterGrid', 'OrderCenterView1', 'OrderCenterView2', 'OrderCenterView3', 'OrderCenterItemFullPage', 'OrderCenterVariant', 'OrderCenterBarcodeGridline', 'OrderCenterBarcodeLinesView', 'OrderCenterItemDetails', 'OrderCenterMatrix', 'OrderCenterFlatMatrixGrid', 'OrderCenterFlatMatrixLine'];
/** A list of Cart Data Views */
const CART_DATA_VIEWS = ['OrderCartGrid', 'OrderCartView1' ];




// class QunatityCalcMap {
//         private map: {[key: string]: QuantityCalculator}
//         // private item
//         constructor(uoms: Uom[]){
//                 this.map = {};
//                 for(const uom of uoms){
            
            
//                 }
//         }
//  }
            
            /**
             * Data Structure that holds the UOM from the ADAL table
             */
class UOMMap {
    private hashMap: { [key: string]: Uom };
    constructor(uoms: Uom[]) {
        this.hashMap = {};
        
        for (const uom of uoms) {
            this.hashMap[uom.Key] = uom;
        }
    }
    get(key): Uom | undefined{
        return this.hashMap[key];
    }
}
let uoms: UOMMap;
/**
 * Manage UOM logic within a ATD
 */
class UOMManager {
    
    constructor(private config: AtdConfiguration) {
        this.config = config;
    }
    load() {
        this.subscribe()        
    }
    
    async colorField(dd1: UIField | undefined, dd2: UIField | undefined, uq1: UIField | undefined, uq2: UIField|undefined, uiObject:UIObject, dataObject: DataObject){
    //todo
    const itemConfig = await this.getItemConfig(uiObject.dataObject!);
    const inventory: number = (await dataObject?.getFieldValue(this.config.InventoryFieldID)) || 0;
    // debugger
    const total: number = (await dataObject?.getFieldValue(UNIT_QUANTITY)) || 0;
    let uom: Uom | undefined = undefined;
    let ddArr = [dd1,dd2];
    let uqArr = [uq1,uq2];0

    for(var i=0; i<2; i++){
        var dd1 = ddArr[i];
        var uq1 = uqArr[i];
        if(dd1 && uq1){
            //get relevant data build calc and check if he needs to color
            uom = dd1.value ? uoms.get(dd1.value) : undefined;
            const cq = this.getUomCaseQuantity(uom, itemConfig);5
            const min = this.getUomMinQuantity(uom, itemConfig);
            const factor = this.getUomConfig(uom, itemConfig).Factor;
            const calc = new QuantityCalculator({'UOMKey': "",'Min': min, 'Case':cq, 'Factor': factor },inventory,this.config.CaseQuantityType, this.config.MinQuantityType, this.config.InventoryType);
                if(calc.toColor(Number(uq1.value), total))
                {
                    uq1 ? uq1.textColor = "#FF0000" : null;
                    // uq2 ? uq2.textColor = "#FF0000" : null;
                }
            }
        }
    }




    subscribe() {
        // subscribe to Order center & cart data views
        for (const dataView of [...OC_DATA_VIEWS, ...CART_DATA_VIEWS]) {
            const filter = {
                UIObject: {
                    context: {
                        Name: dataView
                    }
                },
                DataObject: {
                    typeDefinition: {
                        internalID: Number(this.config.Key)
                    }
                }
            }
            // recalc event
            pepperi.events.intercept('RecalculateUIObject', filter, async (data, next, main) => {
                //here is per item? 
                //do i need to create here quantity calc instance ?
                await this.recalculateOrderCenterItem(data);
                await next(main);
            })
            
            for (const uqField of [UNIT_QTY_FIRST_TSA, UNIT_QTY_SECOND_TSA]) {
                
                
                // Increment UNIT_QTY_TSA
                //why the ... operator here? 
                pepperi.events.intercept('IncrementFieldValue', { FieldID: uqField, ...filter }, async (data, next, main) => {
                    
                    await next(async () => {
                        //i need here to use quantitycalc object
                        // debugger

                        //he never enter that if, cause data.UIObject.dataObject always undefined just in single action he is enter here
                     
                        if(data && data.UIObject && data.UIObject.dataObject && data.FieldID) {
                           let oldValue = await data.UIObject.dataObject.getFieldValue(uqField) || 0;
                  
                           let itemConfig: UomItemConfiguration[] = await this.getItemConfig(data.UIObject.dataObject);
                      
                          
                            const inventory: number = (await data.dataObject?.getFieldValue(this.config.InventoryFieldID)) || 0;

                           
                            const newValue = oldValue + 1;
                            await this.setUQField(data.UIObject, data.FieldID, newValue,ItemAction.Increment);
                        }
                    });
                });
                // Increment UNIT_QTY_TSA
                pepperi.events.intercept('DecrementFieldValue', { FieldID: uqField, ...filter }, async (data, next, main) => {
                    await next(async () => {
                        if(data && data.UIObject && data.UIObject.dataObject && data.FieldID) {
                            let oldValue = await data.UIObject.dataObject.getFieldValue(uqField) || 0;
                            
                            const newValue = oldValue - 1;
                            await this.setUQField(data.UIObject, data.FieldID, newValue,ItemAction.Decrement);
                        }
                    });
                })
                // Set UNIT_QTY_TSA   
                pepperi.events.intercept('SetFieldValue', { FieldID: uqField, ...filter }, async (data, next, main) => {
                  
                    await next(async () => {
                        if(data && data.UIObject && data.UIObject && data.FieldID) {
                            await this.setUQField(data.UIObject, data.FieldID, parseInt(data.Value),ItemAction.Set);
                        }
                    });
                })
            }
            for (const ddField of [UOM_KEY_FIRST_TSA, UOM_KEY_SECOND_TSA]) {
                // Drop Down Change
                pepperi.events.intercept('SetFieldValue', { FieldID: ddField, ...filter }, async (data, next, main) => {
                    debugger;
                    await next(main);
                    // update the UQ field
                    const uqFieldId = data.FieldID === UOM_KEY_FIRST_TSA ? UNIT_QTY_FIRST_TSA : UNIT_QTY_SECOND_TSA;
                    const quantity = await data.DataObject?.getFieldValue(uqFieldId);
                    await this.setUQField(data.UIObject!, uqFieldId, quantity,ItemAction.Set);
                })
            }
        }
    }

    async setUQField(uiObject: UIObject, fieldId: string, value: number, itemAction:ItemAction) {
        try {
            //const t0 = performance.now();
            
            const dataObject = uiObject.dataObject;
            let doNothing:boolean = false;
            
            // set the fieldIDs
            const uqField = fieldId;
            const otherUQField = uqField === UNIT_QTY_FIRST_TSA ? UNIT_QTY_SECOND_TSA : UNIT_QTY_FIRST_TSA;
            const uomField = fieldId === UNIT_QTY_FIRST_TSA ? UOM_KEY_FIRST_TSA : UOM_KEY_SECOND_TSA;
            const otherUOMField = otherUQField === UNIT_QTY_SECOND_TSA ? UOM_KEY_SECOND_TSA : UOM_KEY_FIRST_TSA;
            // get the UOM
            const uomValue = await dataObject?.getFieldValue(uomField);
            const uom = uomValue ? uoms.get(uomValue) : undefined;
            const otherUomValue = await dataObject?.getFieldValue(otherUOMField);
            const otherUom = otherUomValue ? uoms.get(otherUomValue) : undefined;
            const itemConfig = await this.getItemConfig(dataObject!);
            const uomConfig = this.getUomConfig(uom, itemConfig);
            const otherUomConfig = this.getUomConfig(otherUom, itemConfig);
            let minBehavior = this.config.MinQuantityType;
            let caseBehavior = this.config.CaseQuantityType;
            let quantity = this.config.MinQuantityType === 'Fix' ? (value >= uomConfig.Min ? value : uomConfig.Min) : value;
            let otherQuantity = 0;
            let total = 0;
            let quantityResult:QuantityResult = {'curr': 0,'total': 0};
            if (otherUom) {
                otherQuantity = await dataObject?.getFieldValue(otherUQField);
                total += otherQuantity * otherUomConfig.Factor;
            }
            
        
            const inventory: number = (await dataObject?.getFieldValue(this.config.InventoryFieldID)) || 0;
            const inventoryLeft = inventory - total;
            const quantityCalc: QuantityCalculator = new QuantityCalculator(uomConfig,inventoryLeft,caseBehavior,minBehavior,this.config.InventoryType);
            switch(itemAction as ItemAction){
                case ItemAction.Increment: 
                    quantityCalc.setCurr(value-1);
                    quantityResult = quantityCalc.getIncrementValue();
                    break;
                    
                case ItemAction.Decrement: 
                    quantityCalc.setCurr(value+1);
                    quantityResult = quantityCalc.getDecrementValue();
                    break;
                case ItemAction.Set:
                    quantityCalc.setCurr(value-1);
                    quantityResult = quantityCalc.setVal(value)
                    break;
            };
           
            
            // add quantity to total
            total += quantityResult.total ;
            
            // item with just one UOM - just set the UnitsQuantity & total
            await dataObject?.setFieldValue(UNIT_QUANTITY, total.toString(), true);
            await uiObject.setFieldValue(uqField, quantityResult.curr.toString(), true);

            // const t1 = performance.now();
            // console.log(`Set Field took ${t1 - t0}ms`);
        }
        catch(err) {
            console.log('Error setting UQ field');
            console.error(err);
        }
    }
    async recalculateOrderCenterItem(data: EventData) {
        try {
            const uiObject = data.UIObject!;
            const dataObject = data.DataObject! as TransactionLines;

            // Get the keys of the UOM from integration
            let arr: string[] = await this.getItemUOMs(dataObject);

            // get the UIFields
            const dd1 = await uiObject.getUIField(UOM_KEY_FIRST_TSA);
            const dd2 = await uiObject.getUIField(UOM_KEY_SECOND_TSA);
            const uq1 = await uiObject.getUIField(UNIT_QTY_FIRST_TSA);
            const uq2 = await uiObject.getUIField(UNIT_QTY_SECOND_TSA);

            const optionalValues = arr.map(key => uoms.get(key)).filter(Boolean).map(uom => {
                return {
                    Key: uom!.Key,
                    Value: uom!.Title
                }
            });

            // run uom logic only when current item has available uoms. otherwise, hide uom fields and continue with regular UQ logic
            //what is data  object.children?
            if(optionalValues.length > 0 && dataObject.children.length == 0) {

                if (dd1 && uq1) {
                    dd1.readonly = false;
                    dd1.visible = true;
                    dd1.optionalValues = optionalValues;
                    if (dd1.value === '') {
                        await uiObject.setFieldValue(UOM_KEY_FIRST_TSA, optionalValues[0].Key, true);
                    }

                    // readonly if there is only one, or if there are 2 and this isn't the only configured
                    if (optionalValues.length === 1 || (optionalValues.length === 2 && dd2)) {
                        dd1.readonly = true;
                    }
                }
                if (dd2 && uq2) {
                    dd2.readonly = false;
                    dd2.visible = true;
                    dd2.optionalValues = optionalValues;
                    if (dd2.value === '') {
                        if(dd1 && optionalValues.length > 1) {
                            await uiObject.setFieldValue(UOM_KEY_SECOND_TSA, optionalValues[1].Key, true);
                        }
                        else {
                            await uiObject.setFieldValue(UOM_KEY_SECOND_TSA, optionalValues[0].Key, true);
                        }
                    }
                    // hide
                    if (optionalValues.length < 2) {
                        if(dd1 && uq1) {
                            dd2.visible = false;
                            uq2.visible = false;
                        }
                        else { // is this is the only one configured than make it readonly
                            dd2.readonly = true;
                        }
                    }
                    // readonly
                    if (optionalValues.length === 2 && dd1) {
                        dd2.readonly = true;
                    }
                }

                //needs to check if color
                const itemConfig = await this.getItemConfig(uiObject.dataObject!);
                const inventory: number = (await dataObject?.getFieldValue(this.config.InventoryFieldID)) || 0;
                const total: number = (await dataObject?.getFieldValue(UNIT_QUANTITY)) || 0;
                let uom: Uom | undefined = undefined;
                await this.colorField(dd1,dd2,uq1,uq2,uiObject,dataObject);
 

                //paint in red if total > inventory
                if (this.config.InventoryType === "Color") {
                    const inventory: number = (await dataObject?.getFieldValue(this.config.InventoryFieldID)) || 0;
                    const total: number = (await dataObject?.getFieldValue(UNIT_QUANTITY)) || 0;
                    if(total > inventory) {
                        uq1 ? uq1.textColor = "#FF0000" : null;
                        uq2 ? uq2.textColor = "#FF0000" : null;
                    }
                }

            }
            else {
                dd1 ? dd1.visible = false : null;
                dd2 ? dd2.visible = false : null;
                uq1 && uq2 ? uq2.visible = false : null;

            }
            const realUQ = await uiObject.getUIField(UNIT_QUANTITY);
            if(realUQ && (uq1 || uq2)) {
                realUQ.readonly = true;
            }
        }
        catch (err) {
            console.log('Error recalculating UQ field');
            console.error(err);
        }
    }
    async getItemUOMs(dataObject: DataObject): Promise<string[]> {
        let str = await dataObject.getFieldValue(this.config.UOMFieldID);
        if (!str) {
            str = '[]';
        }
        return JSON.parse(str);
    }
    //this is not working
    async getItemConfig(dataObject: DataObject): Promise<UomItemConfiguration[]> {
        let str = await dataObject.getFieldValue(this.config.ItemConfigFieldID);
        if (!str) {
            str = '[]';
        }
        return JSON.parse(str);
    }

    getUomConfig(uom: Uom | undefined, itemConfig: UomItemConfiguration[]) : UomItemConfiguration{
        let retVal: UomItemConfiguration = {
            UOMKey:"",
            Factor: 1,
            Min: 0,
            Case: 1
        };
        if(uom) {
            const config = itemConfig.find(item => item.UOMKey === uom.Key);
            if(config) {
                retVal = {
                    UOMKey: uom.Key,
                    Factor: Number(config.Factor) || uom.Multiplier,
                    Min: Number(config.Min)|| 0,
                    Case: config === undefined? 1:Number(config.Case)
                };
            }
            else {
                retVal.Factor = uom.Multiplier;
                retVal.UOMKey = uom.Key;
            }
        }
    
        return retVal;
    }
    
    getUomMinQuantity(uom: Uom | undefined, itemConfig: UomItemConfiguration[]) : number{
        let minQuantity = 0;
        if(uom) {
            const config = itemConfig.find(item => item.UOMKey === uom.Key);
            minQuantity = config ? Number(config.Min) : 0;
        }
    
        return minQuantity;
    }
    
    getUomCaseQuantity(uom: Uom | undefined, itemConfig: UomItemConfiguration[]) : number{
        let caseQuantity = 1;
        if(uom) {
            const config = itemConfig.find(item => item.UOMKey === uom.Key);
            caseQuantity = config ? Number(config.Case) : 1;
        }
    
        return caseQuantity;
    }
}



export async function load() {

    // get UOM table
    console.log("Getting the UOM table");
    const list: Uom[] = (await pepperi.api.adal.getList({
        table: 'Uoms',
        addon: config.AddonUUID
    })).objects as Uom[];
    console.log("Retrieved ", list.length, " uoms");
    uoms = new UOMMap(list);
    // get config table
    const configs = (await pepperi.api.adal.getList({
        table: 'AtdConfig',
        addon: config.AddonUUID
    })).objects as AtdConfiguration[];
    // create manager for each config
    for (const config of configs) {
        console.log('Config object:', JSON.stringify(config));
        const manager = new UOMManager(config);
        // load the manager
        manager.load();
    }
}
