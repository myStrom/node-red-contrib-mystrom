var localIP = require("ip");
var typeList = ["switch", "bulb", "buttonplus", "button", "strip"]
var buttonInteractions = ["single", "double", "long", "touch"]
var deviceList = [] //array of mac addresses which are already registerType
var nodeForMac = []
var listenerState = false

module.exports = {

  getHostIp: function() {
    var os = require('os');
    var networkInterfaces = os.networkInterfaces();

    for (var key of Object.keys(networkInterfaces)) {
      for (var i = 0; i < networkInterfaces[key].length; i++) {
        var iface = networkInterfaces[key][i]
        if (iface.family == 'IPv4' && iface.mac != '00:00:00:00:00:00') {
          return iface.address
        }
      }
    }
  },

  setupWiredListFromJSON: function(taskJSON, node) {
    //get actions array for wiredList
    var actions = [taskJSON.data.single['url'], taskJSON.data.double['url'], taskJSON.data.long['url'], taskJSON.data.touch['url']]
    actions = actions.map((value, index, array) => {
      return value == "wire"
    })

    //Set button from wiredlist
    var buttonList = this.getWiredList()
    var i = 0
    for (i; i < buttonList.length; i++) {
      if (buttonList[i].nodeID == node.id) {
        buttonList[i].actions = actions
        buttonList[i].mac = taskJSON.mac
        break
      } else if (buttonList[i].mac == taskJSON.mac) {
        buttonList[i].actions = actions
        buttonList[i].nodeID = node.id
        break
      }
    }

    //if does not already exist (i.e. loop iterated until end)
    if (i == buttonList.length || (i == 0 && buttonList.length == 0)) {
      buttonList.push({ 'mac': taskJSON.mac, 'nodeID': node.id, 'actions': actions })
    }

    this.setWiredList(buttonList)

  },
  setupNodeMacPairs: function(node) {
    var buttonList = this.getWiredList()
    for (var i = 0; i < buttonList.length; i++) {
      if (buttonList[i].nodeID == node.id) {
        var nodeForMacTmp = nodeForMac
        nodeForMacTmp[buttonList[i].mac] = node
        nodeForMac = nodeForMacTmp
      }
    }
  },
  setNodeForMac: function(list) {
    nodeForMac = list
  },
  getNodeForMac: function() {
    return nodeForMac
  },
  getWiredList: function() {
    fs = require('fs');
    var data
    var path = __dirname + '/wiredlist.json'
    if (fs.existsSync(path)) {
      data = JSON.parse(fs.readFileSync(path, 'utf8'))
    } else {
      data = []
    }
    return data
  },

  setWiredList: function(list) {
    fs = require('fs');
    var path = __dirname + '/wiredlist.json'
    fs.writeFileSync(path, JSON.stringify(list), function(err) {
      if (err) return console.log(err);
    });
  },
  getListernerState: function() {
    return listenerState;
  },
  setListenerState: function(state) {
    listenerState = state
  },
  getDeviceList: function() {
    return deviceList
  },

  setDeviceList: function(list) {
    deviceList = list
  },

  //validity has to be checked beforehand
  getPathAndData: function(type, taskJSON, node) {
    ip = taskJSON["ip"]
    mac = taskJSON["mac"]
    request = taskJSON["request"]
    data = taskJSON["data"]

    var resolvedPath = ""
    var resolvedData = ""

    if (type == "switch") {

      //NO DATA EVER SENT
      if (request == "on") {
        resolvedPath = "/relay?state=1"
      } else if (request == "off") {
        resolvedPath = "/relay?state=0"
      } else if (request == "toggle") {
        resolvedPath = "/toggle"
      } else if (request == "report") {
        resolvedPath = "/report"
      } else if (request == "temp") {
        resolvedPath = "/temp"
      }

      if (resolvedPath == "") {
        node.error("Unsupported request: " + request);
      }


    } else if (type == "bulb") {

      if (request == "on") {
        resolvedData += "action=on"
        resolvedPath += "/api/v1/device/" + formatMac(mac)
      } else if (request == "off") {
        resolvedData += "action=off"
        resolvedPath += "/api/v1/device/" + formatMac(mac)
      } else if (request == "toggle") {
        resolvedData += "action=toggle"
        resolvedPath += "/api/v1/device/" + formatMac(mac)
      } else if (request == "report") {
        //NO DATA SENT
        resolvedPath += "/api/v1/device/"
      } else if (request == "color") {
        resolvedData += "action=on&ramp=" + data["ramp"] + "&color=" + data["color"].substr(1).toUpperCase()
        resolvedPath += "/api/v1/device/" + formatMac(mac)
      }

      if (resolvedPath == "" || (resolvedData == "" && request != "report")) {
        node.error("Unsupported request: " + request);
      }

    } else if (type == "strip") {

      if (request == "on") {
        resolvedData += "action=on"
        resolvedPath += "/api/v1/device/" + formatMac(mac)
      } else if (request == "off") {
        resolvedData += "action=off"
        resolvedPath += "/api/v1/device/" + formatMac(mac)
      } else if (request == "toggle") {
        resolvedData += "action=toggle"
        resolvedPath += "/api/v1/device/" + formatMac(mac)
      } else if (request == "report") {
        //NO DATA SENT
        resolvedPath += "/api/v1/device/"
      } else if (request == "color") {
        resolvedData += "action=on&ramp=" + data["ramp"] + "&color=" + data["color"].substr(1).toUpperCase()
        resolvedPath += "/api/v1/device/" + formatMac(mac)
      }

      if (resolvedPath == "" || (resolvedData == "" && request != "report")) {
        node.error("Unsupported request: " + request);
      }
    } else if (type == "buttonplus" || type == "button") {


      if (request == "report") {
        //NO DATA SENT
        resolvedPath += "/api/v1/device/" + formatMac(mac)
      } else if (request == "set") {

        var settingURLs = []

        for (var action of buttonInteractions) {
          var currentURL = ""
          var errorFlag = false

          if (data.hasOwnProperty(action) && data[action]['url'].length > 0) {

            if (data[action]['url'] != 'wire') {
              var current = data[action]
              var url = current['url']
              currentURL = "get://" + url

              if (current.hasOwnProperty('url-data') && current['url-data'].length > 0) {
                var urlData = current['url-data']
                //replace = with %3D
                urlData = urlData.replace(/=/g, '%3D');
                //replace & with %26
                urlData = urlData.replace(/&/g, '%26');
                currentURL = "post://" + url + "?" + urlData

              }
            } else {
              //CHANGE MIDDLE IP
              currentURL = "post://" + this.getHostIp() + ":1880/buttons?mac%3D" + mac.toUpperCase() + "%26action%3D" + buttonInteractions.indexOf(action)
            }
            var url = action + "=" + currentURL
            settingURLs.push(url)
          }
        }
        resolvedData = settingURLs.join("&")

        resolvedPath += "/api/v1/device/" + formatMac(mac)

      }
    }

    return [resolvedPath, resolvedData]
  },

  messageToJson: function(resp) {
    var ret;
    if (resp != '') {
      ret = { success: "true", response: resp };
    } else {
      ret = { success: "false", response: "You might get this message falsely with the myStrom Swithc sometimes" };
    }
    return ret
  },

  numberToType: function(number) {

    switch (number) {
      case 101:
        return "switch" //v1
        break;
      case 102:
        return "bulb"
        break;
      case 103:
        return "buttonplus"
        break;
      case 104:
        return "button"
        break;
      case 105:
        return "strip"
        break;
      case 106:
        return "switch" //v2
        break;
      case 107:
        return "switch" //EU
        break;
      default:
        return "unkown"
    }
  },


  amountDevicesForType: function() {
    var amount = new Array(5).fill(0) //amount of devices

    if (deviceList) {
      for (let i = 0; i < deviceList.length; i++) {
        var obj = deviceList[i]
        var index = typeList.indexOf(obj.type)
        if (index >= 0) {
          amount[index]++
        }
      }
    }
    return zipToObject(typeList, amount)

  },

  knownDevicesWithIP: function() {
    var macList = []
    var ipList = []
    for (var i of deviceList) {
      macList.push(i.mac)
      ipList.push(i.ip)
    }
    return zipToObject(macList, ipList)
  }
};


function zipToObject(a, b) {
  if (a.length != b.length) {
    console.log("NOT SAME LENGTH");
    return

  }

  var object = {}
  for (var i = 0; i < a.length; i++) {
    object[a[i]] = b[i]
  }

  return object
}

function formatMac(mac) {
  mac = mac.replace(/:/g, '');
  return mac.toUpperCase();
}