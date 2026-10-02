export const handleDisputeSockets = (io, socket) => {
  // Join a specific dispute room
  socket.on('join_dispute', (disputeId) => {
    if (!disputeId) return;
    const roomName = `dispute_${disputeId}`;
    socket.join(roomName);
    console.log(`User ${socket.user.id} joined room: ${roomName}`);
  });

  // Leave a specific dispute room
  socket.on('leave_dispute', (disputeId) => {
    if (!disputeId) return;
    const roomName = `dispute_${disputeId}`;
    socket.leave(roomName);
    console.log(`User ${socket.user.id} left room: ${roomName}`);
  });

  // Handle new messages in a dispute
  socket.on('send_dispute_message', (data) => {
    const { disputeId, message } = data;
    if (!disputeId || !message) return;
    
    const roomName = `dispute_${disputeId}`;
    
    // Broadcast the message to all others in the room
    socket.to(roomName).emit('receive_dispute_message', {
      disputeId,
      senderId: socket.user.id,
      message,
      timestamp: new Date().toISOString()
    });
  });
};
