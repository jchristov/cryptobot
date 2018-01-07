const request = require("request-promise");
const debug = require("debug")("http");
function http(url, data, headers, method = "GET") {
    debug (`request: ${method} ${url}`, data);
    if ( !data ) data = {};
    let opt = {
        url: url,
        qs: data,
        method: method,
        timeout: 60000,
        agent: false,
        headers: headers,
        json: true
    };
    return request(opt).then(function(response){
        debug(`response received`);
        return response;
    });
};

module.exports = http;