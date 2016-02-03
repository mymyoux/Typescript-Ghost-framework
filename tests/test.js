var chai = require('chai');
var io = require("socket.io-client");
var fs = require("fs");
//eval(fs.readFileSync("tests/client.js").toString());
eval(fs.readFileSync("index.js").toString());
var dispatcher;



describe('EventDispatcher', function() {
  describe('Constructor', function() {
    it('should initiate without error', function() {
   		dispatcher = new ghost.events.EventDispatcher();
    });
  });
});
