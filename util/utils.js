
//pluck a specific value and return it as an array
function extractPrice(bars, index){
    return bars.map(function(bar){
        return bar[index];
    });
}


module.exports = {
    extractPrice
};