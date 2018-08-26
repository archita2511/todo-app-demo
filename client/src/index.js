// https://codepen.io/TheVVaFFle/pen/PBGbyq
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import '@fortawesome/fontawesome-free/js/all.js';
import './styles/index.css';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
OfflinePluginRuntime.install();

//components
import Item from './components/Item';
import AddItemInput from './components/AddItemInput';
import ItemNameInput from './components/ItemNameInput';

// ********** Commented code shows server calls replaced with turtledb ********** //

//import axios from 'axios';
import TurtleDB from 'turtledb';


class App extends React.Component {
  constructor(props) {
    super(props)
    this.getMeta = this.getMeta.bind(this)
    this.toggleItem = this.toggleItem.bind(this)
    this.addItem = this.addItem.bind(this)
    this.editItem = this.editItem.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.setItemHeight = this.setItemHeight.bind(this)
    this.getItemCountText = this.getItemCountText.bind(this)
    this.syncClick = this.syncClick.bind(this);
    this.loadAllTodos = this.loadAllTodos.bind(this);
    this.state = {
      item: {
        height: 60
      },
      items: []
    }

    //this.dbUrl = 'http://localhost:3000/todos';

    //this.db = new TurtleDB('todos');
    window.turtledb = new TurtleDB('todos');
    this.db = window.turtledb;
    this.db.setRemote('http://localhost:3000');
  }

  componentDidMount() {
    this.loadAllTodos();
  }

  loadAllTodos() {
    this.db.readAll()
      .then((todos) => {
        this.setState({ items: todos });
      })
      .catch((err) => console.log('Error:', err));

    // axios.get(this.dbUrl)
    //   .then(({ data: { todos } }) => {
    //     this.setState({ items: todos });
    //   })
    //   .catch((err) => console.log('Error:', err));
  }

  addItem(name) {
    const updatedItems = [...this.state.items];

    const newItem = {
      name: name,
      height: 60,
      isCompleted: false
    };

    this.db.create(newItem)
      .then((todo) => {
        updatedItems.push(todo);
        this.setState({ items: updatedItems })
      })
      .catch((err) => console.log('Error:', err));


    // axios.post(this.dbUrl, newItem)
    //   .then(({ data: { todo } }) => {
    //     updatedItems.push(todo);
    //     this.setState({ items: updatedItems })
    //   })
    //   .catch((err) => console.log('Error:', err));
  }

  editItem(_id, name) {
    let updatedItems;
    const oldItems = this.state.items;
    const oldItem = oldItems.find(item => item._id === _id);
    const newItem = Object.assign(oldItem, { name: name });

    this.db.update(_id, newItem)
      .then((updatedTodo) => {
        updatedItems = oldItems.map(item => item._id === _id ? updatedTodo : item);
        this.setState({ items: updatedItems });
      })
      .catch((err) => console.log('Error:', err));

    // axios.put(this.dbUrl + '/' + _id, newItem)
    //   .then(({ data: { todo } }) => {
    //     updatedItems = oldItems.map(item => item._id === _id ? todo : item);
    //     this.setState({ items: updatedItems });
    //   })
    //   .catch((err) => console.log('Error:', err));
  }

  toggleItem(_id) {
    let updatedItems;
    const oldItems = this.state.items;
    const oldItem = oldItems.find(item => item._id === _id);
    const newItem = Object.assign(oldItem, { isCompleted: !oldItem.isCompleted });

    this.db.update(_id, newItem)
      .then((updatedTodo) => {
        updatedItems = oldItems.map(item => item._id === _id ? updatedTodo : item);
        this.setState({ items: updatedItems });
      })
      .catch((err) => console.log('Error:', err));

    // axios.put(this.dbUrl + '/' + _id, newItem)
    //   .then(({ data: { todo } }) => {
    //     updatedItems = oldItems.map(item => item._id === _id ? todo : item);
    //     this.setState({ items: updatedItems });
    //   })
    //   .catch((err) => console.log('Error:', err));
  }

  deleteItem(_id) {
    this.db.delete(_id)
      .then(() => {
        let updatedItems = [...this.state.items].filter(item => item._id !== _id)
        this.setState({ items: updatedItems });
      })
      .catch((err) => console.log('Error:', err));

    // axios.delete(this.dbUrl + '/' + _id)
    //   .then(({ data: { todo } }) => {
    //     let updatedItems = [...this.state.items].filter(item => item._id !== _id)
    //     this.setState({ items: updatedItems });
    //   })
    //   .catch((err) => console.log('Error:', err));
  }

  syncClick() {
    this.db.sync()
      .then(() => this.loadAllTodos());

    //this.loadAllTodos();
  }

  // ********** turtledb/server code replacement ends here ********** //

  setItemHeight(id, height) {
    const updatedItems = this.state.items
      .map(item => {
        if (item.id === id) {
          item.height = height
        }
        return item
      })
    this.setState({ items: updatedItems })
  }

  getItemCountText() {
    const meta = this.getMeta()
    let itemCountText = ''
    if (meta.completed.items.length === 0) {
      itemCountText = 'No completed items'
    }
    else if (meta.completed.items.length >= 1) {
      const pluralText = meta.completed.items.length === 1 ? 'item' : 'items'
      itemCountText = `${meta.completed.items.length} completed ${pluralText}`
    }
    return itemCountText
  }

  getMeta() {
    const { items } = this.state;
    const completed = items.filter(item => item.isCompleted);
    const uncompleted = items.filter(item => !item.isCompleted);

    return {
      completed: {
        items: completed,
        height: completed.length > 0 ? _.sumBy(completed, 'height') : 0
      },
      uncompleted: {
        items: uncompleted,
        height: uncompleted.length > 0 ? _.sumBy(uncompleted, 'height') : 0
      }
    }
  }

  render() {
    const meta = this.getMeta();

    let uInd = 0, cInd = 0;

    const items = this.state.items
      .map((item, index) => (
        <Item
          key={item._id}
          _id={item._id}
          index={item.isCompleted ? cInd++ : uInd++}
          height={item.height}
          name={item.name}
          meta={meta}
          isCompleted={item.isCompleted}
          toggleItem={() => this.toggleItem(item._id)}
          editItem={this.editItem}
          deleteItem={() => this.deleteItem(item._id)}
          setItemHeight={this.setItemHeight}
        />
      ))

    const itemCountText = this.getItemCountText()

    return (
      <div id="app">
        <div id="items-outer-container">
          <div id="items-container" className="scroll-bar">
            <AddItemInput addItem={this.addItem} />
            <div id="items">
              <div
                id="items-uncompleted__spacer"
                style={{ height: `${meta.uncompleted.height}px` }}
              />
              {items}
              <div id="items-completed__header">
                <h1>{itemCountText}</h1>
              </div>
              <div
                id="items-completed__spacer"
                style={{ height: `${meta.completed.height}px` }}
              />
            </div>
          </div>
        </div>
        <div id="app__background-accent" />
        <div id="hints">
          <div id="hint-title">
            <h1>Hints</h1>
          </div>
          <div className="hint">
            <i className="fas fa-arrow-right" />
            <h1>Hit enter to add new todo</h1>
          </div>
          <div className="hint">
            <i className="fas fa-arrow-right" />
            <h1>Double click todo text to edit</h1>
          </div>
        </div>
        <div>
          <button
            id="sync"
            onClick={this.syncClick}
          >Sync</button>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
