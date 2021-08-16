import { InventoryAction, UomItemConfiguration, ItemAction, QuantityResult } from './../shared/entities';
export class QuantityCalculator { 
            private normalizedInv:number;
            private factor:number;
            private cq:number;
            private originalMin:number;
    
            constructor(itemConfig: UomItemConfiguration, private inventory: number, private caseBehavior: InventoryAction ,private minBehavior: InventoryAction,private invBehavior: InventoryAction){  
                this.originalMin = Math.max(itemConfig.Min,0);
                this.factor = Math.max(itemConfig.Factor,1);
                this.cq = Math.max(itemConfig.Case, 1);
                this.normalizedInv =  Math.floor(this.inventory/this.factor);
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
                return  (this.caseBehavior === 'Color' && num%this.cq != 0) || (this.minBehavior === 'Color' && num < this.getRealMin() && num > 0) || (this.invBehavior === 'Color' && total > inventory); 
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
                        return value < this.getRealMin()? this.getRealMin(): value;
                    case ItemAction.Decrement:
                        return  value < this.getRealMin() ? 0: value;
                    case ItemAction.Set:
                        if(value === 0){
                            return value;
                        } 
                        return this.minBehavior === 'Fix' && value < this.getSetMin()  ? this.getSetMin(): value;
                }
            }
            //fix the number by max
            //if action = inc or dec and invBehavior = fix and value > max so we change it to max
            // if action = set and not case behavior(cause otherwise we need to fix by case) and value > max and inBehave = fix then he return the max
            fixByMax(value: number, action: ItemAction):number{
                switch (action){
                    case ItemAction.Set:
                        //case we dont have an interval because min > max so if min behavior is fix we should not be able to set any value, so the max is zero
                        if(this.getSetMax() < this.getSetMin() && this.minBehavior === 'Fix')
                        {
                            return 0;
                        }
                        //the usual set case, if the inv fix so the max is setMax, otherwise if value > setMax and inv != fix so the value is the current max.
                        return (this.invBehavior === 'Fix' && value > this.getSetMax())? this.getSetMax(): value;

                    default:
                        //when we dont have an interval in increment, the max is zero.
                        if(this.getRealMax() < this.getRealMin() && action === ItemAction.Increment)
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
                const prevLegalValue = this.fixByCase(value,ItemAction.Decrement) + this.cq;
                //should return an integer that is no less than value
                //otherwise we need to fix result
                let result = this.fix(prevLegalValue,ItemAction.Increment);
                return result.curr < value ? this.resultBuilder(value): result;
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

