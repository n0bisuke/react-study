var React   = require('react');
var Fluxxor = require('fluxxor');
var milkcocoa = new MilkCocoa("woodibru118b.mlkcca.com");
var Mds = milkcocoa.dataStore('todos');

var constants = {
  ADD_TODO:    "ADD_TODO",
  DELETE_TODO: "DELETE_TODO",
  LOAD_TODOS_SUCCESS: "LOAD_TODOS_SUCCESS" //追記
};

function object_array_sort(data,key,order,fn){
    //デフォは降順(DESC)
    var num_a = -1;
    var num_b = 1;

    if(order === 'asc'){//指定があれば昇順(ASC)
      num_a = 1;
      num_b = -1;
    }

   data = data.sort(function(a, b){
      var x = a[key];
      var y = b[key];
      if (x > y) return num_a;
      if (x < y) return num_b;
      return 0;
    });

   fn(data); // ソート後の配列を返す
}

var TodoStore = Fluxxor.createStore({
  initialize: function() {
    this.todoId = 0;
    this.todos = {};
    this.bindActions(
      constants.ADD_TODO,    this.onAddTodo,
      constants.DELETE_TODO, this.onDeleteTodo,
      constants.LOAD_TODOS_SUCCESS, this.onLoadTodosSuccess //追記
    );
  },
  onAddTodo: function(payload) {
    var id = ++this.todoId;
    var todo = {
      id: id,
      username: payload.username,
      text: payload.text,
      milkcocoa_id: payload.milkcocoa_id
    };
    this.todos[id] = todo;
    this.emit('change');
  },

  //変更
  onDeleteTodo: function(payload) {
    var id = payload.milkcocoa_id;
    for (var key in this.todos){
      if (this.todos[key].milkcocoa_id == id) delete this.todos[key];
    }
    this.emit('change');
  },

  //追加
  onLoadTodosSuccess: function(payload){
    payload.data.forEach(function(item){
      var id = ++this.todoId;
      var todo = {
        id: id,
        username: item.value.username,
        text: item.value.text,
        milkcocoa_id: item.id
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
    Mds.stream().sort('desc').next(function(err, data){
      this.dispatch(constants.LOAD_TODOS_SUCCESS, {data: data});
    }.bind(this));
  },

  //追加: Milkcocoa
  watchMilkcocoa: function(){
    //pushを監視
    Mds.on('push', function(pushed){
      this.dispatch(constants.ADD_TODO, {
        text: pushed.value.text,
        username: pushed.value.username,
        milkcocoa_id: pushed.id
      });
    }.bind(this));

    //removeを監視
    Mds.on('remove', function(removed){
      this.dispatch(constants.DELETE_TODO, {milkcocoa_id: removed.id});
    }.bind(this));
  },

  //変更: Milkcocoa
  addTodo: function(text,username) {
    var pushData = {
      'text' : text,
      'username': username
    };
    Mds.push(pushData,function(err, pushed){
      // this.dispatch(constants.ADD_TODO, {text: pushed.value.text});
    }.bind(this));
  },

  //追加
  deleteTodo: function(id, milkcocoa_id) {
    Mds.remove(milkcocoa_id);
  }
};

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var TodoApp = React.createClass({
  mixins: [ FluxMixin, StoreWatchMixin("TodoStore") ],

  getInitialState: function() {
    this.getFlux().actions.loadTodos(); //追加: viewの呼び出し時にロード
    this.getFlux().actions.watchMilkcocoa(); //追加: viewの呼び出し時にロード
    return {
      newTodoText: "",
      newUserText: ""
    };
  },
  getStateFromFlux: function() {
    return this.getFlux().store('TodoStore').getState();
  },
  onTextChange: function (e) {
    this.setState({newTodoText: e.target.value});
  },
  //追加
  onUserChange: function (e) {
    this.setState({newUserText: e.target.value});
  },

  onKeyDown: function (e) {
    // 13 == Enter Key Code
    if (e.keyCode === 13 && this.state.newTodoText.trim() && this.state.newUserText.trim()) {
      this.getFlux().actions.addTodo(
        this.state.newTodoText,
        this.state.newUserText
      );
      this.setState({ newTodoText: "" });
    }
  },
  render: function() {
    return (
      <div>
        <h1>Flux & Milkcocoa ChatApp</h1>
        名前:
        <input type="text"
                onChange={this.onUserChange}
                value={this.state.newUserText} />
        内容:
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

  onClickDelete: function() {
    this.getFlux().actions.deleteTodo(
      this.props.todo.id,
      this.props.todo.milkcocoa_id
    );
  },

  render: function() {
    var todo = this.props.todo;
    var style = {
      textDecoration: todo.complete ? "line-through" : ""
    };

    return (
      <li>
        <span style={style}>[{todo.username}] </span>
        <span style={style}>{todo.text} </span>
        <a href="#" onClick={this.onClickDelete}>×</a>
        <hr />
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
