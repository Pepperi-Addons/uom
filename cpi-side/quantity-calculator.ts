import { QuantityResult } from './uom-app';
import { InventoryAction, UomItemConfiguration } from './../shared/entities';
import { Z_FIXED } from 'zlib';
export class QuantityCalculator { 
            private currInv: number;
            private normalizedInv:number;
            private factor:number;
            private cq:number;
            private originalMin:number;
    
            constructor(itemConfig: UomItemConfiguration, private inventory: number, private caseBehavior: InventoryAction ,private minBehavior: InventoryAction,private invBehavior: InventoryAction){  
                this.originalMin = itemConfig.Min;
                this.factor = itemConfig.Factor === 0? 1: itemConfig.Factor;
                this.currInv = this.inventory;
                this.cq = Math.max(itemConfig.Case, 1);
                this.normalizedInv =  Math.floor(this.inventory/this.factor);
            }
            //function for tests
            getFactor():number {
                return this.factor;
            }

            toColor(num:number, total:number, inventory:number ):boolean{
                return  (this.caseBehavior === 'Color' && num%this.cq != 0) || (this.minBehavior === 'Color' && num < this.getRealMin() && num > 0) || (this.invBehavior === 'Color' && total > inventory); 
            }
    
            getRealMin():number {
                //now min > cq and min%cq != 0 therefore we need  the min number x s.t x>=min but x%cq == 0 
                //such x we cant get from cail(min/cq)*cq
                return this.cq != 0? Math.ceil(this.originalMin/this.cq)*this.cq: this.originalMin;
            }

            inInterval(x:number):boolean{
                return (x <= this.getRealMax() && x >= this.getRealMin() && x%this.cq === 0) || (x === 0);
            }

            getRealMax():number {
                return  Math.floor(this.normalizedInv/this.cq)*this.cq;
            }
            incFixByCase(value: number):number{
                return  value % this.cq != 0? Math.ceil(value/this.cq)*this.cq: value;
            }
            incFixByMin(value):number{
                return value < this.getRealMin()? this.getRealMin(): value;
            }
            fixByMax(value):number{
                return (value > this.getRealMax() && this.invBehavior === 'Fix') ? this.getRealMax(): value;
            }

            resultBuilder(value:number){
                return {'curr': value, 'total': value*this.factor};
            }
            //value is non negative integer
            //always fix in case and min
            //if after the increment by case he is less than real minimum than he should be mean;
            //if after increment by case he is not divided by case, he should be the next non negative number that divided by case(unless he is bigger than max and inv = fix)
            getIncrementValue(value: number):QuantityResult {
                const prevLegalValue = this.decFixByCase(value) + this.cq;
                //should return an integer that is no less than value
                //case there is no interval;
                if(this.getRealMax() < this.getRealMin() || this.getRealMax() === 0)
                   return this.resultBuilder(value);
                //regular case - the number still in interval
                if(this.inInterval(prevLegalValue))
                    return this.resultBuilder(prevLegalValue);
                //otherwise we need to fix result
                return this.resultBuilder(this.fixByMax(this.incFixByCase(this.incFixByMin(prevLegalValue))));        
            }

            decFixByCase(value:number){
                return value % this.cq != 0 ? Math.floor(value/this.cq)*this.cq : value;
            }

            decFixByMin(value:number){
               return  value < this.getRealMin() ? 0: value;
            }

            getDecrementValue(value: number):QuantityResult{
                const nextLegalValue = this.incFixByCase(value) - this.cq;
                if(this.inInterval(nextLegalValue))
                    return this.resultBuilder(nextLegalValue);
                return this.resultBuilder(this.fixByMax(this.decFixByCase(this.decFixByMin(nextLegalValue))));
            }

            setValue(num: number):QuantityResult{
                let originalMax = this.getRealMax(); 
                let min = this.getRealMin();
                let max = this.getRealMax();
                if(this.caseBehavior != 'Fix' && this.minBehavior != 'Fix')
                {
                    min = 0;
                    max = this.normalizedInv;
                }
                //if just case behavior is not fix, so min is the origin min, and max is normalized inventory.
                if(this.caseBehavior != 'Fix' && this.minBehavior === 'Fix')
                {
                min = this.originalMin;
                max = this.normalizedInv;
            }  
            //if just min behavior not fix, so min is case, and max is max{x | x < normalizedInv and x%cq == 0}
            if(this.minBehavior != 'Fix' && this.caseBehavior === 'Fix')
            {
                min = this.cq;
                if(this.cq != 0)
                max = this.normalizedInv <= 0 ? 0: Math.floor(this.normalizedInv/this.cq)*this.cq;
                else
                max = this.normalizedInv;
            }
            if(this.invBehavior != 'Fix')
                max = Number.MAX_VALUE;
            // so we cant set any value so thats needs to be 0
            if(min > max)
            {
                return {'curr': 0, 'total': 0};
            }
            if(num <= 0)
            {
                num = 0;
                return {'curr':num, 'total': num*this.factor};
            }
            //simple case, if he is legal thats ok. if case is not fix so the num is legal iff min<=num<=max
            if(this.inInterval(num) || (this.caseBehavior != 'Fix' && num <= max && num >= min))
            {
                return  {'curr':num, 'total': num*this.factor};
            }
            //if num not in interval so num%cq != 0  or num < min or num > max
            //if num is not in interval so or num < min or num > max or num%cq != 0
            //if num < min so we need to set min there(always ceil to closest legal val)
            if(num < min)
            {
                num = min;
                return {'curr':num, 'total': num*this.factor};
            }
            // if num > max so we  needs to set max(the highest legal value)
            if(num > max)
            {
                num = max;
                return {'curr':num, 'total': num*this.factor};
            }
            // num%cq != 0 so we need to rounded up num to the closest x s.t x%cq == 0 
            if(num % this.cq != 0)
            {
                //here maybe we need to split it to the cases num > cq and else
                num = this.cq != 0 ? Math.ceil(num/this.cq)*this.cq: num;
                return {'curr':num, 'total': num*this.factor};
            }
            //default
            return {'curr':num, 'total': num*this.factor};
    }
}

