const actionSendAdvice = require("./sendAdvice.js");
module.exports = {
    actions:{
        BUY_SIGNAL: actionSendAdvice.BUY_SIGNAL,
        SELL_SIGNAL: actionSendAdvice.SELL_SIGNAL,
    },
    actionCreators:{
        sendBuySignal: actionSendAdvice.sendBuySignal,
        sendSellSignal: actionSendAdvice.sendSellSignal
    }
};