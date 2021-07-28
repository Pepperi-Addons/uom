import { QuantityCalculator } from './quantity-calculator';
import 'mocha'
import { expect } from 'chai'

describe('Quantity Calculator', () => {
//should test all QC
    describe('Basic functionality', () => {
     //basic operations
        describe('simple singles', () => {
        //working with singles
            const calculator = new QuantityCalculator();
     
            describe('Incriment', () => {
            //inc 
                it ('increment should go up by 1', () => {
                    expect(calculator.getIncrementValue()).is.a('number').that.is.equal(1);
                })

                it ('increment should go up by 1 again', () => {
                    expect(calculator.getIncrementValue()).is.a('number').that.is.equal(2);
                })
                //inventory = 2 so no increment expected
                it ('increment should not work, curr val supposed to be 2', () => {
                    expect(calculator.getIncrementValue()).is.a('number').that.is.equal(2);
                })
            }),

            describe('decrimenmt', () => {
              //decrement 
              it ('decrement should go down by 1', () => {
                expect(calculator.getIncrementValue()).is.a('number').that.is.equal(1);
            })

            it ('decrement should go down by 1', () => {
                expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
            })

            it ('decrement should go down by 1', () => {
                expect(calculator.getIncrementValue()).is.a('number').that.is.equal(-1);
            })

            }),
            describe('simple Set singles' , () => {
                it ('set to 2 ', () => {
                    expect(calculator.getIncrementValue()).is.a('number').that.is.equal(2);
                })
                it('set to -1', ()=>{
                    expect(calculator.getIncrementValue()).is.a('number').that.is.equal(-1);
                })
            })
        }),


        //calc, min = 2 , cq = 4, factor = 2, inv = 40.
        //that should test the case that min < cq and therefore the real min is cq;
        describe('min < cq', () => {
            
            const calculator = new QuantityCalculator();
            describe('Incriment', () => {
                //inc 
                    it ('increment should go up by 4', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(4);
                    })
    
                    it ('increment should go up by 4 again', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(8);
                    })
                    //inventory = 2 so no increment expected
                    it ('increment should go up 2', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(10);
                    })
                }),
                describe('decrement', () => {
                    //decr.. 
                        it ('decrement should go down by 4', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(6);
                        })
        
                        it ('decrement should go up down 2, cause cq=4 and curr = 6', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(4);
                        })
                        
                        it ('increment should down by 4', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                        })
                    }),
                    describe('set', () => {
                        //set 
                            it ('set should set 4. input:2 cq:4 => 4', () => {
                                expect(calculator.setVal(2)).is.a('number').that.is.equal(4);
                            })
            
                            it ('set neg value should be default set behavior', () => {
                                expect(calculator.setVal(-1)).is.a('number').that.is.equal(-1);
                            })
                            
                            it ('set to 21 with factor 2 should be 42 thats over the max so val expected to be 40', () => {
                                expect(calculator.setVal(21)).is.a('number').that.is.equal(40);
                            })
                        })

        }),

        
        //I stoped here, continune from here by the prd paper
        
        describe('min < cq'), () => {
            
            const calculator = new QuantityCalculator();
            describe('Incriment', () => {
                //inc 
                    it ('increment should go up by 4', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(4);
                    })
    
                    it ('increment should go up by 4 again', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(8);
                    })
                    //inventory = 2 so no increment expected
                    it ('increment should go up 2', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(10);
                    })
                }),
                describe('decrement', () => {
                    //decr.. 
                        it ('decrement should go down by 4', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(6);
                        })
        
                        it ('decrement should go up down 2, cause cq=4 and curr = 6', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(4);
                        })
                        
                        it ('increment should down by 4', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                        })
                    }),
                    describe('set', () => {
                        //set 
                            it ('set should set 4. input:2 cq:4 => 4', () => {
                                expect(calculator.setVal(2)).is.a('number').that.is.equal(4);
                            })
            
                            it ('set neg value should be default set behavior', () => {
                                expect(calculator.setVal(-1)).is.a('number').that.is.equal(-1);
                            })
                            
                            it ('set to 21 with factor 2 should be 42 thats over the max so val expected to be 40', () => {
                                expect(calculator.setVal(21)).is.a('number').that.is.equal(40);
                            })
                        })

        }






            
        })

    })


