//todo turn this into a proper back tester console app, should load all strategies but new via a flag

const store = require("../store");
const QuadBandStrategy = require("../strategies/quad-band-strategy.js");
const MockConsoleTrader = require("../traders/mock-console-trader.js");


//load bars from random index in file (for now, future use what gets passed in)

const mockConsoleTrader = new MockConsoleTrader(store);
const quadBandStrategy = new QuadBandStrategy({
    store: store,
});


//implement a mock on tick and pass in a subsequent price (next bar)





