var helpers = require('../utils/helpers')
var http = require('http');

const dgram = require('dgram');

module.exports = {
  doAsync: function(callback, type, taskJSON, node) {
    var debug = true;
    var emulateDevcies = false;

    ip = taskJSON["ip"]

    var resolvedArray = helpers.getPathAndData(type, taskJSON, node)
    pathResolved = resolvedArray[0]
    dataResolved = resolvedArray[1]

    //BEAUTIFY DIS
    var currentPort = taskJSON["request"] == "set" ? 7928 : 80

    if (taskJSON["request"] == "set") {
      currentPort = 7928
    }
    var http = require('http');
    var body = '';
    var options = {
      host: ip,
      path: pathResolved,
      port: emulateDevcies ? "8080" : currentPort
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
        var data = json.hasOwnProperty('data')
        if (data) {
          hasSingle = json.data.hasOwnProperty('single')
          hasSingle &= json['single'].data.hasOwnProperty('url')

          hasDouble = json.data.hasOwnProperty('double')
          hasDouble &= json['doube'].data.hasOwnProperty('url')

          hasLong = json.data.hasOwnProperty('long')
          hasTouch &= json['long'].data.hasOwnProperty('url')

          hasTouch = json.data.hasOwnProperty('touch')
          hasTouch &= json['touch'].data.hasOwnProperty('url')

        }
        return basics && (hasSingle || hasDouble || hasLong || hasTouch)
      } else {
        return basics;
      }
    }

  }


};