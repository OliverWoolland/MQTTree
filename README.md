# MQTTree

This tools is for live visualisation of MQTT senders and topics. 

The tool subscribes to the specified MQTT broker and listens for messages. When 
messages are recieved they are parsed, with `/`s deliniating nodes, which are 
connected heirachically to a central `broker` node.

> [!TIP] 
> #### Example
> ##### Incoming message topic
> `GivEnergy/CE1234A56/Power/Flows/Solar_to_Grid`
>
> ##### Rendered as
> `Broker -> GivEnergy -> CE1234A56 -> Power -> Flows -> Solar_to_Grid`

## Installation

Packages are managed with `npm`, to install the project run:

```
npm install
```

## Running

To run the tool with default settings:

```
node server.js
```

> [!NOTE]
> #### Default settings
> Broker: localhost:1883
> Authentication: no user / password
> Filter: Subscribe to all topics

To specify any (or all) of the parameters use command line switches (long form only):

```
node server.js --host {192.168.1.23} --port {83} --user {foo} --pass {bar} --filter {GivEnergy/#}
```
