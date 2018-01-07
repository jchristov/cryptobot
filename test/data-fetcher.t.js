const dataFetchUtils = require("../data-fetch/data-fetcher-utils.js");
const assert = require("assert");

describe("data-fetcher utils", function(){

    function validateWindows(result, expectedLength, windowSize, startTime, endTime){

        assert.equal(result.length, expectedLength);
        let expectedStart = startTime;
        let expectedEnd = startTime + windowSize;
        result.map(function(block){
            assert.equal(block.start, expectedStart);
            assert.equal(block.end, expectedEnd);
            expectedStart = expectedEnd;
            expectedEnd += windowSize;
        });
        assert(result[result.length -1].end >= endTime, `${result[result.length -1]} should be >= ${endTime}`);
    }

    it("should correct separate values and units", function(){
        let interval = dataFetchUtils.expandInterval("15m");
        assert(interval.value === 15, "should have extracted 15");
        assert(interval.unit === dataFetchUtils.validIntervals.m, "should have minutes");
        assert(interval.cost === 60000 * 15); //15 minutes in millseconds
    });

    it("should throw on an invalid interval", function(){
        assert.throws(function(){
            let interval = dataFetchUtils.expandInterval("15X");
        });
    });

    it("should calculate the correct number of bars in a time range", function(){
        let endTime = Date.now(); //now
        let startTime = endTime - (86400000 * 5); //five days back
        //calculate the number of 15 minute bars in 5 days
        let result = dataFetchUtils.calculateBarsInRange(startTime, endTime, 15, 0);
        //1440 minutes in a day / 15 = 96, 96 * 5 = 408
        assert.equal(result,480);
    });

    it("should calculate the correct number of calls required to download all bars given a max bar amount", function(){
        let endTime = Date.now(); //now
        let startTime = endTime - (86400000 * 5); //five days back
        let intervalObj = dataFetchUtils.expandInterval("15m");
        //calculate the number of 15 minute bars in 5 days
        let result = dataFetchUtils.calculateCallsToFetchRange(startTime, endTime, intervalObj, 500);
        //1440 minutes in a day / 15 = 96, 96 * 5 = 480, 480/500 should return 1
        assert.equal(result,1);


        endTime = Date.now(); //now
        startTime = endTime - (86400000 * 51); //fifty one day block
        //calculate the number of 15 minute bars in 51 days
        result = dataFetchUtils.calculateCallsToFetchRange(startTime, endTime, intervalObj, 500);
        //1440 minutes in a day / 15 = 96, 96 * 51 = 4896, 4896/500 should return 1
        assert.equal(result,10);
    });

    it ("should calculate the correct time windows required to download all bars given a max bar amount", function(){
        let endTime = Date.now(); //now
        let startTime = endTime - (86400000 * 5); //five days back
        let intervalObj = dataFetchUtils.expandInterval("15m");

        //calculate the number of 15 minute bars in 5 days
        let result = dataFetchUtils.calculateCallTimeWindows(startTime, endTime, intervalObj, 500);

        //the result here is should be windows starting with startTime and ending with endTime where each pair is
        //15m is milliseconds * 500 in length (60000 * 15 * 500)
        const windowSize = 60000 * 15 * 500;
        validateWindows(result, 1, windowSize, startTime, endTime);


        //a second test for 51 days
        endTime = Date.now(); //now
        startTime = endTime - (86400000 * 51); //51 days back

        //calculate the number of 15 minute bars in 51 days
        result = dataFetchUtils.calculateCallTimeWindows(startTime, endTime, intervalObj, 500);

        //the result here is should be windows starting with startTime and ending with endTime where each pair is
        //15m is milliseconds * 500 in length (60000 * 15 * 500)
        validateWindows(result, 10, windowSize, startTime, endTime);

    });

    it("should provide the correct params to the fetcher and invoke our handler", function(){
        let count = 0;
        let handlerCount = 0;
        let symbol = "FOO";
        let interval = "15m";
        let data = [{start: 0, end:1000}, {start:1001, end:2000}];

        function assertFetch(request, count){
            //asert the fetch has what we expect
            assert.equal(count, handlerCount, "when fetching in steps we should never have a fetch before a handler can catch up");
            assert.equal(request.symbol, symbol);
            assert.equal(request.startTime, data[count].start);
            assert.equal(request.endTime, data[count].end);
            assert.equal(request.interval, interval);
        }


        return dataFetchUtils.doFetchInSteps(function fetchAction(request){
            switch(count){
                case 0:
                case 1:
                    assertFetch(request, count);
                    count++;
                    return Promise.resolve({count:count});
                default:
                    throw new Error(`Count: ${count} was higher then expected`);
            }

        }, symbol, interval, data, function handler(result){
            assert.equal(result.count-1, handlerCount);
            assert(result.count <= 2);
            handlerCount++;
        })
    })


    it("should provide the correct params to the fetcher and invoke our handler (parallel)", function(){
        let count = 0;
        let handlerCount = 0;
        let symbol = "FOO";
        let interval = "15m";
        let data = [{start: 0, end:1000}, {start:1001, end:2000}];

        function assertFetch(request, count){
            //asert the fetch has what we expect
            assert(handlerCount === 0, "when fetching in parallel we should always have a fetch before a handler can catch up");
            assert.equal(request.symbol, symbol);
            assert.equal(request.startTime, data[count].start);
            assert.equal(request.endTime, data[count].end);
            assert.equal(request.interval, interval);
        }


        return dataFetchUtils.doFetchInParallel(function fetchAction(request){
            switch(count){
                case 0:
                case 1:
                    assertFetch(request, count);
                    count++;
                    return Promise.resolve({count:count});
                default:
                    throw new Error(`Count: ${count} was higher then expected`);
            }

        }, symbol, interval, data, function handler(result){
            assert.equal(count, 2, "both fetches should have happened already")
            handlerCount++;
        }).then(function(){
            assert.equal(handlerCount, 2);
        })

    })
});