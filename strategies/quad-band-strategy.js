//reads bars, generates two sets of bollinger bands
//uses that to create limit buy and sell orders

const Bands = require('technicalindicators').BollingerBands
const sides = require("../util/sides");
const assert = require("assert");
const utils  = require("../util/utils.js");
const store = require("./store");


class QuadBandStrategy {

    constructor({ backDataBars, period, tickStreamer, interval, minBandWidth, barIndexForBand }){
        assert(backDataBars.length === period, "backDataBars length must be equal to period");
        this._period = period;
        this._barIndexForBand = barIndexForBand;
        this._interval = utils.expandInterval(interval);
        this._data = utils.extractPrice(backDataBars, this._barIndexForBand);
        this._tickStreamer = tickStreamer;
        this._tickStreamer.on('tick', this.tick.bind(this));
        this._minBandWidth = minBandWidth;
        this._lastBar = Date.now();
        this.update();
    }

    tick(tickData){
        const price = tickData.price;
        const ask = tickData.ask;
        const bid = tickData.bind;
        if (this._bandWidth > this._minBandWidth){
            //bandwidth is atleast x the price is below either buy line, limit at current ask
            const buyLine = (this._currentRec.BUY.midBuy + this._currentRec.BUY.lowBuy) / 2;
            if (price <= buyLine ){
                store.dispatch(actions.sendBuySignal({price: ask}));
            }

            const sellLine = (this._currentRec.SELL.highSell + this._currentRec.SELL.midSell) / 2;
            if (price >= sellLine){
                store.dispatch(actions.sendSellSignal({price: bid}));
            }
        }
        this.collectMetrics(tickData);
     }

    collectMetrics(tickData){
        if (this.shouldAddBar(Date.now(), this._lastBar)){
            this._data = this.updateData(tickData);
            this.update();
        }
    }

    update(){
        let {newRec, newBandWidth } = this.newGuidance();
        this._currentRec = newRec;
        this._bandWidth = newBandWidth;
    }

    updateData(tickData){
        let newData = data;
        newData.unshift();
        newData.push(tickData.price);
        return newData;
    }

    newGuidance(data, period){
        return { newRec: this.generateLimitPrices(data, period),
                 newBandWidth: this.generateBandWidth(data, period)
        };
    }

    shouldAddBar(now, lastBar){
        if (now - lastBar > this._interval.cost){
            return true;
        }
        return false;
    }

    generateBandWidth(values, period){

    },

    //receives bars and trade data, back tests an order generator + buy planner
    generateLimitPrices(values, period){
        //given a set of bars, generate two bollinger bands
        let std2 = Bands.calculate({
            period: period,
            values: values,
            stdDev: 2
        });


        let std1 = Bands.calculate({
            period: period,
            values: values,
            stdDev: 1
        });


        //return a set of 2 limit buy orders, a hold
        //and two limit sell
        let orderSpec = {};
        orderSpec[sides.BUY] = {
            lowBuy: std2.lower,
            midBuy: std1.lower,
        };
        orderSpec[sides.HODL] = std2.middle;
        orderSpec[sides.SELL] = {
            midSell: std1.upper,
            highSell: std2.upper
        };

        return orderSpec;
    }

}

module.exports = {
    generateLimitPrices: generateLimitPrices,
    tick: tick
};