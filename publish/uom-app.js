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
            return { 'curr': this.curr, 'total': this.curr * this.factor * this.cq };
        }
        // here curr is not in interval after updated so x is above max or x is below min
        if (this.curr > this.max) {
            this.curr = this.curr - this.cq;
            return { 'curr': this.curr, 'total': this.curr * this.cq * this.factor };
        }
        if (this.curr < this.min) {
            this.curr = this.getRealMin();
            return { 'curr': this.curr, 'total': this.curr * this.factor * this.cq };
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
            return { 'curr': this.curr, 'total': this.curr * this.cq * this.factor };
        }
        //curr not in interval so curr<min o
        if (this.curr < this.min || this.curr <= 0) {
            this.curr = 0;
            return { 'curr': this.curr, 'total': this.curr * this.cq * this.factor };
        }
        return { 'curr': 0, 'total': 0 };
    }
    //@pre: curr is in interval or curr = 0
    //@post: curr is in interval or curr == 0
    setVal(num) {
        if (!this.hasInterval)
            this.buildInterval();
        if (this.inInterval(num)) {
            this.curr = num;
            return { 'curr': this.curr, 'total': this.curr * this.cq * this.factor };
        }
        if (num % this.cq != 0) {
            if (num > this.cq)
                num = Math.ceil(num / this.cq) * this.cq;
            else
                num = this.cq;
        }
        if (num <= 0) {
            this.curr = 0;
            return { 'curr': this.curr, 'total': this.curr * this.cq * this.factor };
        }
        if (this.inInterval(num)) {
            this.curr = num;
            return { 'curr': this.curr, 'total': this.curr * this.cq * this.factor };
        }
        //if num is not in interval so or num < min or num > max or num%cq != 0
        //if num < min so we need to set min there(always ceil to closest legal val)
        if (num < this.min) {
            this.curr = this.min;
            return { 'curr': this.curr, 'total': this.curr * this.cq * this.factor };
        }
        // if num > max so we  needs to set max(the highest legal value)
        if (num > this.max) {
            this.curr = this.max;
            return { 'curr': this.curr, 'total': this.curr * this.cq * this.factor };
        }
        //so num<max and num>min and num%cq != 0 so we need to set x s.t x>=num and x in interval
        //we can get that x from x = ceil(num/cq)*cq;
        return { 'curr': this.curr, 'total': this.curr * this.cq * this.factor };
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
                    Factor: config.Factor || uom.Multiplier,
                    Min: config.Min || 0,
                    Case: config === undefined ? 1 : config.Case
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
