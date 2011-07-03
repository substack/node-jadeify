var fs = require('fs');
var path = require('path');
var Seq = require('seq');
var vm = require('vm');

var fileify = require('fileify');
var browserify = require('browserify');

module.exports = function (opts, ext) {
    if (!opts) opts = {};
    if (typeof opts === 'string') {
        opts = { views : opts };
    }
    if (ext) opts.ext = ext;
    
    var viewdirs = [ './views' ];
    
    if (opts.views) {
        viewdirs = Array.isArray(opts.views) ? opts.views : [ opts.views ];
    }
    else if (require.cache[__filename] && require.cache[__filename].parent) {
        // silly hack to use the __dirname of the requirer
        viewdirs.unshift(
            path.dirname(require.cache[__filename].parent.filename)
        );
    }
    
    var viewdir = null;
    for (var i = 0; i < viewdirs.length; i++) {
        if (path.existsSync(viewdirs[i])) {
            viewdir = viewdirs[i];
            break;
        }
    }
    if (!viewdir) throw new Error('No suitable views directory');
    
    return function (bundle) {
        bundle.ignore([ 'stylus', 'markdown', 'discount', 'markdown-js' ]);
        bundle.require({ jquery : 'jquery-browserify' });
        bundle.use(fileify('jadeify/views/index.js', viewdir, opts.ext));
        
        Object.keys(bundle.files).forEach(function (key) {
            var file = bundle.files[key];
            if (file.target === '/node_modules/jadeify/package.json'
            || file.target === '/node_modules/jadeify/empty.js') {
                delete bundle.files[key];
            }
        });
        
        bundle.require(__dirname + '/jadeify.js', {
            target : '/node_modules/jadeify/index.js'
        });
    };
};
