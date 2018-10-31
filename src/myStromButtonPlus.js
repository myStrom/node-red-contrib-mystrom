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

        taskJSON = {
          'ip': this.device.host,
          'mac': this.device.mac,
          'request': config.request,
          'data': { 'single': { 'url': config.singleURL, 'url-data': config.singleData }, 'double': { 'url': config.doubleURL, 'url-data': config.doubleData }, 'long': { 'url': config.longURL, 'url-data': config.longData }, 'touch': { 'url': config.touchURL, 'url-data': config.touchData } }
          //URL DATA IS SENT IN FORMAT foo=bar&qoo=lar ...
        }
        this.status({ fill: "yellow", shape: "ring", text: "Using property" });

        if (!requests.isValid(taskJSON, this.DEVICE_TYPE)) {
          node.error("Conversion from property to json failed")
        }
      }

      //iterate over helpers wiredList [{"mac":"someMac", "actions":["true", "false","true", "false"]},{"mac":"someMac2", "actions":["true", "false","true", "false"]}]
      //check if current mac already in if so set element in array if not append device with array
      console.log("hello1");
      var actions = [taskJSON.data.single['url'], taskJSON.data.double['url'], taskJSON.data.long['url'], taskJSON.data.touch['url']]
      console.log("hello2");

      actions = actions.map((value, index, array) => {
        return value == "wire"
      })

      var buttonList = helpers.getWiredList()
      var i = 0
      for (i; i < buttonList.length; i++) {
        if (buttonList[i].mac == taskJSON.mac) {
          buttonList[i].actions = actions
          buttonList[i].node = node
          break
        }
      }
      console.log("I VALUE: " + i + " LENGTH VALUE " + buttonList.length);
      //if does not already exist (i.e. loop iterated until end)
      if (i == buttonList.length - 1 || (i == 0 && buttonList.length == 0)) {
        buttonList.push({ 'mac': taskJSON.mac, 'node': node, 'actions': actions })
      }
      console.log("BUTTON LIST: %j", buttonList);
      helpers.setWiredList(buttonList)


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

  RED.httpAdmin.get("/buttons", function(request, response) {
    console.log("CHECKING");
    var outputIndex = 0

    //get post data i.e. handle post requests
    console.log("METHOD " + request.method);
    node.send(["1", null, null, null])
    response.json("HELLO")
    req = request


    //check if wire
    /*  if (req.hasOwnProperty('mac') && req.hasOwnProperty('action')) {
          var buttonList = helpers.getWiredList()
          for (var button of buttonList) {
            if (!isNaN(req.action) && req < buttonActions.length && buttonList.actions[req.action]) {
              var messages = new Array(buttonActions.length)
              messages[req.action] = true
              var node = buttonList.node
              node.send(messages)
              response.json("executed successfully")
            }
          }
        } else {
          response.json("Request sent: " + req)
    }*/

  });



};