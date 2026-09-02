import Product from "../models/Product.js";
import { emitHomepageUpdate } from "../socket/socketManager.js";

import { getMultipleImageUrls } from "../utils/uploadToCloudinary.js";

/*
========================================
HELPER
NORMALIZE ARRAY DATA
========================================
*/

const normalizeArray = (value) => {
  if (value === undefined || value === null) {
    return [];
  }

  /*
  ALREADY ARRAY
  */

  if (Array.isArray(value)) {
    return [
      ...new Set(value.map((item) => String(item).trim()).filter(Boolean)),
    ];
  }

  /*
  STRING
  */

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    /*
    JSON ARRAY
    */

    try {
      const parsedValue = JSON.parse(trimmedValue);

      if (Array.isArray(parsedValue)) {
        return [
          ...new Set(
            parsedValue.map((item) => String(item).trim()).filter(Boolean),
          ),
        ];
      }
    } catch (error) {
      // Not JSON
    }

    /*
    COMMA SEPARATED
    */

    return [
      ...new Set(
        trimmedValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
  }

  return [];
};

/*
========================================
CREATE PRODUCT
========================================
*/

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      categories,
      stock,
      brand,
      size,
      color,
    } = req.body;

    /*
    CATEGORIES
    */
    const categoryList = normalizeArray(categories || category);

    /*
    VALIDATION
    */

    if (!name || !description || !price || categoryList.length === 0) {
      return res.status(400).json({
        message: "Name, description, price and at least one category are required",
      });
    }

    /*
    IMAGES
    */

    const images = await getMultipleImageUrls(req.files, "products");

    /*
    SIZE
    */

    const productSize = normalizeArray(size);

    /*
    COLOR
    */

    const productColor = normalizeArray(color);

    /*
    CREATE PRODUCT
    */

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice: discountPrice || 0,
      category: categoryList[0],
      categories: categoryList,
      images,
      stock: stock || 0,
      brand: brand || "Decathlon",
      size: productSize,
      color: productColor,
    });

    /*
    REALTIME UPDATE
    */

    emitHomepageUpdate("product_created", {
      productId: product._id,

      categoryId: product.category,
      categories: product.categories,
    });

    /*
    RESPONSE
    */

    return res.status(201).json({
      message: "Product created successfully",

      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
GET PRODUCTS
========================================
*/

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      size,
      color,
      sort,
      page = 1,
      limit = 12,
      admin,
    } = req.query;

    /*
    FILTER
    */

    const filter = {};

    /*
    ACTIVE PRODUCTS
    */

    if (admin !== "true") {
      filter.isActive = true;
    }

    /*
    SEARCH
    */

    if (search) {
      const searchRegex = {
        $regex: search,
        $options: "i",
      };

      const searchConditions = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
      ];

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: searchConditions },
        ];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    /*
    CATEGORY
    */

    /*
    CATEGORY
    */

    if (category) {
      filter.$or = [
        { category: category },
        { categories: category },
      ];
    }

    /*
    BRAND
    */

    if (brand) {
      filter.brand = {
        $regex: brand,
        $options: "i",
      };
    }

    /*
    SIZE
    */

    if (size) {
      filter.size = size;
    }

    /*
    COLOR
    */

    if (color) {
      filter.color = color;
    }

    /*
    PRICE
    */

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined && minPrice !== "") {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined && maxPrice !== "") {
        filter.price.$lte = Number(maxPrice);
      }
    }

    /*
    PAGINATION
    */

    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.max(Number(limit) || 12, 1);

    const skip = (pageNumber - 1) * limitNumber;

    /*
    SORT
    */

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "price_low") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price_high") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    if (sort === "name_asc") {
      sortOption = {
        name: 1,
      };
    }

    if (sort === "name_desc") {
      sortOption = {
        name: -1,
      };
    }

    /*
    TOTAL
    */

    const totalProducts = await Product.countDocuments(filter);

    /*
    PRODUCTS
    */

    const products = await Product.find(filter)
      .populate("category", "name image")
      .populate("categories", "name image")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    /*
    TOTAL PAGES
    */

    const totalPages = Math.ceil(totalProducts / limitNumber);

    /*
    RESPONSE
    */

    return res.status(200).json({
      totalProducts,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
GET PRODUCT BY ID
========================================
*/

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category", "name image")
      .populate("categories", "name image");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
UPDATE PRODUCT
========================================
*/

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    /*
    FIND PRODUCT
    */

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /*
    REQUEST DATA
    */

    const {
      name,
      description,
      price,
      discountPrice,
      category,
      categories,
      stock,
      brand,
      size,
      color,
      isActive,
      existingImages,
    } = req.body;

    /*
    OLD CATEGORY
    */

    const oldCategory = product.category;

    /*
    BASIC FIELDS
    */

    if (name !== undefined) {
      product.name = name;
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (price !== undefined) {
      product.price = price;
    }

    if (discountPrice !== undefined) {
      product.discountPrice = discountPrice;
    }

    if (categories !== undefined || category !== undefined) {
      const catList = normalizeArray(categories || category);
      if (catList.length > 0) {
        product.categories = catList;
        product.category = catList[0];
      }
    }

    if (stock !== undefined) {
      product.stock = stock;
    }

    if (brand !== undefined) {
      product.brand = brand;
    }

    /*
    SIZE
    */

    if (size !== undefined) {
      product.size = normalizeArray(size);
    }

    /*
    COLOR
    */

    if (color !== undefined) {
      product.color = normalizeArray(color);
    }

    /*
    ACTIVE STATUS
    */

    if (isActive !== undefined) {
      product.isActive = isActive === true || isActive === "true";
    }

    /*
    ========================================
    EXISTING IMAGES
    ========================================
    */

    let remainingImages = product.images || [];

    if (existingImages !== undefined) {
      try {
        if (typeof existingImages === "string") {
          if (existingImages.trim() === "") {
            remainingImages = [];
          } else {
            remainingImages = JSON.parse(existingImages);
          }
        } else {
          remainingImages = existingImages;
        }

        if (!Array.isArray(remainingImages)) {
          remainingImages = [];
        }
      } catch (error) {
        return res.status(400).json({
          message: "Invalid existingImages data",
        });
      }
    }

    /*
    ========================================
    NEW IMAGES
    ========================================
    */

    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} new image(s)...`);

      const newImages = await getMultipleImageUrls(req.files, "products");

      remainingImages = [...remainingImages, ...newImages];
    }

    /*
    ========================================
    SAVE IMAGES
    ========================================
    */

    product.images = remainingImages;

    /*
    ========================================
    SAVE PRODUCT
    ========================================
    */

    await product.save();

    /*
    ========================================
    REALTIME UPDATE
    ========================================
    */

    emitHomepageUpdate("product_updated", {
      productId: product._id,

      categoryId: product.category,

      oldCategoryId: oldCategory,

      isActive: product.isActive,
    });

    /*
    ========================================
    RESPONSE
    ========================================
    */

    return res.status(200).json({
      message: "Product updated successfully",

      product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
DELETE PRODUCT
========================================
*/

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const categoryId = product.category;

    await Product.findByIdAndDelete(id);

    /*
    REALTIME UPDATE
    */

    emitHomepageUpdate("product_deleted", {
      productId: id,
      categoryId,
    });

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/*
========================================
EXPORT
========================================
*/

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
