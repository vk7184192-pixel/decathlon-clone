import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import homepageSectionRoutes from "./routes/homepageSectionRoutes.js";

import registrationRoutes from "./routes/registrationRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";

import { initSocket } from "./socket/socketManager.js";

dotenv.config();

const app = express();

/*
========================================
MIDDLEWARE
========================================
*/

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/*
========================================
STATIC FILES
========================================
*/

app.use(
  "/uploads",
  express.static("uploads"),
);

/*
========================================
API ROUTES
========================================
*/

app.use(
  "/api/auth",
  adminRoutes,
);

app.use(
  "/api/categories",
  categoryRoutes,
);

app.use(
  "/api/products",
  productRoutes,
);

app.use(
  "/api/cart",
  cartRoutes,
);

app.use(
  "/api/wishlist",
  wishlistRoutes,
);

app.use(
  "/api/addresses",
  addressRoutes,
);

app.use(
  "/api/orders",
  orderRoutes,
);

app.use(
  "/api/payment",
  paymentRoutes,
);

app.use(
  "/api/banners",
  bannerRoutes,
);

app.use(
  "/api/homepage-sections",
  homepageSectionRoutes,
);

/*
========================================
USER REGISTRATION OTP
========================================
*/

app.use(
  "/api/registration",
  registrationRoutes,
);

/*
========================================
USER LOGIN OTP
========================================
*/

app.use(
  "/api/login",
  loginRoutes,
);

/*
========================================
DEFAULT ROUTE
========================================
*/

app.get("/", (req, res) => {
  res.send(
    "Decathlon Backend Running",
  );
});

/*
========================================
HTTP SERVER
========================================
*/

const server =
  http.createServer(app);

/*
========================================
SOCKET.IO
========================================
*/

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],
  },
});

initSocket(io);

io.on(
  "connection",
  (socket) => {
    console.log(
      "✅ Socket connected:",
      socket.id,
    );

    socket.on(
      "disconnect",
      () => {
        console.log(
          "❌ Socket disconnected:",
          socket.id,
        );
      },
    );
  },
);

/*
========================================
MONGODB
========================================
*/

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB Connected",
    );

    const PORT =
      process.env.PORT || 5000;

    server.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`,
        );

        console.log(
          "Socket.IO server running",
        );
      },
    );
  })
  .catch((error) => {
    console.log(
      "MongoDB Connection Error:",
      error.message,
    );
  });