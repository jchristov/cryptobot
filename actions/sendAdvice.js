const BUY_SIGNAL = "BUY_SIGNAL";
const SELL_SIGNAL = "SELL_SIGNAL";

function sendBuySignal(advice) {
    return {
        type: BUY_SIGNAL,
        advice: { currentBuy: advice }
    }
}

function sendSellSignal(advice) {
    return {
        type: BUY_SIGNAL,
        advice: { currentSell: advice}
    }
}

module.export = {
    sendBuySignal,
    sendSellSignal,
    BUY_SIGNAL,
    SELL_SIGNAL
};