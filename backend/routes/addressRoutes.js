import express from "express";
import { addAddress, getAddresses, updateAddress, deleteAddress } from "../controllers/addressController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addAddress);

router.get("/", authMiddleware, getAddresses);

router.put("/:id", authMiddleware, updateAddress);

router.delete( "/:id", authMiddleware, deleteAddress);

export default router;