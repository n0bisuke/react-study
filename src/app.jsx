var React   = require('react');
var Fluxxor = require('fluxxor');

var constants = {
  ADD_TODO:    "ADD_TODO",
  TOGGLE_TODO: "TOGGLE_TODO",
  LOAD_TODOS_SUCCESS: "LOAD_TODOS_SUCCESS" //追記
};

var TodoStore = Fluxxor.createStore({
  initialize: function() {
    this.todoId = 0;
    this.todos = {};
    this.bindActions(
      constants.ADD_TODO,    this.onAddTodo,
      constants.TOGGLE_TODO, this.onToggleTodo,
      constants.LOAD_TODOS_SUCCESS, this.onLoadTodosSuccess //追記
    );
  },
  onAddTodo: function(payload) {
    var id = ++this.todoId;
    var todo = {
      id: id,
      text: payload.text,
      complete: false
    };
    this.todos[id] = todo;
    this.emit('change');
  },
  onToggleTodo: function(payload) {
    var id = payload.id;
    this.todos[id].complete = !this.todos[id].complete;
    this.emit('change');
  },

  //追加
  onLoadTodosSuccess: function(payload){
    payload.data.forEach(function(item){
      var id = ++this.todoId;
      var todo = {
        id: id,
        text: item.text,
        complete: false
      };
      this.todos[id] = todo;
    }.bind(this));
    this.emit('change');
  },

  getState: function() {
    return { todos: this.todos };
  }
});

var actions = {
  //追加
  loadTodos: function(){
    $.ajax({
      url: "./todos.json"
    }).done(function(data){
      this.dispatch(constants.LOAD_TODOS_SUCCESS, {data: data});
    }.bind(this));
  },

  addTodo: function(text) {
    this.dispatch(constants.ADD_TODO, {text: text});
  },
  toggleTodo: function(id) {
    this.dispatch(constants.TOGGLE_TODO, {id: id});
  }
};

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var TodoApp = React.createClass({
  mixins: [ FluxMixin, StoreWatchMixin("TodoStore") ],

  getInitialState: function() {
    this.getFlux().actions.loadTodos(); //追加: viewの呼び出し時にロード
    return { newTodoText: "" };
  },
  getStateFromFlux: function() {
    return this.getFlux().store('TodoStore').getState();
  },
  onTextChange: function (e) {
    this.setState({newTodoText: e.target.value});
  },
  onKeyDown: function (e) {
    // 13 == Enter Key Code
    if (e.keyCode === 13 && this.state.newTodoText.trim()) {
      this.getFlux().actions.addTodo(this.state.newTodoText);
      this.setState({ newTodoText: "" });
    }
  },
  render: function() {
    return (
      <div>
        <h1>Flux TodoApp</h1>
        <input type="text"
               onKeyDown={this.onKeyDown}
               onChange={this.onTextChange}
               value={this.state.newTodoText} />
        <TodoList todos={this.state.todos} />
      </div>
    );
  }
});

var TodoList = React.createClass({
  render: function() {
    var todos = Object.keys(this.props.todos).map(function(id) {
      return <TodoItem key={id} todo={this.props.todos[id]} />;
    }.bind(this));
    return <ul>{todos}</ul>;
  }
});

var TodoItem = React.createClass({
  mixins: [FluxMixin],

  onCompleteChange: function() {
    this.getFlux().actions.toggleTodo(this.props.todo.id);
  },

  render: function() {
    var todo = this.props.todo;
    var style = {
      textDecoration: todo.complete ? "line-through" : ""
    };

    return (
      <li>
        <input type="checkbox"
               checked={todo.complete}
               onChange={this.onCompleteChange} />
        <span style={style}>{todo.text}</span>
      </li>
    );
  }
});

var stores = { TodoStore: new TodoStore() };
var flux = new Fluxxor.Flux(stores, actions);

React.render(
  <TodoApp flux={flux} />,
  document.getElementById('app-container')
);
