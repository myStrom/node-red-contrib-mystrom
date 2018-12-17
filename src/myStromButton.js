module.exports = function(RED) {
  function myStromButton(config) {
    RED.nodes.createNode(this, config);
    var context = this.context();
    var node = this;
    this.device = RED.nodes.getNode(config.device);
    var helpers = require("../utils/helpers");
    var requests = require("../utils/requests");
    var deviceHelper = require("../utils/deviceListHelper");
    deviceHelper.startDeviceListener(node);
    this.DEVICE_TYPE = "button";
    helpers.setupNodeMacPairs(node);

    //EXECUTE REQUEST
    this.on("input", function(msg) {
      require("../utils/helpers").setupNodeMacPairs(node);

      taskJSON = {
        ip: this.device.host,
        mac: this.device.mac,
        request: config.request,
        data: {
          single: {
            url: config.advanced ? config.singleURL : "wire",
            "url-data": config.singleData
          },
          double: {
            url: config.advanced ? config.doubleURL : "wire",
            "url-data": config.doubleData
          },
          long: {
            url: config.advanced ? config.longURL : "wire",
            "url-data": config.longData
          },
          touch: {
            url: config.advanced ? config.touchURL : "wire",
            "url-data": config.touchData
          }
        }
      };

      if (config.urlOffset != "" && config.urlOffset != null) {
        taskJSON.data["urlOffset"] = config.urlOffset;
      }

      /*  this.status({
        fill: "yellow",
        shape: "ring",
        text: "Using property"
      });*/

      if (!requests.isValid(taskJSON, this.DEVICE_TYPE)) {
        node.error("Conversion from property to json failed");
      }

      helpers.setupWiredListFromJSON(taskJSON, node);
      helpers.setupNodeMacPairs(node);
      requests.doAsync(back, this.DEVICE_TYPE, taskJSON, node);
    });
    return;

    //CALLBACK
    function back(str) {
      if (str["success"] == "false") {
        node.error("An error occured while sending");
        /*  this.status({
          fill: "red",
          shape: "ring",
          text: this.DEVICE_TYPE + " unreachable"
        });*/
      }
      node.send({
        payload: str
      });
    }

    //CLOSE
    this.on("close", function() {});
  }
  RED.nodes.registerType("myStrom Button", myStromButton);

  RED.httpAdmin.post("/buttons", function(req, res) {
    var request = require("../utils/requests");
    req = req.body;

    var DEVICE_TYPE = "button";
    res.json(request.handleRequest(req, DEVICE_TYPE));
  });
};
