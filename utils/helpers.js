module.exports = {
  //validity has to be checked beforehand
  getPathAndData: function(type, taskJSON, node) {

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

};

function formatMac(mac) {
  mac = mac.replace(/:/g, '');
  return mac.toUpperCase();
}