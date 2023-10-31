
import { DataObject, EventData, UIObject, TransactionLine, UIField } from '@pepperi-addons/cpi-node';
import { Relation } from '@pepperi-addons/papi-sdk'

import config from '../addon.config.json'
import {
    AtdConfiguration,
    Uom,
    UNIT_QTY_FIRST_TSA,
    UNIT_QTY_SECOND_TSA,
    UOM_KEY_FIRST_TSA,
    UOM_KEY_SECOND_TSA,
    MAX_DECIMAL_DIGITS,
    ItemAction,
    QuantityResult,
    UomItemConfiguration
} from './../shared/entities';
import { QuantityCalculator } from './quantity-calculator';
import { DataService } from './data.service';

/** The Real UQ Field - Holds the quantity in Baseline */
const UNIT_QUANTITY = 'UnitsQuantity';
/** A list of Order Center Data Views */
const OC_DATA_VIEWS = ['OrderCenterGrid', 'OrderCenterView1', 'OrderCenterView2', 'OrderCenterView3', 'OrderCenterItemFullPage', 'OrderCenterVariant', 'OrderCenterBarcodeGridline', 'OrderCenterBarcodeLinesView', 'OrderCenterItemDetails', 'OrderCenterMatrix', 'OrderCenterFlatMatrixGrid', 'OrderCenterFlatMatrixLine'];
/** A list of Cart Data Views */
const CART_DATA_VIEWS = ['OrderCartGrid', 'OrderCartView1'];

const dataService = new DataService()
export const router = Router()

/**
 * Manage UOM logic within a ATD
 */
class UOMManager {
    constructor(private config: AtdConfiguration) {
        this.config = config;
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
        uom = dd1.value ? dataService.getUomByKey(dd1.value) : undefined;
        const calc = new QuantityCalculator(this.getUomConfig(uom, itemConfig), inventory, this.config.CaseQuantityType, this.config.MinQuantityType, this.config.InventoryType);
        if (calc.toColor(Number(uq1.value), total, inventory)) {
            uq1 ? uq1.textColor = "#FF0000" : null;
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
            const uom = uomValue ? dataService.getUomByKey(uomValue) : undefined;
            const otherUomValue = await dataObject?.getFieldValue(otherUOMField);
            const otherUom = otherUomValue ? dataService.getUomByKey(otherUomValue) : undefined;
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
        uq.decimalDigits = Number(uomConfig.Decimal);
        if (!uomConfig.Decimal && uq['customField'].type === 29) {
            uq['customField'].type = 28;
        }
        else if(uomConfig.Decimal  && uq['customField'].type === 28) {
            uq['customField'].type = 29
        }
    }
    async fixUOMValue(uq1: UIField | undefined, uq2: UIField | undefined, dataObject: TransactionLine, uomConfig, otherUomConfig, uiObject: UIObject)
    {
        const unitsQuantity = await dataObject?.getFieldValue(UNIT_QUANTITY);
        const firstUomTsaValue = Number(uq1?.value || await dataObject?.getFieldValue(UNIT_QTY_FIRST_TSA) || 0);
        const otherUomTsaValue = Number(uq2?.value || await dataObject?.getFieldValue(UNIT_QTY_SECOND_TSA) || 0);
        const sumFromFirstTSA = firstUomTsaValue * uomConfig.Factor;
        const sumFromOtherTSA = otherUomTsaValue * otherUomConfig.Factor;
        const suomOfUoms = sumFromFirstTSA + sumFromOtherTSA;
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

    getFormattedValue(optionalValues: {'Key' : string, 'Value': string}[], key: string){
        const result =  optionalValues.find((optionalValue) => {
            return (key == optionalValue.Key)
        })
        return result != undefined? result.Value : ''
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
                else{
                    const formattedValue = this.getFormattedValue(optionalValues, dd1.value)
                    dd1.formattedValue = formattedValue
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
                else{
                    const formattedValue = this.getFormattedValue(optionalValues, dd2.value)
                    dd2.formattedValue = formattedValue    
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
        return arr.map(key => dataService.getUomByKey(key)).filter(Boolean).map(uom => {
            return {
                Key: uom!.Key,
                Value: uom!.Title
            }
        });
    }
    async getUomConfigByKey(dataObject: DataObject, uomKey: string, itemConfig: UomItemConfiguration[])
    {
        const uomValue = await dataObject?.getFieldValue(uomKey);
        const uom = uomValue ? dataService.getUomByKey(uomValue) : undefined;
        return this.getUomConfig(uom, itemConfig);

    }
    async fixUomValueAndTsas(uomConfigAraay:UomItemConfiguration[], dataObject:TransactionLine, uiObject: UIObject, uq1, uq2)
    {
        await this.fixUOMValue(uq1,uq2,dataObject,uomConfigAraay[0],uomConfigAraay[1],uiObject);
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
            const [
                arr,
                dd1,
                uq1,
                dd2, 
                uq2
            ] = await Promise.all([
                this.getItemUOMs(dataObject),
                uiObject.getField(UOM_KEY_FIRST_TSA),
                uiObject.getField(UNIT_QTY_FIRST_TSA),
                uiObject.getField(UOM_KEY_SECOND_TSA),
                uiObject.getField(UNIT_QTY_SECOND_TSA)
            ])
            // const fieldsObject = this.buildFieldsObjectFromArray(uomsTsaFields);
            await this.updateUOMDropDowns(arr,dataObject,dd1,uq1,uiObject,dd2,uq2)
            const itemConfig = await this.getItemConfig(dataObject!);
            
            const uomConfig = this.getUomConfigByKey(dataObject, UOM_KEY_FIRST_TSA, itemConfig);
            const otherUomConfig = this.getUomConfigByKey(dataObject, UOM_KEY_SECOND_TSA, itemConfig);

            const uomConfigArray = await Promise.all([uomConfig,otherUomConfig])
            await this.fixUomValueAndTsas(uomConfigArray, dataObject, uiObject, uq1, uq2);
            await this.setUnitQuantityReadOnlyIfHasUom(uiObject,uq1,uq2);
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
            Decimal: Number(config?.Decimal || 0) < MAX_DECIMAL_DIGITS ? Number(config?.Decimal || 0): MAX_DECIMAL_DIGITS,
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

// export async function load() {
//     const list: Uom[] = await getUomArray(uomsScheme.Name)
//     uoms = new UOMMap(list);
//     const atdConfigurations = await getAtdConfigurationArray();
//     createUOMMangers(atdConfigurations)

// }

export async function load() {
    let relation: Relation = {
        Type: "CPIAddonAPI",
        AddonRelativeURL: "/uom-app/after_sync_registration",
        AddonUUID: config.AddonUUID,
        RelationName: "AfterSync",
        Name: "uom_after_sync_registration",
    }
    
    await pepperi.addons.data.relations.upsert(relation);
    await loadData();
    subscribe();
}

router.post('/after_sync_registration_success', async (req, res) => {
    await loadData()
    res.json({});
})

function subscribe() {
        // recalc event
    pepperi.events.intercept('RecalculateUIObject', {} , async (data, next, main) => {
        const manager = getUomManager(data.DataObject?.typeDefinition?.internalID!, data.FieldID)
        const dataView = data.UIObject?.context?.Name;
        if(manager && [...CART_DATA_VIEWS,...OC_DATA_VIEWS].includes(dataView))
        {
            await manager.recalculateOrderCenterItem(data);
        }
        await next(main);
    })

    pepperi.events.intercept('IncrementFieldValue', {} , async (data, next, main) => {
        const manager = getUomManager(data.DataObject?.typeDefinition?.internalID!, data.FieldID)
        if (manager) {
            await next(async () => {
                let oldValue = await data.UIObject?.dataObject?.getFieldValue(data.FieldID!) || 0;
                await manager.setUQField(data.UIObject!, data.FieldID!, oldValue, ItemAction.Increment);
            });
        }
    });
    // Increment UNIT_QTY_TSA
    pepperi.events.intercept('DecrementFieldValue', {}, async (data, next, main) => {
        const manager = getUomManager(data.DataObject?.typeDefinition?.internalID!, data.FieldID)
        if (manager) {
            await next(async () => {
                let oldValue = await data.UIObject?.dataObject?.getFieldValue(data.FieldID!) || 0;
                await manager.setUQField(data.UIObject!, data.FieldID!, oldValue, ItemAction.Decrement);
            });
        }
    })
    // Set UNIT_QTY_TSA   
    pepperi.events.intercept('SetFieldValue', {}, async (data, next, main) => {
        const manager = getUomManager(data.DataObject?.typeDefinition?.internalID!, data.FieldID)
        if (manager) {
            if ([UNIT_QTY_FIRST_TSA, UNIT_QTY_SECOND_TSA].includes(data.FieldID!)) { // if we're setting the value of the UQ, we need to override the main function.
                await next(async () => {
                    await manager.setUQField(data.UIObject!, data.FieldID!, parseFloat(data.Value), ItemAction.Set);
                });
            }
            else { // because the getUomManager check the fieldID, we can assume that here the fieldID is one of the UOM drop downs.
                await next(main);
                // update the UQ field
                const uqFieldId = data.FieldID === UOM_KEY_FIRST_TSA ? UNIT_QTY_FIRST_TSA : UNIT_QTY_SECOND_TSA;
                const quantity = await data.DataObject?.getFieldValue(uqFieldId);
                await manager.setUQField(data.UIObject!, uqFieldId, quantity, ItemAction.Set);
            }
        }
    })
}

function getUomManager(typeDefinitionID: number, fieldID: string | undefined): UOMManager | undefined {
    const config = dataService.getConfigObject(typeDefinitionID);
    const isUOMField = fieldID === undefined || [UNIT_QTY_FIRST_TSA, UNIT_QTY_SECOND_TSA,UOM_KEY_FIRST_TSA, UOM_KEY_SECOND_TSA].includes(fieldID)
    return (config && isUOMField) ? new UOMManager(config) : undefined;

}

async function loadData() {
    return await dataService.initData();
}
