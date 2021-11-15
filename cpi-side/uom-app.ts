
import '@pepperi-addons/cpi-node'
import {
    AtdConfiguration,
    Uom,
    UNIT_QTY_FIRST_TSA,
    UNIT_QTY_SECOND_TSA,
    UOM_KEY_FIRST_TSA,
    UOM_KEY_SECOND_TSA
} from './../shared/entities';
import { DataObject, EventData, UIObject, TransactionLine, UIField } from '@pepperi-addons/cpi-node';
import config from '../addon.config.json';
import { QuantityCalculator } from './quantity-calculator';
import { ItemAction, QuantityResult, UomItemConfiguration } from './../shared/entities';
import {uomsScheme, UomTSAFields} from '../server-side/metadata'

// const { JSDOM } = require("jsdom");
// const { window } = new JSDOM();

/** The Real UQ Field - Holds the quantity in Baseline */
const UNIT_QUANTITY = 'UnitsQuantity';
/** A list of Order Center Data Views */
const OC_DATA_VIEWS = ['OrderCenterGrid', 'OrderCenterView1', 'OrderCenterView2', 'OrderCenterView3', 'OrderCenterItemFullPage', 'OrderCenterVariant', 'OrderCenterBarcodeGridline', 'OrderCenterBarcodeLinesView', 'OrderCenterItemDetails', 'OrderCenterMatrix', 'OrderCenterFlatMatrixGrid', 'OrderCenterFlatMatrixLine'];
/** A list of Cart Data Views */
const CART_DATA_VIEWS = ['OrderCartGrid', 'OrderCartView1'];

let iter = 0;

class UOMMap {
    private hashMap: { [key: string]: Uom };
    constructor(uoms: Uom[]) {
        this.hashMap = {};
        for (const uom of uoms) {
            this.hashMap[uom.Key] = uom;
        }
    }
    get(key): Uom | undefined {
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
    async colorField(dd1: UIField | undefined, dd2: UIField | undefined, uq1: UIField | undefined, uq2: UIField | undefined, uiObject: UIObject) {
        const dataObject = uiObject.dataObject!;
        const itemConfig = await this.getItemConfig(dataObject!);
        const inventory: number = (await dataObject?.getFieldValue(this.config.InventoryFieldID)) || 0;
        const total: number = (await dataObject?.getFieldValue(UNIT_QUANTITY)) || 0;
        let uom: Uom | undefined = undefined;
        if (dd1 && uq1) {
            this.colorFields(dd1, uq1, uom, itemConfig, inventory, total);
        }
        if (dd2 && uq2) {
            this.colorFields(dd2, uq2, uom, itemConfig, inventory, total);
        }
    }
    colorFields(dd1: UIField, uq1: UIField, uom: Uom | undefined, itemConfig: UomItemConfiguration[], inventory: number, total: number) {
        //get relevant data build calc and check if he needs to color
        uom = dd1.value ? uoms.get(dd1.value) : undefined;
        const calc = new QuantityCalculator(this.getUomConfig(uom, itemConfig), inventory, this.config.CaseQuantityType, this.config.MinQuantityType, this.config.InventoryType);
        if (calc.toColor(Number(uq1.value), total, inventory)) {
            uq1 ? uq1.textColor = "#FF0000" : null;
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
                const view = dataView;
                await this.recalculateOrderCenterItem(data);
                await next(main);
            })
            for (const uqField of [UNIT_QTY_FIRST_TSA, UNIT_QTY_SECOND_TSA]) {
                pepperi.events.intercept('IncrementFieldValue', { FieldID: uqField, ...filter }, async (data, next, main) => {
                    await next(async () => {
                        if (data && data.UIObject && data.UIObject.dataObject && data.FieldID) {
                            let oldValue = await data.UIObject.dataObject.getFieldValue(uqField) || 0;
                            await this.setUQField(data.UIObject, data.FieldID, oldValue, ItemAction.Increment);
                        }
                    });
                });
                // Increment UNIT_QTY_TSA
                pepperi.events.intercept('DecrementFieldValue', { FieldID: uqField, ...filter }, async (data, next, main) => {
                    await next(async () => {
                        if (data && data.UIObject && data.UIObject.dataObject && data.FieldID) {
                            let oldValue = await data.UIObject.dataObject.getFieldValue(uqField) || 0;
                            await this.setUQField(data.UIObject, data.FieldID, oldValue, ItemAction.Decrement);
                        }
                    });
                })
                // Set UNIT_QTY_TSA   
                pepperi.events.intercept('SetFieldValue', { FieldID: uqField, ...filter }, async (data, next, main) => {
                    await next(async () => {
                        if (data && data.UIObject && data.UIObject && data.FieldID) {
                            await this.setUQField(data.UIObject, data.FieldID, parseFloat(data.Value), ItemAction.Set);
                        }
                    });
                })
            }
            for (const ddField of [UOM_KEY_FIRST_TSA, UOM_KEY_SECOND_TSA]) {
                // Drop Down Change
                pepperi.events.intercept('SetFieldValue', { FieldID: ddField, ...filter }, async (data, next, main) => {
                    await next(main);
                    // update the UQ field
                    const uqFieldId = data.FieldID === UOM_KEY_FIRST_TSA ? UNIT_QTY_FIRST_TSA : UNIT_QTY_SECOND_TSA;
                    const quantity = await data.DataObject?.getFieldValue(uqFieldId);
                    await this.setUQField(data.UIObject!, uqFieldId, quantity, ItemAction.Set);
                })
            }
        }
    }
    async setUQField(uiObject: UIObject, fieldId: string, value: number, itemAction: ItemAction) {
        try {
            const dataObject = uiObject.dataObject;
            let doNothing: boolean = false;
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
            let quantityResult: QuantityResult = { 'curr': 0, 'total': 0 };
            if (otherUom) {
                otherQuantity = await dataObject?.getFieldValue(otherUQField);
                total += otherQuantity * otherUomConfig.Factor;
            }
            const inventory: number = (await dataObject?.getFieldValue(this.config.InventoryFieldID)) || 0;
            const inventoryLeft = inventory - total;
            const quantityCalc: QuantityCalculator = new QuantityCalculator(uomConfig, inventoryLeft, caseBehavior, minBehavior, this.config.InventoryType);
            switch (itemAction) {
                case ItemAction.Increment:
                    quantityResult = quantityCalc.getIncrementValue(value);
                    break;
                case ItemAction.Decrement:
                    quantityResult = quantityCalc.getDecrementValue(value);
                    break;
                case ItemAction.Set:
                    quantityResult = quantityCalc.setValue(value)
                    break; 
            };
            // add quantity to total
            total += quantityResult.total;
            let resultValue = quantityResult.curr.toString();
            await uiObject.setFieldValue(uqField, resultValue, true);
            await dataObject?.setFieldValue(UNIT_QUANTITY, total.toString(), true);
        }
        catch (err) {
            console.log('Error setting UQ field');
            console.error(err);
        }
    }
    updateTSAField(uomConfig: UomItemConfiguration, uq: UIField | undefined) {
        if(!uq || !uomConfig)
            return;

        if(uomConfig.Decimal  && uomConfig.Decimal != uq['customField'].decimalDigits)
        {
            uq['customField'].decimalDigits = uomConfig.Decimal;
        }

        if (!uomConfig.Decimal && uq['customField'].type === 29) {
            uq['customField'].type = 28;
        }
        else if(uomConfig.Decimal  && uq['customField'].type === 28) {
            uq['customField'].decimalDigits = uomConfig.Decimal;
        }
    }
    async fixUOMValue(uq1: UIField | undefined, uq2: UIField | undefined, dataObject: TransactionLine, uomConfig, otherUomConfig, uiObject: UIObject)
    {
        const unitsQuantity = await dataObject?.getFieldValue(UNIT_QUANTITY);
        const firstUomTsaValue = Number(uq1?.value) * uomConfig.Factor;
        const otherUomTsaValue = Number(uq2?.value) * otherUomConfig.Factor;
        const suomOfUoms = firstUomTsaValue + otherUomTsaValue 
        const suomOfUomsMinusUnitQuantity = suomOfUoms - unitsQuantity;
        //if suomOfUomsMinusUnitQuantity so there might be change in cart.(delete or inc/dec the amount)
        if(suomOfUomsMinusUnitQuantity != 0 && (uq1 || uq2) )
        {
            //there was a delete operation, we need to update uom TSA to be 0.
            if(unitsQuantity == 0)
            {
                await uiObject.setFieldValue(UNIT_QTY_FIRST_TSA, "0", true);
                await uiObject.setFieldValue(UNIT_QTY_SECOND_TSA, "0", true);
            }
            else{
                await dataObject?.setFieldValue(UNIT_QUANTITY,suomOfUoms.toString(),true);
            }
        }
    }
    makeEditableAndVisibleWithMenu(dd: UIField, optionalValues)
    {
        dd.readonly = false;
        dd.visible = true;
        dd.optionalValues = optionalValues;
    }
    async updateUOMDropDowns(arr:string[],dataObject: TransactionLine, dd1: UIField | undefined, uq1: UIField | undefined, uiObject: UIObject, dd2: UIField | undefined, uq2: UIField | undefined )
    {
        const optionalValues = this.getOptionalValues(arr);
        if (optionalValues.length > 0 && dataObject.children.length == 0) {
            if (dd1 && uq1) {
                this.makeEditableAndVisibleWithMenu(dd1,optionalValues);
                if (dd1.value === '') {
                    await uiObject.setFieldValue(UOM_KEY_FIRST_TSA, optionalValues[0].Key, true);
                }
                // readonly if there is only one, or if there are 2 and this isn't the only configured
                if (optionalValues.length === 1 || (optionalValues.length === 2 && dd2)) {
                    dd1.readonly = true;
                }
            }
            if (dd2 && uq2) {
                this.makeEditableAndVisibleWithMenu(dd2,optionalValues);
                if (dd2.value === '') {
                    if (dd1 && optionalValues.length > 1) {
                        await uiObject.setFieldValue(UOM_KEY_SECOND_TSA, optionalValues[1].Key, true);
                    }
                    else {
                        await uiObject.setFieldValue(UOM_KEY_SECOND_TSA, optionalValues[0].Key, true);
                    }
                }
                // hide
                if (optionalValues.length < 2) {
                    if (dd1 && uq1) {
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
            await this.colorField(dd1, dd2, uq1, uq2, uiObject);
        }
        else {
            dd1 ? dd1.visible = false : null;
            dd2 ? dd2.visible = false : null;
            uq1 && uq2 ? uq2.visible = false : null;

        }
    }
    getOptionalValues(arr:string[])
    {
        return arr.map(key => uoms.get(key)).filter(Boolean).map(uom => {
            return {
                Key: uom!.Key,
                Value: uom!.Title
            }
        });
    }
    async getUomConfigByKey(dataObject: DataObject, uomKey: string, itemConfig: UomItemConfiguration[])
    {
        const uomValue = await dataObject?.getFieldValue(uomKey);
        const uom = uomValue ? uoms.get(uomValue) : undefined;
        return this.getUomConfig(uom, itemConfig);

    }
    fixUomValueAndTsas(uomConfigAraay:UomItemConfiguration[], dataObject:TransactionLine, uiObject: UIObject, uq1, uq2)
    {
        this.fixUOMValue(uq1,uq2,dataObject,uomConfigAraay[0],uomConfigAraay[1],uiObject);
        //update the TSA Field 
        this.updateTSAField(uomConfigAraay[0], uq1);
        this.updateTSAField(uomConfigAraay[1], uq2);
    }
    async setUnitQuantityReadOnlyIfHasUom(uiObject: UIObject, uq1,uq2)
    {
        const realUQ = await uiObject.getField(UNIT_QUANTITY);
        if (realUQ && (uq1 || uq2)) {
            realUQ.readonly = true;
        }
    }

    getUomFields(uomKey: string, unitQuantityKey:string, uiObject)
    {
        return [uiObject.getField(uomKey),uiObject.getField(unitQuantityKey)]
    }
    buildFieldsObjectFromArray(uomTSAFields)
    {
        return {'arr': uomTSAFields[0],
                'dd1': uomTSAFields[1],
                'uq1': uomTSAFields[2],
                'dd2': uomTSAFields[3],
                'uq2': uomTSAFields[4]
               };
    }

    async recalculateOrderCenterItem(data: EventData) {
        try {
            const uiObject = data.UIObject!;
            const dataObject = data.DataObject! as TransactionLine;
            // Get the keys of the UOM from integration
            let arr =  this.getItemUOMs(dataObject);
            const firstTSAFields = this.getUomFields(UOM_KEY_FIRST_TSA, UNIT_QTY_FIRST_TSA, uiObject);
            const secondTSAFields = this.getUomFields(UOM_KEY_SECOND_TSA, UNIT_QTY_SECOND_TSA, uiObject);

            await Promise.all([arr,...firstTSAFields, ...secondTSAFields]).then(async (uomsTsaFields) => {
                const fieldsObject = this.buildFieldsObjectFromArray(uomsTsaFields);
                await this.updateUOMDropDowns(fieldsObject.arr,dataObject,fieldsObject.dd1,fieldsObject.uq1,uiObject,fieldsObject.dd2,fieldsObject.uq2)
                const itemConfig = await this.getItemConfig(dataObject!);
                
                const uomConfig = this.getUomConfigByKey(dataObject, UOM_KEY_FIRST_TSA, itemConfig);
                const otherUomConfig = this.getUomConfigByKey(dataObject, UOM_KEY_SECOND_TSA, itemConfig);

                await Promise.all([uomConfig,otherUomConfig]).then((uomConfigArry) => this.fixUomValueAndTsas(uomConfigArry, dataObject, uiObject, fieldsObject.uq1, fieldsObject.uq2));
                await this.setUnitQuantityReadOnlyIfHasUom(uiObject, fieldsObject.uq1,fieldsObject.uq2)
            })       
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

    async getItemConfig(dataObject: DataObject): Promise<UomItemConfiguration[]> {
        let str = await dataObject.getFieldValue(this.config.ItemConfigFieldID);
        if (!str) {
            str = '[]';
        }
        return JSON.parse(str);
    }
    getUomConfig(uom: Uom | undefined, itemConfig: UomItemConfiguration[]): UomItemConfiguration {
        const config = itemConfig.find(item => item.UOMKey === uom?.Key);
        return {
            UOMKey: uom?.Key || "",
            Factor: Number(config?.Factor || uom?.Multiplier || 1),
            Min: Number(config?.Min || 0),
            Case: Number(config?.Case || 1),
            //we limit decimal to be at most 4 because UIObject.getValue support only numbers with 4 digits after the dot.
            Decimal: Number(config?.Decimal || 0) < 4? Number(config?.Decimal || 0): 4,
            Negative: Boolean(!!config?.Negative)
        };
    }
    getUomMinQuantity(uom: Uom | undefined, itemConfig: UomItemConfiguration[]): number {
        let minQuantity = 0;
        if (uom) {
            const config = itemConfig.find(item => item.UOMKey === uom.Key);
            minQuantity = config ? Number(config.Min) : 0;
        }
        return minQuantity;
    }
    getUomCaseQuantity(uom: Uom | undefined, itemConfig: UomItemConfiguration[]): number {
        let caseQuantity = 1;
        if (uom) {
            const config = itemConfig.find(item => item.UOMKey === uom.Key);
            caseQuantity = config ? Number(config.Case) : 1;
        }
        return caseQuantity;
    }
}
export async function load() {
    // const start = window.performance.now();
    // get UOM table
    const start = new Date().getTime();
    const list: Uom[] = (await pepperi.api.adal.getList({
        table: `${uomsScheme.Name}`,
        addon: config.AddonUUID
    })).objects as Uom[];
    uoms = new UOMMap(list);
    // get config table
    const configs = (await pepperi.api.adal.getList({
        table: 'AtdConfig',
        addon: config.AddonUUID
    })).objects as AtdConfiguration[];
    // create manager for each config
    for (const config of configs) {
        const manager = new UOMManager(config);
        // load the manager
        manager.load();
    }
    const end = new Date().getTime();
    // const end = window.performance.now();
    console.log(`loading time is ${end - start}ms`);
}
