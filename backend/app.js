import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

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

app.use("/uploads", express.static("uploads"));

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

/*
========================================
USER REGISTRATION OTP
========================================
*/

app.use("/api/registration", registrationRoutes);

/*
========================================
USER LOGIN OTP
========================================
*/

app.use("/api/login", loginRoutes);

/*
========================================
DEFAULT ROUTE
========================================
*/

app.get("/", (req, res) => {
  res.send("Decathlon Backend Running");
});

/*
========================================
DATABASE
========================================
*/

let mongoPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongoPromise) {
    mongoPromise = mongoose.connect(process.env.MONGO_URI);
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

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

export default app;
