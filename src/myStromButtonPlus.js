module.exports = function(RED) {

  var buttonActions = ["single", "double", "long", "touch"]


  function myStromButtonPlus(config) {
    RED.nodes.createNode(this, config);
    var context = this.context();
    var node = this;
    this.device = RED.nodes.getNode(config.device);
    var helpers = require('../utils/helpers')
    var requests = require('../utils/requests')

    this.DEVICE_TYPE = "buttonplus"

    //EXECUTE REQUEST
    this.on("input", function(msg) {

      var taskJSON = msg["payload"]

      this.status({ fill: "blue", shape: "ring", text: "Using json" });

      if (!requests.isValid(taskJSON, this.DEVICE_TYPE)) {
        console.log("REQUEST " + config.request);
        taskJSON = {
          'ip': this.device.host,
          'mac': this.device.mac,
          'request': config.request,
          'data': { 'single': { 'url': config.singleURL, 'url-data': config.singleData }, 'double': { 'url': config.doubleURL, 'url-data': config.doubleData }, 'long': { 'url': config.longURL, 'url-data': config.longURL }, 'touch': { 'url': config.touchURL, 'url-data': config.touchData } }
          //URL DATA IS SENT IN FORMAT foo=bar&qoo=lar ...
        }
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
  RED.nodes.registerType("myStrom Button Plus", myStromButtonPlus);

  RED.httpAdmin.get("/buttons", function(req, res) {
    var outputIsWire = Array(buttonActions.length).fill(false);
    // var nodeContext = this.context();
    // var taskJSON = nodeContext.get("taskJSON")
    // /*        for (var i = 0; i < buttonActions.length; i++) {
    //       outputIsWire[i] = taskJSON.data[buttonActions[i]["url"][buttonActions[i] + "URL"]] == "wire"
    //     }*/

    console.log(outputIsWire)
    console.log("GOT REQUEST: " + req)

    res.json("hello")
  });



};