#!/usr/bin/env node
const dataFetchUtils = require("./data-fetcher-utils.js");
const debug = require("debug")("main");
const jetpack = require("fs-jetpack");
const binance = require("../http-clients/binance-client.js");
const path = require("path");
const assert = require("assert");
function createOutputPath(symbol, interval, days){
    return path.join("./candles/", symbol, `${interval}-${days}-days.tsv`);
}

const argv = require("yargs")
    .usage("Usage: $0 ")
    .command("fetch", "pull candle sticks from an exchange for a given symbol")
    .example("$0 fetch -s XMRETH -p /tmp -i 15m -t 30", "fetch 30 days of 15m interval candlesticks for XMRETH and stick them in a tsv file @ /tmp")
    .alias("s", "symbol")
    .alias("p", "path")
    .alias("i", "interval")
    .alias("t", "time")

    .demandOption(["s", "p", "i", "t"])
    .help("h")
    .alias("h", "help")
    .epilog("ODOYLE RULEZ!")
    .argv;

debug("received args:", argv);

//its so annoying to have to do this..?
process.on("unhandledRejection", up => { throw up })

//get our final output path, based on symbol and range
//wipe the output file
const symbol = argv.symbol;
const interval = argv.interval;
assert(typeof argv.t === "number", "time/t must be a number");
const startTime = Date.now() -  (3600000 * 24 * 7 * argv.t);
const endTime = Date.now();
const filePath = createOutputPath(symbol, interval, argv.t);


if(jetpack.exists(filePath)){
    debug(`Found ${filePath} deleting`);
    jetpack.remove(filePath);
}

let lines = 0;
dataFetchUtils.fetchCandles({
    fetchAction: (request) => {
        return binance.candleSticks(request);
    },
    symbol: symbol,
    interval: interval,
    endTime: endTime,
    startTime: startTime,
    handler: (data) => {
        return data.map((entryAry) => {
            const line = entryAry.reduce(function(accumulator, value){
                return accumulator + value + "\t";
            }, "");
            lines++;
            jetpack.append(filePath, line + "\n");
        });
    }
}).then(function(){
    debug(`Done wrote ${lines} lines to ${filePath}.`);
});
