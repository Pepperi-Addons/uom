import { ItemAction, QuantityResult } from './uom-app';
import { InventoryAction, UomItemConfiguration } from './../shared/entities';

export class QuantityCalculator { 
            private normalizedInv:number;
            private factor:number;
            private cq:number;
            private originalMin:number;
            private negative:boolean;
            private decimal:number;
            private caseIsZero: boolean;
            constructor(itemConfig: UomItemConfiguration, private inventory: number, private caseBehavior: InventoryAction ,private minBehavior: InventoryAction,private invBehavior: InventoryAction){  
                this.negative = !!itemConfig.Negative
                this.decimal = Math.round(itemConfig.Decimal || 0);
                this.originalMin = this.negative? itemConfig.Min: Math.max(itemConfig.Min,0);
                this.factor = this.negative? itemConfig.Factor: Math.max(itemConfig.Factor,0);
                this.cq = this.negative? itemConfig.Case: Math.max(itemConfig.Case, 0);
                this.normalizedInv =  this.factor != 0? Math.abs(Math.floor(this.inventory/this.factor)): Number.MAX_SAFE_INTEGER;
                this.caseIsZero = this.cq === 0;
            }
            //convert the related fields to be a decimal number with a $this.decimal digits after the dot.
            sliceByDec():void{
                this.factor = Number(this.factor.toFixed(this.decimal));
                this.cq = Number(this.cq.toFixed(this.decimal));
                this.originalMin = Number(this.originalMin.toFixed(this.decimal));
            }
            //function for tests
            getFactor():number {
                return this.factor;
            }
            getCq() {
                return this.cq;
            }
            //determince if field needs to be colored
            toColor(num:number, total:number, inventory:number ):boolean{
                return  (this.caseBehavior === 'Color' && num%this.cq != 0) || (this.minBehavior === 'Color' && num < this.getRealMin() && num > 0) || (this.invBehavior === 'Color' && total > inventory); 
            }
            //return the min assume min = fix and case = fix;
            getRealMin():number {
                //such x we cant get from cail(min/cq)*cq
                return this.caseIsZero? this.originalMin: Math.ceil(this.originalMin/this.cq)*this.cq;
            }
            //return the max quantity assume inv = fix and case = fix;
            getRealMax():number {
                return  this.caseIsZero? this.normalizedInv: Math.floor(this.normalizedInv/this.cq)*this.cq;
            }
            //fix the number that will be divided by case, return a number that is not divded by iff action=set and case != fix
            //change Fix functions to fix.
            fixByCase(value: number, action:ItemAction):number{
                if(this.caseIsZero)
                    return value;
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
                        return value < this.getRealMin()? this.getRealMin(): value;
                    case ItemAction.Decrement:
                        return  value < this.getRealMin() ? 0: value;
                    case ItemAction.Set:
                        if(value === 0){
                            return value;
                        }
                const min = this.caseBehavior != 'Fix'? this.originalMin: this.getRealMin();
                //when min > inventory and minx=fix and inv=fix we cannot buy even 1 item
                if(min > this.normalizedInv && this.invBehavior === 'Fix' && this.minBehavior === 'Fix')
                {
                    return 0;
                }
                        
                        return this.minBehavior === 'Fix' && value < min  ? min: value;
                }
            }
            //fix the number by max
            //if action = inc or dec and invBehavior = fix and value > max so we change it to max
            // if action = set and not case behavior(cause otherwise we need to fix by case) and value > max and inBehave = fix then he return the max
            fixByMax(value: number, action: ItemAction):number{
                switch (action){
                    case ItemAction.Set:
                        let max = 0;
                        if(this.caseBehavior != 'Fix')
                            return (this.invBehavior === 'Fix' && value > this.normalizedInv)? this.normalizedInv: value;
                        return (this.invBehavior === 'Fix' && value > this.getRealMax())? this.getRealMax(): value;
                    default:
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
                const prevLegalValue = this.fixByCase(value,ItemAction.Decrement) + this.cq;
                //should return an integer that is no less than value
                //case there is no interval;
                if((this.getRealMax() < this.getRealMin()) && this.invBehavior === 'Fix')
                   return this.resultBuilder(value);
                //otherwise we need to fix result
                return this.fix(prevLegalValue,ItemAction.Increment)    
            }
            getDecrementValue(value: number):QuantityResult{
                const nextLegalValue = this.fixByCase(value, ItemAction.Increment) - this.cq;
                return this.fix(nextLegalValue,ItemAction.Decrement);
            }
            setValue(num: number):QuantityResult{
                return this.fix(Math.max(num,0),ItemAction.Set);
    }
            fix(num: number, action: ItemAction){
                let res = this.fixByCase(num,action);
                res = this.fixByMin(res,action);
                res = this.fixByMax(res, action);
                return this.resultBuilder(res);
            }
}

