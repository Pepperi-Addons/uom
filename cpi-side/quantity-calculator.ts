import { ItemAction, QuantityResult } from './uom-app';
import { InventoryAction, UomItemConfiguration } from './../shared/entities';

export class QuantityCalculator { 
            private currInv: number;
            private normalizedInv:number;
            private factor:number;
            private cq:number;
            private originalMin:number;
    
            constructor(itemConfig: UomItemConfiguration, private inventory: number, private caseBehavior: InventoryAction ,private minBehavior: InventoryAction,private invBehavior: InventoryAction){  
                this.originalMin = Math.max(itemConfig.Min,0);
                this.factor = Math.max(itemConfig.Factor,1);
                this.currInv = Math.max(0,this.inventory);
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

            getRealMax():number {
                return  Math.floor(this.normalizedInv/this.cq)*this.cq;
            }
            FixByCase(value: number, action:ItemAction):number{
                switch(action){
                case ItemAction.Increment:
                    return  value % this.cq != 0? Math.ceil(value/this.cq)*this.cq: value;
                    break;
                case ItemAction.Decrement:
                    return value % this.cq != 0 ? Math.floor(value/this.cq)*this.cq : value;
                    break;
                case ItemAction.Set:
                    return this.caseBehavior === 'Fix'? Math.ceil(value/this.cq)*this.cq: value;
                    break;
                }
            }
            FixByMin(value:number, action: ItemAction):number{
                switch(action){
                    case ItemAction.Increment:
                        return value < this.getRealMin()? this.getRealMin(): value;
                        break;
                    case ItemAction.Decrement:
                        return  value < this.getRealMin() ? 0: value;
                        break;
                    case ItemAction.Set:
                        if(this.caseBehavior != 'Fix')
                        return this.minBehavior === 'Fix' && value < this.originalMin && value > 0 ? this.originalMin: value;
                        return this.minBehavior === 'Fix' && value < this.getRealMin() && value > 0 ? this.getRealMin(): value;
                        break;
                }
               
            }
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

            resultBuilder(value:number){
                return {'curr': value, 'total': value*this.factor};
            }
            //value is non negative integer
            //always fix in case and min
            //if after the increment by case he is less than real minimum than he should be mean;
            //if after increment by case he is not divided by case, he should be the next non negative number that divided by case(unless he is bigger than max and inv = fix)
            getIncrementValue(value: number):QuantityResult {
                const prevLegalValue = this.FixByCase(value,ItemAction.Decrement) + this.cq;
                //should return an integer that is no less than value
                //case there is no interval;
                if(this.getRealMax() < this.getRealMin() || this.getRealMax() === 0)
                   return this.resultBuilder(value);
                //otherwise we need to fix result
                return this.resultBuilder(this.fixByMax(this.FixByCase(this.FixByMin(prevLegalValue, ItemAction.Increment),ItemAction.Increment),ItemAction.Increment));        
            }

            getDecrementValue(value: number):QuantityResult{
                const nextLegalValue = this.FixByCase(value, ItemAction.Increment) - this.cq;
                // if(this.inInterval(nextLegalValue))
                //     return this.resultBuilder(nextLegalValue);
                return this.resultBuilder(this.fixByMax(this.FixByCase(this.FixByMin(nextLegalValue,ItemAction.Decrement),ItemAction.Decrement),ItemAction.Decrement));
            }

            setValue(num: number):QuantityResult{
                return this.resultBuilder(this.FixByCase(this.FixByMin(this.fixByMax(Math.max(num,0), ItemAction.Set),ItemAction.Set),ItemAction.Set))

         
    }
}

