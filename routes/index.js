var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var KiwiSchema = require('../models/Kiwi.js');
var Kiwi = mongoose.model('Kiwi', KiwiSchema);
var TreeSchema = require('../models/Tree.js');
var Tree = mongoose.model('Tree', TreeSchema);

/*GET home page. */
router.get('/', function(req, res, next) {
  var arr = [];
  
  Tree.findOne({date: 'now'}, function(err, tree){
    var idArr = tree.topics;
    for(var i = 0; i < idArr.length; i++){
	Kiwi.findOne({_id: idArr[i]}, function(err, kiwi){
	  arr.push([kiwi.topic, ''+i , [kiwi.keywords[0], kiwi.keywords[1], kiwi.keywords[2], kiwi.keywords[3], kiwi.keywords[4]]]);

      if(arr.length == idArr.length)
	    res.render('index', {title: 'GreenKiwi', arr: arr});
	});
    }

  });
});

router.get('/:page', function(req,res,next){
  res.render(req.params.page);
});

router.get('/hello', function(req,res,next){
  res.render('hello');
});

module.exports = router;
