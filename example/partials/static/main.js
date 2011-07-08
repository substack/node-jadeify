var jadeify = require('jadeify');
var deck = require('deck');
var $ = require('jquery');

$(window).ready(function () {
    setInterval(function () {
        var titles = [ 'foo', 'bar', 'baz' ];
        var bodies = [ 'what', 'lul', 'oh hello' ];
        
        var body = jadeify('body.jade', {
            date : new Date().toString(),
            text : deck.pick(bodies)
        });
        
        var msg = jadeify('msg.jade', {
            title : deck.pick(titles),
            body : body,
        }).appendTo($('#messages'));
        
        setTimeout(function () {
            msg.find('.title').text('[ deleted ]');
            body.find('.text').text('This post is no longer available.');
        }, 5000);
        
        setTimeout(function () {
            msg.animate(
                { opacity : 'toggle', height : 'toggle' },
                1000,
                function () { $(this).remove() }
            );
        }, 6000);
    }, 2000);
});
