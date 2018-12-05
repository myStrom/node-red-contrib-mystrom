var helpers = require("../utils/helpers");

module.exports = {
  startDeviceListener: function(node) {
    //Start listener if not already running
    var listenerState = helpers.getListernerState();
    if (!listenerState) {
      this.deviceListener(node);
    }
  },

  deviceListener: function(node) {
    const dgram = require("dgram");
    const server = dgram.createSocket("udp4");

    helpers.setListenerState(true);
    var deviceList = helpers.getDeviceList();

    server.on("listening", () => {
      const address = server.address();
    });

    server.on("message", (msg, rinfo) => {
      var data = new Uint8Array(msg);

      var macAddressParts = [];
      if (rinfo.size != 8) {
        return;
      }

      //iterate over bytes which are for mac => 6 (entire message size 8)
      for (let byteIndex = 0; byteIndex < 6; byteIndex++) {
        let macByte = data[byteIndex].toString(16);
        if (macByte.length < 2) {
          //leading 0
          macByte = "0" + macByte;
        }
        macAddressParts[byteIndex] = macByte;
      }
      //create device object here and append it to deviceList if not there yet
      const mac = macAddressParts.join(":").toUpperCase();
      const ip = rinfo.address;
      const type = helpers.numberToType(data[6]);

      if (type == "unknown") {
        return;
      }

      var name = "";
      if (helpers.getDevice(mac) == null) {
        name =
          type.charAt(0).toUpperCase() +
          type.slice(1) +
          " " +
          (helpers.amountDevicesForType()[type] + 1);
      } else {
        name = helpers.getDevice(mac).name;
      }

      var device = {
        ip: ip,
        mac: mac,
        type: type,
        name: name
      };
      if (helpers.getDevice(mac) == null) {
        deviceList.push(device);
        helpers.setDeviceList(deviceList);

        if (typeof node != undefined) {
          node.warn(`Discovered: ${name}@${ip} with ${mac}`);
        }
      }
    });

    server.on("error", err => {
      console.log(`server error:\n${err.stack}`);
      console.log(
        "If you get the EADDRINUSE error and are using dingz and mystrom nodes togeth you can disregard this"
      );
      server.close();
    });

    server.on("close", () => {
      console.log("closed");
    });

    server.bind(7979);
  }
};
