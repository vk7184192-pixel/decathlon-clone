import Category from "../models/Category.js";
import Product from "../models/Product.js";

import {
  emitHomepageUpdate,
} from "../socket/socketManager.js";

/*
========================================
GET ALL CATEGORIES
========================================
*/

const getCategories = async (req, res) => {
  try {
    const categories =
      await Category.find().sort({
        sortOrder: 1,
        createdAt: 1,
      });

    const categoriesWithCount =
      await Promise.all(
        categories.map(async (category) => {
          const productsCount =
            await Product.countDocuments({
              category: category._id,
            });

          return {
            ...category.toObject(),
            productsCount,
          };
        })
      );

    res.status(200).json({
      categories: categoriesWithCount,
    });
  } catch (error) {
    console.error(
      "Get Categories Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
GET CATEGORY BY ID
========================================
*/

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category =
      await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const productsCount =
      await Product.countDocuments({
        category: category._id,
      });

    res.status(200).json({
      category: {
        ...category.toObject(),
        productsCount,
      },
    });
  } catch (error) {
    console.error(
      "Get Category Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
CREATE CATEGORY
========================================
*/

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message:
          "Category name is required",
      });
    }

    const existingCategory =
      await Category.findOne({
        name: {
          $regex: `^${name.trim()}$`,
          $options: "i",
        },
      });

    if (existingCategory) {
      return res.status(400).json({
        message:
          "Category already exists",
      });
    }

    const lastCategory =
      await Category.findOne().sort({
        sortOrder: -1,
      });

    const sortOrder = lastCategory
      ? lastCategory.sortOrder + 1
      : 1;

    const category =
      await Category.create({
        name: name.trim(),

        image: req.file
          ? `/uploads/${req.file.filename}`
          : "",

        sortOrder,
      });

    /*
    ========================================
    REALTIME EVENT
    ========================================
    */

    emitHomepageUpdate(
      "category_created",
      {
        categoryId:
          category._id,
      }
    );

    res.status(201).json({
      message:
        "Category created successfully",

      category,
    });
  } catch (error) {
    console.error(
      "Create Category Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
UPDATE CATEGORY
========================================
*/

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category =
      await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const {
      name,
      existingImage,
    } = req.body;

    /*
    UPDATE NAME
    */

    if (
      name !== undefined &&
      name.trim()
    ) {
      const duplicate =
        await Category.findOne({
          _id: {
            $ne: id,
          },

          name: {
            $regex: `^${name.trim()}$`,
            $options: "i",
          },
        });

      if (duplicate) {
        return res.status(400).json({
          message:
            "Category already exists",
        });
      }

      category.name =
        name.trim();
    }

    /*
    UPDATE IMAGE
    */

    if (req.file) {
      category.image =
        `/uploads/${req.file.filename}`;
    } else if (
      existingImage !== undefined
    ) {
      category.image =
        existingImage;
    }

    await category.save();

    /*
    ========================================
    REALTIME EVENT
    ========================================
    */

    emitHomepageUpdate(
      "category_updated",
      {
        categoryId:
          category._id,
      }
    );

    res.status(200).json({
      message:
        "Category updated successfully",

      category,
    });
  } catch (error) {
    console.error(
      "Update Category Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
DELETE CATEGORY
========================================
*/

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category =
      await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const productsCount =
      await Product.countDocuments({
        category: id,
      });

    if (productsCount > 0) {
      return res.status(400).json({
        message:
          "Cannot delete category with products",
      });
    }

    await Category.findByIdAndDelete(id);

    /*
    ========================================
    REALTIME EVENT
    ========================================
    */

    emitHomepageUpdate(
      "category_deleted",
      {
        categoryId: id,
      }
    );

    res.status(200).json({
      message:
        "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Category Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
REORDER CATEGORY
========================================
*/

const reorderCategory = async (req, res) => {
  try {
    const {
      categoryId,
      direction,
    } = req.body;

    if (
      !categoryId ||
      !["up", "down"].includes(
        direction
      )
    ) {
      return res.status(400).json({
        message:
          "Category ID and valid direction are required",
      });
    }

    const categories =
      await Category.find().sort({
        sortOrder: 1,
        createdAt: 1,
      });

    const currentIndex =
      categories.findIndex(
        (category) =>
          category._id.toString() ===
          categoryId
      );

    if (currentIndex === -1) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= categories.length
    ) {
      return res.status(400).json({
        message:
          direction === "up"
            ? "Category is already at the top"
            : "Category is already at the bottom",
      });
    }

    /*
    NORMALIZE ORDER
    */

    categories.forEach(
      (category, index) => {
        category.sortOrder =
          index + 1;
      }
    );

    /*
    SWAP ORDER
    */

    const currentCategory =
      categories[currentIndex];

    const targetCategory =
      categories[targetIndex];

    const currentOrder =
      currentCategory.sortOrder;

    currentCategory.sortOrder =
      targetCategory.sortOrder;

    targetCategory.sortOrder =
      currentOrder;

    await Promise.all(
      categories.map((category) =>
        category.save()
      )
    );

    /*
    ========================================
    REALTIME EVENT
    ========================================
    */

    emitHomepageUpdate(
      "category_reordered",
      {
        categoryId,
        direction,
      }
    );

    const updatedCategories =
      await Category.find().sort({
        sortOrder: 1,
        createdAt: 1,
      });

    res.status(200).json({
      message:
        "Category order updated successfully",

      categories:
        updatedCategories,
    });
  } catch (error) {
    console.error(
      "Reorder Category Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategory,
};