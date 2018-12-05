module.exports = function(RED) {
  var globalContext;

  function myStromConfigSwitch(n) {
    RED.nodes.createNode(this, n);
    this.host = n.host;
    this.mac = n.mac.toUpperCase();
    globalContext = this.context().global;
  }
  RED.nodes.registerType("myStrom Config Switch", myStromConfigSwitch);

  RED.httpAdmin.get("/devices/list/mystrom", function(req, res) {
    var deviceHelper = require("../utils/deviceListHelper");
    var helpers = require("../utils/helpers");

    //get device list
    var deviceList = helpers.getDeviceList();

    res.json(deviceList);
  });
};

//firewall has to let inbound port 7979 through
