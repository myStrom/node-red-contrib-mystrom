module.exports = function(RED) {
  function myStromConfigBulb(n) {
    RED.nodes.createNode(this, n);
    this.host = n.host;
    this.mac = n.mac.toUpperCase();
    node = this;
  }

  RED.nodes.registerType("myStrom Config Bulb", myStromConfigBulb);

  RED.httpAdmin.get("/devices/list/mystrom", function(req, res) {
    var deviceHelper = require("../utils/deviceListHelper");
    var helpers = require("../utils/helpers");

    //get device list
    var deviceList = helpers.getDeviceList();

    res.json(deviceList);
  });
};

//firewall has to let inbound port 7979 through
