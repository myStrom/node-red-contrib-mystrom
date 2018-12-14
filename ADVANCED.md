# Advanced Setup

## Execution

Some devices can be controlled in two ways. That is all except for the buttons.

1.  Give a valid JSON payload as input. What is needed for a valid input can be seen under Usage.
2.  By speciying the wished function with via the property editor. This is the easier option and is recommended for newer users. _If this option is chosen you can disregard the Usage section_

If both options are available i.e. (a valid JSON gets sent as input to a myStrom node which has already been setup with the property editor) the JSON input will be executed. This means **JSON takes precedence over the property editor**.

Also make sure that you can listen on port 7979 on your node-red host since otherwise the automatic device discovery will not work.

### Usage

Every request has to contain the following:

| Attribute   | Type                            | Description                                    |
| :---------- | :------------------------------ | :--------------------------------------------- |
| **ip**      | string                          | IP address of the myStrom Device               |
| **mac**     | string                          | MAC address of the myStrom Device              |
| **request** | enum[ see list for each device] | Request we want to execute                     |
| data        | array                           | Parameter used to further specify the request. |

The elements which are valid options for the request field are specified per-device and can be found below.

#### myStrom Switch

![](misc/preview-switch.png)

Change the state of the switch, get the room temperature or get diagnostic info about the switch.

| Valid requests | Type   | Description                     |
| :------------- | :----- | :------------------------------ |
| `on`           | string | Turns the switch on             |
| `off`          | string | Turns the switch off            |
| `toggle`       | string | toggles the switch              |
| `report`       | string | Get diagnostic information      |
| `temp`         | string | Get room temperature in celsius |

##### Examples

To turn the switch on:

      { "ip": "192.168.1.00",
        "mac": "00:00:00:00:00:00"
        "request":  "on"
      }

To turn the switch off:

    { "ip": "192.168.1.00",
      "mac": "00:00:00:00:00:00"
      "request":  "off"
    }

The api documentatino of the switch can be found [here.](https://mystrom.ch/wp-content/uploads/REST_API_WSE.txt "myStrom Switch documentation")

#### myStrom Bulb

![](misc/preview-bulb.png)

Change the state of the bulb, change the colour and set the speed (ramp) of the transition

| Valid requests | Type   | Description                                                |
| :------------- | :----- | :--------------------------------------------------------- |
| `on`           | string | Turns the bulb on                                          |
| `off`          | string | Turns the bulb off                                         |
| `toggle`       | string | toggles the bulb                                           |
| `report`       | string | Get diagnostic information                                 |
| `color`        | string | _Needs additional data array_. See below for specification |

| Valid data | Type   | Need for request | Format                                      | Description                                                                                    |
| :--------- | :----- | :--------------- | :------------------------------------------ | :--------------------------------------------------------------------------------------------- |
| `color`    | string | `color`          | Must be in RGBW format and start with a '#' | Specifies the color which the bulb should be set to. Only used if the request is set to color. |
| `ramp`     | int    | `color`          | Must be a positive number.                  | Specify the transition time in miliseconds.                                                    |

##### Examples:

To turn the bulb on:

    { "ip": "192.168.1.00",
      "mac": "00:00:00:00:00:00"
      "request":  "on"
    }

To turn the bulb red with a slow transition:

    { "ip": "192.168.1.00",
      "mac": "00:00:00:00:00:00"
      "request":  "color",
      "data": {
        "color": "#ff000000",
        "ramp": "1000"
      }
    }

The api documentatino of the bulb can be found [here.](https://mystrom.ch/wp-content/uploads/REST_API_WRB-2.txt "myStrom Bulb")

#### myStrom Light Strip

![](misc/preview-strip.png)

Change the state of the light strip, change the colour and set the speed (ramp) of the transition

| Valid requests | Type   | Description                                                |
| :------------- | :----- | :--------------------------------------------------------- |
| `on`           | string | Turns the light strip on                                   |
| `off`          | string | Turns the light strip off                                  |
| `toggle`       | string | toggles the light strip                                    |
| `report`       | string | Get diagnostic information                                 |
| `color`        | string | _Needs additional data array_. See below for specification |

| Valid data | Type   | Need for request | Format                                        | Description                                                            |
| :--------- | :----- | :--------------- | :-------------------------------------------- | :--------------------------------------------------------------------- |
| `color`    | string | `color`          | Must be in RGBW format and start with a '#'   | Specifies the color which the light strip should be set to.            |
| `ramp`     | int    | `color`          | Must be a positive number between 0 and 1000. | Specifies the time it takes to transition to new color in miliseconds. |

##### Examples:

To turn the light strip on:

    { "ip": "192.168.1.00",
      "mac": "00:00:00:00:00:00"
      "request":  "on"
    }

To turn the light strip red with a slow transition:

    { "ip": "192.168.1.00",
      "mac": "00:00:00:00:00:00"
      "request":  "color",
      "data": {
        "color": "#ff000000",
        "ramp": "1000"
      }
    }

The api documentatino of the light strip can be found [here.](https://mystrom.ch/wp-content/uploads/REST_API_WRS-1.txt "myStrom light strip")

### Buttons

##### Configuring Buttons

Everytime the settings of the button have been changed they need to be upladed to the button:

- (Easy) property mode: Simply give the button anything as input (e.g. inject a timestamp) and it will upload the data specified in the property of the node to the button.

In order to be able to upload data to the button the button has to be in configuration mode **otherwise it will not work**. Note that the buttons will only stay in configuration mode for a few minutes. You get into the configuration mode as follows:

- _Button_: Charging it for a few seconds, detaching in and pressing the it
- _Button+_: Remove the battery and insert it again. The battery can be accessed by rotating the base of the button (the one with 4 small magnets on it).

You can check that the button is in configuration mode by checking if the device has popped up as [discovered](#automatic-device-discovery).

Once the buttons have been configured you do not need to re-upload to the button everytime you have attached things to the button node outputs. Only when you change things in the actual node property you will have to upload it again.

##### Using button node outputs

![](misc/output-highlight.png)

If the address of a button action is set to 'wire' the outputs of the button node will output the message 'success'. The first node output however is always reserved for the 'report' action. This means that, if the 'Single click' address is set to 'wire', the second output will get the message 'success'. For 'Double click' the third output will get it, for 'Long click' the forth and for 'Touch' the fifth.
