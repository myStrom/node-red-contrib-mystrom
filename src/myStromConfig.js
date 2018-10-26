module.exports = function(RED) {


  "use strict";

  function myStromNode(n) {

    RED.nodes.createNode(this, n);
    this.host = n.host;
    this.mac = n.mac.toUpperCase()
  }
  RED.nodes.registerType("myStrom Device", myStromNode);


  RED.httpAdmin.get("/deviceports", function(req, res) {
    var nmap = require('libnmap');
    const opts = {
      range: ['192.168.0.0/26']
    };


    nmap.discover({ verbose: true }, function(err, report) {
      if (err) throw new Error(err);

      res.json(report)
      for (let item in report) {
        console.log(JSON.stringify(report[item], null, 2));
      }
    });





  });
}