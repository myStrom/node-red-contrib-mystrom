module.exports = function(RED) {
  function myStromButtonPlus(config) {
    RED.nodes.createNode(this, config);
    var context = this.context();
    var node = this;
    this.device = RED.nodes.getNode(config.device);
    var helpers = require("../utils/helpers");
    var requests = require("../utils/requests");
    var deviceHelper = require("../utils/deviceListHelper");
    deviceHelper.startDeviceListener(node);

    this.DEVICE_TYPE = "buttonplus";
    helpers.setupNodeMacPairs(node);

    //EXECUTE REQUEST
    this.on("input", function(msg) {
      require("../utils/helpers").setupNodeMacPairs(node);

      taskJSON = {
        ip: this.device.host,
        mac: this.device.mac,
        request: config.request,
        data: {
          single: { url: config.singleURL, "url-data": config.singleData },
          double: { url: config.doubleURL, "url-data": config.doubleData },
          long: { url: config.longURL, "url-data": config.longData },
          touch: { url: config.touchURL, "url-data": config.touchData }
        }
      };

      if (config.urlOffset != "" && config.urlOffset != null) {
        taskJSON.data["urlOffset"] = config.urlOffset;
      }

      this.status({ fill: "yellow", shape: "ring", text: "Using property" });

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
        this.status({
          fill: "red",
          shape: "ring",
          text: this.DEVICE_TYPE + " unreachable"
        });
      }
      node.send({ payload: str });
    }

    //CLOSE
    this.on("close", function() {});
  }
  RED.nodes.registerType("myStrom Button Plus", myStromButtonPlus);

  RED.httpAdmin.post("/buttons", function(req, res) {
    var request = require("../utils/requests");
    req = req.body;
    var DEVICE_TYPE = "buttonplus";
    res.json(request.handleRequest(req, DEVICE_TYPE));
  });

  RED.httpAdmin.post("/gen", function(req, res) {
    var helpers = require("../utils/helpers");
    req = req.body;

    mac1 = helpers.insert(req.mac, 2, ":");
    mac1 = helpers.insert(mac1, 5, ":");
    mac1 = helpers.insert(mac1, 8, ":");
    mac1 = helpers.insert(mac1, 11, ":");
    mac1 = helpers.insert(mac1, 14, ":");

    var DEVICE_TYPE = "buttonplus";
    if (req.action == "5") {
      var node = helpers.getNodeForMac()[mac1];
      node.send({ payload: req.wheel });
    }
    res.json("success");
  });
};
