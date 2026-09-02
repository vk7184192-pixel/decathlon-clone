import Page from "../models/Page.js";
import { emitHomepageUpdate } from "../socket/socketManager.js";

/*
========================================
GET ALL PAGES
========================================
*/
export const getPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: 1 });
    return res.status(200).json({ success: true, pages });
  } catch (error) {
    console.error("Get Pages Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/*
========================================
GET PAGE BY SLUG (PUBLIC/STORE)
========================================
*/
export const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const page = await Page.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    })
      .populate("sections.categories")
      .populate("sections.products")
      .populate("sections.banners");

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Filter active sections and sort by sortOrder
    const activeSections = page.sections
      .filter((sec) => sec.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return res.status(200).json({
      success: true,
      page: {
        _id: page._id,
        name: page.name,
        slug: page.slug,
        description: page.description,
        sections: activeSections,
      },
    });
  } catch (error) {
    console.error("Get Page By Slug Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/*
========================================
GET PAGE BY ID (ADMIN)
========================================
*/
export const getPageById = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await Page.findById(id)
      .populate("sections.categories")
      .populate("sections.products")
      .populate("sections.banners");

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    return res.status(200).json({ success: true, page });
  } catch (error) {
    console.error("Get Page By ID Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/*
========================================
CREATE PAGE
========================================
*/
export const createPage = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Page name is required" });
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await Page.findOne({ slug: generatedSlug });
    if (existing) {
      return res
        .status(400)
        .json({ message: `Page slug '${generatedSlug}' already exists` });
    }

    const page = await Page.create({
      name,
      slug: generatedSlug,
      description: description || "",
      sections: [],
    });

    emitHomepageUpdate({ type: "page_created", slug: page.slug });

    return res.status(201).json({
      success: true,
      message: "Page created successfully",
      page,
    });
  } catch (error) {
    console.error("Create Page Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/*
========================================
UPDATE PAGE METADATA
========================================
*/
export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    if (name !== undefined) page.name = name;
    if (description !== undefined) page.description = description;
    if (isActive !== undefined) page.isActive = Boolean(isActive);

    await page.save();

    emitHomepageUpdate({ type: "page_updated", slug: page.slug });

    return res.status(200).json({
      success: true,
      message: "Page updated successfully",
      page,
    });
  } catch (error) {
    console.error("Update Page Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/*
========================================
DELETE PAGE
========================================
*/
export const deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    if (page.slug === "home") {
      return res
        .status(400)
        .json({ message: "The default Home page cannot be deleted" });
    }

    await Page.findByIdAndDelete(id);

    emitHomepageUpdate({ type: "page_deleted", slug: page.slug });

    return res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error("Delete Page Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/*
========================================
ADD SECTION TO PAGE
========================================
*/
export const addPageSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, categories, products, banners, sortOrder, isActive } =
      req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ message: "Section name and type are required" });
    }

    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    const newSection = {
      name,
      type,
      categories: categories || [],
      products: products || [],
      banners: banners || [],
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : page.sections.length,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    page.sections.push(newSection);
    await page.save();

    const updatedPage = await Page.findById(id)
      .populate("sections.categories")
      .populate("sections.products")
      .populate("sections.banners");

    emitHomepageUpdate({ type: "section_created", slug: page.slug });

    return res.status(201).json({
      success: true,
      message: "Section added successfully",
      page: updatedPage,
    });
  } catch (error) {
    console.error("Add Page Section Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/*
========================================
UPDATE PAGE SECTION
========================================
*/
export const updatePageSection = async (req, res) => {
  try {
    const { id, sectionId } = req.params;
    const { name, type, categories, products, banners, sortOrder, isActive } =
      req.body;

    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    const section = page.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    if (name !== undefined) section.name = name;
    if (type !== undefined) section.type = type;
    if (categories !== undefined) section.categories = categories;
    if (products !== undefined) section.products = products;
    if (banners !== undefined) section.banners = banners;
    if (sortOrder !== undefined) section.sortOrder = Number(sortOrder);
    if (isActive !== undefined) section.isActive = Boolean(isActive);

    await page.save();

    const updatedPage = await Page.findById(id)
      .populate("sections.categories")
      .populate("sections.products")
      .populate("sections.banners");

    emitHomepageUpdate({ type: "section_updated", slug: page.slug });

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      page: updatedPage,
    });
  } catch (error) {
    console.error("Update Page Section Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/*
========================================
DELETE PAGE SECTION
========================================
*/
export const deletePageSection = async (req, res) => {
  try {
    const { id, sectionId } = req.params;

    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    const section = page.sections.id(sectionId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    section.deleteOne();
    await page.save();

    const updatedPage = await Page.findById(id)
      .populate("sections.categories")
      .populate("sections.products")
      .populate("sections.banners");

    emitHomepageUpdate({ type: "section_deleted", slug: page.slug });

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      page: updatedPage,
    });
  } catch (error) {
    console.error("Delete Page Section Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/*
========================================
REORDER PAGE SECTIONS
========================================
*/
export const reorderPageSections = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionIds } = req.body;

    if (!Array.isArray(sectionIds)) {
      return res.status(400).json({ message: "sectionIds array required" });
    }

    const page = await Page.findById(id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    page.sections.forEach((sec) => {
      const idx = sectionIds.indexOf(sec._id.toString());
      if (idx !== -1) {
        sec.sortOrder = idx;
      }
    });

    page.sections.sort((a, b) => a.sortOrder - b.sortOrder);

    await page.save();

    emitHomepageUpdate({ type: "section_reordered", slug: page.slug });

    return res.status(200).json({
      success: true,
      message: "Sections reordered successfully",
      sections: page.sections,
    });
  } catch (error) {
    console.error("Reorder Page Sections Error:", error);
    return res.status(500).json({ message: error.message });
  }
};
