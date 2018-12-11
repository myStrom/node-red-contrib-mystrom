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

### Installation

#### Installation on Node-RED

myStrom-Node-RED was written in **Node.js** v4.2.6 and tested on Node-RED v0.19.4.

To use it execute `npm install node-red-contrib-mystrom` or use the node-RED interface by accessing Node-RED web ui -> top right menu -> "manage palette"->"install"-> serach for "node-red-contrib-mystrom"

### Bugs

Please report all bugs through the Github issues page. Your help is greatly appreciated.

### Nodes

- [myStrom Switch](#mystrom-switch)
- [myStrom Bulb](#mystrom-bulb)
- [myStrom Light Strip](#mystrom-light-strip)
- [myStrom Button](#mystrom-button)
- [myStrom Button+](#mystrom-buttonplus)

### General usage

Usage:

1.  Select the device in the properties of the node. If a switch has been detected you can automatically select it, otherwise you can manually specifiy a mac and ip address.
2.  Specify which action should be executed when the node is triggered.
3.  The node will be triggered once it receives any kind of input.

### Button usage

Usage:

1.  Make sure your devices are in the configuration mode.
    - Button: Connect the button to a power source with the provided usb cable. After some minutes it should become visible in the network
    - Button+: Open the back of the button up by turning it. Remove the batteries and reinsert them. The button should now be visible.
2.  Select whether you want to specify the button actions or get information about the button by using the dropdown menu in the node properties.
3.  Specify the ip address and data you would like to send. If you only want use the button nodes output enter "wire" in the address field and leave the data field blank.
4.  Connect your other nodes and services you would like to trigger to the nodes outputs. Keep in mind that the first node output port is reserved for the "report" action and will only receive data if you have specified "report" as your request.
5.  Connect an inject node to the button input port. Once you have sent any kind of data to the button input node, the data you have specified in the button node will be uploaded to the button at the specified ip address. Your button is now ready to be used with node-RED! Quick hint: You only need to reupload the data if you have changed something in the button node. If you change what have attached to the output ports or connect/disconnect nodes from these ports, you do not have to upload it again.

For an advacned user guide on how to use the mystrom nodes see [here](#ADVACNED.md)
