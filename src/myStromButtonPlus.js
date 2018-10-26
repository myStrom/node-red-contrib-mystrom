module.exports = function(RED) {

  function myStromButtonPlus(config) {
    RED.nodes.createNode(this, config);
    var context = this.context();
    var node = this;
    this.device = RED.nodes.getNode(config.device);
    var helpers = require('../utils/helpers')
    var requests = require('../utils/requests')

    this.DEVICE_TYPE = "buttonplus"

    var global = this.context().global
    global.set("test", 42)
    //EXECUTE REQUEST
    this.on("input", function(msg) {

      var taskJSON = msg["payload"]

      this.status({ fill: "blue", shape: "ring", text: "Using json" });

      if (!requests.isValid(taskJSON, this.DEVICE_TYPE)) {
        taskJSON = {
          "ip": this.device.host,
          "mac": this.device.mac,
          "request": config.request,
          "data": { "single": { "url": config.singleURL, "data": config.singleData }, "double": { "url": config.doubleURL, "data": config.doubleData }, "long": { "url": config.longURL, "data": config.longURL }, "touch": { "url": config.touchURL, "data": config.touchData } }
        }
        //        BUILD DATA FROM PROPERTY

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
  RED.nodes.registerType("myStrom Button plus", myStromButtonPlus);




};