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
var AddonVersion = "0.0.76";
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
			ParentPackageName: "Quantity Module",
			PackageName: "uom",
			Description: "Quantity Module List"
		},
		{
			ParentPackageName: "Quantity Module",
			PackageName: "config",
			Description: "Quantity Module Configuration"
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
    constructor(itemConfig, inventory, caseBehavior, minBehavior, invBehavior) {
        this.inventory = inventory;
        this.caseBehavior = caseBehavior;
        this.minBehavior = minBehavior;
        this.invBehavior = invBehavior;
        this.min = itemConfig.Min;
        this.originalMin = itemConfig.Min;
        this.factor = itemConfig.Factor === 0 ? 1 : itemConfig.Factor;
        this.max = inventory;
        this.hasInterval = false;
        this.curr = 0;
        this.currInv = this.inventory;
        this.cq = itemConfig.Case;
        this.normalizedInv = Math.floor(this.inventory / this.factor);
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
    getFactor() {
        return this.factor;
    }
    toColor(num, total) {
        // debugger
        return (this.caseBehavior === 'Color' && num % this.cq != 0) || (this.minBehavior === 'Color' && num < this.getRealMin() && num > 0);
    }
    getRealMin() {
        if (this.originalMin >= this.cq && this.originalMin % this.cq === 0) {
            return this.originalMin;
        }
        if (this.originalMin < this.cq && this.originalMin != 0) { // min should be cq
            return this.cq;
        }
        //now min > cq and min%cq != 0 therefore we need  the min number x s.t x>=min but x%cq == 0 
        //such x we cant get from cail(min/cq)*cq
        return this.cq != 0 ? Math.ceil(this.originalMin / this.cq) * this.cq : this.originalMin;
    }
    inInterval(x) {
        if (!this.hasInterval)
            this.buildInterval;
        // if(this.caseBehavior != 'Fix' && this.minBehavior === 'Fix')
        //     return (x <= this.max && x >= this.min && (x-this.originalMin)%this.cq === 0) || (x === 0)?  true:  false; 
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
        return this.cq != 0 ? Math.floor(this.normalizedInv / this.cq) * this.cq : this.normalizedInv;
    }
    getInv() {
        return this.currInv;
    }
    //@pre: curr>=0,curr is an integer,curr%cq == 0 
    //@post curr >=0 curr is an integer, curr % cq == 0 curr in interval
    getIncrementValue() {
        //so the only situation thats minBehave or caseBehave affect is when we have "wrong number" in the curr field(as result of set action that happend before that)
        //in case we change the real min and the real max
        this.min = this.getRealMin();
        this.max = this.getRealMax();
        //rare case, stay with same value
        if (this.min > this.normalizedInv || this.curr > this.max)
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        if (!this.hasInterval)
            this.buildInterval();
        // thats rare case where we cannot inc
        if (this.cq > this.normalizedInv && this.invBehavior === 'Fix')
            return { 'curr': 0, 'total': 0 };
        //if curr is 0 so we need to round him up to the real min who is f(case,min)  unless min is zero and than we should inc him to the case 
        if (this.curr == 0) {
            this.curr = this.min === 0 ? 1 : this.min;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //thats can happen just after set with some behavior that is not fixed
        if (this.curr % this.cq != 0) {
            // if he less than min he should be min
            if (this.curr < this.min) {
                this.curr = this.min;
                return { 'curr': this.curr, 'total': this.curr * this.factor };
            }
            //so he needs to be real max
            if (this.curr > this.max) {
                this.curr = this.max;
                return { 'curr': this.curr, 'total': this.curr * this.factor };
            }
            //otherwise we need to round him up to the closest value x s.t x%cq == 0
            this.curr = this.cq != 0 ? Math.ceil(this.curr / this.cq) * this.cq : this.curr;
            this.curr = this.curr > this.max ? this.max : this.curr;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        this.curr = this.curr + this.cq;
        //if curr is in interval so he is legal and therefor we return him as is.
        if (this.inInterval(this.curr)) {
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        // here curr is not in interval after updated so x is above max or x is below min
        //case curr > max: we need to update him to be real max that is f(case.min)
        if (this.curr > this.max) {
            this.curr = this.max;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //case curr is less than min: curr need to be the real min who is f(case,min)
        if (this.curr < this.min) {
            this.curr = this.min;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        return { 'curr': 0, 'total': 0 };
    }
    //@pre curr >=0 curr is an integer, curr % cq == 0 curr<=max
    //@post curr >=0 curr is an integer, curr % cq == 0 curr in interval
    getDecrementValue() {
        //in every action we build an interval of legal values, *this is not continuous interval
        if (!this.hasInterval)
            this.buildInterval();
        this.max = this.getRealMax();
        this.min = this.getRealMin();
        // if(this.min > this.max)
        //     return {'curr': 0, 'total': 0};
        if (this.cq === 0)
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        // in that case he need to be set to max{x | x < curr and x%cq == 0}
        if (this.curr > this.min && this.curr % this.cq != 0 && this.caseBehavior != 'Fix') {
            this.curr = this.cq != 0 ? Math.floor(this.curr / this.cq) * this.cq : this.curr;
            //if now he is bigger than max, he should be max(remember max of the interval is legal)
            this.curr = this.curr > this.max ? this.max : this.curr;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //assume this is simple decrement, if not we will fix it.
        this.curr = this.curr - this.cq;
        //in interval so simple decrement
        if (this.inInterval(this.curr)) {
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //curr is not in iterval so he can be bigger than max, therfore we want him to be max.
        if (this.curr > this.max) {
            this.curr = this.max;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //if curr is non positive or curr less than min so curr was 0 or min before that therefore curr need to be 0.
        if (this.curr < this.min || this.curr <= 0) {
            this.curr = 0;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        return { 'curr': 0, 'total': 0 };
    }
    //@pre: curr is in interval or curr = 0
    //@post: curr is in interval or curr == 0
    setVal(num) {
        //always build interval before the function
        if (!this.hasInterval)
            this.buildInterval();
        this.getRealMax();
        //if case behavior != fix or min behavior != fix min and max can chage.
        //if both of them not fix, so min is simply zero and max is  normalized inventory.
        if (this.caseBehavior != 'Fix' && this.minBehavior != 'Fix') {
            this.min = 0;
            this.max = this.normalizedInv;
        }
        //if just case behavior is not fix, so min is the origin min, and max is normalized inventory.
        if (this.caseBehavior != 'Fix' && this.minBehavior === 'Fix') {
            this.min = this.originalMin;
            this.max = this.normalizedInv;
        }
        //if just min behavior not fix, so min is case, and max is max{x | x < normalizedInv and x%cq == 0}
        if (this.minBehavior != 'Fix' && this.caseBehavior === 'Fix') {
            this.min = this.cq;
            if (this.cq != 0)
                this.max = this.normalizedInv <= 0 ? 0 : Math.floor(this.normalizedInv / this.cq) * this.cq;
            else
                this.max = this.normalizedInv;
        }
        if (this.invBehavior != 'Fix')
            this.max = Number.MAX_VALUE;
        // so we cant set any value so thats needs to be 0
        if (this.min > this.max) {
            return { 'curr': 0, 'total': 0 };
        }
        if (num <= 0) {
            this.curr = 0;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //simple case, if he is legal thats ok. if case is not fix so the num is legal iff min<=num<=max
        if (this.inInterval(num) || (this.caseBehavior != 'Fix' && num <= this.max && num >= this.min)) {
            if (!this.inInterval) ;
            this.curr = num;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //if num not in interval so num%cq != 0  or num < min or num > max
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
        //num%cq != 0 so we need to rounded up num to the closest x s.t x%cq == 0 
        if (num % this.cq != 0) {
            //here maybe we need to split it to the cases num > cq and else
            num = this.cq != 0 ? Math.ceil(num / this.cq) * this.cq : num;
            this.curr = num;
            return { 'curr': this.curr, 'total': this.curr * this.factor };
        }
        //default
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

// import { config } from 'process';
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
    async colorField(dd1, dd2, uq1, uq2, uiObject, dataObject) {
        //todo
        const itemConfig = await this.getItemConfig(uiObject.dataObject);
        const inventory = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(this.config.InventoryFieldID))) || 0;
        const total = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(UNIT_QUANTITY))) || 0;
        let uom = undefined;
        let ddArr = [dd1, dd2];
        let uqArr = [uq1, uq2];
        //add
        for (var i = 0; i < 2; i++) {
            var dd1 = ddArr[i];
            var uq1 = uqArr[i];
            if (dd1 && uq1) {
                //get relevant data build calc and check if he needs to color
                uom = dd1.value ? uoms.get(dd1.value) : undefined;
                const cq = this.getUomCaseQuantity(uom, itemConfig);
                const min = this.getUomMinQuantity(uom, itemConfig);
                const factor = this.getUomConfig(uom, itemConfig).Factor;
                const calc = new QuantityCalculator({ 'UOMKey': "", 'Min': min, 'Case': cq, 'Factor': factor }, inventory, this.config.CaseQuantityType, this.config.MinQuantityType, this.config.InventoryType);
                if (calc.toColor(Number(uq1.value), total)) {
                    uq1 ? uq1.textColor = "#FF0000" : null;
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
                            await this.getItemConfig(data.UIObject.dataObject);
                            (await ((_a = data.dataObject) === null || _a === void 0 ? void 0 : _a.getFieldValue(this.config.InventoryFieldID))) || 0;
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
                            const newValue = oldValue - 1;
                            await this.setUQField(data.UIObject, data.FieldID, newValue, ItemAction.Decrement);
                        }
                    });
                });
                // Set UNIT_QTY_TSA   
                pepperi.events.intercept('SetFieldValue', Object.assign({ FieldID: uqField }, filter), async (data, next, main) => {
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
            const inventory = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(this.config.InventoryFieldID))) || 0;
            const inventoryLeft = inventory - total;
            const quantityCalc = new QuantityCalculator(uomConfig, inventoryLeft, caseBehavior, minBehavior, this.config.InventoryType);
            switch (itemAction) {
                case ItemAction.Increment:
                    quantityCalc.setCurr(value - 1);
                    quantityResult = quantityCalc.getIncrementValue();
                    break;
                case ItemAction.Decrement:
                    quantityCalc.setCurr(value + 1);
                    quantityResult = quantityCalc.getDecrementValue();
                    break;
                case ItemAction.Set:
                    quantityCalc.setCurr(value - 1);
                    quantityResult = quantityCalc.setVal(value);
                    break;
            }
            ;
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
                //needs to check if color
                const itemConfig = await this.getItemConfig(uiObject.dataObject);
                const inventory = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(this.config.InventoryFieldID))) || 0;
                const total = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(UNIT_QUANTITY))) || 0;
                let uom = undefined;
                await this.colorField(dd1, dd2, uq1, uq2, uiObject, dataObject);
                //paint in red if total > inventory
                if (this.config.InventoryType === "Color") {
                    const inventory = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(this.config.InventoryFieldID))) || 0;
                    const total = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(UNIT_QUANTITY))) || 0;
                    if (total > inventory) {
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
