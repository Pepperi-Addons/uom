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
			PackageName: "quantity module",
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
        return (this.invBehavior === 'Color' && total > this.normalizedInv) || (this.caseBehavior === 'Color' && num % this.cq != 0) || (this.minBehavior === 'Color' && num < this.getRealMin() && this.getRealMin() > 0);
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
        for (var i = 0; i < 2; i++) {
            var dd1 = ddArr[i];
            var uq1 = uqArr[i];
            if (dd1 && uq1) {
                //get relevant data build calc and check if he needs to color
                uom = dd1.value ? uoms.get(dd1.value) : undefined;
                const cq = this.getUomCaseQuantity(uom, itemConfig);
                const min = this.getUomMinQuantity(uom, itemConfig);
                const factor = uom ? uom.Multiplier : 0;
                const calc = new QuantityCalculator({ 'UOMKey': "", 'Min': min, 'Case': cq, 'Factor': factor }, inventory, this.config.CaseQuantityType, this.config.MinQuantityType, this.config.InventoryType);
                if (calc.toColor(Number(uq1.value), total)) {
                    uq1 ? uq1.textColor = "#FF0000" : null;
                    uq2 ? uq2.textColor = "#FF0000" : null;
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
                // if(dd1 && uq1){
                //     //get relevant data build calc and check if he needs to color
                //     uom = dd1.value ? uoms.get(dd1.value) : undefined;
                //     const cq = this.getUomCaseQuantity(uom, itemConfig);
                //     const min = this.getUomMinQuantity(uom, itemConfig);
                //     const factor = uom? uom.Multiplier: 0;
                //     const calc = new QuantityCalculator({'UOMKey': "",'Min': min, 'Case':cq, 'Factor': factor },inventory,this.config.CaseQuantityType, this.config.MinQuantityType, this.config.InventoryType);
                //         if(calc.isLegal(Number(uq1.value)))
                //         {
                //             uq1 ? uq1.textColor = "#FF0000" : null;
                //             uq2 ? uq2.textColor = "#FF0000" : null;
                //         }
                //     }
                //paint in red if total > inventory
                // if (this.config.InventoryType === "Color") {
                //     const inventory: number = (await dataObject?.getFieldValue(this.config.InventoryFieldID)) || 0;
                //     const total: number = (await dataObject?.getFieldValue(UNIT_QUANTITY)) || 0;
                //     if(total > inventory) {
                //         uq1 ? uq1.textColor = "#FF0000" : null;
                //         uq2 ? uq2.textColor = "#FF0000" : null;
                //     }
                // }
                // if(this.config.CaseQuantityType === 'Color')
                // {
                //     const itemConfig = await this.getItemConfig(uiObject.dataObject!) 
                //     let uom: Uom | undefined = undefined;
                //     let cq = 0;
                //     if(dd1 && uq1) {
                //         uom = dd1.value ? uoms.get(dd1.value) : undefined;
                //         cq = this.getUomCaseQuantity(uom, itemConfig);
                //         if(Number(uq1.value) % cq != 0 ) {
                //             uq1.textColor = "#FF0000";
                //         }
                //     }
                //     if(dd2 && uq2) {
                //         uom = dd2.value ? uoms.get(dd2.value) : undefined;
                //         cq = this.getUomCaseQuantity(uom,itemConfig)
                //         if(Number(uq2.value) % cq  != 0) {
                //             uq2.textColor = "#FF0000";
                //         }
                //     }
                // }
                // if(this.config.MinQuantityType === 'Color') {
                //     console.log('min quantity action is Color');
                //     const itemConfig = await this.getItemConfig(uiObject.dataObject!)
                //     let uom: Uom | undefined = undefined;
                //     let minQuantity = 0;
                //     if(dd1 && uq1) {
                //         uom = dd1.value ? uoms.get(dd1.value) : undefined;
                //         minQuantity = this.getUomMinQuantity(uom, itemConfig);
                //         console.log('checking uq1. value is:', uq1.value, 'min quantity is:', minQuantity);
                //         if(Number(uq1.value) < minQuantity && Number(uq1.value) != 0) {
                //             uq1.textColor = "#FF0000";
                //         }
                //     }
                //     if(dd2 && uq2) {
                //         uom = dd2.value ? uoms.get(dd2.value) : undefined;
                //         minQuantity = this.getUomMinQuantity(uom, itemConfig);
                //         console.log('checking uq1. value is:', uq2.value, 'min quantity is:', minQuantity);
                //         if(Number(uq2.value) < minQuantity && Number(uq2.value) != 0) {
                //             uq2.textColor = "#FF0000";
                //         }
                //     }
                // }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW9tLWFwcC5qcyIsInNvdXJjZXMiOlsiQzovdW9tX2VkaXRvci91b20vY3BpLXNpZGUvbm9kZV9tb2R1bGVzL0BwZXBwZXJpLWFkZG9ucy9jcGktbm9kZS9idWlsZC9jcGktc2lkZS9pbmRleC5qcyIsIkM6L3VvbV9lZGl0b3IvdW9tL3NoYXJlZC9lbnRpdGllcy50cyIsIkM6L3VvbV9lZGl0b3IvdW9tL2NwaS1zaWRlL3F1YW50aXR5LWNhbGN1bGF0b3IudHMiLCJDOi91b21fZWRpdG9yL3VvbS9jcGktc2lkZS91b20tYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpudWxsLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0E7QUFDQSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RCxlQUFlLEdBQUcsRUFBRSxDQUFDOzs7O0FDK0JyQjtBQUNPLE1BQU0sa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7QUFDOUMsTUFBTSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztBQUN0RDtBQUNPLE1BQU0saUJBQWlCLEdBQUcsYUFBYSxDQUFDO0FBQ3hDLE1BQU0sa0JBQWtCLEdBQUcsYUFBYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoQy9DO0FBSUE7TUFDYSxrQkFBa0I7O0lBVzNCLFlBQVksVUFBZ0MsRUFBVSxTQUFpQixFQUFVLFlBQTZCLEVBQVUsV0FBNEIsRUFBUyxXQUE0QjtRQUFuSSxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQVUsaUJBQVksR0FBWixZQUFZLENBQWlCO1FBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQWlCO1FBQVMsZ0JBQVcsR0FBWCxXQUFXLENBQWlCO1FBQ3JMLElBQUksQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztRQUMxQixJQUFJLENB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
