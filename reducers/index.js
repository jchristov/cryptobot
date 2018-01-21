const actions = require("../actions").actions;
const actionCreators = require("../actions").actionCreators;

const combineReducers = require("redux").combineReducers;

function processAdvice(state = {}, action) {
    switch (action.type) {
        case actions.BUY_SIGNAL:
        case actions.SELL_SIGNAL:
            return Object.assign({}, state, action.advice)
        default:
            return state
    }
}


modules.exports = combineReducers({
    processAdvice
});