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

//add container get itemConfig, key 
// @Inv curr is and non negative integer, curr%cq == 0, min<=curr<=max
class QuantityCalculator {
    // field of fix inventory fix min ... 
    constructor(itemConfig, inventory) {
        this.inventory = inventory;
        if (itemConfig.Factor == 0) {
            throw new console.error("factor cannot be 0");
        }
        this.min = itemConfig.Min;
        this.factor = itemConfig.Factor;
        this.max = inventory;
        this.hasInterval = false;
        this.curr = 0;
        this.currInv = this.inventory;
        this.cq = itemConfig.Case == 0 ? 1 : itemConfig.Case;
        this.normalizedInv = this.factor == 0 ? 0 : Math.floor(this.inventory / this.factor);
    }
    //define the real max and min
    buildInterval() {
        this.min = this.getRealMin();
        this.max = this.getRealMax();
        if (this.max < this.min) {
            this.max = 0;
            this.min = 0;
        }
        this.hasInterval = true;
    }
    getRealMin() {
        if (this.min >= this.cq && this.min % this.cq === 0) {
            return this.min;
        }
        if (this.min < this.cq && this.min != 0) { // min should be cq
            return this.cq;
        }
        //now min > cq and min%cq != 0 therefore we need  the min number x s.t x>=min but x%cq == 0 
        //such x we cant get from cail(min/cq)*cq
        return Math.ceil(this.min / this.cq) * this.cq;
    }
    inInterval(x) {
        if (!this.hasInterval)
            this.buildInterval;
        //true iff x is in interval and he is a multiplier of cq
        return (x <= this.max && x >= this.min && x % this.cq === 0) || (x === 0) ? true : false;
    }
    getRealMax() {
        if (this.normalizedInv >= this.cq && this.normalizedInv % this.cq === 0) {
            return this.normalizedInv;
        }
        //cannot buy anything if cq > inv
        if (this.normalizedInv < this.cq) {
            return 0;
        }
        //so inventory&cq != 0 therefore we need the max number x s.t x<inv and x%cq == 0
        //that x can be getting from floor(inv/cq)*cq
        return Math.floor(this.normalizedInv / this.cq) * this.cq;
    }
    getInv() {
        return this.currInv;
    }
    //@pre: curr>=0,curr is an integer,curr%cq == 0 
    //@post curr >=0 curr is an integer, curr % cq == 0 curr in interval
    getIncrementValue() {
        if (!this.hasInterval)
            this.buildInterval();
        this.curr = this.curr + this.cq;
        if (this.inInterval(this.curr)) {
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        // here curr is not in interval after updated so x is above max or x is below min
        if (this.curr > this.max) {
            this.curr = this.curr - this.cq;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        if (this.curr < this.min) {
            this.curr = this.getRealMin();
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        return { 'curr': 0, 'total': 0 };
    }
    //@pre curr >=0 curr is an integer, curr % cq == 0 curr<=max
    //@post curr >=0 curr is an integer, curr % cq == 0 curr in interval
    getDecrementValue() {
        if (!this.hasInterval)
            this.buildInterval();
        this.curr = this.curr - this.cq;
        if (this.inInterval(this.curr)) {
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //curr not in interval so curr<min o
        if (this.curr < this.min || this.curr <= 0) {
            this.curr = 0;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        return { 'curr': 0, 'total': 0 };
    }
    //@pre: curr is in interval or curr = 0
    //@post: curr is in interval or curr == 0
    setVal(num) {
        if (!this.hasInterval)
            this.buildInterval();
        if (num <= 0) {
            this.curr = 0;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        if (this.inInterval(num)) {
            this.curr = num;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        if (num % this.cq != 0) {
            if (num > this.cq)
                num = Math.ceil(num / this.cq) * this.cq;
            else
                num = this.cq;
        }
        if (this.inInterval(num)) {
            this.curr = num;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //if num is not in interval so or num < min or num > max or num%cq != 0
        //if num < min so we need to set min there(always ceil to closest legal val)
        if (num < this.min) {
            this.curr = this.min;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        // if num > max so we  needs to set max(the highest legal value)
        if (num > this.max) {
            this.curr = this.max;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //so num<max and num>min and num%cq != 0 so we need to set x s.t x>=num and x in interval
        //we can get that x from x = ceil(num/cq)*cq;
        return { 'curr': this.curr, 'total': this.curr * this.factor };
    }
    updateNormalizedInv() {
        this.normalizedInv = this.factor == 0 ? 0 : Math.floor(this.currInv / this.factor);
    }
    buy() {
        this.currInv = this.currInv - this.curr * this.factor;
        this.updateNormalizedInv();
        this.buildInterval();
        this.curr = 0;
    }
    setCurr(x) {
        this.curr = x;
        return;
    }
}

var ItemAction;
(function (ItemAction) {
    ItemAction[ItemAction["Increment"] = 0] = "Increment";
    ItemAction[ItemAction["Decrement"] = 1] = "Decrement";
    ItemAction[ItemAction["Set"] = 2] = "Set";
})(ItemAction || (ItemAction = {}));
/** The Real UQ Field - Holds the quantity in Baseline */
const UNIT_QUANTITY = 'UnitsQuantity';
/** A list of Order Center Data Views */ //what exactly datat view is?
const OC_DATA_VIEWS = ['OrderCenterGrid', 'OrderCenterView1', 'OrderCenterView2', 'OrderCenterView3', 'OrderCenterItemFullPage', 'OrderCenterVariant', 'OrderCenterBarcodeGridline', 'OrderCenterBarcodeLinesView', 'OrderCenterItemDetails', 'OrderCenterMatrix', 'OrderCenterFlatMatrixGrid', 'OrderCenterFlatMatrixLine'];
/** A list of Cart Data Views */
const CART_DATA_VIEWS = ['OrderCartGrid', 'OrderCartView1'];
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
                //here is per item? 
                //do i need to create here quantity calc instance ?
                await this.recalculateOrderCenterItem(data);
                await next(main);
            });
            for (const uqField of [UNIT_QTY_FIRST_TSA, UNIT_QTY_SECOND_TSA]) {
                // Increment UNIT_QTY_TSA
                //why the ... operator here? 
                pepperi.events.intercept('IncrementFieldValue', Object.assign({ FieldID: uqField }, filter), async (data, next, main) => {
                    await next(async () => {
                        //i need here to use quantitycalc object
                        // debugger
                        var _a;
                        //he never enter that if, cause data.UIObject.dataObject always undefined just in single action he is enter here
                        if (data && data.UIObject && data.UIObject.dataObject && data.FieldID) {
                            let oldValue = await data.UIObject.dataObject.getFieldValue(uqField) || 0;
                            //    const uomValue = await data.UIObject.dataObject.getFieldValue();
                            //is it the right way?
                            await this.getItemConfig(data.UIObject.dataObject);
                            //    let cq: number = itemConfig['case'];
                            //    let factor = itemConfig['Factor'];
                            //    let min = itemConfig['Min'];
                            //    let uom_key = itemConfig['UOMKey'];
                            (await ((_a = data.dataObject) === null || _a === void 0 ? void 0 : _a.getFieldValue(this.config.InventoryFieldID))) || 0;
                            //here i need to use my quantity calc to increment.
                            const newValue = oldValue + 1;
                            await this.setUQField(data.UIObject, data.FieldID, newValue, ItemAction.Increment);
                        }
                    });
                });
                // Increment UNIT_QTY_TSA
                pepperi.events.intercept('DecrementFieldValue', Object.assign({ FieldID: uqField }, filter), async (data, next, main) => {
                    await next(async () => {
                        if (data && data.UIObject && data.UIObject.dataObject && data.FieldID) {
                            let oldValue = await data.UIObject.dataObject.getFieldValue(uqField) || 0;
                            //here i can use my quantity calc
                            const newValue = oldValue - 1;
                            await this.setUQField(data.UIObject, data.FieldID, newValue, ItemAction.Decrement);
                        }
                    });
                });
                // Set UNIT_QTY_TSA   
                pepperi.events.intercept('SetFieldValue', Object.assign({ FieldID: uqField }, filter), async (data, next, main) => {
                    debugger;
                    await next(async () => {
                        if (data && data.UIObject && data.UIObject && data.FieldID) {
                            await this.setUQField(data.UIObject, data.FieldID, parseInt(data.Value), ItemAction.Set);
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
                    await this.setUQField(data.UIObject, uqFieldId, quantity, ItemAction.Set);
                });
            }
        }
    }
    async setUQField(uiObject, fieldId, value, itemAction) {
        try {
            //const t0 = performance.now();
            const dataObject = uiObject.dataObject;
            let doNothing = false;
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
            let quantityResult = { 'curr': 0, 'total': 0 };
            if (otherUom) {
                otherQuantity = await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(otherUQField));
                total += otherQuantity * otherUomConfig.Factor;
            }
            // todo - fix inventory
            if (this.config.InventoryType === "Fix") {
                // todo: what if there is no inventory from integration
                const inventory = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(this.config.InventoryFieldID))) || 0;
                const inventoryLeft = inventory - total;
                const quantityCalc = new QuantityCalculator(uomConfig, inventoryLeft);
                switch (itemAction) {
                    case ItemAction.Increment:
                        quantityCalc.setCurr(value - 1);
                        quantityResult = quantityCalc.getIncrementValue();
                        break;
                    case ItemAction.Decrement:
                        quantityCalc.setCurr(value + 1);
                        quantityResult = quantityCalc.getDecrementValue(); //send here old val;
                        break;
                    case ItemAction.Set:
                        quantityCalc.setCurr(value - 1);
                        quantityResult = quantityCalc.setVal(value);
                        break;
                }
                ;
                // if quantity is bigger than the max quantity available in that UOM
                // set quantity to the max
                // quantity = quantity < maxInUOM ? quantity : maxInUOM;
            }
            // add quantity to total
            total += quantityResult.total;
            // item with just one UOM - just set the UnitsQuantity & total
            await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.setFieldValue(UNIT_QUANTITY, total.toString(), true));
            await uiObject.setFieldValue(uqField, quantityResult.curr.toString(), true);
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
            //what is data  object.children?
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
                //paint in red if total > inventory
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
    //this is not working
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
                    Factor: Number(config.Factor) || uom.Multiplier,
                    Min: Number(config.Min) || 0,
                    Case: config === undefined ? 1 : Number(config.Case)
                };
            }
            else {
                retVal.Factor = uom.Multiplier;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW9tLWFwcC5qcyIsInNvdXJjZXMiOlsiQzovdW9tX2VkaXRvci91b20vY3BpLXNpZGUvbm9kZV9tb2R1bGVzL0BwZXBwZXJpLWFkZG9ucy9jcGktbm9kZS9idWlsZC9jcGktc2lkZS9pbmRleC5qcyIsIkM6L3VvbV9lZGl0b3IvdW9tL3NoYXJlZC9lbnRpdGllcy50cyIsIkM6L3VvbV9lZGl0b3IvdW9tL2NwaS1zaWRlL3F1YW50aXR5LWNhbGN1bGF0b3IudHMiLCJDOi91b21fZWRpdG9yL3VvbS9jcGktc2lkZS91b20tYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpudWxsLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0E7QUFDQSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RCxlQUFlLEdBQUcsRUFBRSxDQUFDOzs7O0FDK0JyQjtBQUNPLE1BQU0sa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7QUFDOUMsTUFBTSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztBQUN0RDtBQUNPLE1BQU0saUJBQWlCLEdBQUcsYUFBYSxDQUFDO0FBQ3hDLE1BQU0sa0JBQWtCLEdBQUcsYUFBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqQy9DO0FBSUE7TUFDYSxrQkFBa0I7O0lBVzNCLFlBQVksVUFBZ0MsRUFBVSxTQUFpQjtRQUFqQixjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQ25FLElBQUcsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQ3pCO1lBQ0ksTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUVqRDtRQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLFVB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
