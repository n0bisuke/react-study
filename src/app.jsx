var React = require('react');

var CounterApp = React.createClass({
  getInitialState: function(){
    return { counter: 0}
  },

  handlePlus: function(){
    this.setState({counter: this.state.counter + 1})
  },

  handleMinus: function(){
    this.setState({counter: this.state.counter - 1})
  },

  render: function(){
    return (
      <div>
        <Counter value={this.state.counter}
          onClickPlus={this.handlePlus}
          onClickMinus={this.handleMinus} />
      </div>
    );
  }
});

var Counter = React.createClass({
  propTypes: {
    value: React.PropTypes.number.isRequired,
    onClickPlus: React.PropTypes.func.isRequired,
    onClickMinus: React.PropTypes.func.isRequired,
  },

  render: function(){
    return (
      <div>
        <span>count: {this.props.value}</span>
        <div>
          <button onClick={this.props.onClickPlus}>
            +1
          </button>
          <button onClick={this.props.onClickMinus}>
            -1
          </button>
        </div>
      </div>
    );
  }
});

React.render(
  <CounterApp />,
  document.getElementById('app-container')
);
