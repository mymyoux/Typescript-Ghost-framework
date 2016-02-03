var chai = require('chai');
var io = require("socket.io-client");
var fs = require("fs");
var path = require("path");
var colors = require("colors");
//eval(fs.readFileSync("tests/client.js").toString());
eval(fs.readFileSync("index.js").toString());
var expect = chai.expect;


var SUITE_FOLDER = "suite";

var files = fs.readdirSync(SUITE_FOLDER);

files.forEach(function(file)
{
	console.log("---- "+colors.red(file)+ " -----");
	eval(fs.readFileSync(path.join(SUITE_FOLDER, file)).toString());
});
