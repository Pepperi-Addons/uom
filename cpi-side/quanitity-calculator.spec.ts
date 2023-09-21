
import { QuantityCalculator } from './quantity-calculator';
import { InventoryAction, UomItemConfiguration, InventoryActions } from './../shared/entities';
import 'mocha'
import { expect } from 'chai'

describe('Quantity Calculator', () => {
    const inc = (result: number, calc: QuantityCalculator,value: number) => {
        return () => {
            expect(calc.getIncrementValue(value)).that.is.eql({'curr': result, 'total' : result*calc.getFactor()});
        }
    }
    const dec = (result: number, calc: QuantityCalculator, value: number) => {
        return () => {
            expect(calc.getDecrementValue(value)).is.eql({'curr': result, 'total' : result*calc.getFactor()});
        }
    }
    const set = (result: number, calc: QuantityCalculator, input:number) => {
        return () => {
            expect(calc.setValue(input)).that.is.eql({'curr': result, 'total' : result*calc.getFactor()});
        }
    }

    describe('Test 1: Inv= fix, Case = fix, Min = fix', ()=>{
        let invBehavior:InventoryAction = 'Fix';
        let caseBehavior: InventoryAction = 'Fix';
        let minBehavior: InventoryAction = 'Fix';
  
        describe ('CASE 1: default inc,dec,set with inv = 10 case,factor = 1, min = 0', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':1, 'Min': 0, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 1', inc(1,calc,0));
                it('2: inc should go up from 1 to 2', inc(2,calc,1));
                it('3: inc should go up from 2 to 3', inc(3,calc,2));
                it('4: inc should go up from 3 to 4', inc(4,calc,3));
                it('5: inc should go up from 4 to 5', inc(5,calc,4));
                it('6: inc should go up from 5 to 6', inc(6,calc,5));
                it('7: inc should go up from 6 to 7', inc(7,calc,6));
                it('8: inc should go up from 7 to 8', inc(8,calc,7));
                it('9: inc should go up from 8 to 9', inc(9,calc,8));
                it('10: inc should go up from 9 to 10', inc(10,calc,9));
                it('11: inc should stay on 10', inc(10,calc,10));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 9', dec(9,calc,10));
                it('2: dec should go down from 9 to 8', dec(8,calc,9));
                it('3: dec should go down from 8 to 7', dec(7,calc,8));
                it('4: dec should go down from 7 to 6', dec(6,calc,7));
                it('5: dec should go down from 6 to 5', dec(5,calc,6));
                it('6: dec should go down from 5 to 4', dec(4,calc,5));
                it('7: dec should go down from 4 to 3', dec(3,calc,4));
                it('8: dec should go down from 3 to 2', dec(2,calc,3));
                it('9: dec should go down from 2 to 1', dec(1,calc,2));
                it('10: dec should go down from 1 to 0', dec(0,calc,1));
                it('11: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10', set(10,calc,10));
                it('3: set to 5', set(5,calc,5));
                it('4: set to 11 should set 10', set(10,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('6: set to 10 should set to 10 ', set(10,calc,999));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 1', inc(1,calc,0));
                it('3: dec should go down to 0', dec(0,calc,1));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc,9));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('6: inc should stay on 10 ', inc(10,calc,10));
            });
        });

        describe ('CASE 2: min%case != 0  inv = 10 case = 2 factor = 1, min = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc,0));
                it('2: inc should go up from 4 to 6', inc(6,calc,4));
                it('3: inc should go up from 6 to 8', inc(8,calc,6));
                it('4: inc should go up from 8 to 10', inc(10,calc,8));
                it('5: inc should stay on 10', inc(10,calc,10));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 8', dec(8,calc,10));
                it('2: dec should go down from 8 to 6', dec(6,calc,8));
                it('3: dec should go down from 6 to 4', dec(4,calc,6));
                it('4: dec should go down from 4 to 0', dec(0,calc,4));
                it('5: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10', set(10,calc,10));
                it('3: set to 5 need to set to 6', set(6,calc,5));
                it('4: set to 11 should set 10', set(10,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('6: set to 1 should set to 4 ', set(4,calc,1));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 4', inc(4,calc,0));
                it('3: dec should go down to 0', dec(0,calc,4));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 10', set(10,calc, 9));
                it('6: inc should stay on 10 ', inc(10,calc,10));
                it('7: set to -1 needs to set to 0 ', set(0,calc,-1));
                it('8: inc should go to 4 ', inc(4,calc,0));
                it('9: dec should go down to 0', dec(0,calc,4));
                it('10: set to 3 should set 4', set(4,calc, 3));
                it('11: dec should go down to 0', dec(0,calc,4));
            });
        });

        describe ('CASE 4: min < case  inv = 10 case = 4 factor = 1, min = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':4, 'Min': 3, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc,0));
                it('2: inc should go up from 4 to 8', inc(8,calc,4));
                it('3: stay on 8 ', inc(8,calc,8));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 8 to 4', dec(4,calc,8));
                it('2: dec should go down from 4 to 0', dec(0,calc,4));
                it('3: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10 needs to set to 8', set(8,calc,10));
                it('3: set to 5 need to set to 8', set(8,calc,5));
                it('4: set to 11 should set 8', set(8,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 8 ', set(8,calc,999));
                it('6: set to 1 should set to 4 ', set(4,calc,1));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 4', inc(4,calc,0));
                it('3: dec should go down to 0', dec(0,calc,4));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 8', set(8,calc, 9));
                it('6: inc should stay on 8 ', inc(8,calc,8));
                it('7: set to -1 should set to 0 ', set(0,calc,-1));
                it('8: inc should inc to 4 ', inc(4,calc,0));
                it('9: dec should go down to 0', dec(0,calc,4));
                it('10: set to 3 should set 4', set(4,calc, 3));
                it('11: dec should go down to 0', dec(0,calc,4));
            });
        });

    });
    describe('Test 2: Inv= fix, Case = DoNothing, Min = fix', ()=>{
        let invBehavior:InventoryAction = 'Fix';
        let caseBehavior: InventoryAction = 'DoNothing';
        let minBehavior: InventoryAction = 'Fix';
  
        describe ('CASE 1: default inc,dec,set with inv = 10 case,factor = 1, min = 0', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':1, 'Min': 0, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 1', inc(1,calc,0));
                it('2: inc should go up from 1 to 2', inc(2,calc,1));
                it('3: inc should go up from 2 to 3', inc(3,calc,2));
                it('4: inc should go up from 3 to 4', inc(4,calc,3));
                it('5: inc should go up from 4 to 5', inc(5,calc,4));
                it('6: inc should go up from 5 to 6', inc(6,calc,5));
                it('7: inc should go up from 6 to 7', inc(7,calc,6));
                it('8: inc should go up from 7 to 8', inc(8,calc,7));
                it('9: inc should go up from 8 to 9', inc(9,calc,8));
                it('10: inc should go up from 9 to 10', inc(10,calc,9));
                it('11: inc should stay on 10', inc(10,calc,10));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 9', dec(9,calc,10));
                it('2: dec should go down from 9 to 8', dec(8,calc,9));
                it('3: dec should go down from 8 to 7', dec(7,calc,8));
                it('4: dec should go down from 7 to 6', dec(6,calc,7));
                it('5: dec should go down from 6 to 5', dec(5,calc,6));
                it('6: dec should go down from 5 to 4', dec(4,calc,5));
                it('7: dec should go down from 4 to 3', dec(3,calc,4));
                it('8: dec should go down from 3 to 2', dec(2,calc,3));
                it('9: dec should go down from 2 to 1', dec(1,calc,2));
                it('10: dec should go down from 1 to 0', dec(0,calc,1));
                it('11: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10', set(10,calc,10));
                it('3: set to 5', set(5,calc,5));
                it('4: set to 11 should set 10', set(10,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('7: set to 10 should set to 10 ', set(10,calc,999));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 1', inc(1,calc,0));
                it('3: dec should go down to 0', dec(0,calc,1));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc,9));
                it('7: set to 999 should set to 10 ', set(10,calc,999));
                it('8: inc should stay on 10 ', inc(10,calc,10));
            });
        });
        describe ('CASE 2:  min%case != 0. inv = 10 case = 2,factor = 1, min = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc,0));
                it('2: inc should go up from 4 to 6', inc(6,calc,4));
                it('3: inc should go up from 6 to 8', inc(8,calc,6));
                it('4: inc should go up from 8 to 10', inc(10,calc,8));
                it('5: inc should stay on 10', inc(10,calc,10));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 8', dec(8,calc,10));
                it('2: dec should go down from 8 to 6', dec(6,calc,8));
                it('3: dec should go down from 6 to 4', dec(4,calc,6));
                it('4: dec should go down from 4 to 0', dec(0,calc,4));
                it('5: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0 should be 0', set(0,calc,0));
                it('2: set to 10 should be 10', set(10,calc,10));
                it('3: set to 5 should be 5', set(5,calc,5));
                it('4: set to 11 should set 10', set(10,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('7: set to 2 should set to 3 ', set(3,calc,2));
                it('8: set to 1 should set to 3 ', set(3,calc,1));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 4', inc(4,calc,0));
                it('3: dec should go down to 0', dec(0,calc,4));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc,9));
                it('7: set to 1 should set to 3 ', set(3,calc,1));
                it('8: inc should go up from 3 to 4 ', inc(4,calc,3));
                it('9: set to 5 should set to 5 ', set(5,calc,5));
                it('10: dec should go down from 5 to 4', dec(4,calc,5));
            });
        });

        describe ('CASE 3:  case > Inventory. inv = 5 case = 6,factor = 1, min = 2', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':6, 'Min': 2, 'Factor':1};
            let inventory: number = 5;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should stay on 0', inc(0,calc,0));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0 should be 0', set(0,calc,0));
                it('2: set to 5 should be 5', set(5,calc,5));
                it('3: set to 5 should be 5', set(5,calc,5));
                it('4: set to 11 should set 5', set(5,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 5 ', set(5,calc,999));
                it('7: set to 2 should set to 2 ', set(2,calc,2));
                it('8: set to 1 should set to 2 ', set(2,calc,1));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should stay 0', inc(0,calc,0));
                it('3: dec should stay 0', dec(0,calc,0));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 5', set(5,calc, 9));
                it('6: inc should stay on 5 ', inc(5,calc,5));
                it('7: set to 1 should set to 2 ', set(2,calc,1));
                it('8: inc should stay on 2 ', inc(2,calc,2));
                it('9: set to 5 should set to 5 ', set(5,calc,5));
                it('10: dec should go down from 5 to 0', dec(0,calc,5));
                it('11: set to 1 should set to 2 ', set(2,calc,1));
                it('12: dec should go down from 2 to 0', dec(0,calc,2));
            });
        });

        describe ('CASE 4:  case * factor > inv. inv = 9 case = 6,factor = 2, min = 2', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':6, 'Min': 2, 'Factor':2};
            let inventory: number = 9;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should stay on 0', inc(0,calc,0));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0 should be 0', set(0,calc,0));
                it('2: set to 5 should be 4', set(4,calc,5));
                it('3: set to 5 should be 4', set(4,calc,5));
                it('4: set to 11 should set 4', set(4,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 4 ', set(4,calc,999));
                it('7: set to 2 should set to 2 ', set(2,calc,2));
                it('8: set to 1 should set to 2 ', set(2,calc,1));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should stay 0', inc(0,calc,0));
                it('3: dec should stay 0', dec(0,calc,0));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 4', set(4,calc, 9));
                it('6: inc should stay on 4 ', inc(4,calc,4));
                it('7: set to 1 should set to 2 ', set(2,calc,1));
                it('8: inc should stay on 2 ', inc(2,calc,2));
                it('9: set to 5 should set to 4 ', set(4,calc,5));
                it('10: dec should go down from 4 to 0', dec(0,calc,4));
                it('11: set to 1 should set to 2 ', set(2,calc,1));
                it('12: dec should go down from 2 to 0', dec(0,calc,2));
            });
        });

        describe ('CASE 5:  case = 0. inv = 3,factor = 1, min = 2', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':0, 'Min': 2, 'Factor':1};
            let inventory: number = 3;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go to 2', inc(2,calc,0));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go to 0', dec(0,calc,2));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0 should be 0', set(0,calc,0));
                it('2: set to 5 should be 3', set(3,calc,5));
                it('3: set to 5 should be 3', set(3,calc,5));
                it('4: set to 11 should set 3', set(3,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 3 ', set(3,calc,999));
                it('7: set to 2 should set to 2 ', set(2,calc,2));
                it('8: set to 1 should set to 2 ', set(2,calc,1));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go to 2', inc(2,calc,0));
                it('3: inc should go to 3', inc(3,calc,2));
                it('4: dec should go to 2', dec(2,calc,3));
                it('5: dec should go to 0', dec(0,calc,2));
                it('6: set to 9 should set 3', set(3,calc, 9));
                it('7: inc should stay on 3 ', inc(3,calc,3));
                it('8: set to 1 should set to 2 ', set(2,calc,1));
                it('9: inc should go to 3 ', inc(3,calc,2));
                it('10: set to 5 should set to 3 ', set(3,calc,5));
                it('11: dec should go to 2', dec(2,calc,3));
                it('12: set to 1 should set to 2 ', set(2,calc,1));
                it('13: dec should go to 0', dec(0,calc,2));
            });
        });
       
     });
    describe('Test 2: Inv= fix, Case = fix, Min = DoNothing', ()=>{
        let invBehavior:InventoryAction = 'Fix';
        let caseBehavior: InventoryAction = 'Fix';
        let minBehavior: InventoryAction = 'DoNothing';
  
        describe ('CASE 1: default inc,dec,set with inv = 10 case,factor = 1, min = 0', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':1, 'Min': 0, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 1', inc(1,calc,0));
                it('2: inc should go up from 1 to 2', inc(2,calc,1));
                it('3: inc should go up from 2 to 3', inc(3,calc,2));
                it('4: inc should go up from 3 to 4', inc(4,calc,3));
                it('5: inc should go up from 4 to 5', inc(5,calc,4));
                it('6: inc should go up from 5 to 6', inc(6,calc,5));
                it('7: inc should go up from 6 to 7', inc(7,calc,6));
                it('8: inc should go up from 7 to 8', inc(8,calc,7));
                it('9: inc should go up from 8 to 9', inc(9,calc,8));
                it('10: inc should go up from 9 to 10', inc(10,calc,9));
                it('11: inc should stay on 10', inc(10,calc,10));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 9', dec(9,calc,10));
                it('2: dec should go down from 9 to 8', dec(8,calc,9));
                it('3: dec should go down from 8 to 7', dec(7,calc,8));
                it('4: dec should go down from 7 to 6', dec(6,calc,7));
                it('5: dec should go down from 6 to 5', dec(5,calc,6));
                it('6: dec should go down from 5 to 4', dec(4,calc,5));
                it('7: dec should go down from 4 to 3', dec(3,calc,4));
                it('8: dec should go down from 3 to 2', dec(2,calc,3));
                it('9: dec should go down from 2 to 1', dec(1,calc,2));
                it('10: dec should go down from 1 to 0', dec(0,calc,1));
                it('11: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10', set(10,calc,10));
                it('3: set to 5', set(5,calc,5));
                it('4: set to 11 should set 10', set(10,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('7: set to 10 should set to 10 ', set(10,calc,999));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 1', inc(1,calc,0));
                it('3: dec should go down to 0', dec(0,calc,1));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc,9));
                it('7: set to 999 should set to 10 ', set(10,calc,999));
                it('8: inc should stay on 10 ', inc(10,calc,10));
            });
        });

        describe ('CASE 2: inv=10, case = 2, min = 3, factor = 1', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc,0));
                it('2: inc should go up from 4 to 6', inc(6,calc,4));
                it('3: inc should go up from 6 to 8', inc(8,calc,6));
                it('4: inc should go up from 8 to 10', inc(10,calc,8));
                it('5: inc should stay 10', inc(10,calc,10));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 8', dec(8,calc,10));
                it('2: dec should go down from 8 to 6', dec(6,calc,8));
                it('3: dec should go down from 6 to 4', dec(4,calc,6));
                it('4: dec should go down from 4 to 0', dec(0,calc,4));
                it('5: dec should stay 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10', set(10,calc,10));
                it('3: set to 5 should set to 6', set(6,calc,6));
                it('4: set to 11 should set 10', set(10,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('7: set to 10 should set to 10 ', set(10,calc,999));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 4', inc(4,calc,0));
                it('3: dec should go down to 0', dec(0,calc,4));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 10', set(10,calc, 10));
                it('6: inc should go to 10 ', inc(10,calc,10));
                it('7: set to 999 should set to 10 ', set(10,calc,999));
                it('8: inc should stay on 10 ', inc(10,calc,10));
                it('9: set to 2 should set to 2 ', set(2,calc,2));
                it('10: inc should go up to 4 ', inc(4,calc,2));
                it('11: set to 1 should set to 2 ', set(2,calc,2));
                it('12: inc should go up to 4 ', inc(4,calc,2));

            });
        });

        describe ('CASE 3: min > inv inv=5, case = 2, min = 6, factor = 1', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 6, 'Factor':1};
            let inventory: number = 5;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should stay 0', inc(0,calc,0));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should stay 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10', set(4,calc,10));
                it('3: set to 5 should set to 4', set(4,calc,5));
                it('4: set to 11 should set 4', set(4,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 4 ', set(4,calc,999));
                it('7: set to 10 should set to 4 ', set(4,calc,999));
                it('8: set to 1 should set to 2', set(2,calc,1));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should stay 0', inc(0,calc,0));
                it('3: dec should stay 0', dec(0,calc,0));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 4', set(4,calc, 9));
                it('6: inc should stay on 4', inc(4,calc,4));
                it('7: set to 999 should set to 4 ', set(4,calc,999));
                it('8: inc should stay on 4 ', inc(4,calc,4));
                it('9: set to 2 should set to 2 ', set(2,calc,2));
                it('10: inc should stay on 2 ', inc(2,calc,2));
                it('11: set to 1 should set to 2 ', set(2,calc,1));
                it('12: inc should stay on 2 ', inc(2,calc,2));
                it('13: set to 3 should set to 4 ', set(4,calc,3));
                it('14: dec should go down to 0', dec(0,calc,4));
                it('15: dec should stay on   0', dec(0,calc,0));

            });
        });

    });

    describe('Test 4: Inv= fix, Case = DoNothing, Min = DoNothing', ()=>{
        let invBehavior:InventoryAction = 'Fix';
        let caseBehavior: InventoryAction = 'DoNothing';
        let minBehavior: InventoryAction = 'DoNothing';
  
        describe ('CASE 1: default inc,dec,set with inv = 10 case,factor = 1, min = 0', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':1, 'Min': 0, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 1', inc(1,calc,0));
                it('2: inc should go up from 1 to 2', inc(2,calc,1));
                it('3: inc should go up from 2 to 3', inc(3,calc,2));
                it('4: inc should go up from 3 to 4', inc(4,calc,3));
                it('5: inc should go up from 4 to 5', inc(5,calc,4));
                it('6: inc should go up from 5 to 6', inc(6,calc,5));
                it('7: inc should go up from 6 to 7', inc(7,calc,6));
                it('8: inc should go up from 7 to 8', inc(8,calc,7));
                it('9: inc should go up from 8 to 9', inc(9,calc,8));
                it('10: inc should go up from 9 to 10', inc(10,calc,9));
                it('11: inc should stay on 10', inc(10,calc,10));
                it('12: inc should go to 10', inc(30,calc,30));
                it('13: inc should go to 10', inc(50,calc,50));
                it('14: inc should go to 10', inc(0,calc,-7));
                it('15: inc should go to 10', inc(10,calc,9));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 9', dec(9,calc,10));
                it('2: dec should go down from 9 to 8', dec(8,calc,9));
                it('3: dec should go down from 8 to 7', dec(7,calc,8));
                it('4: dec should go down from 7 to 6', dec(6,calc,7));
                it('5: dec should go down from 6 to 5', dec(5,calc,6));
                it('6: dec should go down from 5 to 4', dec(4,calc,5));
                it('7: dec should go down from 4 to 3', dec(3,calc,4));
                it('8: dec should go down from 3 to 2', dec(2,calc,3));
                it('9: dec should go down from 2 to 1', dec(1,calc,2));
                it('10: dec should go down from 1 to 0', dec(0,calc,1));
                it('11: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10', set(10,calc,10));
                it('3: set to 5', set(5,calc,5));
                it('4: set to 11 should set 10', set(10,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('7: set to 10 should set to 10 ', set(10,calc,999));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 1', inc(1,calc,0));
                it('3: dec should go down to 0', dec(0,calc,0));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc,9));
                it('7: set to 999 should set to 10 ', set(10,calc,999));
                it('8: inc should stay on 10 ', inc(10,calc,10));
            });
        });

        describe ('CASE 2: inv=10, case = 2, min = 3, factor = 1', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc,0));
                it('2: inc should go up from 4 to 6', inc(6,calc,4));
                it('3: inc should go up from 6 to 8', inc(8,calc,6));
                it('4: inc should go up from 8 to 10', inc(10,calc,8));
                it('5: inc should stay 10', inc(10,calc,10));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 8', dec(8,calc,10));
                it('2: dec should go down from 8 to 6', dec(6,calc,8));
                it('3: dec should go down from 6 to 4', dec(4,calc,6));
                it('4: dec should go down from 4 to 0', dec(0,calc,4));
                it('5: dec should stay 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10', set(10,calc,10));
                it('3: set to 5 should set to 5', set(5,calc,5));
                it('4: set to 11 should set 10', set(10,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('7: set to 7 should set to 7 ', set(7,calc,7));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 4', inc(4,calc,0));
                it('3: dec should go down to 0', dec(0,calc,4));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc,9));
                it('7: set to 999 should set to 10 ', set(10,calc,999));
                it('8: inc should stay on 10 ', inc(10,calc,10));
                it('9: set to 2 should set to 2 ', set(2,calc,2));
                it('10: inc should go up to 4 ', inc(4,calc,2));
                it('11: set to 1 should set to 1 ', set(1,calc,1));
                it('12: inc should go up to 4 ', inc(4,calc,1));
                it('13: inc should go up to 6 ', inc(6,calc,4));
                it('14: inc should go up to 8 ', inc(8,calc,6));
                it('15: set to 1 should set 1', set(1,calc, 1));
                it('16: inc should go up to 4 ', inc(4,calc,1));
                it('17: set to 1 should set 1', set(1,calc, 1));
                it('18: dec should go down to 0', dec(0,calc,1));
            });
        });

        describe ('CASE 3:  inv=7, case = 4, min = 5, factor = 1', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':4, 'Min': 5, 'Factor':1};
            let inventory: number = 7;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: combine set inc dec:', () => {
                it('1: inc should stay 0', inc(0,calc,0));
                it('2: dec should stay 0', dec(0,calc,0));
                it('3: set to 1 should set 1', set(1,calc, 1));
                it('4: inc should stay on 1', inc(1,calc,1));
                it('5: set to 7 should set 7', set(7,calc, 7));
                it('6: dec should go to 0', dec(0,calc,7));

            
            });
        });
    });

    describe('Test 5: factor = 0 all fix', ()=>{
        let invBehavior:InventoryAction = 'Fix';
        let caseBehavior: InventoryAction = 'Fix';
        let minBehavior: InventoryAction = 'Fix';
  
        describe ('CASE 1: factor = 0 inv = 8 case = 2 min = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':0};
            let inventory: number = 8;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc,0));
                it('2: inc should go up from 4 to 6', inc(6,calc,4));
                it('3: inc should go up from 6 to 8', inc(8,calc,6));
                it('4: inc should stay 8', inc(8,calc,8));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 8 to 6', dec(6,calc,8));
                it('2: dec should go down from 6 to 4', dec(4,calc,6));
                it('3: dec should go down from 4 to 0', dec(0,calc,4));
                it('4: inc should stay 0', dec(0,calc,0));
            });

        });
    });

    describe('Test 6: factor = 1 inv = DoNothing case,min = Fix', ()=>{
        let invBehavior:InventoryAction = 'DoNothing';
        let caseBehavior: InventoryAction = 'Fix';
        let minBehavior: InventoryAction = 'Fix';
  
        describe ('CASE 1: factor = 1 inv = 8 case = 2 min = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 8;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc,0));
                it('2: inc should go up from 4 to 6', inc(6,calc,4));
                it('3: inc should go up from 6 to 8', inc(8,calc,6));
                it('4: inc should go up 10', inc(10,calc,8));
                it('5: inc should go up 12', inc(12,calc,10));
                it('6: inc should go up 14', inc(14,calc,12));
                it('7: inc should go up 16', inc(16,calc,14));
                it('8: inc should go up 18', inc(18,calc,16));
                it('9: inc should go up 20', inc(20,calc,18));
                it('10: inc should go up 22', inc(22,calc,20));
                it('11: inc should go up 24', inc(24,calc,22));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 8 to 6', dec(6,calc,8));
                it('2: dec should go down from 6 to 4', dec(4,calc,6));
                it('3: dec should go down from 4 to 0', dec(0,calc,4));
                it('4: inc should stay 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 9 expected: 10', set(10,calc,9));
                it('2: set to 10 expected: 10', set(10,calc,10));
                it('3: set to 1 expected: 4', set(4,calc,1));
                it('4: set to to 3 expected: 4', set(4,calc,3));
            });
            describe ('4: combine tests inc,set,dec:', () => {
                it('1: set to 9 expected: 10', set(10,calc,9));
                it('2: dec expected: 8 ', dec(8,calc,10));
                it('3: inc expected: 10', inc(10,calc,8));
                it('4: set to to 3 expected: 4', set(4,calc,3));
                it('5: dec expected: 0 ', dec(0,calc,4));
                it('6: inc expected: 4', inc(4,calc,0));
                it('7: set to to 50 expected: 50', set(50,calc,50));
                it('8: inc expected: 52', inc(52,calc,50));
                it('9: dec expected: 50 ', dec(50,calc,52));
            });
        });
        describe ('CASE 2: factor = 24 inv = 1 case = 1 min = 0', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':1, 'Min': 0, 'Factor':24};
            let inventory: number = 1;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: combine tests:', () => {
                it('1: inc should go up from 0 to 1', inc(1,calc,0));
                it('2: inc should go up from 1 to 2', inc(2,calc,1));
                it('3: inc should go up from 2 to 3', inc(3,calc,2));
                it('3: set to 24 should set to 24', set(24,calc,24));
                it('3: dec should go from 24 to 23', dec(23,calc,24));
                it('3: dec should go from 23 to 22', dec(22,calc,23));
                it('3: dec should go from 23 to 22', dec(22,calc,23));
                it('3: dec should go from 22 to 21', dec(21,calc,22));
                it('3: dec should go from 21 to 20', dec(20,calc,21));
            });
        });
        describe ('CASE 3: factor = 80 inv = 1 case = 8 min = 0', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':1, 'Min': 0, 'Factor':24};
            let inventory: number = 1;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: combine tests:', () => {
                it('2: set to 24 should set to 24', set(24,calc,24));
                it('3: inc should go from 24 to 25', dec(23,calc,24));
                it('4: dec should go from 25 to 24', dec(24,calc,25));
                it('5: dec should go from 24 to 23', dec(23,calc,24));
                it('6: dec should go from 23 to 22', dec(22,calc,23));
                it('7: dec should go from 23 to 22', dec(22,calc,23));
                it('8: dec should go from 22 to 21', dec(21,calc,22));
                it('9: dec should go from 21 to 20', dec(20,calc,21));
            });
        });
        
    });


    describe('Test 7: factor = 1 inv = Color case,min = Fix', ()=>{
        let invBehavior:InventoryAction = 'Color';
        let caseBehavior: InventoryAction = 'Fix';
        let minBehavior: InventoryAction = 'Fix';
  
        describe ('CASE 1: factor = 1 inv = 8 case = 2 min = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 8;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc,0));
                it('2: inc should go up from 4 to 6', inc(6,calc,4));
                it('3: inc should go up from 6 to 8', inc(8,calc,6));
                it('4: inc should go up to 10', inc(10,calc,8));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 8 to 6', dec(6,calc,8));
                it('2: dec should go down from 6 to 4', dec(4,calc,6));
                it('3: dec should go down from 4 to 0', dec(0,calc,4));
                it('4: inc should stay 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 9 expected: 10', set(10,calc,9));
                it('2: set to 10 expected: 10', set(10,calc,10));
                it('3: set to 1 expected: 4', set(4,calc,1));
                it('4: set to to 3 expected: 4', set(4,calc,3));
            });
            describe ('4: combine tests inc,set,dec:', () => {
                it('1: set to 9 expected: 10', set(10,calc,9));
                it('2: dec expected: 8 ', dec(8,calc,10));
                it('3: inc expected: 10', inc(10,calc,8));
                it('4: set to to 3 expected: 4', set(4,calc,3));
                it('5: dec expected: 0 ', dec(0,calc,4));
                it('6: inc expected: 4', inc(4,calc,0));
                it('7: set to to 50 expected: 50', set(50,calc,50));
                it('8: inc expected: 52', inc(52,calc,50));
                it('9: dec expected: 50 ', dec(50,calc,52));
            });


        });
    });

    describe('Test 8: factor = 1 case,inv = Color ,min = Fix', ()=>{
        let invBehavior:InventoryAction = 'Color';
        let caseBehavior: InventoryAction = 'Color';
        let minBehavior: InventoryAction = 'Fix';
  
        describe ('CASE 1: factor = 1 inv = 8 case = 2 min = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 8;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc,0));
                it('2: inc should go up from 4 to 6', inc(6,calc,4));
                it('3: inc should go up from 6 to 8', inc(8,calc,6));
                it('4: inc should go up to 10', inc(10,calc,8));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 8 to 6', dec(6,calc,8));
                it('2: dec should go down from 6 to 4', dec(4,calc,6));
                it('3: dec should go down from 4 to 0', dec(0,calc,4));
                it('4: inc should stay 0', dec(0,calc,2));
            });
            describe ('3: set tests:', () => {
                it('1: set to 9 expected: 9', set(9,calc,9));
                it('2: set to 10 expected: 10', set(10,calc,10));
                it('3: set to 1 expected: 3', set(3,calc,1));
                it('4: set to to 3 expected: 3', set(3,calc,3));
            });
            describe ('4: combine tests inc,set,dec:', () => {
                it('1: set to 9 expected: 9', set(9,calc,9));
                it('2: dec expected: 8 ', dec(8,calc,9));
                it('3: inc expected: 10', inc(10,calc,8));
                it('4: set to to 3 expected: 3', set(3,calc,3));
                it('5: dec expected: 0 ', dec(0,calc,3));
                it('6: inc expected: 4', inc(4,calc,0));
                it('7: set to to 51 expected: 51', set(51,calc,51));
                it('8: inc expected: 52', inc(52,calc,51));
                it('9: dec expected: 8 ', dec(50,calc,52));
            });


        });

        describe('Test 9: factor = 1 case,inv,min = Color', ()=>{
            let invBehavior:InventoryAction = 'Color';
            let caseBehavior: InventoryAction = 'Color';
            let minBehavior: InventoryAction = 'Color';
      
            describe ('CASE 1: factor = 1 inv = 8 case = 2 min = 3', () => {
                let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
                let inventory: number = 8;
                let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
                describe ('1: inc tests:', () => {
                    it('1: inc should go up from 0 to 4', inc(4,calc,0));
                    it('2: inc should go up from 4 to 6', inc(6,calc,4));
                    it('3: inc should go up from 6 to 8', inc(8,calc,6));
                    it('4: inc should go up to 10', inc(10,calc,8));
                });
                describe ('2: dec tests:', () => {
                    it('1: dec should go down from 8 to 6', dec(6,calc,8));
                    it('2: dec should go down from 6 to 4', dec(4,calc,6));
                    it('3: dec should go down from 4 to 0', dec(0,calc,4));
                    it('4: inc should stay 0', dec(0,calc,0));
                });
                describe ('3: set tests:', () => {
                    it('1: set to 9 expected: 9', set(9,calc,9));
                    it('2: set to 10 expected: 10', set(10,calc,10));
                    it('3: set to 1 expected: 1', set(1,calc,1));
                    it('4: set to to 3 expected: 3', set(3,calc,3));
                });
                describe ('4: combine tests inc,set,dec:', () => {
                    it('1: set to 9 expected: 9', set(9,calc,9));
                    it('2: dec expected: 8 ', dec(8,calc,9));
                    it('3: inc expected: 10', inc(10,calc,8));
                    it('4: set to to 3 expected: 3', set(3,calc,3));
                    it('5: dec expected: 0 ', dec(0,calc,3));
                    it('6: inc expected: 4', inc(4,calc,0));
                    it('7: set to to 51 expected: 51', set(51,calc,51));
                    it('8: inc expected: 52', inc(52,calc,51));
                    it('5: dec expected: 50 ', dec(50,calc,52));
                    it('7: set to to -1 expected: 0', set(0,calc,-1));
                });
            });
        });
        


        describe('Test 10: factor = 1 case = Fix inv,min = Color', ()=>{
            let invBehavior:InventoryAction = 'Color';
            let caseBehavior: InventoryAction = 'Fix';
            let minBehavior: InventoryAction = 'Color';
      
            describe ('CASE 1: factor = 1 inv = 8 case = 2 min = 3', () => {
                let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
                let inventory: number = 8;
                let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
                describe ('1: inc tests:', () => {
                    it('1: inc should go up from 0 to 4', inc(4,calc,0));
                    it('2: inc should go up from 4 to 6', inc(6,calc,4));
                    it('3: inc should go up from 6 to 8', inc(8,calc,6));
                    it('4: inc should go up to 10', inc(10,calc,8));
                });
                describe ('2: dec tests:', () => {
                    it('1: dec should go down from 8 to 6', dec(6,calc,8));
                    it('2: dec should go down from 6 to 4', dec(4,calc,6));
                    it('3: dec should go down from 4 to 0', dec(0,calc,4));
                    it('4: dec should stay 0', dec(0,calc,0));
                });
                describe ('3: set tests:', () => {
                    it('1: set to 9 expected: 10', set(10,calc,10));
                    it('2: set to 10 expected: 10', set(10,calc,10));
                    it('3: set to 1 expected: 2', set(2,calc,1));
                    it('4: set to to 3 expected: 4', set(4,calc,3));
                });
                describe ('4: combine tests inc,set,dec:', () => {
                    it('1: set to 9 expected: 10', set(10,calc,9));
                    it('2: dec expected: 8 ', dec(8,calc,10));
                    it('3: inc expected: 10', inc(10,calc,8));
                    it('4: set to to 3 expected: 4', set(4,calc,3));
                    it('5: dec expected: 0 ', dec(0,calc,4));
                    it('6: inc expected: 4', inc(4,calc,0));
                    it('7: set to to 51 expected: 52', set(52,calc,51));
                    it('8: inc expected: 54', inc(54,calc,52));
                    it('5: dec expected: 52 ', dec(52,calc,54));
                    it('7: set to to -1 expected: 0', set(0,calc,-1));
                });
            });
        });


    });
    describe('Test 10: factor = 4 case = Fix inv,min = Color', ()=>{
        let invBehavior:InventoryAction = 'Fix';
        let caseBehavior: InventoryAction = 'DoNothing';
        let minBehavior: InventoryAction = 'Fix';
  
        describe ('CASE 1: factor = 4 inv = 8 case = 3 min = 1', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':3, 'Min': 1, 'Factor':4};
            let inventory: number = 8;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: set to 1 should work', set(1,calc,1));
                it('2: inc should stay on 1', inc(1,calc,1));
            });
        });
        
    });

    describe('Test 11: Inv= fix, Case = fix, Min = fix', ()=>{
        let invBehavior:InventoryAction = 'Fix';
        let caseBehavior: InventoryAction = 'Fix';
        let minBehavior: InventoryAction = 'Fix';
  
        describe ('CASE 1: default inc,dec,set with inv = 10 case = -5 factor = 1, min = 0', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':-5, 'Min': 0, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 1', inc(1,calc,0));
                it('2: inc should go up from 1 to 2', inc(2,calc,1));
                it('3: inc should go up from 2 to 3', inc(3,calc,2));
                it('4: inc should go up from 3 to 4', inc(4,calc,3));
                it('5: inc should go up from 4 to 5', inc(5,calc,4));
                it('6: inc should go up from 5 to 6', inc(6,calc,5));
                it('7: inc should go up from 6 to 7', inc(7,calc,6));
                it('8: inc should go up from 7 to 8', inc(8,calc,7));
                it('9: inc should go up from 8 to 9', inc(9,calc,8));
                it('10: inc should go up from 9 to 10', inc(10,calc,9));
                it('11: inc should stay on 10', inc(10,calc,10));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 9', dec(9,calc,10));
                it('2: dec should go down from 9 to 8', dec(8,calc,9));
                it('3: dec should go down from 8 to 7', dec(7,calc,8));
                it('4: dec should go down from 7 to 6', dec(6,calc,7));
                it('5: dec should go down from 6 to 5', dec(5,calc,6));
                it('6: dec should go down from 5 to 4', dec(4,calc,5));
                it('7: dec should go down from 4 to 3', dec(3,calc,4));
                it('8: dec should go down from 3 to 2', dec(2,calc,3));
                it('9: dec should go down from 2 to 1', dec(1,calc,2));
                it('10: dec should go down from 1 to 0', dec(0,calc,1));
                it('11: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10', set(10,calc,10));
                it('3: set to 5', set(5,calc,5));
                it('4: set to 11 should set 10', set(10,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('6: set to 10 should set to 10 ', set(10,calc,999));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 1', inc(1,calc,0));
                it('3: dec should go down to 0', dec(0,calc,1));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc,9));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('6: inc should stay on 10 ', inc(10,calc,10));
            });
        });

        describe ('CASE 1: default inc,dec,set with inv = 10 case = -5 factor = -7, min = -8', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':-5, 'Min': -8, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 1', inc(1,calc,0));
                it('2: inc should go up from 1 to 2', inc(2,calc,1));
                it('3: inc should go up from 2 to 3', inc(3,calc,2));
                it('4: inc should go up from 3 to 4', inc(4,calc,3));
                it('5: inc should go up from 4 to 5', inc(5,calc,4));
                it('6: inc should go up from 5 to 6', inc(6,calc,5));
                it('7: inc should go up from 6 to 7', inc(7,calc,6));
                it('8: inc should go up from 7 to 8', inc(8,calc,7));
                it('9: inc should go up from 8 to 9', inc(9,calc,8));
                it('10: inc should go up from 9 to 10', inc(10,calc,9));
                it('11: inc should stay on 10', inc(10,calc,10));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 9', dec(9,calc,10));
                it('2: dec should go down from 9 to 8', dec(8,calc,9));
                it('3: dec should go down from 8 to 7', dec(7,calc,8));
                it('4: dec should go down from 7 to 6', dec(6,calc,7));
                it('5: dec should go down from 6 to 5', dec(5,calc,6));
                it('6: dec should go down from 5 to 4', dec(4,calc,5));
                it('7: dec should go down from 4 to 3', dec(3,calc,4));
                it('8: dec should go down from 3 to 2', dec(2,calc,3));
                it('9: dec should go down from 2 to 1', dec(1,calc,2));
                it('10: dec should go down from 1 to 0', dec(0,calc,1));
                it('11: dec should stay on 0', dec(0,calc,0));
            });
            describe ('3: set tests:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: set to 10', set(10,calc,10));
                it('3: set to 5', set(5,calc,5));
                it('4: set to 11 should set 10', set(10,calc,11));
                it('5: set to -1 should set 0', set(0,calc, -1));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('6: set to 10 should set to 10 ', set(10,calc,999));
            });
            describe ('4: set inc dec cobination:', () => {
                it('1: set to 0', set(0,calc,0));
                it('2: inc should go up to 1', inc(1,calc,0));
                it('3: dec should go down to 0', dec(0,calc,1));
                it('4: dec should stay on 0', dec(0,calc,0));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc,9));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('6: inc should stay on 10 ', inc(10,calc,10));
            });
        });
    });
    //here
    
    describe('Test 12: Inv= fix, Case = doNothing, Min = fix', ()=>{
        let invBehavior:InventoryAction = 'Fix';
        let caseBehavior: InventoryAction = 'DoNothing';
        let minBehavior: InventoryAction = 'Fix';
  
        describe ('CASE 1: min > inv: min = 22, inv = 21, case = 10, factor = 2', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':10, 'Min': 22, 'Factor':2};
            let inventory: number = 21;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: combine tests:', () => {
                it('1: set to 27 should set to 0 ', set(0,calc,27));
            });
        });
        describe('Test 13: Inv= fix, Case = fix, Min = DoNothing', ()=>{
            let invBehavior:InventoryAction = 'Fix';
            let caseBehavior: InventoryAction = 'Fix';
            let minBehavior: InventoryAction = 'DoNothing';
      
            describe ('CASE 1:inv = 80, min = 3, case = 1, factor = 1', () => {
                let  config: UomItemConfiguration = {'UOMKey': "", 'Case':1, 'Min': 3, 'Factor':1};
                let inventory: number = 80;
                let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
                describe ('1: combine tests:', () => {
                    it('1: increment should go from 0 to 3 ', inc(3,calc,0));
                });
            });
        });
        describe('Test 14: Inv= DoNothing, Case = fix, Min = Fix', ()=>{
            let invBehavior:InventoryAction = 'DoNothing';
            let caseBehavior: InventoryAction = 'Fix';
            let minBehavior: InventoryAction = 'Fix';
      
            describe ('CASE 1:inv = 36, min = 36, case = 13, factor = 1', () => {
                let  config: UomItemConfiguration = {'UOMKey': "", 'Case':12, 'Min': 0, 'Factor':120};
                let inventory: number = 10;
                let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
                describe ('1: combine tests:', () => {
                    it('1: increment should stay on 0 ', inc(12,calc,0));
                    it('1: set to 27 should set to 0', inc(24,calc,12));
                });
            });
            describe ('CASE 2:inv = 9, min = 1.5, case = 0.5, factor = 1', () => {
                let  config: UomItemConfiguration = {'UOMKey': "", 'Case':0.5, 'Min': 1.5, 'Factor': 1, 'Decimal': 1};
                let inventory: number = 9;
                let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
                describe ('1: combine tests:', () => {
                    it('1: increment go to 1.5 ', inc(1.5,calc,0));
                    it('2:inc should go to 2', inc(2,calc,1.5));
                    it('3:inc should go to 2.5', inc(2.5,calc,2));
                    it('4:dec should go to 2', dec(2,calc,2.5));
                    it('4:set to 7.2 shuld go to 7.5', set(7.5,calc,7.2));
                });
            })
            describe ('CASE 3:inv = 9, min = 1.5, case = 0.5, factor = 1', () => {
                let  config: UomItemConfiguration = {'UOMKey': "", 'Case':0.5, 'Min': 1.5, 'Factor':1, 'Decimal': 1, 'Negative': true};
                let inventory: number = 9;
                let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
                describe ('1: combine tests:', () => {
                    it('1: dec should go to -1', dec(-1,calc,0));
                    it('2:dec should go to -1.5', dec(-1.5,calc,-0.5));
                    it('3:dec should go to -2', dec(-2,calc,-1));
                    it('3:inc should go to -0.5', inc(-0.5,calc,-1.5));
                    // it('4:dec should go to 2', dec(2,calc,2.5));
                    it('4:set to -909.4 shuld go to -909.4', set(-909,calc,-909));
                    it('4:set to -0 shuld go to 0', set(0,calc,0));
                });
            });
            describe ('CASE 4:inv = 9, min = 3.33, case = 0.11, factor = 1', () => {
                let  config: UomItemConfiguration = {'UOMKey': "", 'Case':0.11, 'Min': 3.33, 'Factor':1, 'Decimal': 2, 'Negative': true};
                let inventory: number = 9;
                let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
                describe ('1: combine tests:', () => {
                    it('1: inc should go to 3.33', inc(3.41,calc,0));
                    it('2: inc should go to 3.52', inc(3.52,calc,3.41));
                    it('3: inc should go to 3.63', inc(3.63,calc,3.52));
                    it('4: inc should go to 3.74', inc(3.74,calc,3.63));
                    it('5: inc should go to 3.85', inc(3.85,calc,3.74));
                    it('6: inc should go to 3.96', inc(3.96,calc,3.85));
                    it('7: inc should go to 4.07', inc(4.07,calc,3.96));
                    it('8:set to 7 should set to 7.04', set(7.04,calc,7));
                    it('9:set to 9 should set to 9.02', set(9.02,calc,9));
                    it('10:set to -10 should set to -10', set(-10,calc,-10));
                    it('11:dec should go to -11', dec(-11,calc,-10));
                    it('12:set to -1 should set to - 1 ', set(-1,calc,-1));
                    it('13: inc should go to 0', inc(0,calc,-0.99));
                    it('14: inc should go to 0', inc(0,calc,-0.88));
                    it('15: inc should go to 0', inc(0,calc,-0.77));
                    it('16: inc should go to 0', inc(0,calc,-0.66));
                    it('17: inc should go to 0', inc(0,calc,-0.55));
                    it('18: inc should go to 0', inc(0,calc,-0.44));
                    it('19: inc should go to 0', inc(0,calc,-0.33));
                    it('19: inc should go to 0', inc(0,calc,-0.22));
                    it('19: inc should go to 0', inc(0.00,calc,-0.11));
                    it('19: inc should go to 3.41', inc(3.41,calc,-0.00));
                });
            })
        });
    });

    describe('Test 15: Inv= DoNothing, Case = DoNothing, Min = DoNothing', ()=>{
        let invBehavior:InventoryAction = 'DoNothing';
        let caseBehavior: InventoryAction = 'DoNothing';
        let minBehavior: InventoryAction = 'DoNothing';
  
        describe ('CASE 1:inv = 70, min = 0.333, case = 0.111, factor = 1.5, Decimal = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':0.111, 'Min': 0.333, 'Factor':1.5, 'Decimal':3};
            let inventory: number = 70;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: combine tests:', () => {
                it('1: set to 5 should set to 5', set(5,calc,5));
                it('2: inc should go to 5.106', inc(5.106,calc,5));
                it('3: inc should go to 5.217', inc(5.217,calc,5.106));
                it('4: inc should go to 5.328', inc(5.328,calc,5.217));
            });
        });
    });
});















