const http = require("./http-client.js");
const binanceHeader =  {
    'User-Agent': 'Mozilla/4.0 (compatible; Node Binance API)',
    'Content-type': 'application/x-www-form-urlencoded'
};
const binanceBase = 'https://api.binance.com/api/';

function candleSticks(data){
    return http(binanceBase+"v1/klines", data, binanceHeader);
}

module.exports = {
    candleSticks
};