module.exports = function(RED) {
  function myStromStrip(config) {
    RED.nodes.createNode(this, config);
    var context = this.context();
    var node = this;
    this.device = RED.nodes.getNode(config.device);
    var helpers = require('../utils/helpers')
    var requests = require('../utils/requests')

    this.DEVICE_TYPE = "strip"

    //EXECUTE REQUEST
    this.on("input", function(msg) {
      var taskJSON = msg["payload"]


      this.status({ fill: "blue", shape: "ring", text: "Using json" });

      if (!requests.isValid(taskJSON, this.DEVICE_TYPE)) {
        taskJSON = { "ip": this.device.host, "mac": this.device.mac, "request": config.request, "data": { "color": config.color, "ramp": config.ramp } }

        this.status({ fill: "yellow", shape: "ring", text: "Using property" });


        if (!requests.isValid(taskJSON, this.DEVICE_TYPE)) {
          node.error("Conversion from property to json failed")
        }
      }

      requests.doAsync(back, this.DEVICE_TYPE, taskJSON, node)
    });
    return;

    //CALLBACK
    function back(str) {
      if (str["success"] == "false") {
        node.error("An error occured while sending")
      }

      node.send({ payload: str });
    }

    //CLOSE
    this.on('close', function() {});
  }
  RED.nodes.registerType("myStrom Strip", myStromStrip);

};