var localIP = require("ip");

module.exports = {
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

    } else if (type == "buttonplus") {

      if (request == "report") {
        //NO DATA SENT
        resolvedPath += "/api/v1/device/"
      } else if (type == "set") {

        var singleURL = ""
        var doubleURL = ""
        var longURL = ""
        var touchURL = ""

        if (json.data.hasOwnProperty('single')) {
          if (json.single['url'] != 'wire') {
            var single = json['single']
            singleURL = "get://" + single['url']

            if (single.hasOwnProperty('url-data')) {
              singleURL = "post://" + single['url'] + single['url-data']
            }
            singleURL = "single=" + singleURL + "&"
          } else {
            singleURL = "post://" + localIP.address() + "/?button=" + ip + "&action=single"
          }
        }

        if (json.data.hasOwnProperty('double')) {
          if (json.double['url'] != 'wire') {
            var double = json['double']
            doubleURL = "get://" + double['url']

            if (double.hasOwnProperty('url-data')) {
              doubleURL = "post://" + double['url'] + double['url-data']
            }
            doubleURL = "double=" + doubleURL + "&"
          } else {
            singleURL = "post://" + localIP.address() + "/?button=" + ip + "&action=double"
          }

        }

        if (json.data.hasOwnProperty('long') && json.long['url'] != 'wire') {

          if (json.long['url'] != 'wire') {
            var long = json['long']
            longURL = "get://" + long['url']

            if (long.hasOwnProperty('url-data')) {
              longURL = "post://" + long['url'] + long['url-data']
            }
            longURL = "long=" + longURL + "&"
          } else {
            singleURL = "post://" + localIP.address() + "/?button=" + ip + "&action=single"
          }

        }

        if (json.data.hasOwnProperty('touch')) {
          if (json.touch['url'] != 'wire') {
            var touch = json['touch']
            touchURL = "get://" + touch['url']

            if (touch.hasOwnProperty('url-data')) {
              touchURL = "post://" + touch['url'] + touch['url-data']
            }
            touchURL = "touch" + touchURL
          } else {
            singleURL = "post://" + localIP.address() + "/?button=" + ip + "&action=single"
          }

        }


        //remove trailing "&"
        resolvedData = (singleURL + doubleURL + longURL + touchURL).replace(/(^&)|(&$)/, "")
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
  }

};

function formatMac(mac) {
  mac = mac.replace(/:/g, '');
  return mac.toUpperCase();
}