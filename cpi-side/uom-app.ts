import '@pepperi-addons/cpi-node'
import { AtdConfiguration, InventoryAction, Uom } from './../shared/entities';
import { DataObject, EventData, UIObject } from '@pepperi-addons/cpi-node';
import config from '../addon.config.json';
import { parse } from 'uuid';
import { TransactionLine } from '@pepperi-addons/cpi-node/build/cpi-side/app/entities';
import { isForInStatement } from 'typescript';

/** Holds the quantity in UOM */
const UNIT_QTY_TSA = 'TSAAOQM_Quantity1';
const UNIT_QTY_ADDITIONAL_TSA = 'TSAAOQM_Quantity2';
/** Holds the Key of the UOM of the line */
const UOM_KEY_TSA = 'TSAAOQM_UOM1';
const UOM_KEY_ADDITIONAL_TSA = 'TSAAOQM_UOM2';
/** The Real UQ Field - Holds the quantity in Baseline */
const UNIT_QUANTITY = 'UnitsQuantity';
/** A list of Order Center Data Views */
const OC_DATA_VIEWS = [ 'OrderCenterGrid', 'OrderCenterView1', 'OrderCenterView2', 'OrderCenterView3', 'OrderCenterItemFullPage', 'OrderCenterVariant', 'OrderCenterBarcodeGridline', 'OrderCenterBarcodeLinesView', 'OrderCenterItemDetails'];
/** A list of Cart Data Views */
const CART_DATA_VIEWS = ['OrderCartGrid', 'OrderCartView1' ];
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
                const uiObject = data.UIObject!;
                // const realUQ = await uiObject.getUIField(UNIT_QUANTITY);
                // if(realUQ && (realUQ.type == 'NumberRealQuantitySelector' || realUQ?.type == 'NumberIntegerQuantitySelector')) {
                    await this.recalculateOrderCenterItem(data);
                // }
                await next(main);
            })
            for (const uqField of [UNIT_QTY_TSA, UNIT_QTY_ADDITIONAL_TSA]) {
                // Increment UNIT_QTY_TSA
                pepperi.events.intercept('IncrementFieldValue', { FieldID: uqField, ...filter }, async (data, next, main) => {
                    await next(async () => {
                        if(data && data.UIObject && data.UIObject.dataObject && data.FieldID) {
                            let oldValue = await data.UIObject.dataObject.getFieldValue(uqField) || 0;
                            const newValue = oldValue + 1;
                            await this.setUQField(data.UIObject, data.FieldID, newValue);
                        }
                    });
                });
                // Increment UNIT_QTY_TSA
                pepperi.events.intercept('DecrementFieldValue', { FieldID: uqField, ...filter }, async (data, next, main) => {
                    await next(async () => {
                        if(data && data.UIObject && data.UIObject.dataObject && data.FieldID) {
                            let oldValue = await data.UIObject.dataObject.getFieldValue(uqField) || 0;
                            const newValue = oldValue - 1;
                            await this.setUQField(data.UIObject, data.FieldID, newValue);
                        }
                    });
                })
                // Set UNIT_QTY_TSA
                pepperi.events.intercept('SetFieldValue', { FieldID: uqField, ...filter }, async (data, next, main) => {
                    debugger;
                    await next(async () => {
                        if(data && data.UIObject && data.UIObject && data.FieldID) {
                            await this.setUQField(data.UIObject, data.FieldID, parseInt(data.Value));
                        }
                    });
                })
            }
            for (const ddField of [UOM_KEY_TSA, UOM_KEY_ADDITIONAL_TSA]) {
                // Drop Down Change
                pepperi.events.intercept('SetFieldValue', { FieldID: ddField, ...filter }, async (data, next, main) => {
                    debugger;
                    await next(main);
                    // update the UQ field
                    const uqFieldId = data.FieldID === UOM_KEY_TSA ? UNIT_QTY_TSA : UNIT_QTY_ADDITIONAL_TSA;
                    const quantity = await data.DataObject?.getFieldValue(uqFieldId);
                    await this.setUQField(data.UIObject!, uqFieldId, quantity);
                })
            }
        }
    }
    async setUQField(uiObject: UIObject, fieldId: string, value: number) {
        try {
            debugger;
            //const t0 = performance.now();
            
            const dataObject = uiObject.dataObject;
            
            // set the fieldIDs
            const uqField = fieldId;
            const otherUQField = uqField === UNIT_QTY_TSA ? UNIT_QTY_ADDITIONAL_TSA : UNIT_QTY_TSA;
            const uomField = fieldId === UNIT_QTY_TSA ? UOM_KEY_TSA : UOM_KEY_ADDITIONAL_TSA;
            const otherUOMField = otherUQField === UNIT_QTY_ADDITIONAL_TSA ? UOM_KEY_ADDITIONAL_TSA : UOM_KEY_TSA;
            // get the UOM
            const uomValue = await dataObject?.getFieldValue(uomField);
            const uom = uomValue ? uoms.get(uomValue) : undefined;
            const otherUomValue = await dataObject?.getFieldValue(otherUOMField);
            const otherUom = otherUomValue ? uoms.get(otherUomValue) : undefined;
            const multiplier = uom ? uom.Multiplier : 1;
            let quantity = value;
            let otherQuantity = 0;
            let total = 0;
            if (otherUom) {
                otherQuantity = await dataObject?.getFieldValue(otherUQField);
                total += otherQuantity * otherUom.Multiplier;
            }
            // todo - fix inventory
            if (this.config.InventoryType === InventoryAction.Fix) {
                // todo: what if there is no inventory from integration
                const inventory: number = (await dataObject?.getFieldValue(this.config.InventoryFieldID)) || 0;
                const inventoryLeft = inventory - total;
                const maxInUOM = Math.floor(inventoryLeft / multiplier);
                
                // if quantity is bigger than the max quantity available in that UOM
                // set quantity to the max
                quantity = quantity < maxInUOM ? quantity : maxInUOM;
            }
            // add quantity to total
            total += quantity * multiplier;
            
            // item with just one UOM - just set the UnitsQuantity & total
            await dataObject?.setFieldValue(UNIT_QUANTITY, total.toString(), true);
            await uiObject.setFieldValue(uqField, quantity.toString(), true);
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
            const dataObject = data.DataObject!;

            // Get the keys of the UOM from integration
            let arr: string[] = await this.getItemUOMs(dataObject);

            // get the UIFields
            const dd1 = await uiObject.getUIField(UOM_KEY_TSA);
            const dd2 = await uiObject.getUIField(UOM_KEY_ADDITIONAL_TSA);
            const uq1 = await uiObject.getUIField(UNIT_QTY_TSA);
            const uq2 = await uiObject.getUIField(UNIT_QTY_ADDITIONAL_TSA);
            
            const optionalValues = arr.map(key => uoms.get(key)).filter(Boolean).map(uom => {
                return {
                    Key: uom!.Key,
                    Value: uom!.Title
                }
            });

            // run uom logic only when current item has available uoms. otherwise, hide uom fields and continue with regular UQ logic
            if(optionalValues.length > 0) {

                if (dd1 && uq1) {
                    dd1.readonly = false;
                    dd1.visible = true;
                    dd1.optionalValues = optionalValues;
                    if (dd1.value === '') {
                        await uiObject.setFieldValue(UOM_KEY_TSA, optionalValues[0].Key, true);
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
                    if (dd2.value === '' && optionalValues.length > 1) {
                        await uiObject.setFieldValue(UOM_KEY_ADDITIONAL_TSA, optionalValues[1].Key, true);
                    }
                    // hide
                    if (optionalValues.length < 2) {
                        dd2.visible = false;
                        uq2.visible = false;
                    }
                    // readonly
                    if (optionalValues.length === 2) {
                        dd2.readonly = true;
                    }
                }
                if (this.config.InventoryType === InventoryAction.Color) {
                    const inventory: number = (await dataObject?.getFieldValue(this.config.InventoryFieldID)) || 0;
                    const total: number = (await dataObject?.getFieldValue(UNIT_QUANTITY)) || 0;
                    if(total > inventory) {
                        uq1 ? uq1.textColor = "#00ff00" : null;
                        uq2 ? uq2.textColor = "#00ff00" : null;
                    }
                }
            }
            else {
                dd1 ? dd1.visible = false : null;
                dd2 ? dd2.visible = false : null;
                uq2 ? uq2.visible = false : null;

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

}

export async function load(configuration: any) {
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
        const manager = new UOMManager(config);
        // load the manager
        manager.load();
    }
}