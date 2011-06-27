var views = require('jadeify/views');
var jade = require('jade');
var traverse = require('traverse');
var $ = require('jquery');

module.exports = function (file, vars, opts) {
    if (!opts) opts = {};
    if (!vars) vars = {};
    opts.locals = traverse(vars).map(function (node) {
        if (node instanceof $) {
            this.update(
                node.get().map(function (elem) {
                    return elem.outerHTML
                }).join('')
            );
        }
        else if (node instanceof window.HTMLElement) {
            this.update(node.outerHTML);
        }
    });
    opts.locals.$ = $;
    
    var evars = {};
    var container = null;
    var defineQueue = [];
    
    var $var = opts.locals.$var = function (key, value) {
        if (arguments.length === 1) value = vars[key];
        
        var r = Math.floor(Math.random() * Math.pow(2,32)).toString(16);
        var id = 'jadeify_' + r;
        
        var elem = $('<div>')
            .css('display', 'inline')
            .attr('id', id)
            .append(value)
        ;
        
        var fn = function () {
            Object.defineProperty(container.vars, key, {
                set : function (x) {
                    value = x;
                    $('#' + id).empty().append(value);
                },
                get : function () { return value },
            });
        };
        
        if (container) fn()
        else defineQueue.push(fn)
        
        return elem[0].outerHTML;
    };
    
    Object.keys(vars).forEach(function (key) {
        opts.locals['$' + key] = $var(key);
    });
    
    container = $(jade.render(views[file], opts));
    container.vars = {};
    defineQueue.forEach(function (fn) { fn() });
    
    return container;
};
