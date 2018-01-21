const debug = require("debug")('order-execution');
module.exports = {
    executeOrder: function (orderData){
        debug("Executing order:", orderData);
        return Promise.resolve();
    },
    cancelOrder: function(orderData){
        debug("Cancelling order:", orderData);
    }
};