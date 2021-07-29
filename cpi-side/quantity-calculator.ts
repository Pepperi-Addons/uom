// import { Interval } from './quantity-calculator';
// import { QuantityCalculator } from './quantity-calculator';
import { InstalledAddon } from '@pepperi-addons/papi-sdk';




// @Inv curr is and non negative integer, curr%cq == 0, min<=curr<=max
export class QuantityCalculator {

    private max:number 
    private hasInterval:boolean;
    private curr: number;
    private currInv: number;
    private normalizedInv;
    constructor(private readonly  inventory: number, private cq: number, private factor: number,private min: number){  
        if(this.factor == 0)
        {
            throw new console.error("factor cannot be 0");
            
        }
        this.max = this.inventory
        this.hasInterval = false;
        this.curr = 0;
        this.currInv = this.inventory;
        this.cq = this.cq == 0 ? 1: this.cq;
        this.normalizedInv = this.factor == 0? 0: Math.floor(this.inventory/factor);
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


    getRealMin():number {
        if(this.min >= this.cq && this.min%this.cq === 0)
        {
            return this.min;
        }
        if(this.min < this.cq)
        { // min should be cq
            return this.cq
        }
        //now min > cq and min%cq != 0 therefore we need  the min number x s.t x>=min but x%cq == 0 
        //such x we cant get from cail(min/cq)*cq
        return Math.ceil(this.min/this.cq)*this.cq;
    }


    inInterval(x:number):boolean{
        if(!this.hasInterval)
            this.buildInterval;
            //true iff x is in interval and he is a multiplier of cq
        return (x <= this.max && x >= this.min && x%this.cq === 0) || (x === 0)?  true:  false; 
    }


    getRealMax():number {
        if(this.normalizedInv >= this.cq && this.normalizedInv%this.cq === 0)
        {
            return this.normalizedInv;
        }
        //cannot buy anything if cq > inv
        if(this.normalizedInv < this.cq)
        {
            return 0;
        }
        //so inventory&cq != 0 therefore we need the max number x s.t x<inv and x%cq == 0
        //that x can be getting from floor(inv/cq)*cq
        return Math.floor(this.normalizedInv/this.cq)*this.cq;   
    }


    getInv() {
        return this.currInv;
    }
    //@pre: curr>=0,curr is an integer,curr%cq == 0 
    //@post curr >=0 curr is an integer, curr % cq == 0 curr in interval
    getIncrementValue():number {
        if(!this.hasInterval)
            this.buildInterval();
        this.curr = this.curr + this.cq;
       
        if(this.inInterval(this.curr))
        {
            return this.curr;
        }
        // here curr is not in interval after updated so x is above max or x is below min
        if(this.curr > this.max)
        {
            this.curr = this.curr - this.cq;
            return this.curr
        }
        if(this.curr < this.min)
        {
            this.curr = this.getRealMin();
            return this.curr;
        }
        return 0;

    }

    //@pre curr >=0 curr is an integer, curr % cq == 0 curr<=max
    //@post curr >=0 curr is an integer, curr % cq == 0 curr in interval
    getDecrementValue():number{
        if(!this.hasInterval)
            this.buildInterval();
        this.curr = this.curr - this.cq;
       
        if(this.inInterval(this.curr))
        {
            return this.curr;
        }
        //curr not in interval so curr<min o
        if(this.curr < this.min || this.curr <=0)
        {
            this.curr = 0;
            return this.curr;
        }
        
        
        return 0;
    }
    //@pre: curr is in interval or curr = 0
    //@post: curr is in interval or curr == 0
    setVal(num: number):number{
        if(!this.hasInterval)
            this.buildInterval();
     
            if(this.inInterval(num))
            {
                this.curr = num;
                return this.curr;
            }

            if(num % this.cq != 0)
            {
                
                if(num > this.cq)
                    num = Math.ceil(num/this.cq)*this.cq;
                else
                    num = this.cq
            }

            if(num <= 0)
            {
                this.curr = 0;
                return this.curr;
            }

            if(this.inInterval(num))
            {
               
                this.curr = num;
                return this.curr;
            }

            //if num is not in interval so or num < min or num > max or num%cq != 0
            //if num < min so we need to set min there(always ceil to closest legal val)
            if(num < this.min)
            {
                this.curr = this.min;
                return this.curr;
            }
            // if num > max so we  needs to set max(the highest legal value)
            if(num > this.max)
            {
                this.curr = this.max;
                return this.curr;
            }
            
            //so num<max and num>min and num%cq != 0 so we need to set x s.t x>=num and x in interval
            //we can get that x from x = ceil(num/cq)*cq;

            return this.curr;
        
    }

    updateNormalizedInv():void{
        this.normalizedInv = this.factor == 0? 0: Math.floor(this.currInv/this.factor);

    }

    buy():void{
        this.currInv = this.currInv - this.curr*this.factor;
        this.updateNormalizedInv();
        this.buildInterval();   
        this.curr = 0;
    }



}

