const debug = require("debug")('order-execution');
module.exports = {
    executeOrder: function (orderData){
        console.log("Executing order:", orderData);
        return Promise.resolve();
    }
};