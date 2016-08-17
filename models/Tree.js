var mongoose = require('mongoose');

var TreeSchema = new mongoose.Schema({
    date: String, // "yyyy/MM/dd"
    topics: [String]
});

module.exports = TreeSchema;
