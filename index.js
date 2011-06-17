var fs = require('fs');
var path = require('path');
var Seq = require('seq');
var vm = require('vm');

var fileify = require('fileify');

var browserify = require('browserify');
var sources = {
    jadeify : browserify.wrap('jadeify').source,
    jquery : browserify.wrap('jquery-browserify', { name : 'jquery' }).source,
    jade : browserify.wrap('jade').source,
    traverse : browserify.wrap('traverse').source,
};

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
    
    return function (src, next) {
        fileify('jadeify/views', viewdir, opts.ext)
        (src, function (fsrc, fnext) {
            // eval but don't run the entries which are behind a
            // process.nextTick() which calls setTimeout
            var c = { setTimeout : function () {} };
            try {
                vm.runInNewContext(fsrc, c);
            }
            catch (err) {
                if (err.constructor.name === 'SyntaxError') {
                    var tmpFile = '/tmp/jadeify_error_' + Math.floor(
                        Math.random() * Math.pow(2,32)
                    ).toString(16) + '.js';
                    fs.writeFileSync(tmpFile, fsrc);
                    try {
                        require(tmpFile);
                    }
                    catch (err) {
                        throw err;
                    }
                }
                else throw err;
            }
            
            Object.keys(sources).forEach(function (pkg) {
                if (!c.require.modules[pkg]) {
                    fsrc += sources[pkg];
                }
            });
            
            next(fsrc);
        });
    };
};
