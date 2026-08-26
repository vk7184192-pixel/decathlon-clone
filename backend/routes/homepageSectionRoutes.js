import express from "express";

import {
  getSections,
  getActiveSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSection,
} from "../controllers/homepageSectionController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get(
  "/active",
  getActiveSections
);

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getSections
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createSection
);

router.put(
  "/reorder",
  authMiddleware,
  adminMiddleware,
  reorderSection
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateSection
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteSection
);

export default router;