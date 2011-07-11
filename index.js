var fs = require('fs');
var path = require('path');
var Seq = require('seq');
var vm = require('vm');

var fileify = require('fileify');
var browserify = require('browserify');

var cache = JSON.parse(
    fs.readFileSync(__dirname + '/_cache.js', 'utf8')
);

module.exports = function (opts, ext) {
    if (!opts) opts = {};
    if (typeof opts === 'string') {
        opts = { views : opts };
    }
    if (ext && typeof ext === 'string') {
        opts.ext = ext;
    }
    else if (typeof ext === 'object') {
        Object.keys(ext).forEach(function (key) {
            opts[key] = ext[key];
        });
    }
    
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
        Object.keys(cache).forEach(function (key) {
            if (!bundle.files[key]) bundle.files[key] = cache[key]
        });
        
        bundle.require({ jquery : 'jquery-browserify' });
        bundle.use(fileify('jadeify/views/index.js', viewdir, opts));
        
        Object.keys(bundle.files).forEach(function (key) {
            var file = bundle.files[key];
            if (file.target === '/node_modules/jadeify/package.json'
            || file.target === '/node_modules/jadeify/empty.js') {
                delete bundle.files[key];
            }
        });
    };
};
