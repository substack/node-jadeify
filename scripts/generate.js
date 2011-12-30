#!/usr/bin/env node

var browserify = require('browserify');
var bundle = browserify();
bundle.ignore([ 'stylus', 'markdown', 'discount', 'markdown-js', 'sys' ]);

var viewStub = Math.random();
bundle.include(viewStub, '/node_modules/jadeify/views/index.js', '');

bundle.require({ jquery : 'jquery-browserify' });

bundle.require(__dirname + '/../jadeify.js', {
    target : '/node_modules/jadeify/index.js'
});

delete bundle.files[viewStub];

var fs = require('fs');
fs.writeFileSync(__dirname + '/../_cache.js', JSON.stringify(bundle.files));
