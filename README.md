# node-mysql

TODO: link to travis
<!--
[![Build Status](https://secure.travis-ci.org/felixge/node-mysql.png)](http://travis-ci.org/felixge/node-mysql)
-->

## Install

```bash
npm install lips
```

## Introduction

This is a node.js module providing a unique interface for subscribing to an expandable amount of services.

Example of use:

```js
"use strict";

var lips = require('lips');

var mySQLLips = lips.create({
  implementation: 'mysql-lips',
  config: {
    /* config specific to mysql-lips module */
  }
});

mySQLLips.on({ /* event parameters specific to mysql-lips module */ }, function(err, jsonData) {
  /* handle jsonData here */
});
```

## Contributors

Thanks goes to the people who have contributed code to this module, see the
[GitHub Contributors page][].

TODO: link to the github repo
[GitHub Contributors page]: https://github.com/lafourchette/lips/graphs/contributors

Additionnal thanks:

* [Guillermo Rauch][] - Socket.IO
* [Felix Geisendörfer][] - node-mysql
* [Theo Schlossnagle][] - node-amqp

[Guillermo Rauch]: http://devthought.com/
[Felix Geisendörfer]: https://github.com/felixge
[Theo Schlossnagle]: https://github.com/postwait

## Sponsors

This project is supported by [lafourchette.com](http://www.lafourchette.com)

## Community

If you'd like to discuss this module, or ask questions about it, please use one
of the following:

TODO: add link to whatever mean of communication is provided


