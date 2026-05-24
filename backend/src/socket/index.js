// Socket.io event handlers
// Rooms:
//   cook:{cookId}   — cook dashboard subscribes here to get new_order events
//   order:{orderId} — customer tracking screen subscribes here to get order_update events

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    // Cook joins their room
    socket.on('join_cook', (cookId) => {
      socket.join(`cook:${cookId}`);
    });

    // Customer joins order tracking room
    socket.on('join_order', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('disconnect', () => {});
  });
}

module.exports = registerSocketHandlers;
