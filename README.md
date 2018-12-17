![logo](misc/logo.jpg)

[![Build Status](https://travis-ci.org/myStrom/node-red-contrib-mystrom.svg?branch=master)](https://travis-ci.org/myStrom/node-red-contrib-mystrom) ![npm-version](https://badge.fury.io/js/node-red-contrib-mystrom.svg) [![dependencies Status](https://david-dm.org/myStrom/node-red-contrib-mystrom/status.svg)](https://david-dm.org/myStrom/node-red-contrib-mystrom) [![Packagist](https://img.shields.io/npm/l/node-red-contrib-mystrom.svg?registry_uri=https%3A%2F%2Fregistry.npmjs.com)](https://github.com/myStrom/node-red-contrib-mystrom/blob/master/LICENSE)

[![NPM](https://nodei.co/npm/node-red-contrib-mystrom.png?compact=true)](https://nodei.co/npm/node-red-contrib-mystrom/)

### Features

- Control nodes via JSON input flows or by simply setting the values in the properties menu
- Automatic discovery of myStrom devices
- Full functionality of the myStrom api
- Status message of how the message was sent
- Status if message has arrived at destination (TODO)
- Graphical color picker for lights (TODO)
- - Control almost any device with dingz!

### Installation

#### Installation on Node-RED

myStrom-Node-RED was written in **Node.js** v4.2.6 and tested on Node-RED v0.19.4.

To use it execute `npm install node-red-contrib-mystrom` or use the node-RED interface by accessing Node-RED web ui -> top right menu -> "manage palette"->"install"-> serach for "node-red-contrib-mystrom"

### Bugs

Please report all bugs through the Github issues page. Your help is greatly appreciated.

### Nodes

- myStrom Switch
- myStrom Bulb
- myStrom Light Strip
- myStrom Button
- myStrom Button+

---

### General usage

Usage:

1.  Select the device in the properties of the node. To do this simply click on the node and a new menu will pop up. From there you can either:
    - Select an already configured device.
    - Create a new device. If you choose to create a new device, you can either specify this device by providing an IP and MAC address. You can also use the "discovered devices" dropdown to select a device that has automatically discovered in your network.
2.  Specify which action should be executed when the node is triggered.
3.  The node will be triggered once it receives any kind of input.

### Button usage

Usage:

1.  Make sure your devices are in the configuration mode.
    - Button: Connect the button to a power source with the provided USB cable. After some minutes it should become visible in the network
    - Button+: Open the back of the button up by turning it. Remove the batteries and reinsert them. The button should now be visible.
2.  Specify the ip address and data you would like to send. If you only want use the button nodes output enter "wire" in the address field and leave the data field blank.
3.  Connect your other nodes and services you would like to trigger to the nodes outputs.
4.  Press the button on the left side of the button node to upload your configuration to the button. You only need to reupload the data if you have changed something within the button node. If you change what you have attached to the output ports or connect/disconnect nodes from these ports, you do not have to upload it again.

For an advanced user guide on how to use the myStrom nodes see [here](ADVANCED.md)
