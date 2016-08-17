/**
 * Created by jaejeon on 2016-08-05.
 */
var cheerio = require('cheerio');
var request = require('request');

module.exports = function(words, callback){
    var url = 'http://www.naver.com';
    request(url, function (error, response, html) {
        if (error) {throw error;}
        var $ = cheerio.load(html);
        var liList = $('#ranklist').children('dd').children('ol').children('li');
        for (var i = 0; i < 10; i++) {
            var tempArr = [$([liList[i]]).children('a').attr('title'),$([liList[i]]).attr('class'), i];
            words.push(tempArr);
        }
        callback(null, 0);
    });
};
