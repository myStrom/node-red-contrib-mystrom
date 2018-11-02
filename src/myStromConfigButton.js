module.exports = function(RED) {
  function myStromConfigButton(n) {
    RED.nodes.createNode(this, n)
    this.host = n.host
    this.mac = n.mac.toUpperCase()
  }

  RED.nodes.registerType("myStrom Config Button", myStromConfigButton);

  RED.httpAdmin.get("/devices/list", function(req, res) {
    var deviceHelper = require('../utils/deviceListHelper')
    var helpers = require('../utils/helpers')

    //get device list
    var deviceList = helpers.getDeviceList()

    //Start listener if not already running
    var listenerState = helpers.getListernerState()
    if (!listenerState) {
      deviceHelper.deviceListener()
    }

    res.json(deviceList)
  })

}