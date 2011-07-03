var assert = require('assert');
var vm = require('vm');
var fs = require('fs');

var browserify = require('browserify');
var jadeify = require('../');

var jade = require('jade');
var jsdom = require('jsdom');

exports.simple = function () {
    var bundle = browserify().use(jadeify(__dirname + '/simple', 'jade'));
    
    var to = setTimeout(function () {
        assert.fail('never finished');
    }, 5000);
    
    fs.readFile(__dirname + '/simple/index.jade', function (err, file) {
        var html = jade.render(file);
        
        jsdom.env(html, function (err, window) {
            clearTimeout(to);
            
            if (err) assert.fail(err);
            
            var c = {
                setTimeout : process.nextTick,
                assert : assert,
                window : window,
            };
            var src = bundle.bundle();
            vm.runInNewContext(src, c);
            
            assert.ok(c.require('jadeify'));
            assert.ok(c.require('jadeify/views')['index.jade']);
            
            assert.equal(
                html,
                c.require('jade').render(
                    c.require('jadeify/views')['index.jade']
                )
            );
            
            var $ = c.require('jquery');
            c.require('jadeify')('msg.jade', {
                title : 'oh hello',
                body : 'nice night for a test',
            }).appendTo($('#messages'));
            
            assert.equal(
                $('#messages .msg .title').text(),
                'oh hello'
            );
            
            assert.equal(
                $('#messages .msg .body').text(),
                'nice night for a test'
            );
        });
    });
};
