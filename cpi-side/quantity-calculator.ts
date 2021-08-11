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
        this.cq = itemConfig.Case;
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
        return (x <= this.getRealMax() && x >= this.getRealMin() && x%this.cq === 0) || (x === 0)?  true:  false; 
    }

    getRealMax():number {
        return  Math.floor(this.normalizedInv/this.cq)*this.cq;
    }

    fix(result: number):number{
        if(this.cq > this.getRealMax())
            return result;
        if(this.inInterval(result+this.cq))
            return result+this.cq;
        return this.invBehavior === 'Fix'? this.fixByCase(this.fixByMin(result)): this.fixByCase(this.fixByMin(result)); 
    }
    fixByCase(result: number):number{
        return result > this.getRealMin()? Math.ceil(result/this.cq) * this.cq: result;
    }
    fixByMin(result:number){
        return result < this.getRealMin()? this.getRealMin(): result;
    }
    fixByMax(result: number):number{
        return result > this.getRealMax()? this.getRealMax(): result;
    }
    resultBuilder(result: number):QuantityResult{
        return{'curr':result, 'total': result*this.factor};
    }
    //Math.ceil(value/this.cq) * this.cq: value;
    //value is non negative integer
    //should return an integer that is no less than value
    //always fix in case and min
    //if after the increment by case he is less than real minimum than he should be mean;
    //if after increment by case he is not divided by case, he should be the next non negative number that divided by case(unless he is bigger than max and inv = fix)
    getIncrementValue(value: number):QuantityResult {
        if(value > this.getRealMax())
            return this.resultBuilder(value);
        return  this.invBehavior != 'Fix'? this.resultBuilder(this.fixByCase(this.fixByMin(value))) : this.resultBuilder(this.fix(value));
    }
    getDecrementValue(value: number):QuantityResult{
        //in every action we build an interval of legal values, *this is not continuous interval
        const max  = this.getRealMax();
        const min  = this.getRealMin();
        if(this.cq === 0)
            return {'curr': value, 'total': value * this.factor};
        // in that case he need to be set to max{x | x < curr and x%cq == 0}
        if(value > min && value % this.cq != 0 && this.caseBehavior != 'Fix')
        {
            value = this.cq != 0 ?  Math.floor(value/this.cq) * this.cq: value;
            //if now he is bigger than max, he should be max(remember max of the interval is legal)
            value = value > max ? max: value;
            return {'curr':value, 'total': value*this.factor};
        }
        //assume this is simple decrement, if not we will fix it.
        value = value - this.cq;
        //in interval so simple decrement
        if(this.inInterval(value))
        {
            return {'curr':value, 'total': value*this.factor};
        }
        //curr is not in iterval so he can be bigger than max, therfore we want him to be max.
        if(value > max)
        {
            value = max;
            return {'curr':value, 'total': value*this.factor};
        }
        //if curr is non positive or curr less than min so curr was 0 or min before that therefore curr need to be 0.
        if(value < min || value <=0)
        {
            value = 0;
            return {'curr':value, 'total': value*this.factor}
        }
        return {'curr':0, 'total': 0};
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

