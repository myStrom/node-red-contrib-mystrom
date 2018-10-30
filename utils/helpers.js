var localIP = require("ip");
var typeList = ["switch", "bulb", "buttonplus", "button", "strip"]
var deviceList = []
var listenerState = false

module.exports = {

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
    console.log("LOCAL IP: " + localIP.address());


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
    } else if (type == "buttonplus") {

      console.log("request |" + request + "|");
      if (request == "report") {
        //NO DATA SENT
        resolvedPath += "/api/v1/device/"
      } else if (request == "set") {

        var singleURL = ""
        var doubleURL = ""
        var longURL = ""
        var touchURL = ""

        if (data.hasOwnProperty('single')) {
          if (data.single['url'] != 'wire') {
            var current = data['single']
            var url = single['url']

            singleURL = "get://" + url

            if (current.hasOwnProperty('url-data')) {
              var data = single['url-data']
              //replace = with %3D
              data = data.replace(/=/g, '%3D');
              //replace & with %26
              data = data.replace(/&/g, '%26');

              singleURL = "post://" + url + "?" + data
            }
            singleURL = "single=" + singleURL + "&"
          } else {

            //CHANGE MIDDLE IP
            singleURL = "get://" + "192.168.1.121" /*+ "/buttons" ?button%3D" + ip + "%26action%3Dsingle" + "%26"*/
          }
        }

        console.log(singleURL);

        //remove trailing "&"
        resolvedData = ("single=" + singleURL /*+ "double=" + doubleURL + "long=" + longURL + "touch=" + touchURL*/ ).replace(/(^&)|(&$)/, "")

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