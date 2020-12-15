var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  phNumber: {
    type: String,
  },
  age: {
    type: Number,
  }
});

module.exports = { Todo: Todo };
// Or with ES6: module.exports = {Todo};