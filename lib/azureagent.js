var https   = require('https');
var debug   = require('debug')('azure-agent');
var util    = require('util');

/**
 * Idle socket timeout, set to 55 seconds because the Azure load balancer will
 * silently drop connections after 60 s of idle time. And we won't detect the
 * drop until we try to send keep-alive packages, so to avoid making requests
 * on invalid connections we close connections after 55 s of idle time.
 */
var SOCKET_IDLE_TIMEOUT = 55 * 1000;

/**
 * Error handler that ignores errors which occurs while the socket is owned
 * AzureAgent. We don't want these errors to crash our application.
 */
var idleErrorHandler = function idleErrorHandler(err) {
  debug("Error from idle socket owned by AzureAgent: %s", err.stack);
};

/**
 * Socket timeout handler for AzureAgent sockets, which destroys sockets that
 * haven't been destroyed. Used to close sockets after being idle for 55 s.
 */
var socketTimeoutHandler = function socketTimeoutHandler() {
  if (!this.destroyed) {
    console.log("Destroyed idle connection");
    this.destroy();
  }
};

/**
 * A https.Agent subclass for use with a Azure Storage Services. This agent
 * is a specialization of  the https.Agent class with extra features:
 *  - catches socket errors from idle sockets,
 *  - closes sockets after being idle for 55 seconds, and
 *  - disables TCP Nagle for all sockets (socket.setNoDelay).
 *
 * For details on Azure issues with ECONNRESET see:
 * http://blog.gluwer.com/2014/03/story-of-eaddrinuse-and-econnreset-errors/
 */
var AzureAgent = function AzureAgent(options) {
  https.Agent.call(this, options);

  // Listen for free sockets
  this.on('free', function(socket) {
    // Ignore idle errors
    socket.on('error', idleErrorHandler);
    // Set idle timeout to avoid connection drops from azure
    socket.setTimeout(SOCKET_IDLE_TIMEOUT, socketTimeoutHandler);
  });
};

// Subclass https.Agent
util.inherits(AzureAgent, https.Agent);

/**
 * Override the `addRequest` method so we can remove error handler and timeout
 * handler from sockets when they are given to a request.
 */
AzureAgent.prototype.addRequest = function addRequest(req, options) {
  req.once('socket', function(socket) {
    // Disable TCP Nagle for socket about to be used by the request
    socket.setNoDelay(true);
    socket.removeListener('error', idleErrorHandler);
    socket.setTimeout(0, socketTimeoutHandler);
  });
  return https.Agent.prototype.addRequest.call(this, req, options);
};

/**
 * Override the `removeSocket` method so we can remove error handler and
 * timeout handler from sockets when they are removed the agent.
 */
AzureAgent.prototype.removeSocket = function removeSocket(socket, options) {
  socket.removeListener('error', idleErrorHandler);
  socket.setTimeout(0, socketTimeoutHandler);
  return https.Agent.prototype.removeSocket.call(this, socket, options);
};

// Export AzureAgent
module.exports = AzureAgent;