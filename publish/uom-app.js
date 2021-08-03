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
    constructor(itemConfig, inventory, caseBehavior, minBehavior) {
        this.inventory = inventory;
        this.caseBehavior = caseBehavior;
        this.minBehavior = minBehavior;
        if (itemConfig.Factor == 0) {
            throw new console.error("factor cannot be 0");
        }
        this.min = itemConfig.Min;
        this.originalMin = itemConfig.Min;
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
        if (this.caseBehavior != 'Fix' && this.minBehavior === 'Fix')
            return this.originalMin;
        if (this.caseBehavior === 'Fix' && this.minBehavior != 'Fix')
            return this.cq;
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
        // if(this.caseBehavior != 'Fix' && this.minBehavior === 'Fix')
        //     return (x <= this.max && x >= this.min && (x-this.originalMin)%this.cq === 0) || (x === 0)?  true:  false; 
        return (x <= this.max && x >= this.min && x % this.cq === 0) || (x === 0) ? true : false;
    }
    incCaseFix(num) {
        if (num <= this.max)
            return { 'curr': num, 'total': num * this.factor };
        // num = Math.floor((num/this.cq)*this.cq);
        return { 'curr': this.max, 'total': this.max * this.factor };
    }
    incMinFix(num) {
        //if not case maybe we should inc just by one? 
        if (num <= this.max)
            return { 'curr': num, 'total': num * this.factor };
        num = this.normalizedInv;
        return { 'curr': num, 'total': num * this.factor };
    }
    getRealMax() {
        if (this.caseBehavior != 'Fix' && this.minBehavior === 'Fix')
            return this.normalizedInv;
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
        // if(this.curr === 0)
        //     this.curr = this.min;
        // else 
        if (this.curr % this.cq != 0 && this.caseBehavior != 'Fix') {
            if (this.curr < this.cq)
                return { 'curr': this.cq, 'total': this.cq * this.factor };
            this.curr = Math.ceil(this.curr / this.cq) * this.cq;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        this.curr = this.curr + this.cq;
        //we should check if case is not fixed and curr%cq != 0 so curr = x s.t x = min({q|q>x and q%cq = 0})
        // if(this.caseBehavior != 'Fix' && this.minBehavior === 'Fix')
        //     return this.incMinFix(this.curr);
        if (this.caseBehavior === 'Fix' && this.minBehavior != 'Fix')
            return this.incCaseFix(this.curr);
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
        if (this.curr % this.cq != 0 && this.caseBehavior != 'Fix') {
            if (this.curr <= this.min)
                return { 'curr': 0, 'total': 0 };
            var cqMul = Math.floor(this.curr / this.cq) * this.cq;
            this.curr = cqMul >= this.min ? cqMul : this.min;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        this.curr = this.curr - this.cq;
        if (this.caseBehavior != 'Fix' && this.minBehavior === 'Fix') {
            if (this.curr < this.originalMin)
                return { 'curr': 0, 'total': 0 };
            return { 'curr': this.curr, 'total': this.factor * this.curr };
        }
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
        //case min fix and not case fix
        if (this.caseBehavior != 'Fix' && this.minBehavior === 'Fix') {
            if (num >= this.originalMin && num <= this.max)
                return { 'curr': num, 'total': num * this.factor };
            //so num either bigger than max or smaller than min
            //num is bigger than max
            if (num > this.max)
                return { 'curr': this.max, 'total': this.max * this.factor };
            //now num is smaller than min
            return { 'curr': this.originalMin, 'total': this.originalMin * this.factor };
        }
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
                    // debugger;
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
            let minBehavior = this.config.MinQuantityType;
            let caseBehavior = this.config.CaseQuantityType;
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
                const quantityCalc = new QuantityCalculator(uomConfig, inventoryLeft, caseBehavior, minBehavior);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW9tLWFwcC5qcyIsInNvdXJjZXMiOlsiQzovdW9tX2VkaXRvci91b20vY3BpLXNpZGUvbm9kZV9tb2R1bGVzL0BwZXBwZXJpLWFkZG9ucy9jcGktbm9kZS9idWlsZC9jcGktc2lkZS9pbmRleC5qcyIsIkM6L3VvbV9lZGl0b3IvdW9tL3NoYXJlZC9lbnRpdGllcy50cyIsIkM6L3VvbV9lZGl0b3IvdW9tL2NwaS1zaWRlL3F1YW50aXR5LWNhbGN1bGF0b3IudHMiLCJDOi91b21fZWRpdG9yL3VvbS9jcGktc2lkZS91b20tYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpudWxsLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0E7QUFDQSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RCxlQUFlLEdBQUcsRUFBRSxDQUFDOzs7O0FDK0JyQjtBQUNPLE1BQU0sa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7QUFDOUMsTUFBTSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztBQUN0RDtBQUNPLE1BQU0saUJBQWlCLEdBQUcsYUFBYSxDQUFDO0FBQ3hDLE1BQU0sa0JBQWtCLEdBQUcsYUFBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoQy9DO0FBSUE7TUFDYSxrQkFBa0I7O0lBVzNCLFlBQVksVUFBZ0MsRUFBVSxTQUFpQixFQUFVLFlBQTZCLEVBQVUsV0FBNEI7UUFBOUYsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFpQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFpQjtRQUNoSixJQUFHLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUN6QjtZQUNJLE1BQU0sSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7U0FF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
