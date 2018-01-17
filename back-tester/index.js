const assert = require("assert");
const utils = require("./util/utils");

//receives bars and trade data, back tests an order generator + buy planner
class BackTester {
    constructor(initialBars, periodLength, orderGenerator){
        this._periodLength = periodLength;
        this._currentBars = initialBars;
        this._orderGenerator = orderGenerator;

        assert(initialBars.length === periodLength,
            `The initial set of bars needs to meet the period length. Received: ${initialBars.length}, expected ${periodLength}`);

        utils.extractPrice(this._currentBars, )

    }
}


module.exports = {};