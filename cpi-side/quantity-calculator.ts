
import { QuantityResult } from './uom-app';
import { InventoryAction, UomItemConfiguration } from './../shared/entities';
export class QuantityCalculator {
    private max:number 
    private hasInterval:boolean;
    private curr: number;
    private currInv: number;
    private normalizedInv:number;
    private factor:number;
    private cq:number;
    private min:number;
    private originalMin:number;
    
    constructor(itemConfig: UomItemConfiguration, private inventory: number, private caseBehavior: InventoryAction ,private minBehavior: InventoryAction,private invBehavior: InventoryAction){  
        this.min = itemConfig.Min;
        this.originalMin = itemConfig.Min;
        this.factor = itemConfig.Factor === 0? 1: itemConfig.Factor;
        this.max = inventory;
        this.hasInterval = false;
        this.curr = 0;
        this.currInv = this.inventory;
        this.cq = itemConfig.Case;
        this.normalizedInv =  Math.floor(this.inventory/this.factor);
    }
    //define the real max and min
    buildInterval(){
        this.min = this.getRealMin();
        this.max = this.getRealMax();
        if(this.max < this.min)
        {
            this.max = 0;
            this.min = 0;
        }
        this.hasInterval = true;
    }
    getFactor():number {
        return this.factor;
    }
    toColor(num:number, total:number):boolean{
        // debugger
        return  (this.caseBehavior === 'Color' && num%this.cq != 0) || (this.minBehavior === 'Color' && num < this.getRealMin() && num > 0); 
    }
    getRealMin():number {
        //now min > cq and min%cq != 0 therefore we need  the min number x s.t x>=min but x%cq == 0 
        //such x we cant get from cail(min/cq)*cq
        return this.cq != 0? Math.ceil(this.originalMin/this.cq)*this.cq: this.originalMin;
    }
    inInterval(x:number):boolean{
        if(!this.hasInterval)
            this.buildInterval;
        return (x <= this.max && x >= this.min && x%this.cq === 0) || (x === 0)?  true:  false; 
    }
    getRealMax():number {
        //so inventory&cq != 0 therefore we need the max number x s.t x<inv and x%cq == 0
        //that x can be getting from floor(inv/cq)*cq
        return this.cq != 0 ? Math.floor(this.normalizedInv/this.cq)*this.cq: this.normalizedInv;
    }

    getIncrementValue(value: number):QuantityResult {   
        this.curr = value;
        //in case we change the real min and the real max
        const  min = this.getRealMin();
        const max  = this.getRealMax();

        //rare case, stay with same value
        if(min > this.normalizedInv || this.curr > max)
            return {'curr': this.curr, 'total': this.curr*this.factor}

        if(!this.hasInterval)
            this.buildInterval();
        // thats rare case where we cannot inc
        if(this.cq  > this.normalizedInv && this.invBehavior === 'Fix')
            return {'curr': 0, 'total': 0};
        //if curr is 0 so we need to round him up to the real min who is f(case,min)  unless min is zero and than we should inc him to the case 
        if(this.curr == 0)
        {
            this.curr = min === 0? 1: min
            return {'curr': this.curr, 'total': this.curr*this.factor}
        }
        //thats can happen just after set with some behavior that is not fixed
        if(this.curr % this.cq != 0 )
        {
            // if he less than min he should be min
            if(this.curr < min)
            {
                this.curr = min;
                return {'curr': this.curr, 'total': this.curr*this.factor};
            }
            //so he needs to be real max
            if(this.curr > max)
            {
                this.curr = max;
                return { 'curr': this.curr, 'total': this.curr * this.factor};
            }
            //otherwise we need to round him up to the closest value x s.t x%cq == 0
            this.curr = this.cq != 0 ? Math.ceil(this.curr/this.cq) * this.cq: this.curr;
            this. curr = this.curr > max ? max: this.curr;
            return { 'curr': this.curr, 'total': this.curr * this.factor};
        }
        this.curr = this.curr + this.cq;
        //if curr is in interval so he is legal and therefor we return him as is.
        if(this.inInterval(this.curr))
        {
            return {'curr': this.curr, 'total': this.curr*this.factor};
        }
        // here curr is not in interval after updated so x is above max or x is below min
        //case curr > max: we need to update him to be real max that is f(case.min)
        if(this.curr > max)
        {
            this.curr = max;
            return {'curr': this.curr, 'total': this.curr*this.factor};
        }
        //case curr is less than min: curr need to be the real min who is f(case,min)
        if(this.curr < min)
        {
            this.curr = this.min;
            return {'curr': this.curr, 'total': this.curr*this.factor};
        }
        return {'curr':0, 'total': 0};
    }
    getDecrementValue(value: number):QuantityResult{
        this.curr = value;
        //in every action we build an interval of legal values, *this is not continuous interval
        if(!this.hasInterval)
            this.buildInterval();
        this.max = this.getRealMax();
        this.min = this.getRealMin();
        if(this.cq === 0)
            return {'curr': this.curr, 'total': this.curr * this.factor};
        // in that case he need to be set to max{x | x < curr and x%cq == 0}
        if(this.curr > this.min && this.curr % this.cq != 0 && this.caseBehavior != 'Fix')
        {
            this.curr = this.cq != 0 ?  Math.floor(this.curr/this.cq) * this.cq: this.curr;
            //if now he is bigger than max, he should be max(remember max of the interval is legal)
            this.curr = this.curr > this.max ? this.max: this.curr;
            return {'curr':this.curr, 'total': this.curr*this.factor};
        }
        //assume this is simple decrement, if not we will fix it.
        this.curr = this.curr - this.cq;
        //in interval so simple decrement
        if(this.inInterval(this.curr))
        {
            return {'curr':this.curr, 'total': this.curr*this.factor};
        }
        //curr is not in iterval so he can be bigger than max, therfore we want him to be max.
        if(this.curr > this.max)
        {
            this.curr = this.max;
            return {'curr':this.curr, 'total': this.curr*this.factor};
        }
        //if curr is non positive or curr less than min so curr was 0 or min before that therefore curr need to be 0.
        if(this.curr < this.min || this.curr <=0)
        {
            this.curr = 0;
            return {'curr':this.curr, 'total': this.curr*this.factor}
        }
        return {'curr':0, 'total': 0};
    }
    setValue(num: number):QuantityResult{
            //always build interval before the function
          if(!this.hasInterval)
                this.buildInterval();
            let originalMax = this.getRealMax(); 
            if(this.caseBehavior != 'Fix' && this.minBehavior != 'Fix')
            {
                this.min = 0;
                this.max = this.normalizedInv;
            }
            //if just case behavior is not fix, so min is the origin min, and max is normalized inventory.
            if(this.caseBehavior != 'Fix' && this.minBehavior === 'Fix')
            {
                this.min = this.originalMin;
                this.max = this.normalizedInv;
            }  
            //if just min behavior not fix, so min is case, and max is max{x | x < normalizedInv and x%cq == 0}
            if(this.minBehavior != 'Fix' && this.caseBehavior === 'Fix')
            {
                this.min = this.cq;
                if(this.cq != 0)
                this.max = this.normalizedInv <= 0 ? 0: Math.floor(this.normalizedInv/this.cq)*this.cq;
                else
                this.max = this.normalizedInv;
            }
            if(this.invBehavior != 'Fix')
                this.max = Number.MAX_VALUE;
            // so we cant set any value so thats needs to be 0
            if(this.min > this.max)
            {
                return {'curr': 0, 'total': 0};
            }
            if(num <= 0)
            {
                this.curr = 0;
                return {'curr':this.curr, 'total': this.curr*this.factor};
            }
            //simple case, if he is legal thats ok. if case is not fix so the num is legal iff min<=num<=max
            if(this.inInterval(num) || (this.caseBehavior != 'Fix' && num <= this.max && num >= this.min))
            {
                if(!this.inInterval)
                {
                 
                }
                this.curr = num;
                return  {'curr':this.curr, 'total': this.curr*this.factor};
            }
            //if num not in interval so num%cq != 0  or num < min or num > max
            //if num is not in interval so or num < min or num > max or num%cq != 0
            //if num < min so we need to set min there(always ceil to closest legal val)
            if(num < this.min)
            {
                this.curr = this.min;
                return {'curr':this.curr, 'total': this.curr*this.factor};
            }
            // if num > max so we  needs to set max(the highest legal value)
            if(num > this.max)
            {
                this.curr = this.max;
                return {'curr':this.curr, 'total': this.curr*this.factor};
            }
            //num%cq != 0 so we need to rounded up num to the closest x s.t x%cq == 0 
            if(num % this.cq != 0)
            {
                //here maybe we need to split it to the cases num > cq and else
                num = this.cq != 0 ? Math.ceil(num/this.cq)*this.cq: num;
                this.curr = num;
                return {'curr':this.curr, 'total': this.curr*this.factor};
            }
            //default
            return {'curr':this.curr, 'total': this.curr*this.factor};
    }
    updateNormalizedInv():void{
        this.normalizedInv = this.factor == 0? 0: Math.floor(this.currInv/this.factor);

    }
    setCurr(x:number):void{
        this.curr = x;
        return;
    }
}

