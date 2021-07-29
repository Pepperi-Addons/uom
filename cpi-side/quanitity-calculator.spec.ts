import { QuantityCalculator } from './quantity-calculator';
import 'mocha'
import { expect } from 'chai'

describe('Quantity Calculator', () => {
//should test all QC
    describe('Basic functionality', () => {
     //basic operations
        describe('simple singles', () => {
        //working with singles
            const calculator = new QuantityCalculator({});
     
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

            it ('decrement should stay 0 ', () => {
                expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
            })

            }),
            describe('simple Set singles' , () => {
                it ('set to 2 ', () => {
                    expect(calculator.getIncrementValue()).is.a('number').that.is.equal(2);
                })
                it('set to -1 expected 0 ', ()=>{
                    expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                })
            })
        }),


        //calc, min = 2 , cq = 4, factor = 2, inv = 40.
        //that should test the case that min < cq and therefore the real min is cq;
        describe('min < cq', () => {
            
            const calculator = new QuantityCalculator({});
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
            
                            it ('set neg value should be 0', () => {
                                expect(calculator.setVal(0)).is.a('number').that.is.equal(0);
                            })
                            
                            it ('set to 21 with factor 2 should be 42 thats over the max so val expected to be 40', () => {
                                expect(calculator.setVal(21)).is.a('number').that.is.equal(40);
                            })
                        })

        }),

        
        //from prd tables, will be alot sets tests.
        
        describe('table 1 tests'), () => {
            
            describe('line 3 singles', () => {
                //inventoy = 999, factor = 1, case = 5 trying to set 3
                const calculator = new QuantityCalculator({});
                    it ('should be set to 5', () => {
                        expect(calculator.setVal(3)).is.a('number').that.is.equal(5);
                    })
    
                    it ('increment, expected 10', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(10);
                    })
                  
                    it ('increment should be 15', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(15);
                    })
                    it ('Decrement should be 10', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(10);
                    })
                    it ('Decrement should be 5', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(5);
                    })
                    it ('Decrement should be 0', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                    })

                }),
                describe('line 5 singles', () => {
                    //inventoy = 3, factor = 1, case = 2, min = 0 trying to set 2 should success
                    const calculator = new QuantityCalculator({});
                        it ('should be set to 2', () => {
                            expect(calculator.setVal(2)).is.a('number').that.is.equal(2);
                        })
        
                        it ('increment, expected stay 2, cause inventory is 3', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(2);
                        })
                      
                        it ('Decrement should be 0', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                        })
                    }),
                    describe('minQty > inv', () => {
                        //inventoy = 5, factor = 1, case = 0, min = 6 
                        const calculator = new QuantityCalculator({});
                            it ('set to 5 should failed, expected value 0', () => {
                                expect(calculator.setVal(5)).is.a('number').that.is.equal(0);
                            })
            
                            it ('increment, expected value is 0', () => {
                                expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                            })
                          
                            it ('Decrement should be 0', () => {
                                expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                            })
                        }),
                        describe('min > case, round to 5x>6', () => {
                            //inventoy = 999, factor = 1, case = 5, min = 6 
                            const calculator = new QuantityCalculator({});
                                it ('set to 5 should failed, expected value 6', () => {
                                    expect(calculator.setVal(5)).is.a('number').that.is.equal(6);
                                })
                
                                it ('increment, expected value is 10', () => {
                                    expect(calculator.getIncrementValue()).is.a('number').that.is.equal(10);
                                })
                              
                                it ('Decrement should be 6', () => {
                                    expect(calculator.getIncrementValue()).is.a('number').that.is.equal(6);
                                })
                                it ('Decrement should be 0', () => {
                                    expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                                })
                            }),
                            describe('min > case, round to 5x>6', () => {
                                //inventoy = 999, factor = 1, case = 5, min = 6 
                                const calculator = new QuantityCalculator({});
                                    it ('set to 5 , expected value 6', () => {
                                        expect(calculator.setVal(5)).is.a('number').that.is.equal(6);
                                    })
                    
                                    it ('increment, expected value is 10', () => {
                                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(10);
                                    })
                                  
                                    it ('Decrement should be 6', () => {
                                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(6);
                                    })
                                    it ('Decrement should be 0', () => {
                                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                                    })
                                    it ('Decrement should be 0', () => {
                                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                                    })
                                }),
                                describe('8x > inv', () => {
                                    //inventoy = 7, factor = 1, case = 8, min = 6 
                                    const calculator = new QuantityCalculator({});
                                        it ('set to 1 , expected value 0', () => {
                                            expect(calculator.setVal(1)).is.a('number').that.is.equal(0);
                                        })
                        
                                        it ('increment, expected value is 0', () => {
                                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                                        })
                                      
                                        it ('Decrement should be 0', () => {
                                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                                        })
                                    })
         }
         describe('table 2 tests'), () => {
            
            describe('line 1 factor = 3', () => {
                //inventoy = 997, factor = 3, case = 0 
                const calculator = new QuantityCalculator({});
                    it ('set to 1 , should be 1', () => {
                        expect(calculator.setVal(1)).is.a('number').that.is.equal(1);
                    })
                    it ('get inventory , should be 994', () => {
                        expect(calculator.getInv()).is.a('number').that.is.equal(994);
                    })
    
                    it ('increment, expected 2', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(2);
                    })
                    it ('get inventory , should be 991', () => {
                        expect(calculator.getInv()).is.a('number').that.is.equal(991);
                    })
                  
                    it ('set to 50', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(50);
                    })
                    it ('get inventory should be 849 ', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(849);
                    })
                    it ('set to 1', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(1);
                    })
                    it ('Decrement should be 0', () => {
                        expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                    })

                }),
                describe('line 3 factor = 3', () => {
                    //inventoy = 997, factor = 3, case = 5 
                    const calculator = new QuantityCalculator({});
                        it ('set to 1 , should be 5', () => {
                            expect(calculator.setVal(1)).is.a('number').that.is.equal(5);
                        })
                        it ('get inventory , should be 992', () => {
                            expect(calculator.getInv()).is.a('number').that.is.equal(992);
                        })
        
                        it ('increment, expected 10', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(10);
                        })
                        it ('get inventory , should be 927', () => {
                            expect(calculator.getInv()).is.a('number').that.is.equal(927);
                        })
                      
                        it ('set to 300 should set to max', () => {
                            expect(calculator.setVal(300)).is.a('number').that.is.equal(199);
                        })
                        it ('inc , val should stay as 199', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(199);
                        })
                        it ('set to 1 val should be 5', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(5);
                        })
                        it ('Decrement should be 0', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                        })
                        it ('Decrement should be 0', () => {
                            expect(calculator.getIncrementValue()).is.a('number').that.is.equal(0);
                        })
    
                    })



               
               

        }






            
        })

    })


