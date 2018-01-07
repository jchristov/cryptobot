const assert = require("assert");
const debug = require("debug")("fetch");
const validIntervals = Object.freeze({
    m:0,
    h:1,
    d:2,
    w:4,
    M:5
});
//flip the above into
const intervalValues = Object.freeze(Object.keys(validIntervals));
const defaultMaxBars = 500;
const unitMilliseconds = Object.freeze([
    60000, //m
    60000 * 60, //h
    3600000 * 24, //d
    3600000 * 24 * 7,
    3600000 * 24 * 7 * 30, //roughly...
]);

function fetchCandles(options){
    let fetchAction = options.fetchAction;
    let symbol = options.symbol;
    let interval = options.interval;
    let startTime = options.startTime;
    let endTime = options.endTime;
    let handler = options.handler;
    let parallel = options.parallel;

    assert(typeof startTime === "number" && startTime < Date.now(), "startTime must be a number less then the current time");
    assert(typeof endTime === "number", "endTime must be a number");
    assert(startTime < endTime, "startTime must be before endTime")

    //understand the interval
    let intervalObj = expandInterval(interval);

    let timeWindows = calculateCallTimeWindows(startTime, endTime, intervalObj);

    if (parallel){
        return doFetchInParallel(fetchAction, symbol, interval, timeWindows, handler);
    }
    else {
        return doFetchInSteps(fetchAction, symbol, interval, timeWindows, handler);
    }
}

async function doFetchInSteps(fetchAction, symbol, interval, timeWindows, handler){
    const results = [];
    for(let startEndPair of timeWindows){
        debug("fetching...");
        let result = await fetchAction({
            symbol:symbol,
            interval:interval,
            startTime: startEndPair.start,
            endTime: startEndPair.end
        });
        debug("fetched, handling...");
        if (handler){
            result =  handler(result);
        }
        debug("handled.");
        results.push(result);
    }
    return Promise.resolve(results);
}

function doFetchInParallel(fetchAction, symbol, interval, timeWindows, handler){
    return Promise.all(timeWindows.map(function(startEndPair){
        const request = {
            symbol:symbol,
            interval:interval,
            startTime: startEndPair.start,
            endTime: startEndPair.end
        };
        let fetchPromise = fetchAction(request);

        if (handler){
            return fetchPromise.then(function(data){
                return handler(request, data);
            });
        }
        else {
            return fetchPromise;
        }
    }));
}

/**
 * Calculates the specifc time windows for multiple data fetches required to fetch an entire range
 * @param startTime
 * @param endTime
 * @param intervalObj
 * @param maxBars
 */
function calculateCallTimeWindows(startTime, endTime, intervalObj, maxBars){
    //next we want to determine how many calls we need to make to fetch all intervals between start and end time.
    let calls = calculateCallsToFetchRange(startTime, endTime, intervalObj);
    let windowStart = startTime;
    let windowEnd = 0;
    let finalMaxBars = maxBars || defaultMaxBars;
    let results = [];
    while(windowStart < endTime){
        windowEnd = windowStart + intervalObj.cost * finalMaxBars;
        results.push({
            start: windowStart,
            end: windowEnd
        });
        windowStart = windowEnd;
    }
    return results;
}


/**
 * Calculates the number of calls required to fetch the range of data based on
 * an interval and max number of bars
 * @param startTime
 * @param endTime
 * @param intervalObj
 * @param inMaxBars
 * @returns {number}
 */
function calculateCallsToFetchRange(startTime, endTime, intervalObj, inMaxBars){

    //how many bars are in the requested time frame
    let numberOfBars = calculateBarsInRange(startTime, endTime, intervalObj.value, intervalObj.unit);

    let maxBars = inMaxBars || defaultMaxBars;

    //how many calls is that
    let calls = numberOfBars / maxBars;

    return Math.ceil(calls);
}

/**
 * Calculates the number of bars in a time range based on the interval and unit supplied
 * @param startTime
 * @param endTime
 * @param interval
 * @param unit
 * @returns {number}
 */
function calculateBarsInRange(startTime, endTime, interval, unit){
    let diff = endTime - startTime;
    let unitAsMilliseconds = unitMilliseconds[unit];
    let intervalMilliseconds = unitAsMilliseconds * interval;
    let bars = Math.floor(diff/ intervalMilliseconds);
    return bars;
}


/***
 * Separates an interval string into a numeric value and a unit string
 * @param {String} interval
 */
function expandInterval(interval){
    let value = interval.match(/\d+/);
    if (!Array.isArray(value)){
        throw new Error(`failed to extract a numeric interval, was ${interval} correct?`);
    }

    let unit = interval.match(/[mhdwM]/);
    if (!Array.isArray(unit)) {
        throw new Error(`failed to extract a string unit for the interval interval, was ${interval} correct?`);
    }

    let unitNumeral = validIntervals[unit[0]];
    value = parseInt(value[0], 10);
    assert(typeof unitNumeral === 'number', 'The unit for an interval must be m, h, d, w or M');

   let cost = unitMilliseconds[unitNumeral] * value;

    return {unit: unitNumeral, value, cost};
}


module.exports = {
    fetchCandles,
    calculateCallsToFetchRange,
    calculateBarsInRange,
    expandInterval,
    validIntervals,
    calculateCallTimeWindows,
    doFetchInParallel,
    doFetchInSteps
};
