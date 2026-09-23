const { Server } = require("socket.io");
const { verifyToken } = require("../services/authService");

let io;

/**
 * Call once from server.js after creating the HTTP server.
 * Clients join a room per ride: `ride:<rideId>`, so both rider and
 * driver on that ride receive the same events without broadcasting globally.
 */
function initSockets(httpServer) {
  io = new Server(httpServer, { cors: { origin: "*" } });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      socket.user = verifyToken(token);
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ride:join", (rideId) => {
      socket.join(`ride:${rideId}`);
    });

    socket.on("ride:leave", (rideId) => {
      socket.leave(`ride:${rideId}`);
    });

    // Driver app calls this repeatedly while a ride is active
    socket.on("ride:location_update", ({ rideId, lat, lng }) => {
      io.to(`ride:${rideId}`).emit("ride:driver_location", { rideId, lat, lng });
    });
  });

  return io;
}

/** Called from route handlers after any ride status change. */
function broadcastRideUpdate(ride) {
  if (!io) return;
  io.to(`ride:${ride._id}`).emit("ride:status_update", {
    rideId: ride._id,
    status: ride.status,
  });
}

module.exports = { initSockets, broadcastRideUpdate };
