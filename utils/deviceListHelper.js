var helpers = require('../utils/helpers')

module.exports = {

  checkDevices: function(deviceList) {

  },

  deviceListener: function() {
    const dgram = require('dgram');
    const server = dgram.createSocket('udp4');

    helpers.setListenerState(true)
    //var deviceList = globalContext.get("deviceList")
    var deviceList = helpers.getDeviceList()

    server.on('listening', () => {
      const address = server.address();
    });

    server.on('message', (msg, rinfo) => {
      var data = new Uint8Array(msg)

      var macAddressParts = []
      if (rinfo.size != 8) {
        return
      }

      //iterate over bytes which are for mac => 6 (entire message size 8)
      for (let byteIndex = 0; byteIndex < 6; byteIndex++) {
        let macByte = data[byteIndex].toString(16)
        if (macByte < 0x10) { //leading 0
          macByte = '0' + macByte
        }
        macAddressParts[byteIndex] = macByte
      }
      //create device object here and append it to deviceList if not there yet
      const mac = macAddressParts.join(':')
      const ip = rinfo.address
      const type = helpers.numberToType(data[6])
      const name = type.charAt(0).toUpperCase() + type.slice(1) + " " + (helpers.amountDevicesForType()[type] + 1);

      var device = {
        'ip': ip,
        'mac': mac,
        'type': type,
        'name': name
      }
      var known = helpers.knownDevicesWithIP()

      if (Object.keys(known).indexOf(mac) < 0) {
        deviceList.push(device)
        helpers.setDeviceList(deviceList)
        console.log(`ADDED ${name} with ${mac}`);
      }
    })

    server.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      server.close();
    });

    server.on('close', () => {
      console.log('closed');
    })

    server.bind(7979);
  }

};