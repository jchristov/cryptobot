const assert = require("assert");
const debug = require("debug")("fetch");
const defaultMaxBars = 500;

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


module.exports = {
    fetchCandles,
    calculateCallsToFetchRange,
    calculateBarsInRange,
    calculateCallTimeWindows,
    doFetchInParallel,
    doFetchInSteps
};
