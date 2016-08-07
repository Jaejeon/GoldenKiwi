/**
 * Created by jaejeon on 2016-08-06.
 */
var mongoose = require('mongoose');

var KiwiSchema = new mongoose.Schema({
    topic: String,
    keywords: [String],
    count: Number,
    url: String,
    ranking: Number,
    status : String
});

module.exports = KiwiSchema;