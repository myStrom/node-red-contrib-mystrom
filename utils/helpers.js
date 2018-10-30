var localIP = require("ip");
var typeList = ["switch", "bulb", "buttonplust", "button", "strip"]
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
            var single = data['single']
            singleURL = "get://" + single['url']

            if (single.hasOwnProperty('url-data')) {
              singleURL = "post://" + single['url'] + "?" + single['url-data']
            }
            singleURL = "single=" + singleURL + "%26"
          } else {

            //CHANGE MIDDLE IP
            singleURL = "get://" + "192.168.1.121" /*+ "/buttons" ?button%3D" + ip + "%26action%3Dsingle" + "%26"*/
          }
        }

        if (data.hasOwnProperty('double')) {
          if (data.double['url'] != 'wire') {
            var double = data['double']
            doubleURL = "get://" + double['url']

            if (double.hasOwnProperty('url-data')) {
              doubleURL = "post://" + double['url'] + "?" + double['url-data']
            }
            doubleURL = "double=" + doubleURL + "%26"
          } else {

            doubleURL = "post://" + localIP.address() + ":1880/buttons?button%3D" + ip + "%26action%3Ddouble" + "%26"
          }

        }

        if (data.hasOwnProperty('long')) {
          if (data.long['url'] != 'wire') {
            var long = data['long']
            longURL = "get://" + long['url']

            if (long.hasOwnProperty('url-data')) {
              longURL = "post://" + long['url'] + "?" + long['url-data']
            }
            longURL = "long=" + longURL + "%26"
          } else {

            longURL = "post://" + localIP.address() + ":1880/buttons?button%3D" + ip + "%26action%3Dsingle" + "%26"
            //TODO ADD &
          }

        }

        /*  if (data.hasOwnProperty('touch')) {

            if (data.touch['url'] != 'wire') {
              var touch = data['touch']
              touchURL = "get://" + touch['url']

              if (touch.hasOwnProperty('url-data')) {
                touchURL = "post://" + touch['url'] + "?" + touch['url-data']
              }
              touchURL = "touch" + touchURL
            } else {

              touchURL = "post://" + localIP.address() + "/buttons?button=" + ip + "&action=single"
            }

          }*/


        //remove trailing "&"
        resolvedData = ("single=" + singleURL /*+ "double=" + doubleURL + "long=" + longURL + "touch=" + touchURL*/ ).replace(/(^%26)|(%26$)/, "")

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