'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createCommonjsModule(fn, basedir, module) {
	return module = {
		path: basedir,
		exports: {},
		require: function (path, base) {
			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
		}
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

createCommonjsModule(function (module, exports) {
/* eslint no-var: 0 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {};

});

/** Holds the quantity in UOM */
const UNIT_QTY_FIRST_TSA = 'TSAAOQMQuantity1';
const UNIT_QTY_SECOND_TSA = 'TSAAOQMQuantity2';
/** Holds the Key of the UOM of the line */
const UOM_KEY_FIRST_TSA = 'TSAAOQMUOM1';
const UOM_KEY_SECOND_TSA = 'TSAAOQMUOM2';

var AddonUUID = "1238582e-9b32-4d21-9567-4e17379f41bb";
var AddonVersion = "0.0.75";
var DebugPort = 4500;
var WebappBaseUrl = "https://app.sandbox.pepperi.com";
var DefaultEditor = "main";
var Endpoints = [
	"installation.ts",
	"api.ts"
];
var Editors = [
	"main"
];
var Assets = [
	"de.json",
	"en.json",
	"en.ngx-lib.json",
	"es.json",
	"fr.json",
	"he.json",
	"hu.json",
	"it.json",
	"ja.json",
	"nl.json",
	"pl.json",
	"pt.json",
	"ru.json",
	"zh.json"
];
var PublishConfig = {
	ClientStack: "ng10",
	Editors: [
		{
			ParentPackageName: "UOM",
			PackageName: "uom",
			Description: "UOM List"
		},
		{
			ParentPackageName: "UOM",
			PackageName: "config",
			Description: "UOM Configuration"
		}
	],
	Dependencies: {
	},
	CPISide: [
		"uom-app.ts"
	]
};
var config = {
	AddonUUID: AddonUUID,
	AddonVersion: AddonVersion,
	DebugPort: DebugPort,
	WebappBaseUrl: WebappBaseUrl,
	DefaultEditor: DefaultEditor,
	Endpoints: Endpoints,
	Editors: Editors,
	Assets: Assets,
	PublishConfig: PublishConfig
};

/** The Real UQ Field - Holds the quantity in Baseline */
const UNIT_QUANTITY = 'UnitsQuantity';
/** A list of Order Center Data Views */
const OC_DATA_VIEWS = ['OrderCenterGrid', 'OrderCenterView1', 'OrderCenterView2', 'OrderCenterView3', 'OrderCenterItemFullPage', 'OrderCenterVariant', 'OrderCenterBarcodeGridline', 'OrderCenterBarcodeLinesView', 'OrderCenterItemDetails', 'OrderCenterMatrix', 'OrderCenterFlatMatrixGrid', 'OrderCenterFlatMatrixLine'];
/** A list of Cart Data Views */
const CART_DATA_VIEWS = ['OrderCartGrid', 'OrderCartView1'];
/**
 * Data Structure that holds the UOM from the ADAL table
 */
class UOMMap {
    constructor(uoms) {
        this.hashMap = {};
        for (const uom of uoms) {
            this.hashMap[uom.Key] = uom;
        }
    }
    get(key) {
        return this.hashMap[key];
    }
}
let uoms;
/**
 * Manage UOM logic within a ATD
 */
class UOMManager {
    constructor(config) {
        this.config = config;
        this.config = config;
    }
    load() {
        this.subscribe();
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
            };
            // recalc event
            pepperi.events.intercept('RecalculateUIObject', filter, async (data, next, main) => {
                await this.recalculateOrderCenterItem(data);
                await next(main);
            });
            for (const uqField of [UNIT_QTY_FIRST_TSA, UNIT_QTY_SECOND_TSA]) {
                // Increment UNIT_QTY_TSA
                pepperi.events.intercept('IncrementFieldValue', Object.assign({ FieldID: uqField }, filter), async (data, next, main) => {
                    await next(async () => {
                        // debugger
                        if (data && data.UIObject && data.UIObject.dataObject && data.FieldID) {
                            let oldValue = await data.UIObject.dataObject.getFieldValue(uqField) || 0;
                            const newValue = oldValue + 1;
                            await this.setUQField(data.UIObject, data.FieldID, newValue);
                        }
                    });
                });
                // Increment UNIT_QTY_TSA
                pepperi.events.intercept('DecrementFieldValue', Object.assign({ FieldID: uqField }, filter), async (data, next, main) => {
                    await next(async () => {
                        if (data && data.UIObject && data.UIObject.dataObject && data.FieldID) {
                            let oldValue = await data.UIObject.dataObject.getFieldValue(uqField) || 0;
                            const newValue = oldValue - 1;
                            await this.setUQField(data.UIObject, data.FieldID, newValue);
                        }
                    });
                });
                // Set UNIT_QTY_TSA
                pepperi.events.intercept('SetFieldValue', Object.assign({ FieldID: uqField }, filter), async (data, next, main) => {
                    debugger;
                    await next(async () => {
                        if (data && data.UIObject && data.UIObject && data.FieldID) {
                            await this.setUQField(data.UIObject, data.FieldID, parseInt(data.Value));
                        }
                    });
                });
            }
            for (const ddField of [UOM_KEY_FIRST_TSA, UOM_KEY_SECOND_TSA]) {
                // Drop Down Change
                pepperi.events.intercept('SetFieldValue', Object.assign({ FieldID: ddField }, filter), async (data, next, main) => {
                    var _a;
                    debugger;
                    await next(main);
                    // update the UQ field
                    const uqFieldId = data.FieldID === UOM_KEY_FIRST_TSA ? UNIT_QTY_FIRST_TSA : UNIT_QTY_SECOND_TSA;
                    const quantity = await ((_a = data.DataObject) === null || _a === void 0 ? void 0 : _a.getFieldValue(uqFieldId));
                    await this.setUQField(data.UIObject, uqFieldId, quantity);
                });
            }
        }
    }
    async setUQField(uiObject, fieldId, value) {
        try {
            //const t0 = performance.now();
            const dataObject = uiObject.dataObject;
            // set the fieldIDs
            const uqField = fieldId;
            const otherUQField = uqField === UNIT_QTY_FIRST_TSA ? UNIT_QTY_SECOND_TSA : UNIT_QTY_FIRST_TSA;
            const uomField = fieldId === UNIT_QTY_FIRST_TSA ? UOM_KEY_FIRST_TSA : UOM_KEY_SECOND_TSA;
            const otherUOMField = otherUQField === UNIT_QTY_SECOND_TSA ? UOM_KEY_SECOND_TSA : UOM_KEY_FIRST_TSA;
            // get the UOM
            const uomValue = await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(uomField));
            const uom = uomValue ? uoms.get(uomValue) : undefined;
            const otherUomValue = await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(otherUOMField));
            const otherUom = otherUomValue ? uoms.get(otherUomValue) : undefined;
            const itemConfig = await this.getItemConfig(dataObject);
            const uomConfig = this.getUomConfig(uom, itemConfig);
            const otherUomConfig = this.getUomConfig(otherUom, itemConfig);
            let quantity = this.config.MinQuantityType === 'Fix' ? (value >= uomConfig.Min ? value : uomConfig.Min) : value;
            let otherQuantity = 0;
            let total = 0;
            if (otherUom) {
                otherQuantity = await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(otherUQField));
                total += otherQuantity * otherUomConfig.Factor;
            }
            // todo - fix inventory
            if (this.config.InventoryType === "Fix") {
                // todo: what if there is no inventory from integration
                const inventory = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(this.config.InventoryFieldID))) || 0;
                const inventoryLeft = inventory - total;
                const maxInUOM = Math.floor(inventoryLeft / uomConfig.Factor);
                // if quantity is bigger than the max quantity available in that UOM
                // set quantity to the max
                quantity = quantity < maxInUOM ? quantity : maxInUOM;
            }
            // add quantity to total
            total += quantity * uomConfig.Factor;
            // item with just one UOM - just set the UnitsQuantity & total
            await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.setFieldValue(UNIT_QUANTITY, total.toString(), true));
            await uiObject.setFieldValue(uqField, quantity.toString(), true);
            // const t1 = performance.now();
            // console.log(`Set Field took ${t1 - t0}ms`);
        }
        catch (err) {
            console.log('Error setting UQ field');
            console.error(err);
        }
    }
    async recalculateOrderCenterItem(data) {
        try {
            const uiObject = data.UIObject;
            const dataObject = data.DataObject;
            // Get the keys of the UOM from integration
            let arr = await this.getItemUOMs(dataObject);
            // get the UIFields
            const dd1 = await uiObject.getUIField(UOM_KEY_FIRST_TSA);
            const dd2 = await uiObject.getUIField(UOM_KEY_SECOND_TSA);
            const uq1 = await uiObject.getUIField(UNIT_QTY_FIRST_TSA);
            const uq2 = await uiObject.getUIField(UNIT_QTY_SECOND_TSA);
            const optionalValues = arr.map(key => uoms.get(key)).filter(Boolean).map(uom => {
                return {
                    Key: uom.Key,
                    Value: uom.Title
                };
            });
            // run uom logic only when current item has available uoms. otherwise, hide uom fields and continue with regular UQ logic
            if (optionalValues.length > 0 && dataObject.children.length == 0) {
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
                if (this.config.InventoryType === "Color") {
                    const inventory = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(this.config.InventoryFieldID))) || 0;
                    const total = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(UNIT_QUANTITY))) || 0;
                    if (total > inventory) {
                        uq1 ? uq1.textColor = "#FF0000" : null;
                        uq2 ? uq2.textColor = "#FF0000" : null;
                    }
                }
                if (this.config.MinQuantityType === 'Color') {
                    console.log('min quantity action is Color');
                    const itemConfig = await this.getItemConfig(uiObject.dataObject);
                    let uom = undefined;
                    let minQuantity = 0;
                    if (dd1 && uq1) {
                        uom = dd1.value ? uoms.get(dd1.value) : undefined;
                        minQuantity = this.getUomMinQuantity(uom, itemConfig);
                        console.log('checking uq1. value is:', uq1.value, 'min quantity is:', minQuantity);
                        if (Number(uq1.value) < minQuantity) {
                            uq1.textColor = "#FF0000";
                        }
                    }
                    if (dd2 && uq2) {
                        uom = dd2.value ? uoms.get(dd2.value) : undefined;
                        minQuantity = this.getUomMinQuantity(uom, itemConfig);
                        console.log('checking uq1. value is:', uq2.value, 'min quantity is:', minQuantity);
                        if (Number(uq2.value) < minQuantity) {
                            uq2.textColor = "#FF0000";
                        }
                    }
                }
            }
            else {
                dd1 ? dd1.visible = false : null;
                dd2 ? dd2.visible = false : null;
                uq1 && uq2 ? uq2.visible = false : null;
            }
            const realUQ = await uiObject.getUIField(UNIT_QUANTITY);
            if (realUQ && (uq1 || uq2)) {
                realUQ.readonly = true;
            }
        }
        catch (err) {
            console.log('Error recalculating UQ field');
            console.error(err);
        }
    }
    async getItemUOMs(dataObject) {
        let str = await dataObject.getFieldValue(this.config.UOMFieldID);
        if (!str) {
            str = '[]';
        }
        return JSON.parse(str);
    }
    async getItemConfig(dataObject) {
        let str = await dataObject.getFieldValue(this.config.ItemConfigFieldID);
        if (!str) {
            str = '[]';
        }
        return JSON.parse(str);
    }
    getUomConfig(uom, itemConfig) {
        let retVal = {
            UOMKey: "",
            Factor: 1,
            Min: 0,
            Case: 1
        };
        if (uom) {
            const config = itemConfig.find(item => item.UOMKey === uom.Key);
            if (config) {
                retVal = {
                    UOMKey: uom.Key,
                    Factor: config.Factor,
                    Min: config.Min,
                    Case: config.Case
                };
            }
            else {
                retVal.UOMKey = uom.Key;
            }
        }
        return retVal;
    }
    getUomMinQuantity(uom, itemConfig) {
        let minQuantity = 0;
        if (uom) {
            const config = itemConfig.find(item => item.UOMKey === uom.Key);
            minQuantity = config ? Number(config.Min) : 0;
        }
        return minQuantity;
    }
    getUomCaseQuantity(uom, itemConfig) {
        let caseQuantity = 1;
        if (uom) {
            const config = itemConfig.find(item => item.UOMKey === uom.Key);
            caseQuantity = config ? Number(config.Case) : 1;
        }
        return caseQuantity;
    }
}
async function load() {
    debugger;
    // get UOM table
    console.log("Getting the UOM table");
    const list = (await pepperi.api.adal.getList({
        table: 'Uoms',
        addon: config.AddonUUID
    })).objects;
    console.log("Retrieved ", list.length, " uoms");
    uoms = new UOMMap(list);
    // get config table
    const configs = (await pepperi.api.adal.getList({
        table: 'AtdConfig',
        addon: config.AddonUUID
    })).objects;
    // create manager for each config
    for (const config of configs) {
        console.log('Config object:', JSON.stringify(config));
        const manager = new UOMManager(config);
        // load the manager
        manager.load();
    }
}

exports.load = load;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW9tLWFwcC5qcyIsInNvdXJjZXMiOlsiQzovdW9tX2VkaXRvci91b20vY3BpLXNpZGUvbm9kZV9tb2R1bGVzL0BwZXBwZXJpLWFkZG9ucy9jcGktbm9kZS9idWlsZC9jcGktc2lkZS9pbmRleC5qcyIsIkM6L3VvbV9lZGl0b3IvdW9tL3NoYXJlZC9lbnRpdGllcy50cyIsIkM6L3VvbV9lZGl0b3IvdW9tL2NwaS1zaWRlL3VvbS1hcHAudHMiXSwic291cmNlc0NvbnRlbnQiOm51bGwsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQTtBQUNBLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlELGVBQWUsR0FBRyxFQUFFLENBQUM7Ozs7QUM2QnJCO0FBQ08sTUFBTSxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztBQUM5QyxNQUFNLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO0FBQ3REO0FBQ08sTUFBTSxpQkFBaUIsR0FBRyxhQUFhLENBQUM7QUFDeEMsTUFBTSxrQkFBa0IsR0FBRyxhQUFhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3pCL0M7QUFDQSxNQUFNLGFBQWEsR0FBRyxlQUFlLENBQUM7QUFDdEM7QUFDQSxNQUFNLGFBQWEsR0FBRyxDQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLHlCQUF5QixFQUFFLG9CQUFvQixFQUFFLDRCQUE0QixFQUFFLDZCQUE2QixFQUFFLHdCQUF3QixFQUFFLG1CQUFtQixFQUFFLDJCQUEyQixFQUFFLDJCQUEyQixDQUFDLENBQUM7QUFDOVQ7QUFDQSxNQUFNLGVBQWUsR0FBRyxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBRSxDQUFDO0FBQzdEOzs7QUFHQSxNQUFNLE1BQU07SUFFUixZ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
