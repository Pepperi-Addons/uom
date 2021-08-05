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
        // debugger
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
                const factor = this.getUomConfig(uom, itemConfig).Factor;
                const calc = new QuantityCalculator({ 'UOMKey': "", 'Min': min, 'Case': cq, 'Factor': factor }, inventory, this.config.CaseQuantityType, this.config.MinQuantityType, this.config.InventoryType);
                if (calc.toColor(Number(uq1.value), total)) {
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
                if (this.config.InventoryType === "Color") {
                    const inventory = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(this.config.InventoryFieldID))) || 0;
                    const total = (await (dataObject === null || dataObject === void 0 ? void 0 : dataObject.getFieldValue(UNIT_QUANTITY))) || 0;
                    if (total > inventory) {
                        uq1 ? uq1.textColor = "#FF0000" : null;
                        uq2 ? uq2.textColor = "#FF0000" : null;
                    }
                }
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
