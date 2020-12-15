var mongoose = require('mongoose');

// mongoose.connect(process.env.MONGODB_URI);

mongoose.connect('mongodb+srv://admin-list:6rNMKHjObaNkUhvp@cluster0.lhcpo.mongodb.net/offline-app?retryWrites=true&w=majority');

module.exports = { mongoose: mongoose };
// Or with ES6: module.exports = {mongoose};