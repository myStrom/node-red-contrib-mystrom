module.exports = function(RED) {
  function myStromNode(n) {
    RED.nodes.createNode(this, n);
    this.host = n.host;
    this.mac = n.mac
  }
  RED.nodes.registerType("myStrom Device", myStromNode);
}