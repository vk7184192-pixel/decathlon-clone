import HomepageSection from "../models/HomepageSection.js";

import { emitHomepageUpdate } from "../socket/socketManager.js";

/*
========================================
GET ALL HOMEPAGE SECTIONS
ADMIN
========================================
*/

const getSections = async (req, res) => {
  try {
    const sections = await HomepageSection.find()
      .populate("categories", "name image sortOrder")
      .populate("products", "name price discountPrice images brand")
      .populate("banners", "title image type link isActive")
      .sort({
        sortOrder: 1,
        createdAt: 1,
      });

    res.status(200).json({
      sections,
    });
  } catch (error) {
    console.error("Get Homepage Sections Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
GET ACTIVE HOMEPAGE SECTIONS
FRONTEND
========================================
*/

const getActiveSections = async (req, res) => {
  try {
    const sections = await HomepageSection.find({
      isActive: true,
    })
      .populate("categories", "name image sortOrder")
      .populate("products", "name price discountPrice images brand")
      .populate("banners", "title image type link isActive")
      .sort({
        sortOrder: 1,
        createdAt: 1,
      });

    res.status(200).json({
      sections,
    });
  } catch (error) {
    console.error("Get Active Homepage Sections Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
CREATE HOMEPAGE SECTION
========================================
*/

const createSection = async (req, res) => {
  try {
    const {
      name,
      type,
      categories = [],
      products = [],
      banners = [],
      isActive = true,
    } = req.body;

    /*
    SECTION NAME
    */

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Section name is required",
      });
    }

    /*
    SECTION TYPE
    */

    const allowedTypes = ["category", "product", "banner"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid section type",
      });
    }

    /*
    TYPE VALIDATION
    */

    if (type === "category" && categories.length === 0) {
      return res.status(400).json({
        message: "At least one category is required",
      });
    }

    if (type === "product" && products.length === 0) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    if (type === "banner" && banners.length === 0) {
      return res.status(400).json({
        message: "At least one banner is required",
      });
    }

    /*
    FIND LAST SECTION ORDER
    */

    const lastSection = await HomepageSection.findOne().sort({
      sortOrder: -1,
    });

    const sortOrder = lastSection ? lastSection.sortOrder + 1 : 1;

    /*
    CREATE SECTION
    */

    const section = await HomepageSection.create({
      name: name.trim(),

      type,

      categories: type === "category" ? categories : [],

      products: type === "product" ? products : [],

      banners: type === "banner" ? banners : [],

      sortOrder,

      isActive: isActive === true || isActive === "true",
    });

    /*
    POPULATE CREATED SECTION
    */

    const populatedSection = await HomepageSection.findById(section._id)
      .populate("categories", "name image sortOrder")
      .populate("products", "name price discountPrice images brand")
      .populate("banners", "title image type link isActive");

    /*
    REALTIME UPDATE
    */

    emitHomepageUpdate("section_created", {
      sectionId: section._id,
      sectionType: section.type,
    });

    res.status(201).json({
      message: "Homepage section created successfully",

      section: populatedSection,
    });
  } catch (error) {
    console.error("Create Homepage Section Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
UPDATE HOMEPAGE SECTION
========================================
*/

const updateSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await HomepageSection.findById(id);

    if (!section) {
      return res.status(404).json({
        message: "Homepage section not found",
      });
    }

    const { name, type, categories, products, banners, isActive } = req.body;

    /*
    UPDATE NAME
    */

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Section name cannot be empty",
        });
      }

      section.name = name.trim();
    }

    /*
    UPDATE TYPE
    */

    if (type !== undefined) {
      const allowedTypes = ["category", "product", "banner"];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          message: "Invalid section type",
        });
      }

      section.type = type;
    }

    /*
    UPDATE CATEGORIES
    */

    if (categories !== undefined) {
      section.categories = categories;
    }

    /*
    UPDATE PRODUCTS
    */

    if (products !== undefined) {
      section.products = products;
    }

    /*
    UPDATE BANNERS
    */

    if (banners !== undefined) {
      section.banners = banners;
    }

    /*
    UPDATE STATUS
    */

    if (isActive !== undefined) {
      section.isActive = isActive === true || isActive === "true";
    }

    /*
    CLEAR OTHER DATA
    WHEN TYPE CHANGES
    */

    if (section.type === "category") {
      section.products = [];
      section.banners = [];
    }

    if (section.type === "product") {
      section.categories = [];
      section.banners = [];
    }

    if (section.type === "banner") {
      section.categories = [];
      section.products = [];
    }

    /*
    VALIDATION
    */

    if (section.type === "category" && section.categories.length === 0) {
      return res.status(400).json({
        message: "At least one category is required",
      });
    }

    if (section.type === "product" && section.products.length === 0) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    if (section.type === "banner" && section.banners.length === 0) {
      return res.status(400).json({
        message: "At least one banner is required",
      });
    }

    /*
    SAVE
    */

    await section.save();

    /*
    POPULATE UPDATED SECTION
    */

    const populatedSection = await HomepageSection.findById(section._id)
      .populate("categories", "name image sortOrder")
      .populate("products", "name price discountPrice images brand")
      .populate("banners", "title image type link isActive");

    /*
    REALTIME UPDATE
    */

    emitHomepageUpdate("section_updated", {
      sectionId: section._id,
      sectionType: section.type,
      isActive: section.isActive,
    });

    res.status(200).json({
      message: "Homepage section updated successfully",

      section: populatedSection,
    });
  } catch (error) {
    console.error("Update Homepage Section Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
DELETE HOMEPAGE SECTION
========================================
*/

const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await HomepageSection.findById(id);

    if (!section) {
      return res.status(404).json({
        message: "Homepage section not found",
      });
    }

    await HomepageSection.findByIdAndDelete(id);

    /*
    REALTIME UPDATE
    */

    emitHomepageUpdate("section_deleted", {
      sectionId: id,
    });

    res.status(200).json({
      message: "Homepage section deleted successfully",
    });
  } catch (error) {
    console.error("Delete Homepage Section Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
REORDER HOMEPAGE SECTION
========================================
*/

const reorderSection = async (req, res) => {
  try {
    const { sectionId, direction } = req.body;

    if (!sectionId || !["up", "down"].includes(direction)) {
      return res.status(400).json({
        message: "Section ID and valid direction are required",
      });
    }

    const sections = await HomepageSection.find().sort({
      sortOrder: 1,
      createdAt: 1,
    });

    const currentIndex = sections.findIndex(
      (section) => section._id.toString() === sectionId,
    );

    if (currentIndex === -1) {
      return res.status(404).json({
        message: "Homepage section not found",
      });
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sections.length) {
      return res.status(400).json({
        message:
          direction === "up"
            ? "Section is already at the top"
            : "Section is already at the bottom",
      });
    }

    /*
    SWAP ORDER
    */

    const currentSection = sections[currentIndex];

    const targetSection = sections[targetIndex];

    const currentOrder = currentSection.sortOrder;

    currentSection.sortOrder = targetSection.sortOrder;

    targetSection.sortOrder = currentOrder;

    await currentSection.save();
    await targetSection.save();

    /*
    REALTIME UPDATE
    */

    emitHomepageUpdate("section_reordered", {
      sectionId,
      direction,
    });

    /*
    GET UPDATED SECTIONS
    */

    const updatedSections = await HomepageSection.find()
      .populate("categories", "name image sortOrder")
      .populate("products", "name price discountPrice images brand")
      .populate("banners", "title image type link isActive")
      .sort({
        sortOrder: 1,
        createdAt: 1,
      });

    res.status(200).json({
      message: "Section order updated successfully",

      sections: updatedSections,
    });
  } catch (error) {
    console.error("Reorder Homepage Section Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  getSections,
  getActiveSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSection,
};
