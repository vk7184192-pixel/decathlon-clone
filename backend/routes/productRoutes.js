import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Admin: Create Product with multiple images
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  createProduct
);

// User/Admin: Get Products
router.get("/", getProducts);

// User/Admin: Get Single Product
router.get("/:id", getProductById);

// Admin: Update Product
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  updateProduct
);

// Admin: Delete Product
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

export default router;