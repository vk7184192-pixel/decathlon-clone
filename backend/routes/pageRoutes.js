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
import upload from "../middleware/uploadMiddleware.js";
import { getSingleImageUrl } from "../utils/uploadToCloudinary.js";

const router = express.Router();

// Upload image for custom section items
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      const url = await getSingleImageUrl(req.file, "pages");
      return res.status(200).json({ success: true, url });
    } catch (error) {
      console.error("Page Image Upload Error:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

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
