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

server-side methods
===================

jadeify(viewdir, opts or extension)
-----------------------------------

Use templates from `viewdir` or `opts.views` with file extension `extension` or
`opts.extension` or otherwise any file.

The options are passed along to
[fileify](http://github.com/substack/node-fileify).

One thing you might want to pass along to fileify is the watch parameter to
update the jadeified view files when they change on disk without restarting the
server.

browser-side methods
====================

jadeify(templateFile, vars={})
------------------------------

Render `templateFile` with `vars` local variables.

The `vars` parameter undergoes a deep traversal to find HTMLElement and jquery
handles in order to stringify their outerHTMLs so you can just `!{varname}` to
insert elements into a template.

Returns an HTML DOM element wrapped with jquery.

template methods
================

These methods are available to your template logic.

$ (jquery handle)
-----------------

The jquery function is passed in as `$`.

installation
============

With [npm](http://npmjs.org), do:

    npm install jadeify

license
=======

MIT/X11
