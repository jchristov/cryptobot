const bandOrderGenerator = require("../order-generators/bollinger-band-generator.js");
const _ = require("lodash");
const Bands = require('technicalindicators').BollingerBands;
const util = require("../util/utils.js");
const assert = require("assert");

describe("order value generations", () => {
    it("should select the correct levels based on bollinger bands", function () {
        const values = [];
        for (let i = 0; i < 20; i++) {
            values.push(_.random(10, 25));
        }
        const std1 = Bands.calculate({
            period: values.length,
            values: values,
            stdDev: 1
        });
        const std2 = Bands.calculate({
            period: values.length,
            values: values,
            stdDev: 2
        });

        const prices = bandOrderGenerator.generateLimitPrices(values);
        assert.equal(prices.lowestBuy, std2.lower);
        assert.equal(prices.lowBuy, std1.lower);
        assert.equal(prices.midHold, std2.middle);
        assert.equal(prices.highSell, std1.upper);
        assert.equal(prices.highestSell, std2.upper);
    });

    it("should extract an index to use as the basis of the bands", function () {
        //generate 10 bars
        const bars = [];
        for (let i = 0; i < 10; i++) {
            let bar = [];
            bars.push(bar);
            for (let i = 0; i < 10; i++) {
                bar.push(_.random(10, 25));
            }
        }

        const values = util.extractPrice(bars, 0);
        let count = 0;
        bars.map((bar)=>{
            assert(bar[0] === values[count]);
            count++;
        });
    })
});