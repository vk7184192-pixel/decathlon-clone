import express from "express";

import {
  registerUser,
  loginUser,
  getAllUsers,
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get(
  "/profile",
  authMiddleware,
  (req, res) => {
    res.json({
      message: "Protected route accessed",
      user: req.user,
    });
  }
);

router.get(
  "/admin/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

export default router;