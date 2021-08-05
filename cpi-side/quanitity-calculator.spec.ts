
import { QuantityCalculator } from './quantity-calculator';
import { InventoryAction, UomItemConfiguration, InventoryActions } from './../shared/entities';
import 'mocha'
import { expect } from 'chai'

describe('Quantity Calculator', () => {
    let inc = (result: number, calc: QuantityCalculator) => {
        return () => {
            expect(calc.getIncrementValue()).that.is.eql({'curr': result, 'total' : result*calc.getFactor()});
        }
    }
    let dec = (result: number, calc: QuantityCalculator) => {
        return () => {
            expect(calc.getDecrementValue()).is.eql({'curr': result, 'total' : result*calc.getFactor()});
        }
    }
    let set = (result: number, calc: QuantityCalculator, input:number) => {
        return () => {
            expect(calc.setVal(input)).that.is.eql({'curr': result, 'total' : result*calc.getFactor()});
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
                it('1: inc should go up from 0 to 1', inc(1,calc));
                it('2: inc should go up from 1 to 2', inc(2,calc));
                it('3: inc should go up from 2 to 3', inc(3,calc));
                it('4: inc should go up from 3 to 4', inc(4,calc));
                it('5: inc should go up from 4 to 5', inc(5,calc));
                it('6: inc should go up from 5 to 6', inc(6,calc));
                it('7: inc should go up from 6 to 7', inc(7,calc));
                it('8: inc should go up from 7 to 8', inc(8,calc));
                it('9: inc should go up from 8 to 9', inc(9,calc));
                it('10: inc should go up from 9 to 10', inc(10,calc));
                it('11: inc should stay on 10', inc(10,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 9', dec(9,calc));
                it('2: dec should go down from 9 to 8', dec(8,calc));
                it('3: dec should go down from 8 to 7', dec(7,calc));
                it('4: dec should go down from 7 to 6', dec(6,calc));
                it('5: dec should go down from 6 to 5', dec(5,calc));
                it('6: dec should go down from 5 to 4', dec(4,calc));
                it('7: dec should go down from 4 to 3', dec(3,calc));
                it('8: dec should go down from 3 to 2', dec(2,calc));
                it('9: dec should go down from 2 to 1', dec(1,calc));
                it('10: dec should go down from 1 to 0', dec(0,calc));
                it('11: dec should stay on 0', dec(0,calc));
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
                it('2: inc should go up to 1', inc(1,calc));
                it('3: dec should go down to 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc));
                it('6: set to 999 should set to 10 ', set(10,calc,999));
                it('6: inc should stay on 10 ', inc(10,calc));
            });
        });

        describe ('CASE 2: min%case != 0  inv = 10 case = 2 factor = 1, min = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc));
                it('2: inc should go up from 4 to 6', inc(6,calc));
                it('3: inc should go up from 6 to 8', inc(8,calc));
                it('4: inc should go up from 8 to 10', inc(10,calc));
                it('5: inc should stay on 10', inc(10,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 8', dec(8,calc));
                it('2: dec should go down from 8 to 6', dec(6,calc));
                it('3: dec should go down from 6 to 4', dec(4,calc));
                it('4: dec should go down from 4 to 0', dec(0,calc));
                it('5: dec should stay on 0', dec(0,calc));
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
                it('2: inc should go up to 4', inc(4,calc));
                it('3: dec should go down to 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 10', set(10,calc, 9));
                it('6: inc should stay on 10 ', inc(10,calc));
                it('7: set to -1 needs to set to 0 ', set(0,calc,-1));
                it('8: inc should go to 4 ', inc(4,calc));
                it('9: dec should go down to 0', dec(0,calc));
                it('10: set to 3 should set 4', set(4,calc, 3));
                it('11: dec should go down to 0', dec(0,calc));
            });
        });

        describe ('CASE 4: min < case  inv = 10 case = 4 factor = 1, min = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':4, 'Min': 3, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc));
                it('2: inc should go up from 4 to 8', inc(8,calc));
                it('3: stay on 8 ', inc(8,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 8 to 4', dec(4,calc));
                it('2: dec should go down from 4 to 0', dec(0,calc));
                it('3: dec should stay on 0', dec(0,calc));
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
                it('2: inc should go up to 4', inc(4,calc));
                it('3: dec should go down to 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 8', set(8,calc, 9));
                it('6: inc should stay on 8 ', inc(8,calc));
                it('7: set to -1 should set to 0 ', set(0,calc,-1));
                it('8: inc should inc to 4 ', inc(4,calc));
                it('9: dec should go down to 0', dec(0,calc));
                it('10: set to 3 should set 4', set(4,calc, 3));
                it('11: dec should go down to 0', dec(0,calc));
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
                it('1: inc should go up from 0 to 1', inc(1,calc));
                it('2: inc should go up from 1 to 2', inc(2,calc));
                it('3: inc should go up from 2 to 3', inc(3,calc));
                it('4: inc should go up from 3 to 4', inc(4,calc));
                it('5: inc should go up from 4 to 5', inc(5,calc));
                it('6: inc should go up from 5 to 6', inc(6,calc));
                it('7: inc should go up from 6 to 7', inc(7,calc));
                it('8: inc should go up from 7 to 8', inc(8,calc));
                it('9: inc should go up from 8 to 9', inc(9,calc));
                it('10: inc should go up from 9 to 10', inc(10,calc));
                it('11: inc should stay on 10', inc(10,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 9', dec(9,calc));
                it('2: dec should go down from 9 to 8', dec(8,calc));
                it('3: dec should go down from 8 to 7', dec(7,calc));
                it('4: dec should go down from 7 to 6', dec(6,calc));
                it('5: dec should go down from 6 to 5', dec(5,calc));
                it('6: dec should go down from 5 to 4', dec(4,calc));
                it('7: dec should go down from 4 to 3', dec(3,calc));
                it('8: dec should go down from 3 to 2', dec(2,calc));
                it('9: dec should go down from 2 to 1', dec(1,calc));
                it('10: dec should go down from 1 to 0', dec(0,calc));
                it('11: dec should stay on 0', dec(0,calc));
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
                it('2: inc should go up to 1', inc(1,calc));
                it('3: dec should go down to 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc));
                it('7: set to 999 should set to 10 ', set(10,calc,999));
                it('8: inc should stay on 10 ', inc(10,calc));
            });
        });
        describe ('CASE 2:  min%case != 0. inv = 10 case = 2,factor = 1, min = 3', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc));
                it('2: inc should go up from 4 to 6', inc(6,calc));
                it('3: inc should go up from 6 to 8', inc(8,calc));
                it('4: inc should go up from 8 to 10', inc(10,calc));
                it('5: inc should stay on 10', inc(10,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 8', dec(8,calc));
                it('2: dec should go down from 8 to 6', dec(6,calc));
                it('3: dec should go down from 6 to 4', dec(4,calc));
                it('4: dec should go down from 4 to 0', dec(0,calc));
                it('5: dec should stay on 0', dec(0,calc));
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
                it('2: inc should go up to 4', inc(4,calc));
                it('3: dec should go down to 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc));
                it('7: set to 1 should set to 3 ', set(3,calc,1));
                it('8: inc should go up from 3 to 4 ', inc(4,calc));
                it('9: set to 5 should set to 5 ', set(5,calc,5));
                it('10: dec should go down from 5 to 4', dec(4,calc));
            });
        });

        describe ('CASE 3:  case > Inventory. inv = 5 case = 6,factor = 1, min = 2', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':6, 'Min': 2, 'Factor':1};
            let inventory: number = 5;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should stay on 0', inc(0,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should stay on 0', dec(0,calc));
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
                it('2: inc should stay 0', inc(0,calc));
                it('3: dec should stay 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 5', set(5,calc, 9));
                it('6: inc should stay on 5 ', inc(5,calc));
                it('7: set to 1 should set to 2 ', set(2,calc,1));
                it('8: inc should stay on 2 ', inc(2,calc));
                it('9: set to 5 should set to 5 ', set(5,calc,5));
                it('10: dec should go down from 5 to 0', dec(0,calc));
                it('11: set to 1 should set to 2 ', set(2,calc,1));
                it('12: dec should go down from 2 to 0', dec(0,calc));
            });
        });

        describe ('CASE 4:  case * factor > inv. inv = 9 case = 6,factor = 2, min = 2', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':6, 'Min': 2, 'Factor':2};
            let inventory: number = 9;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should stay on 0', inc(0,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should stay on 0', dec(0,calc));
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
                it('2: inc should stay 0', inc(0,calc));
                it('3: dec should stay 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 4', set(4,calc, 9));
                it('6: inc should stay on 4 ', inc(4,calc));
                it('7: set to 1 should set to 2 ', set(2,calc,1));
                it('8: inc should stay on 2 ', inc(2,calc));
                it('9: set to 5 should set to 4 ', set(4,calc,5));
                it('10: dec should go down from 4 to 0', dec(0,calc));
                it('11: set to 1 should set to 2 ', set(2,calc,1));
                it('12: dec should go down from 2 to 0', dec(0,calc));
            });
        });

        describe ('CASE 5:  case = 0. inv = 3,factor = 1, min = 2', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':0, 'Min': 2, 'Factor':1};
            let inventory: number = 3;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go to 2', inc(2,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should stay on 2', dec(2,calc));
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
                it('2: inc should go to 2', inc(2,calc));
                it('3: inc should stay 2', inc(2,calc));
                it('4: dec should stay 2', dec(2,calc));
                it('5: dec should stay on 2', dec(2,calc));
                it('6: set to 9 should set 3', set(3,calc, 9));
                it('7: inc should stay on 3 ', inc(3,calc));
                it('8: set to 1 should set to 2 ', set(2,calc,1));
                it('9: inc should stay on 2 ', inc(2,calc));
                it('10: set to 5 should set to 3 ', set(3,calc,5));
                it('11: dec should stay on 3', dec(3,calc));
                it('12: set to 1 should set to 2 ', set(2,calc,1));
                it('13: dec should stay on 2', dec(2,calc));
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
                it('1: inc should go up from 0 to 1', inc(1,calc));
                it('2: inc should go up from 1 to 2', inc(2,calc));
                it('3: inc should go up from 2 to 3', inc(3,calc));
                it('4: inc should go up from 3 to 4', inc(4,calc));
                it('5: inc should go up from 4 to 5', inc(5,calc));
                it('6: inc should go up from 5 to 6', inc(6,calc));
                it('7: inc should go up from 6 to 7', inc(7,calc));
                it('8: inc should go up from 7 to 8', inc(8,calc));
                it('9: inc should go up from 8 to 9', inc(9,calc));
                it('10: inc should go up from 9 to 10', inc(10,calc));
                it('11: inc should stay on 10', inc(10,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 9', dec(9,calc));
                it('2: dec should go down from 9 to 8', dec(8,calc));
                it('3: dec should go down from 8 to 7', dec(7,calc));
                it('4: dec should go down from 7 to 6', dec(6,calc));
                it('5: dec should go down from 6 to 5', dec(5,calc));
                it('6: dec should go down from 5 to 4', dec(4,calc));
                it('7: dec should go down from 4 to 3', dec(3,calc));
                it('8: dec should go down from 3 to 2', dec(2,calc));
                it('9: dec should go down from 2 to 1', dec(1,calc));
                it('10: dec should go down from 1 to 0', dec(0,calc));
                it('11: dec should stay on 0', dec(0,calc));
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
                it('2: inc should go up to 1', inc(1,calc));
                it('3: dec should go down to 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc));
                it('7: set to 999 should set to 10 ', set(10,calc,999));
                it('8: inc should stay on 10 ', inc(10,calc));
            });
        });

        describe ('CASE 2: inv=10, case = 2, min = 3, factor = 1', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc));
                it('2: inc should go up from 4 to 6', inc(6,calc));
                it('3: inc should go up from 6 to 8', inc(8,calc));
                it('4: inc should go up from 8 to 10', inc(10,calc));
                it('5: inc should stay 10', inc(10,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 8', dec(8,calc));
                it('2: dec should go down from 8 to 6', dec(6,calc));
                it('3: dec should go down from 6 to 4', dec(4,calc));
                it('4: dec should go down from 4 to 0', dec(0,calc));
                it('5: dec should stay 0', dec(0,calc));
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
                it('2: inc should go up to 4', inc(4,calc));
                it('3: dec should go down to 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 10', set(10,calc, 10));
                it('6: inc should go to 10 ', inc(10,calc));
                it('7: set to 999 should set to 10 ', set(10,calc,999));
                it('8: inc should stay on 10 ', inc(10,calc));
                it('9: set to 2 should set to 2 ', set(2,calc,2));
                it('10: inc should go up to 4 ', inc(4,calc));
                it('11: set to 1 should set to 2 ', set(2,calc,2));
                it('12: inc should go up to 4 ', inc(4,calc));

            });
        });

        describe ('CASE 3: min > inv inv=5, case = 2, min = 6, factor = 1', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 6, 'Factor':1};
            let inventory: number = 5;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should stay 0', inc(0,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should stay 0', dec(0,calc));
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
                it('2: inc should stay 0', inc(0,calc));
                it('3: dec should stay 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 4', set(4,calc, 9));
                it('6: inc should stay on 4', inc(4,calc));
                it('7: set to 999 should set to 4 ', set(4,calc,999));
                it('8: inc should stay on 4 ', inc(4,calc));
                it('9: set to 2 should set to 2 ', set(2,calc,2));
                it('10: inc should stay on 2 ', inc(2,calc));
                it('11: set to 1 should set to 2 ', set(2,calc,1));
                it('12: inc should stay on 2 ', inc(2,calc));
                it('13: set to 3 should set to 4 ', set(4,calc,3));
                it('14: dec should go down to 0', dec(0,calc));
                it('15: dec should stay on   0', dec(0,calc));

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
                it('1: inc should go up from 0 to 1', inc(1,calc));
                it('2: inc should go up from 1 to 2', inc(2,calc));
                it('3: inc should go up from 2 to 3', inc(3,calc));
                it('4: inc should go up from 3 to 4', inc(4,calc));
                it('5: inc should go up from 4 to 5', inc(5,calc));
                it('6: inc should go up from 5 to 6', inc(6,calc));
                it('7: inc should go up from 6 to 7', inc(7,calc));
                it('8: inc should go up from 7 to 8', inc(8,calc));
                it('9: inc should go up from 8 to 9', inc(9,calc));
                it('10: inc should go up from 9 to 10', inc(10,calc));
                it('11: inc should stay on 10', inc(10,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 9', dec(9,calc));
                it('2: dec should go down from 9 to 8', dec(8,calc));
                it('3: dec should go down from 8 to 7', dec(7,calc));
                it('4: dec should go down from 7 to 6', dec(6,calc));
                it('5: dec should go down from 6 to 5', dec(5,calc));
                it('6: dec should go down from 5 to 4', dec(4,calc));
                it('7: dec should go down from 4 to 3', dec(3,calc));
                it('8: dec should go down from 3 to 2', dec(2,calc));
                it('9: dec should go down from 2 to 1', dec(1,calc));
                it('10: dec should go down from 1 to 0', dec(0,calc));
                it('11: dec should stay on 0', dec(0,calc));
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
                it('2: inc should go up to 1', inc(1,calc));
                it('3: dec should go down to 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc));
                it('7: set to 999 should set to 10 ', set(10,calc,999));
                it('8: inc should stay on 10 ', inc(10,calc));
            });
        });

        describe ('CASE 2: inv=10, case = 2, min = 3, factor = 1', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':2, 'Min': 3, 'Factor':1};
            let inventory: number = 10;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: inc tests:', () => {
                it('1: inc should go up from 0 to 4', inc(4,calc));
                it('2: inc should go up from 4 to 6', inc(6,calc));
                it('3: inc should go up from 6 to 8', inc(8,calc));
                it('4: inc should go up from 8 to 10', inc(10,calc));
                it('5: inc should stay 10', inc(10,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 10 to 8', dec(8,calc));
                it('2: dec should go down from 8 to 6', dec(6,calc));
                it('3: dec should go down from 6 to 4', dec(4,calc));
                it('4: dec should go down from 4 to 0', dec(0,calc));
                it('5: dec should stay 0', dec(0,calc));
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
                it('2: inc should go up to 4', inc(4,calc));
                it('3: dec should go down to 0', dec(0,calc));
                it('4: dec should stay on 0', dec(0,calc));
                it('5: set to 9 should set 9', set(9,calc, 9));
                it('6: inc should go to 10 ', inc(10,calc));
                it('7: set to 999 should set to 10 ', set(10,calc,999));
                it('8: inc should stay on 10 ', inc(10,calc));
                it('9: set to 2 should set to 2 ', set(2,calc,2));
                it('10: inc should go up to 4 ', inc(4,calc));
                it('11: set to 1 should set to 1 ', set(1,calc,1));
                it('12: inc should go up to 4 ', inc(4,calc));
                it('13: inc should go up to 6 ', inc(6,calc));
                it('14: inc should go up to 8 ', inc(8,calc));
                it('15: set to 1 should set 1', set(1,calc, 1));
                it('16: inc should go up to 4 ', inc(4,calc));
                it('17: set to 1 should set 1', set(1,calc, 1));
                it('18: dec should go down to 0', dec(0,calc));
            });
        });

        describe ('CASE 3:  inv=7, case = 4, min = 5, factor = 1', () => {
            let  config: UomItemConfiguration = {'UOMKey': "", 'Case':4, 'Min': 5, 'Factor':1};
            let inventory: number = 7;
            let calc = new QuantityCalculator(config,inventory,caseBehavior,minBehavior,invBehavior);
            describe ('1: combine set inc dec:', () => {
                it('1: inc should stay 0', inc(0,calc));
                it('2: dec should stay 0', dec(0,calc));
                it('3: set to 1 should set 1', set(1,calc, 1));
                it('4: inc should stay on 1', inc(1,calc));
                it('5: set to 7 should set 7', set(7,calc, 7));
                it('6: dec should go to 0', dec(0,calc));

            
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
                it('1: inc should go up from 0 to 4', inc(4,calc));
                it('2: inc should go up from 4 to 6', inc(6,calc));
                it('3: inc should go up from 6 to 8', inc(8,calc));
                it('4: inc should stay 8', inc(8,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 8 to 6', dec(6,calc));
                it('2: dec should go down from 6 to 4', dec(4,calc));
                it('3: dec should go down from 4 to 0', dec(0,calc));
                it('4: inc should stay 0', dec(0,calc));
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
                it('1: inc should go up from 0 to 4', inc(4,calc));
                it('2: inc should go up from 4 to 6', inc(6,calc));
                it('3: inc should go up from 6 to 8', inc(8,calc));
                it('4: inc should stay 8', inc(8,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 8 to 6', dec(6,calc));
                it('2: dec should go down from 6 to 4', dec(4,calc));
                it('3: dec should go down from 4 to 0', dec(0,calc));
                it('4: inc should stay 0', dec(0,calc));
            });
            describe ('3: set tests:', () => {
                it('1: set to 9 expected: 10', set(10,calc,9));
                it('2: set to 10 expected: 10', set(10,calc,10));
                it('3: set to 1 expected: 4', set(4,calc,1));
                it('4: set to to 3 expected: 4', set(4,calc,3));
            });
            describe ('4: combine tests inc,set,dec:', () => {
                it('1: set to 9 expected: 10', set(10,calc,9));
                it('2: dec expected: 8 ', dec(8,calc));
                it('3: inc expected: 8', inc(8,calc));
                it('4: set to to 3 expected: 4', set(4,calc,3));
                it('5: dec expected: 0 ', dec(0,calc));
                it('6: inc expected: 4', inc(4,calc));
                it('7: set to to 50 expected: 50', set(50,calc,50));
                it('8: inc expected: 50', inc(50,calc));
                it('5: dec expected: 8 ', dec(8,calc));
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
                it('1: inc should go up from 0 to 4', inc(4,calc));
                it('2: inc should go up from 4 to 6', inc(6,calc));
                it('3: inc should go up from 6 to 8', inc(8,calc));
                it('4: inc should stay 8', inc(8,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 8 to 6', dec(6,calc));
                it('2: dec should go down from 6 to 4', dec(4,calc));
                it('3: dec should go down from 4 to 0', dec(0,calc));
                it('4: inc should stay 0', dec(0,calc));
            });
            describe ('3: set tests:', () => {
                it('1: set to 9 expected: 10', set(10,calc,9));
                it('2: set to 10 expected: 10', set(10,calc,10));
                it('3: set to 1 expected: 4', set(4,calc,1));
                it('4: set to to 3 expected: 4', set(4,calc,3));
            });
            describe ('4: combine tests inc,set,dec:', () => {
                it('1: set to 9 expected: 10', set(10,calc,9));
                it('2: dec expected: 8 ', dec(8,calc));
                it('3: inc expected: 8', inc(8,calc));
                it('4: set to to 3 expected: 4', set(4,calc,3));
                it('5: dec expected: 0 ', dec(0,calc));
                it('6: inc expected: 4', inc(4,calc));
                it('7: set to to 50 expected: 50', set(50,calc,50));
                it('8: inc expected: 50', inc(50,calc));
                it('5: dec expected: 8 ', dec(8,calc));
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
                it('1: inc should go up from 0 to 4', inc(4,calc));
                it('2: inc should go up from 4 to 6', inc(6,calc));
                it('3: inc should go up from 6 to 8', inc(8,calc));
                it('4: inc should stay 8', inc(8,calc));
            });
            describe ('2: dec tests:', () => {
                it('1: dec should go down from 8 to 6', dec(6,calc));
                it('2: dec should go down from 6 to 4', dec(4,calc));
                it('3: dec should go down from 4 to 0', dec(0,calc));
                it('4: inc should stay 0', dec(0,calc));
            });
            describe ('3: set tests:', () => {
                it('1: set to 9 expected: 9', set(9,calc,9));
                it('2: set to 10 expected: 10', set(10,calc,10));
                it('3: set to 1 expected: 3', set(3,calc,1));
                it('4: set to to 3 expected: 3', set(3,calc,3));
            });
            describe ('4: combine tests inc,set,dec:', () => {
                it('1: set to 9 expected: 9', set(9,calc,9));
                it('2: dec expected: 8 ', dec(8,calc));
                it('3: inc expected: 8', inc(8,calc));
                it('4: set to to 3 expected: 3', set(3,calc,3));
                it('5: dec expected: 0 ', dec(0,calc));
                it('6: inc expected: 4', inc(4,calc));
                it('7: set to to 51 expected: 51', set(51,calc,51));
                it('8: inc expected: 51', inc(51,calc));
                it('5: dec expected: 8 ', dec(8,calc));
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
                    it('1: inc should go up from 0 to 4', inc(4,calc));
                    it('2: inc should go up from 4 to 6', inc(6,calc));
                    it('3: inc should go up from 6 to 8', inc(8,calc));
                    it('4: inc should stay 8', inc(8,calc));
                });
                describe ('2: dec tests:', () => {
                    it('1: dec should go down from 8 to 6', dec(6,calc));
                    it('2: dec should go down from 6 to 4', dec(4,calc));
                    it('3: dec should go down from 4 to 0', dec(0,calc));
                    it('4: inc should stay 0', dec(0,calc));
                });
                describe ('3: set tests:', () => {
                    it('1: set to 9 expected: 9', set(9,calc,9));
                    it('2: set to 10 expected: 10', set(10,calc,10));
                    it('3: set to 1 expected: 1', set(1,calc,1));
                    it('4: set to to 3 expected: 3', set(3,calc,3));
                });
                describe ('4: combine tests inc,set,dec:', () => {
                    it('1: set to 9 expected: 9', set(9,calc,9));
                    it('2: dec expected: 8 ', dec(8,calc));
                    it('3: inc expected: 8', inc(8,calc));
                    it('4: set to to 3 expected: 3', set(3,calc,3));
                    it('5: dec expected: 0 ', dec(0,calc));
                    it('6: inc expected: 4', inc(4,calc));
                    it('7: set to to 51 expected: 51', set(51,calc,51));
                    it('8: inc expected: 51', inc(51,calc));
                    it('5: dec expected: 8 ', dec(8,calc));
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
                    it('1: inc should go up from 0 to 4', inc(4,calc));
                    it('2: inc should go up from 4 to 6', inc(6,calc));
                    it('3: inc should go up from 6 to 8', inc(8,calc));
                    it('4: inc should stay 8', inc(8,calc));
                });
                describe ('2: dec tests:', () => {
                    it('1: dec should go down from 8 to 6', dec(6,calc));
                    it('2: dec should go down from 6 to 4', dec(4,calc));
                    it('3: dec should go down from 4 to 0', dec(0,calc));
                    it('4: inc should stay 0', dec(0,calc));
                });
                describe ('3: set tests:', () => {
                    it('1: set to 9 expected: 10', set(10,calc,10));
                    it('2: set to 10 expected: 10', set(10,calc,10));
                    it('3: set to 1 expected: 2', set(2,calc,1));
                    it('4: set to to 3 expected: 4', set(4,calc,3));
                });
                describe ('4: combine tests inc,set,dec:', () => {
                    it('1: set to 9 expected: 10', set(10,calc,9));
                    it('2: dec expected: 8 ', dec(8,calc));
                    it('3: inc expected: 8', inc(8,calc));
                    it('4: set to to 3 expected: 4', set(4,calc,3));
                    it('5: dec expected: 0 ', dec(0,calc));
                    it('6: inc expected: 4', inc(4,calc));
                    it('7: set to to 51 expected: 52', set(52,calc,51));
                    it('8: inc expected: 52', inc(52,calc));
                    it('5: dec expected: 8 ', dec(8,calc));
                    it('7: set to to -1 expected: 0', set(0,calc,-1));
                });
            });
        });


    });


});















