"use strict";

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;

global.sinon = sinon;
global.expect = chai.expect;

chai.should();
chai.use(sinonChai);