var assert = require('assert');
var vm = require('vm');
var fs = require('fs');

var browserify = require('browserify');
var jadeify = require('../');

var jade = require('jade');
var jsdom = require('jsdom');

exports.vars = function () {
    var bundle = browserify().use(jadeify(__dirname + '/vars', 'jade'));
    var src = bundle.bundle();
    
    var to = setTimeout(function () {
        assert.fail('never finished');
    }, 5000);
    
    fs.readFile(__dirname + '/vars/index.jade', function (err, file) {
        var html = jade.render(file);
        
        jsdom.env(html, function (err, window) {
            clearTimeout(to);
            
            if (err) assert.fail(err);
            
            var c = {
                setTimeout : process.nextTick,
                assert : assert,
                window : window,
            };
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
            assert.ok($);
            var msg = c.require('jadeify')('msg.jade', {
                title : 'oh hello',
                body : 'nice night for a test',
            }).appendTo($('#messages'));
            assert.ok(msg instanceof $);
            
            assert.equal(
                $('#messages .msg .title').text(),
                'oh hello'
            );
            
            assert.equal(
                $('#messages .msg .body').text(),
                'nice night for a test'
            );
            
            msg.find('.title').text('BREAKING NEWS');
            
            assert.equal(
                $('#messages .msg .title').text(),
                'BREAKING NEWS'
            );
            
            // expression test with calling $var()
            assert.equal($('#messages .msg .exp').text(), '555');
            msg.find('.exp').text(999);
            assert.equal($('#messages .msg .exp').text(), '999');
            
            c.require('jadeify')('msg.jade', {
                title : $('<b>').text('ahoy!'),
                body : '...',
            }).appendTo($('#messages'));
            
            var b = $('#messages .msg .title b');
            assert.ok(b[0]);
            assert.equal(b.text(), 'ahoy!');
        });
    });
};
