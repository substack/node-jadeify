jadeify
=======

Browserify middleware for browser-side jade templates.

usage
=====

For some expresso/connect/etc application `app`:

````javascript
var browserify = require('browserify');
var jadeify = require('jadeify');

var bundle = browserify()
    .use(jadeify(__dirname + '/views'))
    .addEntry(__dirname + '/main.js')
;
app.use(bundle);
````

Then in your browser-side main.js entry point you can use `jadeify()`:

````javascript
var $ = require('jquery');
var jadeify = require('jadeify');

var msg = jadeify('msg.jade', {
    title : 'foo',
    body : 'bar baz quux'
}).appendTo($('#messages'));
````

[See here](https://github.com/substack/node-jadeify/tree/master/example/simple)
for a more complete example.

browser-side methods
====================

jadeify(templateFile, vars={})
------------------------------

Render `templateFile` with `vars` local variables.

The `vars` parameter undergoes a deep traversal to find HTMLElement and jquery
handles in order to stringify their outerHTMLs so you can just `!{varname}` to
insert elements into a template.

Returns an HTML DOM element wrapped with jquery.
A special `vars` parameter is added that you can update for `$var()` parameters.

template variables
==================

For each variable `foo` you make available to the template, a special copy,
`$foo` is made available using the `$var()` function below. This special copy is
an inline div with the content of `foo` that you can update with a setter.

Suppose you've got a template bar.jade:

````jade
div.bar !{$foo}
````

which you can render browser-side by doing:

````javascript
var elem = jadeify('bar.jade', { foo : 'pow!' });

setTimeout(function () {
    elem.vars.foo = 'zang!';
}, 1000);
````

This first renders bar.jade as effectively:

````html
<div>pow!</div>
````

Then after a second, the template changes to be:

````html
<div>zang!</div>
````

In actuality there is a div with `display : inline` wrapped around the inner
value to provide a handle for the jadeify innards to attach an ID to.

You should use `!{}` in favor of `#{}` for interpolation on updatable elements
for this reason.

template methods
================

These methods are available to your template logic.

$ (jquery handle)
-----------------

The jquery function is passed in as `$`.

$var(name, value=vars[name])
----------------------------

You can assign updatable handles to be modified with `elem.vars[name] = ...`
setters by calling `$var()` directly in your template logic.

For instance you can create a handle `x` in a template:

num.jade

````jade
div.num
  div.x !{$var('x', 10 * 2 + 1)}
  div.y 19
  div.z 17
````

and then update it browser-side:

````javascript
var num = jadeify('num.jade');
num.vars.x *= 100;
````

which updates the `div.x` text from `21` to `2100`.

Wrapped values should always use `!{}` instead of `#{}` because they need to
insert additional HTML to install element IDs.

installation
============

With [npm](http://npmjs.org), do:

    npm install jadeify

license
=======

MIT/X11
