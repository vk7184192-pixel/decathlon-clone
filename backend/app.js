import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

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

dotenv.config();

/*
========================================
DNS
========================================
*/

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (error) {
  console.warn("Could not set custom DNS servers:", error.message);
}

const app = express();

/*
========================================
CORS
========================================
*/

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/*
========================================
BODY PARSER
========================================
*/

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

app.use("/uploads", express.static("uploads"));

/*
========================================
DATABASE
========================================
*/

let mongoPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongoPromise) {
    mongoPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });
  }

  await mongoPromise;

  console.log("MongoDB Connected");
};

/*
========================================
DATABASE MIDDLEWARE
========================================
*/

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);

    return res.status(500).json({
      message: "Database connection failed",
    });
  }
});

/*
========================================
API ROUTES
========================================
*/

app.use("/api/auth", adminRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/addresses", addressRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api/banners", bannerRoutes);

app.use("/api/homepage-sections", homepageSectionRoutes);

app.use("/api/registration", registrationRoutes);

app.use("/api/login", loginRoutes);

/*
========================================
DEFAULT ROUTE
========================================
*/

app.get("/", (req, res) => {
  res.send("Decathlon Backend Running");
});

export default app;
