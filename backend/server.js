import http from "http";
import dotenv from "dotenv";

import app from "./app.js";
import { Server } from "socket.io";
import { initSocket } from "./socket/socketManager.js";

dotenv.config();

/*
========================================
HTTP SERVER
========================================
*/

const server = http.createServer(app);

/*
========================================
SOCKET.IO
========================================
*/

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

initSocket(io);

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

/*
========================================
START SERVER
========================================
*/

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  console.log("Socket.IO server running");
});
