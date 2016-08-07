/**
 * Created by jaejeon on 2016-08-05.
 */
var urlencode = require('urlencode');
var https = require('https');
var mecab = require('mecab-ya');
var async = require('async');
var mongoose = require('mongoose');
var KiwiSchema = require('../models/Kiwi.js');
var Kiwi = mongoose.model('Kiwi', KiwiSchema);
var TreeSchema = require('../models/Tree.js');
var Tree = mongoose.model('Tree', TreeSchema);

var format = require('date-format');

module.exports = function(poll_result){

    var client_id = 'PON8429nB5fozBKQR0bi';
    var client_secret = 'XmvIFNtvxN';
    var host = 'openapi.naver.com';
    var port = 443;
    var uri = '/v1/search/news.xml';
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser();
    var replaceall = require('replaceall');
    var wordMap = new Map();

    var options = {
        host: host,
        port: port,
        path: uri + '?query=' + urlencode(poll_result[0]) + '&display=10&start=1&sort=sim',
        method: 'GET',
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };

    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            parser.parseString(chunk, function (err, result) {
                if (!result) return console.log("API response error");
                if (!result.rss) return console.log("API response error");
                if (!result.rss.channel) return console.log("API response error");
                var newsList = result.rss.channel[0].item;
                var newsTitle = "1";
                var newsDesc = "2";
                var links = [];
                var url = newsList[0].originallink;
                var ranking = poll_result[2];
                var status = poll_result[1];
                for (var i = 0; i < newsList.length; i++) {
                    newsTitle = newsTitle.concat(newsList[i].title[0]);
                    newsDesc = newsDesc.concat(newsList[i].description[0]);
                    links.push(newsList[i].link);
                }
                var sortedMap = [];
                var wordMap = new Map();
                async.series([
                    function (callback) {
                        mecab.nouns(newsTitle, function (err, result) {
                            for (var j = 0; j < result.length; j++) {
                                if (wordMap[result[j]] == undefined) {
                                    wordMap[result[j]] = 2;
                                }
                                else {
                                    wordMap[result[j]] += 2;
                                }
                            }
                            mecab.nouns(newsDesc, function (err, result) {
                                for (var j = 0; j < result.length; j++) {
                                    if (wordMap[result[j]] == undefined) {
                                        wordMap[result[j]] = 1;
                                    }
                                    else {
                                        wordMap[result[j]] += 1;
                                    }
                                }

                                for (var value in wordMap) {
                                    sortedMap.push([value, wordMap[value]]);
                                    sortedMap.sort(
                                        function (a, b) {
                                            return b[1] - a[1];
                                        }
                                    )
                                }
                                callback(null, 1);
                            });
                        });

                    }], function (err, result) {
                    var i = 0;
                    var j = 0;
                    var keywords = [];
                    while (i < 5) {
                        if (poll_result[0].includes(sortedMap[j][0])) ;
                        else {
                            keywords.push(sortedMap[j][0]);
                            i++;
                        }
                        j++;
                    }

                    Kiwi.findOne({topic: poll_result[0]}, function (err, kiwi) {
                        if (err) console.log(err);
                        if (kiwi) {
                            Tree.findOne({date:'now'}, function(err, tree){
                                tree.topics.push(kiwi._id);
                                tree.save();});
                            kiwi.keywords = keywords;
                            kiwi.count++;
                            kiwi.url = url;
                            kiwi.ranking = ranking;
                            kiwi.status = status;
                            kiwi.save();
                        }
                        else {
                            var newKiwi = new Kiwi({topic: poll_result[0], keywords: keywords, count: 1, url: url, ranking: ranking, status: status});
                            newKiwi.save(function (err) {
                                Tree.findOne({date:'now'}, function(err, tree){tree.topics.push(newKiwi._id); tree.save();});

                                Tree.findOne({date: format('yyyy/MM/dd', new Date())}, function (err, tree) {
                                    if (err) console.log(err);
                                    if (tree) {
                                        tree.topics.push(newKiwi._id);

                                        tree.save();
                                    }
                                    else {
                                        var newTree = new Tree;
                                        newTree.date = format('yyyy/MM/dd', new Date());
                                        newTree.topics = [];
                                        newTree.topics.push(newKiwi._id);
                                        newTree.save(function (err) {
                                        });

                                    }

                                });
                            });

                        }
                    });

                });
            });
        });
    });
    req.end();
};
