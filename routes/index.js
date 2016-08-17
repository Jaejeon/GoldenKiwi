var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var KiwiSchema = require('../models/Kiwi.js');
var Kiwi = mongoose.model('Kiwi', KiwiSchema);
var TreeSchema = require('../models/Tree.js');
var Tree = mongoose.model('Tree', TreeSchema);

var mongoose = require('mongoose');
var KiwiSchema = require('../models/Kiwi.js');
var Kiwi = mongoose.model('Kiwi', KiwiSchema);
var TreeSchema = require('../models/Tree.js');
var Tree = mongoose.model('Tree', TreeSchema);

router.get('/api/calendar/:date', function(req,res,next){
  var date = req.params.date;
  date = date.replace('-','/');
  date = date.replace('-','/');
  console.log("date : " + date);
  Tree.findOne({date: date}, function(err, tree){
    if(tree){
      var idArr = tree.topics;
      var arr = [];
      for(var i = 0; i < idArr.length; i++){
        Kiwi.findOne({_id : idArr[i]}, function(err, kiwi){
          arr.push([kiwi.topic, kiwi.count]);
          if(idArr.length == arr.length) res.render('history-result', {arr: arr});
        });
      }
    }
    else{
      res.send("Not exist");
    }
  });
});

/*GET home page. */
router.get('/', function(req, res, next) {
  var arr = [];
  Tree.findOne({date: 'now'}, function(err, tree){
    var idArr = tree.topics;
    for(var i = 0; i < idArr.length; i++){
	Kiwi.findOne({_id: idArr[i]}, function(err, kiwi){
	  arr.push([kiwi.topic, ''+i , [kiwi.keywords[0], kiwi.keywords[1], kiwi.keywords[2], kiwi.keywords[3], kiwi.keywords[4]], kiwi.url, parseInt(kiwi.ranking)+1, kiwi.status]);
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
