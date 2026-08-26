let io = null;

const initSocket = (socketIo) => {
  io = socketIo;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized");
  }

  return io;
};

const emitHomepageUpdate = (type, data = null) => {
  if (!io) {
    console.log("Socket.IO is not initialized");

    return;
  }

  io.emit("homepage_updated", {
    type,
    data,
    timestamp: Date.now(),
  });

  console.log(`📡 Homepage update emitted: ${type}`);
};

export { initSocket, getIO, emitHomepageUpdate };
