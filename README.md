# LiPS

<!--
TODO: link to travis
[![Build Status](https://secure.travis-ci.org/felixge/node-mysql.png)](http://travis-ci.org/felixge/node-mysql)
-->

## Introduction

This is a [node](http://nodejs.org) module providing a unique interface for subscribing to an expandable amount of services.

## Install

```bash
npm install LiPS
```

## Quick start

### Usage sample

```js
"use strict";

var path = require('path');
var ON_DEATH = require('death');

var LiPS = require('./index.js');

var fileLiPS = LiPS.create({
    implementation: 'file-lips'
});

var listener = fileLiPS.on({
    filepath: path.join(__dirname, 'plop'),
    fileEncoding: 'utf8',
    readingMethod: 'append'
}, function(err, data) {
    if(!err) console.log('content [', data, ']');
});
```

### Demos

For each demo, go to LiPS module folder.

#### file-lips demo

Have a `plop` file:

```bash
touch plop
```

Run the npm demo script:

```bash
npm run-script demo-file-lips
```

Start modifying the `plop` file to see the changes being logged.


#### socket.io-lips demo

Run the npm demo script:

```bash
npm run-script demo-socket.io-lips 
```

It launches a server and a client. Messages received by the client are logged.

#### amqp-lips demo

Have a RabbitMQ server running and change the configuration in `demo_amqp_lips.js` to match your server one.

Run the npm demo script:

```bash
npm run-script demo-amqp-lips
```

Publish a message in the speficied queue and see this message being logged.

#### mysql-lips

**Warning** :  this module works only if the mysql database is on the same server as the script and the mysql user must have all privileges to manage creating mysql triggers for the purpose of this module.

After configuring the mysql in `demo_mysql_lips.js`, run the npm demo script:

```bash
npm run-script demo-mysql-lips
```

Once the server is up and running, just update a line in the watched table to see the modified values beeing logged.

## Generate JSDoc

A grunt task is dedicated to JSDoc generation which you run with:

```bach
grunt jsdoc
```

The documentation is generated in the `doc` folder at the root of the package.

## Contributors

Thanks goes to the people who have contributed code to this module, see the
[GitHub Contributors page][].

[GitHub Contributors page]: https://github.com/lafourchette/lips/graphs/contributors

## Sponsor

This project is supported by [lafourchette.com](http://www.lafourchette.com)
[![lafourchette.com](http://www.lafourchette.com/favicon.png)](http://www.lafourchette.com)

## Community

If you'd like to discuss this module, or ask questions about it, please use one
of the following:

* [Yassine Bouzekri](mailto:yassineb+lips@lafourchette.com)
* [Alexis Tondelier](mailto:atondelier+lips@lafourchette.com)


