var helpers = require('../utils/helpers')
var http = require('http');

module.exports = {
  doAsync: function(callback, type, taskJSON, node) {
    var debug = false;
    var emulateDevcies = false;

    ip = taskJSON["ip"]

    var resolvedArray = helpers.getPathAndData(type, taskJSON, node)
    pathResolved = resolvedArray[0]
    dataResolved = resolvedArray[1]

    var http = require('http');
    var body = '';
    var options = {
      host: ip,
      path: pathResolved,
      port: emulateDevcies ? "8080" : "80"
    };

    //Set options depending on type of request
    if (dataResolved.length <= 0) {
      options.method = "GET"
    } else {
      options.method = "POST"
      options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': dataResolved.length
      }
    }

    var req = http.request(options, (response) => {
      // Continuously update stream with data
      response.on('data', function(d) {
        body += d;
      });
      response.on('end', function() {
        var json = helpers.messageToJson(body)
        callback(json);
      });
    });

    req.on('error', function(err) {
      var json = helpers.messageToJson(body)
      callback(json);
    });

    if (dataResolved.length > 0) {
      req.write(dataResolved);
    }

    req.end();

    if (debug) {
      node.log("\nDEVICE TYPE: " + type + "\nREQUEST TYPE: " + options.method + "\nDATA SENT: " + dataResolved + "\nADDRESS: " + ip + pathResolved + "\n")
    }

    return req
  },


  isValid: function(json, type) {

    var hasIP = json.hasOwnProperty('ip')
    var hasMAC = json.hasOwnProperty('mac')
    var hasRequest = json.hasOwnProperty('request')

    var basics = hasIP && hasMAC && hasRequest


    if (type == "switch") { //SWITCH
      //no additional validity checks
      return basics
    } else if (type == "bulb") { //BULB
      if (json['request'] == 'color') {
        var hasColorValue = false
        var hasRamp = false
        var data = json.hasOwnProperty('data')
        if (data) {
          hasColorValue = json.data.hasOwnProperty('color')
          hasRamp = json.data.hasOwnProperty('ramp')
        }
        return basics && hasColorValue && hasRamp
      } else {
        return basics
      }

    } else if (type == "strip") { //STRIP
      if (json['request'] == 'color') {
        var hasColorValue = false
        var hasRamp = false
        var data = json.hasOwnProperty('data')
        if (data) {
          hasColorValue = json.data.hasOwnProperty('color')
          hasRamp = json.data.hasOwnProperty('ramp')
        }
        return basics && hasColorValue && hasRamp
      } else {
        return basics
      }

    } else if (type == "buttonplus") {
      if (json['request'] == 'set') {
        var hasSingle = false;
        var hasDouble = false;
        var hasLong = false;
        var hasTouch = false;

        var data = json.hasOwnProperty('data')

        if (data) {
          hasSingle = json.data.hasOwnProperty('single')
          hasSingle &= json.data['single'].hasOwnProperty('url')

          hasDouble = json.data.hasOwnProperty('double')
          hasDouble &= json.data['double'].hasOwnProperty('url')

          hasLong = json.data.hasOwnProperty('long')
          hasLong &= json.data['long'].hasOwnProperty('url')

          hasTouch = json.data.hasOwnProperty('touch')
          hasTouch &= json.data['touch'].hasOwnProperty('url')

        }

        return basics && (hasSingle || hasDouble || hasLong || hasTouch)
      } else {

        return basics;
      }
    } else if (type == "button") {
      if (json['request'] == 'set') {
        var hasSingle = false;
        var hasDouble = false;
        var hasLong = false;

        var data = json.hasOwnProperty('data')

        if (data) {
          hasSingle = json.data.hasOwnProperty('single')
          hasSingle &= json.data['single'].hasOwnProperty('url')

          hasDouble = json.data.hasOwnProperty('double')
          hasDouble &= json.data['double'].hasOwnProperty('url')

          hasLong = json.data.hasOwnProperty('long')
          hasLong &= json.data['long'].hasOwnProperty('url')
        }

        return basics && (hasSingle || hasDouble || hasLong)
      } else {

        return basics;
      }
    }

  },

  handleRequest: function(req, DEVICE_TYPE) {
    var buttonActions = DEVICE_TYPE != "buttonplus" ? ["single", "double", "long"] : ["single", "double", "long", "touch"]


    //check if wire
    if (req.hasOwnProperty('mac') && req.hasOwnProperty('action')) {
      var buttonList = helpers.getWiredList()

      for (var button of buttonList) {

        if (!isNaN(req.action) && parseInt(req.action) < buttonActions.length && button.actions[req.action] && button.mac == req.mac) {


          var messages = new Array(buttonActions.length + 1).fill(null)
          var index = parseInt(req.action) + 1

          messages[index] = {
            'payload': true
          }


          var node = helpers.getNodeForMac()[req.mac]

          node.send(messages)
          return "executed successfully"
          break
        }
      }
    } else {
      console.log("Faulty request sent: " + req);
    }
  }


};