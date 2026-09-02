import express from "express";
import {
  getPages,
  getPageBySlug,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  addPageSection,
  updatePageSection,
  deletePageSection,
  reorderPageSections,
} from "../controllers/pageController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public route for Store Frontend
router.get("/slug/:slug", getPageBySlug);

// Admin protected routes
router.get("/", authMiddleware, adminMiddleware, getPages);
router.get("/:id", authMiddleware, adminMiddleware, getPageById);
router.post("/", authMiddleware, adminMiddleware, createPage);
router.put("/:id", authMiddleware, adminMiddleware, updatePage);
router.delete("/:id", authMiddleware, adminMiddleware, deletePage);

// Page sections management routes
router.put("/:id/sections/reorder", authMiddleware, adminMiddleware, reorderPageSections);
router.post("/:id/sections", authMiddleware, adminMiddleware, addPageSection);
router.put("/:id/sections/:sectionId", authMiddleware, adminMiddleware, updatePageSection);
router.delete("/:id/sections/:sectionId", authMiddleware, adminMiddleware, deletePageSection);

export default router;
