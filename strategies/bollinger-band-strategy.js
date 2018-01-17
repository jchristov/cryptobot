const utils = require("../util/utils");

class BollingerBandStrategy{

    constructor(opts){
        this._funds = opts.funds;
        this._availableFunds = this._funds;
        this._valuePerOrder = opts.valuePerOrder;
        this._orderGenerator = opts.orderGenerator;
        this._orderExecutor = opts._orderExecutor;
        this._valueIndex = opts.valueIndex;
        this._orderHistory = [];
        this._values = utils.extractPrice(opts.initialBars, opts.valueIndex);
        this._orderHistory.push(this.generatorOrder(this._values));
        this._executeTop();

    }

    generatorOrder(values){
        return this._orderGenerator.generatorOrder(values);
    }

    tick(bar){
        const value = bar[this._valueIndex];
        this._values.unshift();
        this._values.push(value);

        //gen new order
        const newOrder = this.generatorOrder(value);

        //cancel open orders

        //execute new orders


        //report status
    }

    //status from somewhere changed
    //update funds
    //log history
    //update status
    onOrderStatusChange(){

    }

    //should update open orders
    //should update history
    //should adjust available funds
    cancelOpen(){

    }

    //should update open orders
    //should update history
    //should adjust available funds
    executeTop(){

    }

    status(){

    }

    top(){
        return this._orderHistory[this._orderHistory.length -1];
    }
}