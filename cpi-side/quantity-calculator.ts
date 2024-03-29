import { InventoryAction, UomItemConfiguration, ItemAction, QuantityResult, MAX_DECIMAL_DIGITS } from './../shared/entities';

export class QuantityCalculator { 
            private normalizedInv:number;
            private factor:number;
            private cq:number;
            private originalMin:number;
            private negative: boolean
            private decimal: number
            private alreadyConverted = false;
            constructor(itemConfig: UomItemConfiguration, private inventory: number, private caseBehavior: InventoryAction ,private minBehavior: InventoryAction,private invBehavior: InventoryAction){  
                this.decimal = MAX_DECIMAL_DIGITS // DI-25249 we have disconnected the relation between the factor and the number of decimal digits appear on the itemConfig
                this.negative = !!itemConfig.Negative;
                this.originalMin = Number(Math.max(itemConfig.Min,0).toFixed(this.decimal));
                this.factor = itemConfig.Factor > 0 ? Number(itemConfig.Factor.toFixed(this.decimal)): 1;
                this.cq = itemConfig.Case > 0 ? Number(itemConfig.Case.toFixed(this.decimal)): 1;
                this.normalizedInv =  Number(Math.floor(this.inventory/this.factor));
                this.convertFieldsToInteger();
            }
            convertFieldsToInteger()
            {  
                this.cq = this.convertToInteger(this.cq);
                this.originalMin = this.convertToInteger(this.originalMin);
                this.normalizedInv = this.convertToInteger(this.normalizedInv)
                this.alreadyConverted = true;     
            }
            //function for tests
            getFactor():number {
                return this.factor;
            }
            getSetMin():number{
                return this.caseBehavior != 'Fix'? this.originalMin: this.getRealMin();
            }
            getSetMax():number{
                return this.caseBehavior != 'Fix'? this.normalizedInv: this.getRealMax();
            }
            //determince if field needs to be colored
            toColor(num:number, total:number, inventory:number ):boolean{
                if(num <= 0 && this.negative)
                {
                    return false;
                }
                const newNum = this.convertToInteger(num);
                return  (this.caseBehavior === 'Color' && newNum%this.cq != 0) ||
                        (this.minBehavior === 'Color' && newNum < this.getRealMin() && newNum > 0) ||
                        (this.invBehavior === 'Color' && total > inventory); 
            }
            //return the min assume min = fix and case = fix;
            getRealMin():number {
                //such x we cant get from cail(min/cq)*cq
                return Math.ceil(this.originalMin/this.cq)*this.cq;
            }
            //return the max quantity assume inv = fix and case = fix;
            getRealMax():number {
                return  Math.floor(this.normalizedInv/this.cq)*this.cq;
            }
            //fix the number that will be divided by case, return a number that is not divded by iff action=set and case != fix
            //change Fix functions to fix.
            fixByCase(value: number, action:ItemAction):number{
                switch(action){
                case ItemAction.Increment:
                    return  Math.ceil(value/this.cq)*this.cq;
                case ItemAction.Decrement:
                    return Math.floor(value/this.cq)*this.cq;
                case ItemAction.Set:
                    return this.caseBehavior === 'Fix'? Math.ceil(value/this.cq)*this.cq: value;
                }
            }
            //fix the number by min, if number bellow min:
            //if add its up to min  
            //if dec its down to 0
            //if set and min=fix its up to min
            //otherwise return value;
            fixByMin(value:number, action: ItemAction):number{
                switch(action){
                    case ItemAction.Increment:
                        //if value is <=0 and negative is on, so we dont need to go up to min
                        return value < this.getRealMin() && (!this.negative || value > 0)? this.getRealMin(): value;
                    case ItemAction.Decrement:
                        return  value < this.getRealMin() && (!this.negative || value > 0) ? 0: value;
                    case ItemAction.Set:
                        if(value === 0){
                            return value;
                        } 
                        return this.minBehavior === 'Fix' && value < this.getSetMin() && (!this.negative || value > 0) ? this.getSetMin(): value;
                }
            }
            //fix the number by max
            //if action = inc or dec and invBehavior = fix and value > max so we change it to max
            // if action = set and not case behavior(cause otherwise we need to fix by case) and value > max and inBehave = fix then he return the max
            fixByMax(value: number, action: ItemAction):number{
                switch (action){
                    case ItemAction.Set:
                        //should consider on the none interval case only if inv=fix
                        //case we dont have an interval because min > max so if min behavior is fix we should not be able to set any value, so the max is zero
                        if(this.getSetMax() < this.getSetMin() && this.minBehavior === 'Fix'  && this.invBehavior === 'Fix')
                        {
                            return 0;
                        }
                        //the usual set case, if the inv fix so the max is setMax, otherwise if value > setMax and inv != fix so the value is the current max.
                        return (this.invBehavior === 'Fix' && value > this.getSetMax())? this.getSetMax(): value;
                    default:
                        //when we dont have an interval in increment, the max is zero.
                        if(this.getRealMax() < this.getRealMin() && action === ItemAction.Increment && this.invBehavior === 'Fix')
                        {
                            return 0;
                        }
                        //usual case of fix by max on dec/inc
                        return (value > this.getRealMax() && this.invBehavior === 'Fix') ? this.getRealMax(): value;
                }
            }
            //build the return type that the uom-app expect to
            resultBuilder(value:number){
                return {'curr': value, 'total': value*this.factor};
            }
            //value is non negative integer
            //always fix in case and min
            //if after the increment by case he is less than real minimum than he should be mean;
            //if after increment by case he is not divided by case, he should be the next non negative number that divided by case(unless he is bigger than max and inv = fix)
            getIncrementValue(value: number):QuantityResult {
                if(!this.alreadyConverted)
                {
                    this.convertFieldsToInteger();
                }
                const newVal = this.convertToInteger(value)
                if(newVal < 0 && this.negative)
                {
                    const shiftedOne = this.convertToInteger(1);
                    const shiftedMinusOne = this.convertToInteger(-1);
                    const resultOfNegativeBehavior = newVal + shiftedOne;
                    return newVal <= shiftedMinusOne? this.resultBuilder(this.convertToDec(resultOfNegativeBehavior)):  this.resultBuilder(0);
                }
                const nextLegalValue = this.fixByCase(newVal,ItemAction.Decrement) + this.cq;
                //should return an integer that is no less than value
                //otherwise we need to fix result
                let result = this.fix(nextLegalValue,ItemAction.Increment);
                return result.curr < value ? this.resultBuilder(value): result;
            }
            getDecrementValue(value: number):QuantityResult{
                // if(value <= 0 && this.negative)
                // {
                //     return this.resultBuilder(value - 1);
                // }
                if(!this.alreadyConverted)
                {
                    this.convertFieldsToInteger();
                }
                const newVal = this.convertToInteger(value);
                if(newVal <= 0 && this.negative)
                {
                    const shiftedOne = this.convertToInteger(1);
                    const resultOfNegativeBehavior = newVal - shiftedOne;
                    return this.resultBuilder(this.convertToDec(resultOfNegativeBehavior));
                }
                const prevLegalValue = this.fixByCase(newVal, ItemAction.Increment) - this.cq;
                return this.fix(prevLegalValue,ItemAction.Decrement);
            }
            setValue(num: number):QuantityResult{
                if(num <= 0 && this.negative)
                {
                    return this.resultBuilder(num);
                }
                if(!this.alreadyConverted)
                {
                    this.convertFieldsToInteger();
                }
                let newVal = this.convertToInteger(num);
                //here you need to format that to number.x where x.length == decimal
                newVal = this.negative ? newVal : Math.max(newVal,0);
                return this.fix(newVal,ItemAction.Set);
            }
            fix(num: number, action: ItemAction){
                //first shift left everything by decimal
                // num = this.convertToInteger(num);
                let res = this.fixByCase(num,action);
                res = this.fixByMin(res,action);
                res = this.fixByMax(res, action);
                //shift right back to the original base by decimal
                res = this.convertToDec(res);
                return this.resultBuilder(res)
            }
            // in order to support frac we just sfhit left $decimal digits, and then work on integers
            //always return an integer !
            convertToInteger(num:number):number{               
                let shifter = Math.pow(10,this.decimal);
                // this.originalMin = this.originalMin * shifter;
                // this.cq = this.cq * shifter;
                // this.normalizedInv = this.normalizedInv * shifter;
                return Math.round(num * shifter);
            }
            // here we shift right to go back to the original base of the number.
            convertToDec(res: number):number{
                let shifter = Math.pow(10,this.decimal);
                this.originalMin = Number((this.originalMin / shifter).toFixed(this.decimal));
                this.cq = Number((this.cq / shifter).toFixed(this.decimal));
                this.normalizedInv = Number((this.normalizedInv / shifter).toFixed(this.decimal));
                this.alreadyConverted = false;
                return Number((res/shifter).toFixed(this.decimal));
            }
}

