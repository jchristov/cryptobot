//reads bars, generates two sets of bollinger bands
//uses that to create limit buy and sell orders

const Bands = require('technicalindicators').BollingerBands

//receives bars and trade data, back tests an order generator + buy planner
function generateLimitPrices(values){
    //given a set of bars, generate two bollinger bands
    let std2 = Bands.calculate({
        period: values.length,
        values: values,
        stdDev: 2
    });


    let std1 = Bands.calculate({
        period: values.length,
        values: values,
        stdDev: 1
    });


    //return a set of 3 limit buy orders
    //and two limit sell

    return {
        lowestBuy: std2.lower,
        lowBuy: std1.lower,
        midHold: std2.middle,
        highSell: std1.upper,
        highestSell: std2.upper
    };

}

module.exports = {
    generateLimitPrices: generateLimitPrices
}