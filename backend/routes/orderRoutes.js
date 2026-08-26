import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// User: Create Order
router.post("/", authMiddleware, createOrder);

// User: Get My Orders
router.get("/my-orders", authMiddleware, getMyOrders);

// User: Get Single Order
router.get("/:id", authMiddleware, getOrderById);

// User: Cancel Order
router.put(
  "/:id/cancel",
  authMiddleware,
  cancelOrder
);

// Admin: Get All Orders
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);

router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

export default router;