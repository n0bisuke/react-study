var React = require('react');
var Fluxxor = require('fluxxor');

var constants = {
  UPDATE_COUNTER: "UPDATE_COUNTER",
};

//Store
var CounterStore = Fluxxor.createStore({
  initialize: function(){
    this.counter = 0;
    this.bindActions(
      constants.UPDATE_COUNTER, this.onUpdateCounter
    );
  },

  onUpdateCounter: function(payload){
    this.counter = this.counter + payload.value;
    this.emit('change');
  },

  getState: function(){
    return {counter: this.counter}
  }
});

//Action (Action Creator)
var actions = {
  plusCounter: function(){
    this.dispatch(constants.UPDATE_COUNTER,{value:1});
  },

  minusCounter: function(){
    this.dispatch(constants.UPDATE_COUNTER,{value:-1});
  }
};

//Reactから利用するMixin
var FluxMixin = Fluxxor.FluxMixin(React),
  StoreWatchMixin = Fluxxor.StoreWatchMixin;

// View(React)
var CounterApp = React.createClass({
  mixins: [ FluxMixin, StoreWatchMixin('CounterStore')],

  getStateFromFlux: function(){
    return this.getFlux()
                .store('CounterStore')
                .getState();
  },

  render: function(){
    return <Counter value={this.state.counter} />;
  }
});

var Counter = React.createClass({
  mixins: [FluxMixin],

  propTypes: {
    value: React.PropTypes.number.isRequired,
  },

  onClickPlus: function(){
    return this.getFlux().actions.plusCounter();
  },

  onClickMinus: function(){
    return this.getFlux().actions.minusCounter();
  },

  render: function(){
    return(
      <div>
        <span>count: {this.props.value}</span>
        <div>
          <button onClick={this.onClickPlus}>
            +1
          </button>
          <button onClick={this.onClickMinus}>
            -1
          </button>
        </div>
      </div>
    );
  }
});

var stores = {CounterStore: new CounterStore()};
var flux = new Fluxxor.Flux(stores, actions);

React.render(
  <CounterApp flux={flux} />,
  document.getElementById('app-container')
);
